// Custom error types for Enigma proxy server
use axum::response::{IntoResponse, Response};
use http::StatusCode;

#[derive(Debug)]
pub enum ProxyError {
    ApiNotFound,
    UserNotFound,
    PaymentRequired(Response),
    UpstreamError(String),
    InvalidConfiguration(String),
}

impl IntoResponse for ProxyError {
    fn into_response(self) -> Response {
        match self {
            ProxyError::ApiNotFound => (StatusCode::NOT_FOUND, "API not found").into_response(),
            ProxyError::UserNotFound => (StatusCode::NOT_FOUND, "User not found").into_response(),
            ProxyError::PaymentRequired(response) => response,
            ProxyError::UpstreamError(msg) => {
                (StatusCode::BAD_GATEWAY, format!("Upstream error: {}", msg)).into_response()
            }
            ProxyError::InvalidConfiguration(msg) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Config error: {}", msg),
            )
                .into_response(),
        }
    }
}
