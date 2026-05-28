"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiForm } from "@/components/dashboard/api-form";
import { createApi, addStoredApiName, listUserApis } from "@/lib/api";
import {
  buildInitializeUserTransaction,
  confirmBuiltTransaction,
  CreatorSetupEstimate,
  getSolanaErrorMessage,
  getCreatorSetupEstimate,
  isUserInitialized,
  lamportsToSol,
  sendBuiltTransaction,
} from "@/lib/enigma-program";
import { CreateApiRequest } from "@/lib/types";

type CreateStep = "checking" | "creator_setup" | "setup_success" | "api_form";

function formatSol(value: number | null): string {
  if (value == null) return "checking...";
  return `${value.toFixed(4)} SOL`;
}

function shortAddress(value: string): string {
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

export default function NewApi() {
  const { user } = useAuth();
  const { connected, publicKey, sendTransaction, signTransaction } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [settingUpCreator, setSettingUpCreator] = useState(false);
  const [checkingCreatorSetup, setCheckingCreatorSetup] = useState(true);
  const [existingApiCount, setExistingApiCount] = useState<number | null>(null);
  const [creatorSetupReady, setCreatorSetupReady] = useState<boolean | null>(null);
  const [setupEstimate, setSetupEstimate] = useState<CreatorSetupEstimate | null>(null);
  const [walletBalanceLamports, setWalletBalanceLamports] = useState<number | null>(null);
  const [createStep, setCreateStep] = useState<CreateStep>("checking");
  const [setupError, setSetupError] = useState("");
  const [error, setError] = useState("");

  const walletMatches =
    !!user && !!publicKey && publicKey.toString() === user.sol_public_key;
  const setupRequired = existingApiCount === 0 && creatorSetupReady === false;
  const balanceSol = useMemo(
    () =>
      walletBalanceLamports == null
        ? null
        : lamportsToSol(walletBalanceLamports),
    [walletBalanceLamports],
  );
  const balanceTooLow =
    setupRequired &&
    setupEstimate != null &&
    walletBalanceLamports != null &&
    walletBalanceLamports < setupEstimate.totalLamports;

  const loadCreatorSetupStatus = useCallback(async () => {
    if (!user) return null;

    setCheckingCreatorSetup(true);
    setCreateStep("checking");
    setSetupError("");
    try {
      const ownerPublicKey = new PublicKey(user.sol_public_key);
      const [apis, initialized, estimate] = await Promise.all([
        listUserApis(user.user_name),
        isUserInitialized(connection, ownerPublicKey),
        getCreatorSetupEstimate(connection),
      ]);
      const apiCount = apis?.length ?? 0;

      setExistingApiCount(apiCount);
      setCreatorSetupReady(initialized);
      setSetupEstimate(estimate);
      setError("");
      setCreateStep(apiCount > 0 || initialized ? "api_form" : "creator_setup");

      if (publicKey) {
        const balance = await connection.getBalance(publicKey, "confirmed");
        setWalletBalanceLamports(balance);
      } else {
        setWalletBalanceLamports(null);
      }

      return { apiCount, initialized };
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not check creator setup.";
      setSetupError(message);
      setExistingApiCount(null);
      setCreatorSetupReady(null);
      setCreateStep("creator_setup");
      return null;
    } finally {
      setCheckingCreatorSetup(false);
    }
  }, [connection, publicKey, user]);

  useEffect(() => {
    void loadCreatorSetupStatus();
  }, [loadCreatorSetupStatus]);

  async function ensureCreatorSetup(): Promise<boolean> {
    if (!user) return false;

    setSetupError("");
    setError("");
    const status =
      existingApiCount == null || creatorSetupReady == null
        ? await loadCreatorSetupStatus()
        : { apiCount: existingApiCount, initialized: creatorSetupReady };

    if (!status) {
      const message = "Could not check creator setup. Try again in a moment.";
      setError(message);
      setSetupError(message);
      return false;
    }

    if (status.apiCount > 0 || status.initialized) {
      setCreateStep("api_form");
      return true;
    }

    if (!connected || !publicKey || !walletMatches) {
      const message = `Connect the wallet you signed up with (${shortAddress(
        user.sol_public_key,
      )}) before publishing your first API.`;
      setError(message);
      setSetupError(message);
      return false;
    }

    const estimate = setupEstimate ?? (await getCreatorSetupEstimate(connection));
    setSetupEstimate(estimate);

    const balance =
      walletBalanceLamports ??
      (await connection.getBalance(publicKey, "confirmed"));
    setWalletBalanceLamports(balance);

    if (balance < estimate.totalLamports) {
      const message =
        "Add a little SOL to this wallet, then refresh. It covers the one-time creator payout setup and network fees.";
      setError(message);
      setSetupError(message);
      return false;
    }

    if (!signTransaction && !sendTransaction) {
      const message = "Your wallet is connected, but it cannot sign transactions.";
      setError(message);
      setSetupError(message);
      return false;
    }

    setSettingUpCreator(true);
    try {
      const built = await buildInitializeUserTransaction(connection, publicKey);
      const sig = await sendBuiltTransaction(
        connection,
        built,
        signTransaction,
        sendTransaction,
      );

      try {
        await confirmBuiltTransaction(connection, built, sig);
      } catch (err) {
        const initializedAfterError = await isUserInitialized(connection, publicKey);
        if (!initializedAfterError) throw err;
      }

      setCreatorSetupReady(true);
      setError("");
      setCreateStep("setup_success");
      const nextBalance = await connection.getBalance(publicKey, "confirmed");
      setWalletBalanceLamports(nextBalance);
      return true;
    } catch (err: unknown) {
      try {
        const initializedAfterError = await isUserInitialized(connection, publicKey);
        if (initializedAfterError) {
          setCreatorSetupReady(true);
          setError("");
          setCreateStep("setup_success");
          return true;
        }
      } catch {
        // Keep the original transaction error below; this re-check is only a recovery path.
      }

      const message = getSolanaErrorMessage(err, "Creator setup failed.");
      setError(message);
      setSetupError(message);
      return false;
    } finally {
      setSettingUpCreator(false);
    }
  }

  async function handleSubmit(data: CreateApiRequest) {
    setError("");
    setSubmitting(true);
    try {
      if (!user) return;

      const api = await createApi(user.user_name, data);
      addStoredApiName(user.user_name, api.name);
      router.push(`/dashboard/${api.name}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create API");
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return null;

  if (createStep === "checking" || checkingCreatorSetup) {
    return (
      <SetupShell>
        <div className="border border-border p-6 space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            checking creator setup
          </p>
          <p className="text-sm text-foreground">
            Getting your API workspace ready...
          </p>
          <p className="text-xs text-muted-foreground">
            We are checking whether your one-time creator payout account already exists.
          </p>
        </div>
      </SetupShell>
    );
  }

  if (createStep === "setup_success") {
    return (
      <SetupShell>
        <div className="border border-emerald-500/40 bg-emerald-500/10 p-6 space-y-5">
          <div className="space-y-2">
            <p className="text-xs text-emerald-300 uppercase tracking-widest">
              creator setup complete
            </p>
            <h1 className="text-lg text-foreground font-mono">
              Payouts are ready.
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your creator payout account is prepared. Now you can add your API
              details, import an OpenAPI spec, and choose pricing.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setError("");
              setCreateStep("api_form");
            }}
            className="w-full border border-foreground bg-foreground text-background px-4 py-3 text-sm hover:bg-transparent hover:text-foreground transition-colors"
          >
            continue to API setup →
          </button>
        </div>
      </SetupShell>
    );
  }

  if (createStep === "creator_setup") {
    return (
      <SetupShell>
        <div className="border border-border p-6 space-y-6">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              one-time creator setup
            </p>
            <h1 className="text-lg text-foreground font-mono">
              Prepare your payout account first.
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This creates your creator payout account so API earnings can be
              routed to you. It only happens before your first API.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px border border-border bg-border">
            <div className="bg-card p-3 space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                wallet
              </p>
              <p className="text-xs text-foreground font-mono">
                {publicKey ? shortAddress(publicKey.toString()) : "not connected"}
              </p>
            </div>
            <div className="bg-card p-3 space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                balance
              </p>
              <p className="text-xs text-foreground font-mono">
                {formatSol(balanceSol)}
              </p>
            </div>
            <div className="bg-card p-3 space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                estimated need
              </p>
              <p className="text-xs text-foreground font-mono">
                {formatSol(setupEstimate?.totalSol ?? null)}
              </p>
            </div>
          </div>

          {existingApiCount == null || creatorSetupReady == null ? (
            <p className="text-xs text-amber-300">
              We could not confirm your setup status. Try checking again.
            </p>
          ) : !setupRequired ? (
            <p className="text-xs text-muted-foreground">
              Setup is no longer required. Continue to API setup.
            </p>
          ) : !connected || !walletMatches ? (
            <p className="text-xs text-amber-300">
              Connect the wallet you signed up with (
              {shortAddress(user.sol_public_key)}) before publishing your first API.
            </p>
          ) : balanceTooLow ? (
            <p className="text-xs text-amber-300">
              Add a little SOL to this wallet, then refresh. The estimate
              includes a small safety buffer for network setup costs.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Your wallet will ask for one approval to prepare payouts.
            </p>
          )}

          {setupError && (
            <p className="text-xs text-destructive break-all">{setupError}</p>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {existingApiCount == null || creatorSetupReady == null ? (
              <button
                type="button"
                onClick={() => void loadCreatorSetupStatus()}
                className="flex-1 border border-foreground bg-foreground text-background px-4 py-3 text-sm hover:bg-transparent hover:text-foreground transition-colors"
              >
                check again →
              </button>
            ) : !setupRequired ? (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setCreateStep("api_form");
                }}
                className="flex-1 border border-foreground bg-foreground text-background px-4 py-3 text-sm hover:bg-transparent hover:text-foreground transition-colors"
              >
                continue to API setup →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void ensureCreatorSetup()}
                disabled={
                  settingUpCreator ||
                  !connected ||
                  !walletMatches ||
                  balanceTooLow ||
                  setupEstimate == null
                }
                className="flex-1 border border-foreground bg-foreground text-background px-4 py-3 text-sm hover:bg-transparent hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {settingUpCreator ? "setting up..." : "set up payouts →"}
              </button>
            )}
          </div>
        </div>
      </SetupShell>
    );
  }

  return (
    <ApiForm
      mode="create"
      submitting={submitting}
      submitError={error}
      onSubmit={handleSubmit}
    />
  );
}

function SetupShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 py-8 max-w-2xl mx-auto w-full">
      <Link
        href="/dashboard"
        className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block"
      >
        ← back
      </Link>
      {children}
    </div>
  );
}
