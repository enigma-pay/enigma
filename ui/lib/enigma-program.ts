import {
  Connection,
  PublicKey,
  Transaction,
  SendOptions,
  TransactionSignature,
  TransactionInstruction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

export const PROGRAM_ID = new PublicKey("7JNGV1YkP5mT1aQvZwrADAozdPdYmpFTAAin2EqroSJW");
export const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
export const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);
export const FEE_VAULT = new PublicKey("F26ZsBCbbwxYucxg1nVXfffp9RUgdnqMTfu1m9cr6QH6");

// discriminator from IDL: [111, 17, 185, 250, 60, 122, 38, 254]
const INITIALIZE_USER_DISCRIMINATOR = Buffer.from([111, 17, 185, 250, 60, 122, 38, 254]);

// discriminator from IDL: [170, 208, 111, 232, 234, 134, 5, 217]
const COLLECT_BALANCE_DISCRIMINATOR = Buffer.from([170, 208, 111, 232, 234, 134, 5, 217]);

export interface BuiltTransaction {
  transaction: Transaction;
  blockhash: string;
  lastValidBlockHeight: number;
}

type SignTransaction = (transaction: Transaction) => Promise<Transaction>;
type SendTransaction = (
  transaction: Transaction,
  connection: Connection,
  options?: SendOptions,
) => Promise<TransactionSignature>;

export const USER_DATA_ACCOUNT_SIZE = 73;
export const TOKEN_ACCOUNT_SIZE = 165;
export const SETUP_BUFFER_SOL = 0.01;

export interface CreatorSetupEstimate {
  userDataRentLamports: number;
  tokenAccountRentLamports: number;
  bufferLamports: number;
  totalLamports: number;
  totalSol: number;
}

export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

export async function getCreatorSetupEstimate(
  connection: Connection
): Promise<CreatorSetupEstimate> {
  const [userDataRentLamports, tokenAccountRentLamports] = await Promise.all([
    connection.getMinimumBalanceForRentExemption(USER_DATA_ACCOUNT_SIZE, "confirmed"),
    connection.getMinimumBalanceForRentExemption(TOKEN_ACCOUNT_SIZE, "confirmed"),
  ]);
  const bufferLamports = Math.ceil(SETUP_BUFFER_SOL * LAMPORTS_PER_SOL);
  const totalLamports =
    userDataRentLamports + tokenAccountRentLamports + bufferLamports;

  return {
    userDataRentLamports,
    tokenAccountRentLamports,
    bufferLamports,
    totalLamports,
    totalSol: lamportsToSol(totalLamports),
  };
}

export function getGlobalConfigPda(): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("global_config")],
    PROGRAM_ID
  );
  return pda;
}

export function getUserDataPda(globalConfig: PublicKey, developer: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("USER_DATA_SEEDS"), globalConfig.toBuffer(), developer.toBuffer()],
    PROGRAM_ID
  );
  return pda;
}

export function getAssociatedTokenAddress(owner: PublicKey, mint: PublicKey): PublicKey {
  const [ata] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return ata;
}

export async function isUserInitialized(
  connection: Connection,
  developer: PublicKey
): Promise<boolean> {
  const globalConfig = getGlobalConfigPda();
  const userData = getUserDataPda(globalConfig, developer);
  const accountInfo = await connection.getAccountInfo(userData);
  return accountInfo !== null;
}

export function buildInitializeUserInstruction(developer: PublicKey): TransactionInstruction {
  const globalConfig = getGlobalConfigPda();
  const userData = getUserDataPda(globalConfig, developer);
  const userDataAta = getAssociatedTokenAddress(userData, USDC_MINT);

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: developer, isSigner: true, isWritable: true },
      { pubkey: globalConfig, isSigner: false, isWritable: false },
      { pubkey: userData, isSigner: false, isWritable: true },
      { pubkey: userDataAta, isSigner: false, isWritable: true },
      { pubkey: USDC_MINT, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: INITIALIZE_USER_DISCRIMINATOR,
  });
}

export async function buildInitializeUserTransaction(
  connection: Connection,
  developer: PublicKey
): Promise<BuiltTransaction> {
  const ix = buildInitializeUserInstruction(developer);
  const tx = new Transaction().add(ix);
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash = blockhash;
  tx.lastValidBlockHeight = lastValidBlockHeight;
  tx.feePayer = developer;
  return { transaction: tx, blockhash, lastValidBlockHeight };
}

export async function confirmBuiltTransaction(
  connection: Connection,
  built: BuiltTransaction,
  signature: TransactionSignature
): Promise<void> {
  const result = await connection.confirmTransaction(
    {
      signature,
      blockhash: built.blockhash,
      lastValidBlockHeight: built.lastValidBlockHeight,
    },
    "confirmed"
  );

  if (result.value.err) {
    throw new Error(`Transaction failed: ${JSON.stringify(result.value.err)}`);
  }
}

export async function sendBuiltTransaction(
  connection: Connection,
  built: BuiltTransaction,
  signTransaction?: SignTransaction,
  sendTransaction?: SendTransaction,
): Promise<TransactionSignature> {
  if (signTransaction) {
    const signed = await signTransaction(built.transaction);
    return connection.sendRawTransaction(signed.serialize(), {
      preflightCommitment: "confirmed",
      skipPreflight: false,
    });
  }

  if (sendTransaction) {
    return sendTransaction(built.transaction, connection, {
      preflightCommitment: "confirmed",
      skipPreflight: false,
    });
  }

  throw new Error("Your wallet cannot sign this transaction.");
}

export function getSolanaErrorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof Error)) return fallback;

  const message = err.message?.trim();
  if (!message) return fallback;

  if (/user rejected|rejected the request|declined|cancelled|canceled/i.test(message)) {
    return "Transaction cancelled in wallet.";
  }

  if (message === "Unexpected error") {
    return "Wallet could not sign or send the setup transaction. Make sure this wallet is on Solana devnet, then try again.";
  }

  return message;
}

export function buildCollectBalanceInstruction(developer: PublicKey): TransactionInstruction {
  const globalConfig = getGlobalConfigPda();
  const userData = getUserDataPda(globalConfig, developer);
  const userDataAta = getAssociatedTokenAddress(userData, USDC_MINT);
  const devAta = getAssociatedTokenAddress(developer, USDC_MINT);

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: developer, isSigner: true, isWritable: true },
      { pubkey: globalConfig, isSigner: false, isWritable: false },
      { pubkey: userData, isSigner: false, isWritable: false },
      { pubkey: userDataAta, isSigner: false, isWritable: true },
      { pubkey: FEE_VAULT, isSigner: false, isWritable: true },
      { pubkey: devAta, isSigner: false, isWritable: true },
      { pubkey: USDC_MINT, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: COLLECT_BALANCE_DISCRIMINATOR,
  });
}

export async function buildCollectBalanceTransaction(
  connection: Connection,
  developer: PublicKey
): Promise<BuiltTransaction> {
  const ix = buildCollectBalanceInstruction(developer);
  const tx = new Transaction().add(ix);
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash = blockhash;
  tx.lastValidBlockHeight = lastValidBlockHeight;
  tx.feePayer = developer;
  return { transaction: tx, blockhash, lastValidBlockHeight };
}

export async function getEscrowBalance(
  connection: Connection,
  developer: PublicKey
): Promise<number> {
  try {
    const globalConfig = getGlobalConfigPda();
    const userData = getUserDataPda(globalConfig, developer);
    const userDataAta = getAssociatedTokenAddress(userData, USDC_MINT);
    const info = await connection.getTokenAccountBalance(userDataAta);
    return info.value.uiAmount ?? 0;
  } catch {
    return 0;
  }
}
