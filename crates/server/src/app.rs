use crate::{
    endpoint_matcher::resolve_request_price,
    handlers::{
        browse_apis, create_api, create_user, delete_api, get_api, get_user, get_user_by_pubkey,
        list_user_apis, send_otp, update_api, verify_otp,
    },
    proxy::proxy_request,
};
use anchor_lang::prelude::Pubkey;
use axum::{
    routing::{delete, get, post},
    Router,
};
use database::{ApiRepository, UserRepository};
use sqlx::PgPool;
use std::{env, str::FromStr};
use tower_http::{cors::CorsLayer, trace::TraceLayer};
use url::Url;
use x402_axum::X402Middleware;
use x402_chain_solana::{chain::Address, v2_solana_exact::V2SolanaExact, KnownNetworkSolana};
use x402_types::networks::USDC;

const PROGRAM_ID: &str = "7JNGV1YkP5mT1aQvZwrADAozdPdYmpFTAAin2EqroSJW";
const USDC_MINT: &str = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"; // TODO: convert to mainnet
const TOKEN_PROGRAM_ID: &str = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const ASSOCIATED_TOKEN_PROGRAM_ID: &str = "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";

fn derive_user_data_accounts(user_sol_pubkey: &str) -> Option<(Pubkey, Pubkey)> {
    let program_id = Pubkey::from_str(PROGRAM_ID).ok()?;
    let mint = Pubkey::from_str(USDC_MINT).ok()?;
    let token_program = Pubkey::from_str(TOKEN_PROGRAM_ID).ok()?;
    let associated_token_program = Pubkey::from_str(ASSOCIATED_TOKEN_PROGRAM_ID).ok()?;

    let developer = Pubkey::from_str(user_sol_pubkey).ok()?;

    let (global_config, _) = Pubkey::find_program_address(&[b"global_config"], &program_id);

    let (user_data, _) = Pubkey::find_program_address(
        &[
            b"USER_DATA_SEEDS",
            global_config.as_ref(),
            developer.as_ref(),
        ],
        &program_id,
    );

    let (user_data_ata, _) = Pubkey::find_program_address(
        &[user_data.as_ref(), token_program.as_ref(), mint.as_ref()],
        &associated_token_program,
    );

    Some((user_data, user_data_ata))
}

#[derive(Clone)]
pub struct AppState {
    pub user_repo: UserRepository,
    pub api_repo: ApiRepository,
    pub facilitator_url: String,
    pub base_url: Url,
}

pub fn create_app(pool: PgPool) -> Router {
    let user_repo = UserRepository::new(pool.clone());
    let api_repo = ApiRepository::new(pool);

    let facilitator_url =
        env::var("FACILITATOR_URL").unwrap_or_else(|_| "http://0.0.0.0:8080".to_string());

    let base_url = env::var("BASE_URL").unwrap_or_else(|_| "http://localhost:3000".to_string());
    let base_url = Url::parse(&base_url).expect("Invalid BASE_URL");
    let api_repo_dyn = api_repo.clone();
    let user_repo_dyn = user_repo.clone();

    let make_price_layer = |request_method: shared::HttpMethod,
                            api_repo: ApiRepository,
                            user_repo: UserRepository| {
        X402Middleware::try_from(facilitator_url.clone())
            .expect("Failed to initialize X402 middleware")
            .with_base_url(base_url.clone())
            .with_dynamic_price(move |_headers, uri, _base_url| {
                let request_method = request_method.clone();
                let path = uri.path().to_string();
                let mut parts = path.trim_start_matches('/').splitn(3, '/');
                let user_name = parts.next().unwrap_or("").to_string();
                let api_name = parts.next().unwrap_or("").to_string();
                let request_path = format!("/{}", parts.next().unwrap_or(""));

                tracing::info!("[x402] price callback — path={path} user={user_name} api={api_name}");

                let api_repo = api_repo.clone();
                let user_repo = user_repo.clone();

                async move {
                    let apis = match api_repo.get_apis_by_user(&user_name).await {
                        Ok(apis) => apis,
                        Err(e) => {
                            tracing::error!("[x402] get_apis_by_user error: {e}");
                            return vec![];
                        }
                    };
                    tracing::info!("[x402] found {} apis for user={user_name}", apis.len());

                    let api = match apis.into_iter().find(|a| a.name == api_name) {
                        Some(api) => api,
                        None => {
                            tracing::warn!("[x402] api not found: {api_name}");
                            return vec![];
                        }
                    };

                    let Some(cost_per_request) =
                        resolve_request_price(&api, &request_method, &request_path)
                    else {
                        tracing::warn!("[x402] no active price for api={api_name} path={request_path}");
                        return vec![];
                    };
                    tracing::info!("[x402] resolved_cost_per_request={cost_per_request}");

                    let user = match user_repo.get_user_by_id(&user_name).await {
                        Ok(Some(user)) => user,
                        Ok(None) => {
                            tracing::warn!("[x402] user not found: {user_name}");
                            return vec![];
                        }
                        Err(e) => {
                            tracing::error!("[x402] get_user_by_id error: {e}");
                            return vec![];
                        }
                    };
                    tracing::info!("[x402] user sol_public_key={}", user.sol_public_key);

                    let Some((user_data_pda, user_data_ata)) = derive_user_data_accounts(&user.sol_public_key) else {
                        tracing::error!("[x402] derive_user_data_accounts failed for {}", user.sol_public_key);
                        return vec![];
                    };
                    tracing::info!("[x402] user_data_pda={user_data_pda} user_data_ata={user_data_ata}");
                    let Ok(pay_to) = Address::from_str(&user_data_pda.to_string()) else {
                        tracing::error!("[x402] Address::from_str failed for {user_data_pda}");
                        return vec![];
                    };

                    let amount = (cost_per_request * 1_000_000.0) as u64;
                    tracing::info!("[x402] issuing price_tag pay_to={pay_to} (ata={user_data_ata}) amount={amount}");
                    vec![
                        V2SolanaExact::price_tag(pay_to, USDC::solana_devnet().amount(amount)),
                    ]
                }
            })
    };

    Router::new()
        .route("/create_user", post(create_user))
        .route("/send_otp", post(send_otp))
        .route("/verify_otp", post(verify_otp))
        .route("/browse", get(browse_apis))
        .route("/user/pubkey/{pubkey}", get(get_user_by_pubkey))
        .route("/{user_name}", get(get_user))
        .route("/{user_name}/apis", get(list_user_apis))
        .route("/{user_name}/create_api", post(create_api))
        .route("/{user_name}/{api_name}", get(get_api))
        .route("/{user_name}/{api_name}", delete(delete_api))
        .route("/{user_name}/{api_name}", axum::routing::put(update_api))
        .route(
            "/{user_name}/{api_name}",
            post(proxy_request).layer(make_price_layer(
                shared::HttpMethod::POST,
                api_repo_dyn.clone(),
                user_repo_dyn.clone(),
            )),
        )
        .route(
            "/{user_name}/{api_name}/{*rest}",
            get(proxy_request).layer(make_price_layer(
                shared::HttpMethod::GET,
                api_repo_dyn.clone(),
                user_repo_dyn.clone(),
            )),
        )
        .route(
            "/{user_name}/{api_name}/{*rest}",
            post(proxy_request).layer(make_price_layer(
                shared::HttpMethod::POST,
                api_repo_dyn.clone(),
                user_repo_dyn.clone(),
            )),
        )
        .route(
            "/{user_name}/{api_name}/{*rest}",
            axum::routing::put(proxy_request).layer(make_price_layer(
                shared::HttpMethod::PUT,
                api_repo_dyn.clone(),
                user_repo_dyn.clone(),
            )),
        )
        .route(
            "/{user_name}/{api_name}/{*rest}",
            delete(proxy_request).layer(make_price_layer(
                shared::HttpMethod::DELETE,
                api_repo_dyn.clone(),
                user_repo_dyn.clone(),
            )),
        )
        .route(
            "/{user_name}/{api_name}/{*rest}",
            axum::routing::patch(proxy_request).layer(make_price_layer(
                shared::HttpMethod::PATCH,
                api_repo_dyn.clone(),
                user_repo_dyn.clone(),
            )),
        )
        .route(
            "/{user_name}/{api_name}/{*rest}",
            axum::routing::head(proxy_request).layer(make_price_layer(
                shared::HttpMethod::HEAD,
                api_repo_dyn.clone(),
                user_repo_dyn.clone(),
            )),
        )
        .route(
            "/{user_name}/{api_name}/{*rest}",
            axum::routing::options(proxy_request).layer(make_price_layer(
                shared::HttpMethod::OPTIONS,
                api_repo_dyn,
                user_repo_dyn,
            )),
        )
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http())
        .with_state(AppState {
            user_repo,
            api_repo,
            facilitator_url,
            base_url,
        })
}
