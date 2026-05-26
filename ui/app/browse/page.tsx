// Browse APIs marketplace page
"use client";

import { useEffect, useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { browseApis } from "@/lib/api";
import { Api } from "@/lib/types";
import { ApiCard, EnigmaLogo } from "@/components/api-browser";
import { AuthModal } from "@/components/auth-modal";

export default function BrowsePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { connected } = useWallet();

  const [apis, setApis] = useState<Api[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const fetchApis = useCallback(async () => {
    setLoading(true);
    try {
      const data = await browseApis();
      setApis(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApis();
  }, [fetchApis]);

  const allCategories = [
    ...new Set(apis.map((a) => a.category || "Uncategorized")),
  ].sort((a, b) =>
    a === "Uncategorized" ? 1 : b === "Uncategorized" ? -1 : a.localeCompare(b),
  );

  const q = search.toLowerCase().trim();
  const searchFiltered = q
    ? apis.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.description || "").toLowerCase().includes(q) ||
          a.user_name.toLowerCase().includes(q),
      )
    : apis;

  const categoryFiltered =
    activeCategory === "all"
      ? searchFiltered
      : searchFiltered.filter(
          (a) => (a.category || "Uncategorized") === activeCategory,
        );

  const grouped: Record<string, Api[]> = {};
  for (const api of categoryFiltered) {
    const cat = api.category || "Uncategorized";
    (grouped[cat] = grouped[cat] || []).push(api);
  }
  const groupedCategories = Object.keys(grouped).sort((a, b) =>
    a === "Uncategorized" ? 1 : b === "Uncategorized" ? -1 : a.localeCompare(b),
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-6 py-3 flex items-center justify-between sticky top-0 bg-background z-40">
        <Link href="/" className="flex items-center gap-2">
          <EnigmaLogo />
          <span className="text-xs tracking-widest uppercase text-foreground">
            enigma
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <a
            href="/docs"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            docs
          </a>
          {!authLoading && user ? (
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
              {connected ? "sign in" : "get started"}
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              browse apis {!loading && `(${apis.length})`}
            </p>
            <button
              onClick={fetchApis}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              refresh
            </button>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search by name, description, or author..."
            className="w-full bg-transparent border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
          />
        </div>

        {!loading && allCategories.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveCategory("all")}
              className={`text-xs px-3 py-1.5 border transition-colors ${
                activeCategory === "all"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
              }`}
            >
              all
            </button>
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs px-3 py-1.5 border transition-colors ${
                  activeCategory === cat
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="border border-border p-4 space-y-3 animate-pulse"
              >
                <div className="h-3 w-32 bg-muted" />
                <div className="h-2 w-48 bg-muted" />
                <div className="h-2 w-24 bg-muted" />
              </div>
            ))}
          </div>
        ) : apis.length === 0 ? (
          <div className="border border-border border-dashed px-6 py-20 text-center space-y-3">
            <EnigmaLogo />
            <p className="text-sm text-muted-foreground">
              no apis registered yet
            </p>
            <button
              onClick={() => setShowAuth(true)}
              className="text-xs text-foreground underline underline-offset-4"
            >
              be the first →
            </button>
          </div>
        ) : categoryFiltered.length === 0 ? (
          <div className="border border-border border-dashed px-6 py-20 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              no results for &ldquo;{search}&rdquo;
            </p>
            <button
              onClick={() => {
                setSearch("");
                setActiveCategory("all");
              }}
              className="text-xs text-foreground underline underline-offset-4"
            >
              clear filters
            </button>
          </div>
        ) : activeCategory === "all" ? (
          <div className="space-y-10">
            {groupedCategories.map((cat) => (
              <section key={cat} className="space-y-3">
                <div className="flex items-center gap-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">
                    {cat}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {grouped[cat].length}
                  </span>
                  <div className="flex-1 border-t border-border" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px">
                  {grouped[cat].map((api) => (
                    <ApiCard
                      key={api.id}
                      api={api}
                      href={`/${api.user_name}/${api.name}`}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px">
            {categoryFiltered.map((api) => (
              <ApiCard
                key={api.id}
                api={api}
                href={`/${api.user_name}/${api.name}`}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <EnigmaLogo />
          <span className="text-xs text-muted-foreground">enigma</span>
        </div>
        <p className="text-xs text-muted-foreground">
          non-custodial · instant payouts
        </p>
      </footer>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
