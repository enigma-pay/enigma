use chrono::{DateTime, Utc};
use shared::{Api, User};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, FromRow)]
pub struct UserRow {
    pub sol_public_key: String,
    pub user_name: String,
    pub email: String,
    pub avatar_id: String,
    pub created_at: DateTime<Utc>,
}

impl From<UserRow> for User {
    fn from(row: UserRow) -> Self {
        User {
            sol_public_key: row.sol_public_key,
            user_name: row.user_name,
            email: row.email,
            avatar_id: row.avatar_id,
            created_at: row.created_at,
        }
    }
}

#[derive(Debug, Clone, FromRow)]
pub struct OtpRow {
    pub id: Uuid,
    pub email: String,
    pub otp: String,
    pub expires_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct ApiRow {
    pub id: Uuid,
    pub user_name: String,
    pub name: String,
    pub description: Option<String>,
    pub category: Option<String>,
    pub base_url: String,
    pub endpoints: serde_json::Value,
    pub payment_config: Option<serde_json::Value>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<ApiRow> for Api {
    fn from(row: ApiRow) -> Self {
        Api {
            id: row.id,
            user_name: row.user_name.clone(),
            name: row.name,
            description: row.description,
            category: row.category,
            base_url: row.base_url,
            endpoints: serde_json::from_value(row.endpoints).unwrap_or_default(),
            payment_config: row
                .payment_config
                .and_then(|v| serde_json::from_value(v).ok()),
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}
