"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { EnigmaLogo } from "@/components/api-browser";
import { UserAvatar } from "@/components/user-avatar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-sm text-muted-foreground animate-pulse">
          loading...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <EnigmaLogo />
            <span className="text-xs tracking-widest uppercase text-foreground hover:text-muted-foreground transition-colors">
              enigma
            </span>
          </Link>
          <Link
            href="/browse"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            browse
          </Link>
          <a
            href="/docs"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            docs
          </a>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href={`/${user.user_name}`}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <UserAvatar
              avatarId={user.avatar_id}
              name={user.user_name}
              size="xs"
              className="border-0"
            />
            <span className="font-mono hidden sm:block">@{user.user_name}</span>
          </Link>
          <span className="text-xs text-muted-foreground font-mono hidden sm:block">
            {user.sol_public_key.slice(0, 4)}...{user.sol_public_key.slice(-4)}
          </span>
          <button
            onClick={logout}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            disconnect
          </button>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
