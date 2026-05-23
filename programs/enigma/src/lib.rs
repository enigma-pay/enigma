use anchor_lang::prelude::*;
pub mod errors;
pub mod instructions;
pub mod states;

pub use errors::*;
pub use instructions::*;
pub use states::*;

declare_id!("7JNGV1YkP5mT1aQvZwrADAozdPdYmpFTAAin2EqroSJW");

#[program]
pub mod enigma {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, fee_bps: u16) -> Result<()> {
        ctx.accounts.initialize(&ctx.bumps, fee_bps)
    }

    pub fn update_global_config(
        ctx: Context<UpdateGlobalConfig>,
        params: UpdateConfigParams,
    ) -> Result<()> {
        ctx.accounts.update_global_config(params)
    }

    pub fn initialize_user(ctx: Context<InitializeUser>) -> Result<()> {
        ctx.accounts.initialize_user(&ctx.bumps)
    }

    pub fn collect_balance(ctx: Context<CollectBalance>) -> Result<()> {
        ctx.accounts.collect_balance()
    }
}
