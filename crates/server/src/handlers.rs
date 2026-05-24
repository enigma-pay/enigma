use crate::app::AppState;
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::Json,
};
use base64::{engine::general_purpose, Engine as _};
use shared::{Api, CreateApiRequest, CreateUserRequest, SendOtpRequest, User, VerifyOtpRequest};

fn generate_otp() -> String {
    let id = uuid::Uuid::new_v4();
    let bytes = id.as_bytes();
    let n = u32::from_be_bytes([bytes[0], bytes[1], bytes[2], bytes[3]]);
    format!("{:06}", n % 1_000_000)
}

async fn get_gmail_access_token(
    client_id: &str,
    client_secret: &str,
    refresh_token: &str,
) -> anyhow::Result<String> {
    let resp = reqwest::Client::new()
        .post("https://oauth2.googleapis.com/token")
        .form(&[
            ("client_id", client_id),
            ("client_secret", client_secret),
            ("refresh_token", refresh_token),
            ("grant_type", "refresh_token"),
        ])
        .send()
        .await?
        .json::<serde_json::Value>()
        .await?;

    resp["access_token"]
        .as_str()
        .map(|s| s.to_string())
        .ok_or_else(|| anyhow::anyhow!("No access_token: {:?}", resp))
}

async fn send_otp_email(to: &str, otp: &str) {
    let refresh_token = std::env::var("GMAIL_REFRESH_TOKEN").ok().filter(|s| !s.is_empty());
    if refresh_token.is_none() {
        tracing::warn!("[OTP] GMAIL_REFRESH_TOKEN not set — OTP for {to}: {otp}");
        return;
    }
    let refresh_token = refresh_token.unwrap();
    let client_id = std::env::var("GMAIL_CLIENT_ID").ok().filter(|s| !s.is_empty()).unwrap_or_default();
    let client_secret = std::env::var("GMAIL_CLIENT_SECRET").ok().filter(|s| !s.is_empty()).unwrap_or_default();
    let from = std::env::var("GMAIL_FROM_EMAIL").ok().filter(|s| !s.is_empty()).unwrap_or_default();

    let html = format!(
        r#"<div style="font-family:monospace;max-width:400px;margin:0 auto;padding:40px 20px;background:#0a0a0a;color:#fff">
            <p style="color:#666;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-bottom:24px">enigma · verify your email</p>
            <div style="border:1px solid #333;padding:24px;text-align:center;margin-bottom:24px">
            <span style="font-size:32px;font-weight:700;letter-spacing:12px;color:#fff">{otp}</span>
            </div>
            <p style="color:#666;font-size:12px">This code expires in 5 minutes.</p>
        </div>"#
    );

    let boundary = uuid::Uuid::new_v4().to_string().replace('-', "");
    let html_b64 = general_purpose::STANDARD.encode(html.as_bytes());
    let raw = format!(
        "From: Enigma <{from}>\r\nTo: {to}\r\nSubject: Your Enigma verification code\r\nMIME-Version: 1.0\r\nContent-Type: multipart/alternative; boundary=\"{boundary}\"\r\n\r\n--{boundary}\r\nContent-Type: text/html; charset=\"UTF-8\"\r\nContent-Transfer-Encoding: base64\r\n\r\n{html_b64}\r\n\r\n--{boundary}--"
    );
    let encoded = general_purpose::URL_SAFE_NO_PAD.encode(raw.as_bytes());

    match get_gmail_access_token(&client_id, &client_secret, &refresh_token).await {
        Ok(token) => {
            let res = reqwest::Client::new()
                .post("https://gmail.googleapis.com/gmail/v1/users/me/messages/send")
                .bearer_auth(token)
                .json(&serde_json::json!({ "raw": encoded }))
                .send()
                .await;
            match res {
                Ok(r) if r.status().is_success() => tracing::info!("[OTP] sent to {to}"),
                Ok(r) => tracing::error!("[OTP] Gmail error: {}", r.status()),
                Err(e) => tracing::error!("[OTP] request failed: {e}"),
            }
        }
        Err(e) => tracing::error!("[OTP] token error: {e}"),
    }
}

pub async fn create_user(
    State(state): State<AppState>,
    Json(request): Json<CreateUserRequest>,
) -> Result<Json<User>, StatusCode> {
    match state.user_repo.create_user(request).await {
        Ok(user) => Ok(Json(user)),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn get_user(
    State(state): State<AppState>,
    Path(user_name): Path<String>,
) -> Result<Json<User>, StatusCode> {
    match state.user_repo.get_user_by_id(&user_name).await {
        Ok(Some(user)) => Ok(Json(user)),
        Ok(None) => Err(StatusCode::NOT_FOUND),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn get_user_by_pubkey(
    State(state): State<AppState>,
    Path(pubkey): Path<String>,
) -> Result<Json<User>, StatusCode> {
    match state.user_repo.get_user_by_address(&pubkey).await {
        Ok(Some(user)) => Ok(Json(user)),
        Ok(None) => Err(StatusCode::NOT_FOUND),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn browse_apis(State(state): State<AppState>) -> Result<Json<Vec<Api>>, StatusCode> {
    match state.api_repo.list_all_apis().await {
        Ok(apis) => Ok(Json(apis)),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn create_api(
    State(state): State<AppState>,
    Path(user_name): Path<String>,
    Json(request): Json<CreateApiRequest>,
) -> Result<Json<Api>, StatusCode> {
    match state.user_repo.get_user_by_id(&user_name).await {
        Ok(Some(_)) => {}
        Ok(None) => return Err(StatusCode::NOT_FOUND),
        Err(_) => return Err(StatusCode::INTERNAL_SERVER_ERROR),
    }

    match state.api_repo.create_api(&user_name, request).await {
        Ok(api) => Ok(Json(api)),
        Err(e) => {
            tracing::error!("create_api error for user={user_name}: {e}");
            if let Some(db_err) = e.downcast_ref::<sqlx::Error>() {
                if let sqlx::Error::Database(db) = db_err {
                    // Unique constraint violation — duplicate API name
                    if db.code().as_deref() == Some("23505") {
                        return Err(StatusCode::CONFLICT);
                    }
                }
            }
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_api(
    State(state): State<AppState>,
    Path((user_name, api_name)): Path<(String, String)>,
) -> Result<Json<Api>, StatusCode> {
    let apis = match state.api_repo.get_apis_by_user(&user_name).await {
        Ok(apis) => apis,
        Err(_) => return Err(StatusCode::INTERNAL_SERVER_ERROR),
    };

    match apis.into_iter().find(|a| a.name == api_name) {
        Some(api) => Ok(Json(api)),
        None => Err(StatusCode::NOT_FOUND),
    }
}

pub async fn update_api(
    State(state): State<AppState>,
    Path((user_name, api_name)): Path<(String, String)>,
    Json(request): Json<CreateApiRequest>,
) -> Result<Json<Api>, StatusCode> {
    match state.user_repo.get_user_by_id(&user_name).await {
        Ok(Some(_)) => {}
        Ok(None) => return Err(StatusCode::NOT_FOUND),
        Err(_) => return Err(StatusCode::INTERNAL_SERVER_ERROR),
    }

    let apis = match state.api_repo.get_apis_by_user(&user_name).await {
        Ok(apis) => apis,
        Err(_) => return Err(StatusCode::INTERNAL_SERVER_ERROR),
    };

    let api = match apis.into_iter().find(|a| a.name == api_name) {
        Some(api) => api,
        None => return Err(StatusCode::NOT_FOUND),
    };

    match state.api_repo.update_api(api.id, request).await {
        Ok(Some(updated)) => Ok(Json(updated)),
        Ok(None) => Err(StatusCode::NOT_FOUND),
        Err(e) => {
            tracing::error!("update_api error for user={user_name} api={api_name}: {e}");
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn send_otp(
    State(state): State<AppState>,
    Json(req): Json<SendOtpRequest>,
) -> Result<StatusCode, StatusCode> {
    let otp = generate_otp();
    let expires_at = chrono::Utc::now() + chrono::Duration::minutes(5);

    state
        .user_repo
        .upsert_otp(&req.email, &otp, expires_at)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    send_otp_email(&req.email, &otp).await;
    Ok(StatusCode::OK)
}

pub async fn verify_otp(
    State(state): State<AppState>,
    Json(req): Json<VerifyOtpRequest>,
) -> Result<StatusCode, StatusCode> {
    match state
        .user_repo
        .verify_and_consume_otp(&req.email, &req.otp)
        .await
    {
        Ok(true) => Ok(StatusCode::OK),
        Ok(false) => Err(StatusCode::UNPROCESSABLE_ENTITY),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn list_user_apis(
    State(state): State<AppState>,
    Path(user_name): Path<String>,
) -> Result<Json<Vec<Api>>, StatusCode> {
    match state.user_repo.get_user_by_id(&user_name).await {
        Ok(Some(_)) => {}
        Ok(None) => return Err(StatusCode::NOT_FOUND),
        Err(_) => return Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
    match state.api_repo.get_apis_by_user(&user_name).await {
        Ok(apis) => Ok(Json(apis)),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn delete_api(
    State(state): State<AppState>,
    Path((user_name, api_name)): Path<(String, String)>,
) -> Result<StatusCode, StatusCode> {
    let apis = match state.api_repo.get_apis_by_user(&user_name).await {
        Ok(apis) => apis,
        Err(_) => return Err(StatusCode::INTERNAL_SERVER_ERROR),
    };

    let api = match apis.into_iter().find(|a| a.name == api_name) {
        Some(api) => api,
        None => return Err(StatusCode::NOT_FOUND),
    };

    match state.api_repo.delete_api(api.id).await {
        Ok(true) => Ok(StatusCode::NO_CONTENT),
        Ok(false) => Err(StatusCode::NOT_FOUND),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}
