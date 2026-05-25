# Enigma

Program ID (devnet): `7JNGV1YkP5mT1aQvZwrADAozdPdYmpFTAAin2EqroSJW`

IDL account: `7hH8smURaA4zAD7D3V8JfBVJ4qSvvjt7s7Whj6ydwzqd`

## Local setup

### Prerequisites

- Rust toolchain from `rust-toolchain.toml`
- Node.js
- `pnpm`
- Docker

### 1. Start services (Postgres + Facilitator)

```bash
docker compose up -d postgres
```

The backend defaults to:

```text
postgres://postgres:password@localhost/enigma
```

### 2. Configure env files

```bash
cp .env.example .env
cp ui/.env.example ui/.env.local
```

`GMAIL_*` values are optional for local development unless you want OTP emails to come from your own Gmail app.

### 3. Install frontend dependencies

```bash
cd ui
pnpm install
```

### 4. Run the backend

From the repo root:

```bash
cargo run
```

The API starts on `http://localhost:3000` and runs the database migrations on startup.

### 5. Run the frontend

In a second terminal:

```bash
cd ui
pnpm dev
```

The UI starts on `http://localhost:3001`.

## Architecture

- **Programs**: Solana smart contract (Anchor)
- **Backend**: Rust (Axum) REST API
- **Frontend**: Next.js 15
- **Payments**: x402 protocol over Solana devnet USDC
