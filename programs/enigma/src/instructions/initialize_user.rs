use crate::{EnigmaError, GlobalConfig, UserData};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(mut)]
    pub developer: Signer<'info>,

    #[account(
        seeds = [b"global_config"],
        bump = global_config.bump,
        constraint = !global_config.paused @ EnigmaError::PlatformPaused,
    )]
    pub global_config: Account<'info, GlobalConfig>,

    #[account(
        init,
        payer = developer,
        space = 8 + UserData::INIT_SPACE,
        seeds = [b"USER_DATA_SEEDS", global_config.key().as_ref(), developer.key().as_ref()],
        bump
    )]
    pub user_data: Account<'info, UserData>,

    #[account(
        init_if_needed,
        payer = developer,
        associated_token::mint = mint,
        associated_token::authority = user_data,
    )]
    pub user_data_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
        address = global_config.mint @ EnigmaError::InvalidMint,
    )]
    pub mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> InitializeUser<'info> {
    pub fn initialize_user(&mut self, bumps: &InitializeUserBumps) -> Result<()> {
        self.user_data.set_inner(UserData {
            dev: self.developer.key(),
            global_config: self.global_config.key(),
            bump: bumps.user_data,
        });
        Ok(())
    }
}
