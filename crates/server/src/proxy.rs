use crate::{endpoint_matcher::find_matching_endpoint, errors::ProxyError, AppState};
use axum::{
    body::{Body, Bytes},
    extract::{Path, State},
    http::{Method, Uri},
    response::Response,
};
use serde::Deserialize;
use shared::HttpMethod;

#[derive(Deserialize)]
pub struct ProxyPath {
    pub user_name: String,
    pub api_name: String,
}

pub async fn proxy_request(
    method: Method,
    uri: Uri,
    State(state): State<AppState>,
    Path(ProxyPath {
        user_name,
        api_name,
    }): Path<ProxyPath>,
    body: Bytes,
) -> Result<Response, ProxyError> {
    tracing::info!("[proxy] {method} {uri} — user={user_name} api={api_name}");
    let apis = state
        .api_repo
        .get_apis_by_user(&user_name)
        .await
        .map_err(|_| ProxyError::ApiNotFound)?;

    let api = apis
        .into_iter()
        .find(|a| a.name == api_name)
        .ok_or(ProxyError::ApiNotFound)?;

    let full = uri.path_and_query().map(|pq| pq.as_str()).unwrap_or("");
    let prefix = format!("/{}/{}", user_name, api_name);
    let rest = full.strip_prefix(&prefix).unwrap_or("");
    let request_path = if rest.is_empty() { "/" } else { rest };
    let request_method = HttpMethod::from(method.clone());
    let _matched_endpoint = find_matching_endpoint(&api, &request_method, request_path);
    let upstream_url = format!("{}{}", api.base_url.trim_end_matches('/'), rest);
    tracing::info!("[proxy] → upstream {method} {upstream_url}");
    tracing::debug!("[proxy] base_url={} rest={}", api.base_url, rest);

    let client = reqwest::Client::new();
    let builder = match method {
        Method::GET => client.get(&upstream_url),
        Method::POST => client.post(&upstream_url),
        Method::PUT => client.put(&upstream_url),
        Method::DELETE => client.delete(&upstream_url),
        Method::PATCH => client.patch(&upstream_url),
        _ => client.get(&upstream_url),
    };
    let builder = builder.header("User-Agent", "Enigma-Proxy/1.0");
    let builder = if body.is_empty() {
        builder
    } else {
        builder.body(body.to_vec())
    };

    let upstream = builder
        .send()
        .await
        .map_err(|e| ProxyError::UpstreamError(e.to_string()))?;

    let status = upstream.status();
    tracing::info!("[proxy] ← upstream status={status}");
    let headers = upstream.headers().clone();
    let resp_bytes = upstream
        .bytes()
        .await
        .map_err(|e| ProxyError::UpstreamError(e.to_string()))?;
    const HOP_BY_HOP: &[&str] = &[
        "transfer-encoding",
        "content-encoding",
        "content-length",
        "connection",
        "keep-alive",
        "te",
        "trailers",
        "upgrade",
    ];
    let mut builder = Response::builder().status(status.as_u16());
    for (key, value) in &headers {
        if !HOP_BY_HOP.contains(&key.as_str().to_lowercase().as_str()) {
            builder = builder.header(key.as_str(), value.as_bytes());
        }
    }

    builder
        .body(Body::from(resp_bytes))
        .map_err(|e| ProxyError::UpstreamError(e.to_string()))
}
