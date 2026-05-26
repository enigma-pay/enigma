"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { AuthModal } from "@/components/auth-modal";
import { EnigmaLogo } from "@/components/api-browser";

export default function Home() {
  const { user, isLoading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-mono">
      {/* Nav */}
      <header className="border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <EnigmaLogo />
          <span className="text-xs tracking-widest uppercase">enigma</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/browse"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            browse apis
          </Link>
          <button
            onClick={() => setShowAuth(true)}
            className="border border-foreground bg-foreground text-background px-3 py-1.5 text-xs hover:bg-transparent hover:text-foreground transition-colors"
          >
            sign in →
          </button>
          <a
            href="/docs"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            docs
          </a>
          {!isLoading && user ? (
            <Link
              href="/dashboard"
              className="text-xs border border-border px-3 py-1.5 text-foreground hover:bg-accent transition-colors"
            >
              dashboard →
            </Link>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="text-xs border border-foreground bg-foreground text-background px-3 py-1.5 hover:bg-transparent hover:text-foreground transition-colors"
            >
              get started
            </button>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="px-6 py-24 max-w-4xl mx-auto space-y-8">
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              [ api monetization on solana ]
            </p>
            <h1 className="text-4xl leading-tight tracking-tight">
              Monetize your APIs.
              <br />
              Non-custodial. Instant USDC payouts.
            </h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
            Register any API, set per-request pricing, and start earning USDC on
            Solana. Payments go directly to your wallet — no middlemen, no
            custody risk.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAuth(true)}
              className="border border-foreground bg-foreground text-background px-5 py-2.5 text-sm hover:bg-transparent hover:text-foreground transition-colors"
            >
              get started →
            </button>
            <Link
              href="/browse"
              className="border border-border px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            >
              browse apis
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-border">
          <div className="px-6 py-16 max-w-4xl mx-auto">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-8">
              [ how it works ]
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 border border-border">
              <div className="p-6 space-y-3">
                <p className="text-xs text-muted-foreground">01</p>
                <h3 className="text-sm text-foreground">Register your API</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Connect your wallet, point to your base URL, define endpoints,
                  and set USDC pricing per request.
                </p>
              </div>
              <div className="p-6 space-y-3 sm:border-l sm:border-r border-t sm:border-t-0 border-border">
                <p className="text-xs text-muted-foreground">02</p>
                <h3 className="text-sm text-foreground">
                  Consumers call through Enigma
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Consumers call your API via the Enigma proxy. Each request
                  triggers an X402 micropayment on Solana.
                </p>
              </div>
              <div className="p-6 space-y-3 border-t sm:border-t-0 border-border">
                <p className="text-xs text-muted-foreground">03</p>
                <h3 className="text-sm text-foreground">Claim your USDC</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Earnings accumulate in your on-chain escrow. Claim anytime —
                  funds go directly to your Solana wallet.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Proxy call example */}
        <section className="border-t border-border">
          <div className="px-6 py-16 max-w-4xl mx-auto space-y-6">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              [ calling a registered api ]
            </p>
            <div className="border border-border p-5 text-xs space-y-1.5 bg-card">
              <p className="text-muted-foreground">
                # route a request through the enigma proxy
              </p>
              <p>
                <span className="text-foreground">GET</span>{" "}
                <span className="text-muted-foreground">enigma.xyz/</span>
                <span className="text-foreground">
                  satoshi/weather-api/v1/forecast
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">X-Payment: </span>
                <span className="text-foreground">
                  &lt;x402-solana-payment-header&gt;
                </span>
              </p>
              <p>&nbsp;</p>
              <p className="text-muted-foreground">
                # payment validated on-chain → request proxied → creator earns
                USDC
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border">
          <div className="px-6 py-16 max-w-4xl mx-auto">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-10">
              [ built for developers ]
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-2">
                <h3 className="text-sm text-foreground">Non-custodial</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your earnings live in a program-derived account only you can
                  claim. No platform custody, no withdrawal delays.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm text-foreground">OpenAPI import</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Paste an OpenAPI spec and Enigma auto-configures your
                  endpoints. Skip the manual endpoint setup.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm text-foreground">Per-endpoint pricing</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Set different USDC prices per endpoint. Charge more for
                  expensive compute, less for lightweight reads.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm text-foreground">X402 protocol</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Built on the open X402 payment standard. Any compatible client
                  can pay and call your API without extra integration.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm text-foreground">Public marketplace</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Browse and discover APIs registered by the community. Find
                  endpoints you need or showcase your own.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm text-foreground">
                  Instant devnet payouts
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Running on Solana Devnet with USDC. Sub-second finality means
                  your earnings are settled before the response returns.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border">
          <div className="px-6 py-24 max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-2xl tracking-tight">
              Start earning from your APIs today.
            </h2>
            <p className="text-sm text-muted-foreground">
              Connect your Solana wallet to register. No KYC, no approval
              required.
            </p>
            <button
              onClick={() => setShowAuth(true)}
              className="border border-foreground bg-foreground text-background px-6 py-3 text-sm hover:bg-transparent hover:text-foreground transition-colors"
            >
              connect wallet & register →
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <EnigmaLogo />
          <span className="text-xs text-muted-foreground">enigma</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>Solana Devnet</span>
          <span>·</span>
          <span>USDC payments</span>
          <span>·</span>
          <span>X402 protocol</span>
          <span>·</span>
          <Link href="/browse" className="hover:text-foreground transition-colors">
            browse apis
          </Link>
        </div>
      </footer>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
