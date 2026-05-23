use crate::{EnigmaError, GlobalConfig, UserData};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

#[derive(Accounts)]
pub struct CollectBalance<'info> {
    #[account(mut)]
    pub developer: Signer<'info>,

    #[account(
        seeds = [b"global_config"],
        bump = global_config.bump,
        constraint = !global_config.paused @ EnigmaError::PlatformPaused,
    )]
    pub global_config: Account<'info, GlobalConfig>,

    #[account(
        seeds = [b"USER_DATA_SEEDS", global_config.key().as_ref(), developer.key().as_ref()],
        bump = user_data.bump,
        constraint = user_data.dev == developer.key() @ EnigmaError::Unauthorized,
        constraint = user_data.global_config == global_config.key() @ EnigmaError::Unauthorized,
    )]
    pub user_data: Account<'info, UserData>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = user_data,
    )]
    pub user_data_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        address = global_config.fee_vault @ EnigmaError::InvalidFeeVault,
    )]
    pub fee_vault: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = developer,
        associated_token::mint = mint,
        associated_token::authority = developer,
    )]
    pub dev_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(address = global_config.mint @ EnigmaError::InvalidMint)]
    pub mint: InterfaceAccount<'info, Mint>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> CollectBalance<'info> {
    pub fn collect_balance(&mut self) -> Result<()> {
        let balance = self.user_data_ata.amount;
        require!(balance > 0, EnigmaError::InsufficientBalance);
        let fee = (balance as u128)
            .checked_mul(self.global_config.fee_bps as u128)
            .ok_or(EnigmaError::Overflow)?
            .checked_div(10_000)
            .ok_or(EnigmaError::Overflow)? as u64;

        let net = balance.checked_sub(fee).ok_or(EnigmaError::Overflow)?;
        let global_config_key = self.global_config.key();
        let developer_key = self.developer.key();
        let bump = [self.user_data.bump];
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"USER_DATA_SEEDS",
            global_config_key.as_ref(),
            developer_key.as_ref(),
            &bump,
        ]];

        if fee > 0 {
            transfer_checked(
                CpiContext::new_with_signer(
                    self.token_program.to_account_info(),
                    TransferChecked {
                        from: self.user_data_ata.to_account_info(),
                        mint: self.mint.to_account_info(),
                        to: self.fee_vault.to_account_info(),
                        authority: self.user_data.to_account_info(),
                    },
                    signer_seeds,
                ),
                fee,
                self.mint.decimals,
            )?;
        }

        if net > 0 {
            transfer_checked(
                CpiContext::new_with_signer(
                    self.token_program.to_account_info(),
                    TransferChecked {
                        from: self.user_data_ata.to_account_info(),
                        mint: self.mint.to_account_info(),
                        to: self.dev_ata.to_account_info(),
                        authority: self.user_data.to_account_info(),
                    },
                    signer_seeds,
                ),
                net,
                self.mint.decimals,
            )?;
        }

        Ok(())
    }
}
