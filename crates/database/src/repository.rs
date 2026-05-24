use crate::models::{ApiRow, OtpRow, UserRow};
use anyhow::Result;
use shared::{Api, CreateApiRequest, CreateUserRequest, User};
use sqlx::PgPool;
use uuid::Uuid;

const DEFAULT_AVATAR_ID: &str = "sunbeam-fox";
const ALLOWED_AVATAR_IDS: &[&str] = &[
    "sunbeam-fox",
    "melon-cat",
    "bubble-bunny",
    "orbit-panda",
    "berry-bot",
    "mint-ghost",
    "peach-pup",
    "cobalt-owl",
    "lime-frog",
    "coral-koi",
    "star-mouse",
    "plum-dragon",
];

fn normalize_avatar_id(avatar_id: Option<String>) -> String {
    avatar_id
        .filter(|id| ALLOWED_AVATAR_IDS.contains(&id.as_str()))
        .unwrap_or_else(|| DEFAULT_AVATAR_ID.to_string())
}

#[derive(Clone)]
pub struct UserRepository {
    pool: PgPool,
}

#[derive(Clone)]
pub struct ApiRepository {
    pool: PgPool,
}

impl UserRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn create_user(&self, request: CreateUserRequest) -> Result<User> {
        let avatar_id = normalize_avatar_id(request.avatar_id);
        let user = sqlx::query_as::<_, UserRow>(
            "INSERT INTO users (user_name, email, sol_public_key, avatar_id) VALUES ($1, $2, $3, $4) RETURNING *",
        )
        .bind(&request.user_name)
        .bind(&request.email)
        .bind(&request.sol_public_key)
        .bind(&avatar_id)
        .fetch_one(&self.pool)
        .await?;

        Ok(user.into())
    }

    pub async fn get_user_by_id(&self, user_name: &str) -> Result<Option<User>> {
        let user = sqlx::query_as::<_, UserRow>("SELECT * FROM users WHERE user_name = $1")
            .bind(user_name)
            .fetch_optional(&self.pool)
            .await?;

        Ok(user.map(|u| u.into()))
    }

    pub async fn get_user_by_email(&self, email: &str) -> Result<Option<User>> {
        let user = sqlx::query_as::<_, UserRow>("SELECT * FROM users WHERE email = $1")
            .bind(email)
            .fetch_optional(&self.pool)
            .await?;

        Ok(user.map(|u| u.into()))
    }

    pub async fn upsert_otp(
        &self,
        email: &str,
        otp: &str,
        expires_at: chrono::DateTime<chrono::Utc>,
    ) -> Result<()> {
        let id = Uuid::new_v4();
        sqlx::query("DELETE FROM email_verifications WHERE email = $1")
            .bind(email)
            .execute(&self.pool)
            .await?;
        sqlx::query(
            "INSERT INTO email_verifications (id, email, otp, expires_at) VALUES ($1, $2, $3, $4)",
        )
        .bind(&id)
        .bind(email)
        .bind(otp)
        .bind(&expires_at)
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    pub async fn verify_and_consume_otp(&self, email: &str, otp: &str) -> Result<bool> {
        let row: Option<OtpRow> = sqlx::query_as(
            "SELECT * FROM email_verifications WHERE email = $1 AND expires_at > NOW()",
        )
        .bind(email)
        .fetch_optional(&self.pool)
        .await?;

        match row {
            Some(r) if r.otp.trim() == otp => {
                sqlx::query("DELETE FROM email_verifications WHERE email = $1")
                    .bind(email)
                    .execute(&self.pool)
                    .await?;
                Ok(true)
            }
            _ => Ok(false),
        }
    }

    pub async fn get_user_by_address(&self, sol_address: &str) -> Result<Option<User>> {
        let user = sqlx::query_as::<_, UserRow>("SELECT * FROM users WHERE sol_public_key = $1")
            .bind(sol_address)
            .fetch_optional(&self.pool)
            .await?;

        Ok(user.map(|u| u.into()))
    }
}

impl ApiRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn create_api(&self, user_name: &str, request: CreateApiRequest) -> Result<Api> {
        let id = Uuid::new_v4();
        let now = chrono::Utc::now();
        let endpoints_json = serde_json::to_value(&request.endpoints)?;
        let payment_config_json = request
            .payment_config
            .map(|config| serde_json::to_value(config))
            .transpose()?;

        let api = sqlx::query_as::<_, ApiRow>(
            "INSERT INTO apis (id, user_name, name, description, category, base_url, endpoints, payment_config, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *"
        )
        .bind(&id)
        .bind(&user_name)
        .bind(&request.name)
        .bind(&request.description)
        .bind(&request.category)
        .bind(&request.base_url)
        .bind(&endpoints_json)
        .bind(&payment_config_json)
        .bind(&now)
        .bind(&now)
        .fetch_one(&self.pool)
        .await?;

        Ok(api.into())
    }

    pub async fn get_api_by_id(&self, id: Uuid) -> Result<Option<Api>> {
        let api = sqlx::query_as::<_, ApiRow>("SELECT * FROM apis WHERE id = $1")
            .bind(&id)
            .fetch_optional(&self.pool)
            .await?;

        Ok(api.map(|a| a.into()))
    }

    pub async fn get_apis_by_user(&self, user_name: &str) -> Result<Vec<Api>> {
        let apis = sqlx::query_as::<_, ApiRow>(
            "SELECT * FROM apis WHERE user_name = $1 ORDER BY created_at DESC",
        )
        .bind(&user_name)
        .fetch_all(&self.pool)
        .await?;

        Ok(apis.into_iter().map(|a| a.into()).collect())
    }

    pub async fn update_api(&self, id: Uuid, request: CreateApiRequest) -> Result<Option<Api>> {
        let now = chrono::Utc::now();
        let endpoints_json = serde_json::to_value(&request.endpoints)?;
        let payment_config_json = request
            .payment_config
            .map(|config| serde_json::to_value(config))
            .transpose()?;

        let api = sqlx::query_as::<_, ApiRow>(
            "UPDATE apis
             SET description = $2,
                 category = $3,
                 base_url = $4,
                 endpoints = $5,
                 payment_config = $6,
                 updated_at = $7
             WHERE id = $1
             RETURNING *",
        )
        .bind(&id)
        .bind(&request.description)
        .bind(&request.category)
        .bind(&request.base_url)
        .bind(&endpoints_json)
        .bind(&payment_config_json)
        .bind(&now)
        .fetch_optional(&self.pool)
        .await?;

        Ok(api.map(Into::into))
    }

    pub async fn list_all_apis(&self) -> Result<Vec<Api>> {
        let apis = sqlx::query_as::<_, ApiRow>(
            "SELECT * FROM apis ORDER BY category NULLS LAST, created_at DESC",
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(apis.into_iter().map(|a| a.into()).collect())
    }

    pub async fn delete_api(&self, id: Uuid) -> Result<bool> {
        let result = sqlx::query("DELETE FROM apis WHERE id = $1")
            .bind(&id)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }
}
