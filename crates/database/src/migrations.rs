// migrations: idempotent SQL run on startup
use anyhow::Result;
use sqlx::PgPool;

pub async fn run_migrations(pool: &PgPool) -> Result<()> {
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS users (
            user_name VARCHAR(255) PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            sol_public_key VARCHAR(44) UNIQUE,
            avatar_id VARCHAR(64) NOT NULL DEFAULT 'sunbeam-fox',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        "#,
    )
    .execute(pool)
    .await?;

    sqlx::query(
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_id VARCHAR(64) NOT NULL DEFAULT 'sunbeam-fox'",
    )
    .execute(pool)
    .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS apis (
            id UUID PRIMARY KEY,
            user_name VARCHAR(255) NOT NULL
                REFERENCES users(user_name) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            base_url TEXT NOT NULL,
            endpoints JSONB NOT NULL DEFAULT '[]'::jsonb,
            payment_config JSONB,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE (user_name, name)
        )
        "#,
    )
    .execute(pool)
    .await?;

    sqlx::query("CREATE INDEX IF NOT EXISTS idx_apis_user_name ON apis(user_name)")
        .execute(pool)
        .await?;

    sqlx::query("CREATE INDEX IF NOT EXISTS idx_apis_created_at ON apis(created_at)")
        .execute(pool)
        .await?;

    sqlx::query("ALTER TABLE apis ADD COLUMN IF NOT EXISTS category VARCHAR(255)")
        .execute(pool)
        .await?;

    sqlx::query("CREATE INDEX IF NOT EXISTS idx_apis_category ON apis(category)")
        .execute(pool)
        .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS email_verifications (
            id UUID PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            otp CHAR(6) NOT NULL,
            expires_at TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        "#,
    )
    .execute(pool)
    .await?;

    sqlx::query("CREATE INDEX IF NOT EXISTS idx_ev_email ON email_verifications(email)")
        .execute(pool)
        .await?;

    Ok(())
}
