import { notFound } from "next/navigation";
import Link from "next/link";
import { ApiDetailView } from "@/components/api-detail-view";
import { EnigmaLogo } from "@/components/api-browser";
import { getApi, getUser } from "@/lib/api";

interface Props {
  params: Promise<{ username: string; apiName: string }>;
}

export default async function PublicApiDetailPage({ params }: Props) {
  const { username, apiName } = await params;
  const [user, api] = await Promise.all([
    getUser(username),
    getApi(username, apiName),
  ]);

  if (!user || !api) {
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

      <main className="flex-1">
        <ApiDetailView
          api={api}
          variant="public"
          backHref={`/${user.user_name}`}
          backLabel={`@${user.user_name}`}
          owner={{ user_name: user.user_name, avatar_id: user.avatar_id }}
        />
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
