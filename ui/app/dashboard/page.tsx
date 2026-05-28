// Dashboard main page
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useAuth } from "@/components/providers/auth-provider";
import { listUserApis } from "@/lib/api";
import { describeApiPrice } from "@/lib/pricing";
import { Api } from "@/lib/types";
import {
  getEscrowBalance,
  buildCollectBalanceTransaction,
  confirmBuiltTransaction,
  getSolanaErrorMessage,
  sendBuiltTransaction,
} from "@/lib/enigma-program";

function EarningsCard() {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const { connection } = useConnection();

  const [balance, setBalance] = useState<number | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimError, setClaimError] = useState("");

  const loadBalance = useCallback(async () => {
    if (!publicKey) return;
    const b = await getEscrowBalance(connection, publicKey);
    setBalance(b);
  }, [publicKey, connection]);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  async function handleClaim() {
    if (!publicKey || (!signTransaction && !sendTransaction) || !balance || balance === 0) return;
    setClaiming(true);
    setClaimError("");
    try {
      const built = await buildCollectBalanceTransaction(connection, publicKey);
      const sig = await sendBuiltTransaction(
        connection,
        built,
        signTransaction,
        sendTransaction,
      );
      await confirmBuiltTransaction(connection, built, sig);
      setClaimSuccess(true);
      await loadBalance();
      setTimeout(() => setClaimSuccess(false), 3000);
    } catch (err: unknown) {
      setClaimError(getSolanaErrorMessage(err, "Claim failed"));
    } finally {
      setClaiming(false);
    }
  }

  return (
    <div className="border border-border px-5 py-4">
      <div className="flex items-center justify-between gap-6">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">earnings</p>
          {balance === null ? (
            <p className="text-2xl font-mono text-muted-foreground animate-pulse">—</p>
          ) : (
            <p className="text-2xl font-mono text-foreground">${balance}</p>
          )}
          {balance === 0 && !claimSuccess && (
            <p className="text-xs text-muted-foreground">no earnings yet</p>
          )}
          {claimSuccess && (
            <p className="text-xs text-foreground">claimed successfully ✓</p>
          )}
          {claimError && (
            <p className="text-xs text-destructive break-all">{claimError}</p>
          )}
        </div>

        {balance !== null && balance > 0 && (
          <button
            onClick={handleClaim}
            disabled={claiming}
            className="border border-foreground bg-foreground text-background px-4 py-2 text-xs hover:bg-transparent hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {claiming ? "claiming..." : "claim →"}
          </button>
        )}
      </div>
    </div>
  );
}

function ApiRow({ api }: { api: Api }) {
  return (
    <Link
      href={`/dashboard/${api.name}`}
      className="block border border-border px-4 py-4 hover:bg-accent transition-colors group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-3">
            <span className="text-sm text-foreground font-mono">{api.name}</span>
            {api.payment_config?.enabled && (
              <span className="text-xs text-muted-foreground border border-border px-1.5 py-0.5 font-mono">
                {describeApiPrice(api)}
              </span>
            )}
          </div>
          {api.description && (
            <p className="text-xs text-muted-foreground truncate">{api.description}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-xs text-muted-foreground">
            {api.endpoints.length} {api.endpoints.length === 1 ? "endpoint" : "endpoints"}
          </span>
          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [apis, setApis] = useState<Api[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApis = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await listUserApis(user.user_name);
      setApis(data ?? []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchApis();
  }, [fetchApis]);

  if (!user) return null;

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto w-full space-y-8">
      <EarningsCard />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-sm font-mono text-foreground tracking-tight">apis</h1>
          <p className="text-xs text-muted-foreground">
            {apis.length} {apis.length === 1 ? "api" : "apis"} registered
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="border border-foreground bg-foreground text-background px-3 py-1.5 text-xs hover:bg-transparent hover:text-foreground transition-colors"
        >
          + new api
        </Link>
      </div>

      {loading ? (
        <div className="space-y-px">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border border-border px-4 py-4 animate-pulse">
              <div className="h-3 w-32 bg-muted rounded-none mb-2" />
              <div className="h-2 w-48 bg-muted rounded-none" />
            </div>
          ))}
        </div>
      ) : apis.length === 0 ? (
        <div className="border border-border border-dashed px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">no apis yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            register your first api to start earning
          </p>
          <Link
            href="/dashboard/new"
            className="inline-block mt-4 text-xs text-foreground hover:text-muted-foreground transition-colors underline underline-offset-4"
          >
            create api →
          </Link>
        </div>
      ) : (
        <div className="space-y-px">
          {apis.map((api) => (
            <ApiRow key={api.id} api={api} />
          ))}
        </div>
      )}
    </div>
  );
}
