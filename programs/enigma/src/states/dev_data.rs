use anchor_lang::prelude::*;

#[account]
/// PDA SEEDS: ["USER_DATA_SEEDS", global_config.key() ,dev.key()]
#[derive(InitSpace)]
pub struct UserData {
    /// The developers's wallet address
    pub dev: Pubkey,
    /// global config
    pub global_config: Pubkey,
    /// PDA bump for user_data
    pub bump: u8,
}
