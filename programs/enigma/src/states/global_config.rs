use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct GlobalConfig {
    /// Admin that can update config
    pub authority: Pubkey,
    /// SPL token mint used for payments (e.g. USDC)
    pub mint: Pubkey,
    /// Platform fee in basis points (10% = 1000)
    pub fee_bps: u16,
    /// Token account that receives platform fees
    pub fee_vault: Pubkey,
    /// Emergency pause switch
    pub paused: bool,
    /// PDA bump
    pub bump: u8,
}
