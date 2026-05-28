import Link from "next/link";
import { EnigmaLogo } from "@/components/api-browser";

export default function UserNotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-6 py-3 flex items-center justify-between sticky top-0 bg-background z-40">
        <Link href="/" className="flex items-center gap-2">
          <EnigmaLogo />
          <span className="text-xs tracking-widest uppercase text-foreground">
            enigma
          </span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center space-y-6 max-w-sm">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              404
            </p>
            <p className="text-sm text-foreground font-mono">user not found</p>
            <p className="text-xs text-muted-foreground">
              This username doesn&apos;t exist on enigma.
            </p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/browse"
              className="text-xs border border-border px-3 py-1.5 text-foreground hover:bg-accent transition-colors"
            >
              browse apis →
            </Link>
            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
