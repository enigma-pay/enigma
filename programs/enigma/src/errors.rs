use anchor_lang::prelude::*;

#[error_code]
pub enum EnigmaError {
    #[msg("Unauthorized: Only the authority can perform this action")]
    Unauthorized,
    #[msg("Platform is currently paused")]
    PlatformPaused,
    #[msg("Invalid fee basis points (must be <= 10000)")]
    InvalidFeeBps,
    #[msg("Insufficient balance in treasury")]
    InsufficientBalance,
    #[msg("Invalid mint: does not match global config")]
    InvalidMint,
    #[msg("Invalid fee vault: does not match global config")]
    InvalidFeeVault,
    #[msg("Arithmetic overflow")]
    Overflow,
}
