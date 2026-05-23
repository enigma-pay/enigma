use crate::errors::EnigmaError;
use crate::states::GlobalConfig;
use anchor_lang::prelude::*;
use anchor_spl::token_interface::TokenAccount;

#[derive(Accounts)]
pub struct UpdateGlobalConfig<'info> {
    #[account(
        constraint = authority.key() == global_config.authority @ EnigmaError::Unauthorized,
    )]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"global_config"],
        bump = global_config.bump,
    )]
    pub global_config: Account<'info, GlobalConfig>,

    /// Optional new fee vault (only validated if fee_vault is being changed)
    pub new_fee_vault: Option<InterfaceAccount<'info, TokenAccount>>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateConfigParams {
    pub new_authority: Option<Pubkey>,
    pub new_fee_bps: Option<u16>,
    pub new_fee_vault: Option<Pubkey>,
    pub paused: Option<bool>,
}

impl<'info> UpdateGlobalConfig<'info> {
    pub fn update_global_config(&mut self, params: UpdateConfigParams) -> Result<()> {
        if let Some(new_authority) = params.new_authority {
            msg!(
                "Updating authority: {} -> {}",
                self.global_config.authority,
                new_authority
            );
            self.global_config.authority = new_authority;
        }

        if let Some(new_fee_bps) = params.new_fee_bps {
            require!(new_fee_bps <= 10_000, EnigmaError::InvalidFeeBps);
            msg!(
                "Updating fee_bps: {} -> {}",
                self.global_config.fee_bps,
                new_fee_bps
            );
            self.global_config.fee_bps = new_fee_bps;
        }

        if let Some(new_fee_vault) = params.new_fee_vault {
            // Validate that the new fee vault has the correct mint
            if let Some(ref new_vault_account) = self.new_fee_vault {
                require!(
                    new_vault_account.mint == self.global_config.mint,
                    EnigmaError::InvalidMint
                );
                require!(
                    new_vault_account.key() == new_fee_vault,
                    EnigmaError::InvalidFeeVault
                );
            }
            msg!(
                "Updating fee_vault: {} -> {}",
                self.global_config.fee_vault,
                new_fee_vault
            );
            self.global_config.fee_vault = new_fee_vault;
        }

        if let Some(paused) = params.paused {
            msg!(
                "Updating paused: {} -> {}",
                self.global_config.paused,
                paused
            );
            self.global_config.paused = paused;
        }

        Ok(())
    }
}
