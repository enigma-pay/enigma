import { notFound } from "next/navigation";
import Link from "next/link";
import { getUser, listUserApis } from "@/lib/api";
import { EnigmaLogo } from "@/components/api-browser";
import { UserAvatar } from "@/components/user-avatar";
import UserProfileClient from "./client";

interface Props {
  params: Promise<{ username: string }>;
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  const [user, apis] = await Promise.all([
    getUser(username),
    listUserApis(username),
  ]);

  if (!user || apis === null) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-6 py-3 flex items-center justify-between sticky top-0 bg-background z-40">
        <Link href="/" className="flex items-center gap-2">
          <EnigmaLogo />
          <span className="text-xs tracking-widest uppercase text-foreground">
            enigma
          </span>
        </Link>
        <Link
          href="/browse"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          browse apis →
        </Link>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 space-y-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <UserAvatar
              avatarId={user.avatar_id}
              name={user.user_name}
              size="lg"
            />
            <div className="space-y-0.5">
              <p className="text-sm font-mono text-foreground">
                @{user.user_name}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {user.sol_public_key.slice(0, 6)}...
                {user.sol_public_key.slice(-4)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              {apis.length} api{apis.length !== 1 ? "s" : ""}
            </span>
            {user.created_at && (
              <span>
                joined{" "}
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        </div>

        <UserProfileClient apis={apis} username={username} />
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
    </div>
  );
}
