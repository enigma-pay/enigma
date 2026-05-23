use crate::errors::EnigmaError;
use crate::states::GlobalConfig;
use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount};

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        seeds = [b"global_config"],
        bump,
        space = 8 + GlobalConfig::INIT_SPACE
    )]
    pub global_config: Account<'info, GlobalConfig>,

    /// The SPL token mint for payments (e.g., USDC)
    pub mint: InterfaceAccount<'info, Mint>,

    /// The token account that will receive platform fees
    #[account(
        constraint = fee_vault.mint == mint.key() @ EnigmaError::InvalidMint,
    )]
    pub fee_vault: InterfaceAccount<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
}

impl<'info> Initialize<'info> {
    pub fn initialize(&mut self, bumps: &InitializeBumps, fee_bps: u16) -> Result<()> {
        require!(fee_bps <= 10_000, EnigmaError::InvalidFeeBps);

        self.global_config.set_inner(GlobalConfig {
            authority: self.authority.key(),
            mint: self.mint.key(),
            fee_bps,
            fee_vault: self.fee_vault.key(),
            paused: false,
            bump: bumps.global_config,
        });

        msg!(
            "Enigma platform initialized. Authority: {}, Fee: {}bps",
            self.authority.key(),
            fee_bps
        );

        Ok(())
    }
}
