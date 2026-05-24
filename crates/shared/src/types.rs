use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub sol_public_key: String,
    pub user_name: String,
    pub email: String,
    pub avatar_id: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Api {
    pub id: Uuid,
    pub user_name: String,
    pub name: String,
    pub description: Option<String>,
    pub category: Option<String>,
    pub base_url: String,
    pub endpoints: Vec<ApiEndpoint>,
    pub payment_config: Option<PaymentConfig>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiEndpoint {
    pub path: String,
    pub method: HttpMethod,
    pub headers: Option<serde_json::Value>,
    pub body_schema: Option<serde_json::Value>,
    pub query_params: Option<serde_json::Value>,
    pub cost_per_request: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum HttpMethod {
    GET,
    POST,
    PUT,
    DELETE,
    PATCH,
    HEAD,
    OPTIONS,
}

impl From<http::Method> for HttpMethod {
    fn from(value: http::Method) -> Self {
        match value {
            http::Method::GET => Self::GET,
            http::Method::POST => Self::POST,
            http::Method::PUT => Self::PUT,
            http::Method::DELETE => Self::DELETE,
            http::Method::PATCH => Self::PATCH,
            http::Method::HEAD => Self::HEAD,
            http::Method::OPTIONS => Self::OPTIONS,
            _ => Self::GET,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PaymentConfig {
    pub cost_per_request: f64, // Cost in USDC
    pub enabled: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateUserRequest {
    pub sol_public_key: String,
    pub user_name: String,
    pub email: String,
    pub avatar_id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
// used by /send_otp endpoint
pub struct SendOtpRequest {
    pub email: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VerifyOtpRequest {
    pub email: String,
    pub otp: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateApiRequest {
    pub name: String,
    pub description: Option<String>,
    pub category: Option<String>,
    pub base_url: String,
    pub endpoints: Vec<ApiEndpoint>,
    pub payment_config: Option<PaymentConfig>,
}
