FROM rust:1.91-slim-trixie AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    pkg-config libssl-dev ca-certificates build-essential \
 && rm -rf /var/lib/apt/lists/*
COPY rust-toolchain.toml Cargo.toml Cargo.lock ./
COPY crates ./crates
COPY src ./src
COPY programs ./programs
RUN cargo build --release --bin enigma_server

FROM debian:trixie-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates libssl3 \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/target/release/enigma_server /app/enigma_server
CMD ["/app/enigma_server"]
