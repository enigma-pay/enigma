"use client";

import { useEffect, useState, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/components/providers/auth-provider";
import { getUser, sendOtp, verifyOtp } from "@/lib/api";
import { IconX } from "@/components/api-browser";
import { UserAvatar } from "@/components/user-avatar";
import { AVATARS, getDefaultAvatarId } from "@/lib/avatars";

type Step = "wallets" | "register" | "otp";
type UsernameStatus = "idle" | "checking" | "available" | "taken";

function WalletLogo({ name, icon }: { name: string; icon?: string }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <span
      aria-hidden="true"
      className="flex h-10 w-10 shrink-0 items-center justify-center bg-transparent p-1 text-xs font-mono text-muted-foreground"
    >
      {icon && !imageFailed ? (
        <Image
          src={icon}
          alt=""
          width={32}
          height={32}
          unoptimized
          className="h-full w-full object-contain"
          onError={() => setImageFailed(true)}
        />
      ) : (
        initial
      )}
    </span>
  );
}

export function AuthModal({ onClose }: { onClose: () => void }) {
  const { connected, connecting, wallets, wallet, select, connect, disconnect, publicKey } = useWallet();
  const { user, isLoading, needsRegistration, registerUser } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("wallets");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [selectedAvatarId, setSelectedAvatarId] = useState(getDefaultAvatarId());
  const [avatarTouched, setAvatarTouched] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (user && !isLoading) router.replace("/dashboard");
  }, [user, isLoading, router]);

  // Switch to register step when wallet connects and account doesn't exist
  useEffect(() => {
    if (needsRegistration && connected) setStep("register");
  }, [needsRegistration, connected]);

  useEffect(() => {
    if (!avatarTouched) {
      setSelectedAvatarId(getDefaultAvatarId(userName));
    }
  }, [avatarTouched, userName]);

  // Debounced username availability check
  useEffect(() => {
    if (!userName) {
      setUsernameStatus("idle");
      return;
    }
    setUsernameStatus("checking");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const existing = await getUser(userName);
        setUsernameStatus(existing ? "taken" : "available");
      } catch {
        setUsernameStatus("idle");
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [userName]);

  async function handleWalletSelect(name: Parameters<typeof select>[0]) {
    setError("");
    select(name);
    await new Promise((r) => setTimeout(r, 50));
    try {
      await connect();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to connect");
    }
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!userName || !email || usernameStatus !== "available") return;
    setError("");
    setSendingOtp(true);
    try {
      await sendOtp(email);
      setStep("otp");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleVerifyAndCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!otp) return;
    setError("");
    setRegistering(true);
    try {
      const result = await verifyOtp(email, otp);
      if (!result.valid) {
        setError(result.error || "Invalid code");
        setRegistering(false);
        return;
      }
      await registerUser(userName, email, selectedAvatarId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setRegistering(false);
    }
  }

  function truncate(pk: string) {
    return `${pk.slice(0, 6)}...${pk.slice(-4)}`;
  }

  const canSend =
    !!userName &&
    !!email &&
    usernameStatus === "available" &&
    !sendingOtp;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card border border-border w-full max-w-sm p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            {connecting || (connected && isLoading)
              ? "loading..."
              : step === "otp"
              ? "verify email"
              : step === "register"
              ? "create account"
              : "sign in"}
          </p>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <IconX size={12} />
          </button>
        </div>

        {/* Connecting / loading */}
        {(connecting || (connected && isLoading)) && (
          <div className="flex items-center gap-2">
            {wallet ? (
              <WalletLogo name={wallet.adapter.name} icon={wallet.adapter.icon} />
            ) : (
              <span className="w-1.5 h-1.5 bg-muted-foreground animate-pulse inline-block" />
            )}
            <span className="text-sm text-muted-foreground">
              {connecting ? "connecting wallet..." : "checking account..."}
            </span>
          </div>
        )}

        {/* Wallet picker */}
        {!connected && !connecting && step === "wallets" && (
          <div className="space-y-2">
            {wallets.filter((w) => w.readyState === "Installed").length === 0 ? (
              <div className="border border-border border-dashed p-4 space-y-2">
                <p className="text-xs text-muted-foreground">No wallet detected.</p>
                <a
                  href="https://phantom.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-foreground underline underline-offset-4"
                >
                  install phantom →
                </a>
              </div>
            ) : (
              wallets
                .filter((w) => w.readyState === "Installed")
                .map((w) => (
                  <button
                    key={w.adapter.name}
                    onClick={() => handleWalletSelect(w.adapter.name)}
                    className="w-full border border-border px-4 py-3 text-sm text-foreground hover:bg-accent transition-colors flex items-center justify-between"
                  >
                    <span className="flex items-center gap-3">
                      <WalletLogo name={w.adapter.name} icon={w.adapter.icon} />
                      <span>{w.adapter.name}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">→</span>
                  </button>
                ))
            )}
          </div>
        )}

        {/* Registration form */}
        {step === "register" && connected && !isLoading && needsRegistration && (
          <form onSubmit={handleSendOtp} className="space-y-4" noValidate>
            <p className="text-xs text-muted-foreground font-mono">
              {publicKey ? truncate(publicKey.toString()) : ""}
            </p>

            <div className="space-y-3">
              {/* Username */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground uppercase tracking-widest">
                    username
                  </label>
                  {userName && (
                    <span
                      className={`text-[10px] ${
                        usernameStatus === "available"
                          ? "text-emerald-400"
                          : usernameStatus === "taken"
                          ? "text-red-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {usernameStatus === "available"
                        ? "available"
                        : usernameStatus === "taken"
                        ? "taken"
                        : "checking..."}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) =>
                    setUserName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
                  }
                  placeholder="satoshi"
                  required
                  autoComplete="off"
                  className={`w-full bg-transparent border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none font-mono transition-colors ${
                    usernameStatus === "taken"
                      ? "border-red-400/50"
                      : usernameStatus === "available"
                      ? "border-emerald-400/50"
                      : "border-border focus:border-ring"
                  }`}
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground uppercase tracking-widest">
                  email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="off"
                  className="w-full bg-transparent border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground uppercase tracking-widest">
                    profile pic
                  </label>
                  <span className="text-[10px] text-muted-foreground">
                    pick one
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map((avatar) => {
                    const selected = selectedAvatarId === avatar.id;

                    return (
                      <button
                        key={avatar.id}
                        type="button"
                        aria-label={`Select ${avatar.label}`}
                        aria-pressed={selected}
                        onClick={() => {
                          setSelectedAvatarId(avatar.id);
                          setAvatarTouched(true);
                        }}
                        className={`flex h-10 w-10 items-center justify-center border transition-colors ${
                          selected
                            ? "border-foreground bg-foreground/10"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <UserAvatar
                          avatarId={avatar.id}
                          name={avatar.label}
                          size="sm"
                          className="border-0"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {error && <p className="text-xs text-destructive break-all">{error}</p>}

            <button
              type="submit"
              disabled={!canSend}
              className="w-full border border-foreground bg-foreground text-background px-4 py-2.5 text-sm hover:bg-transparent hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {sendingOtp ? "sending..." : "send verification code →"}
            </button>

            <button
              type="button"
              onClick={() => disconnect()}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              disconnect wallet
            </button>
          </form>
        )}

        {/* OTP entry */}
        {step === "otp" && (
          <form onSubmit={handleVerifyAndCreate} className="space-y-4" noValidate>
            <p className="text-xs text-muted-foreground">
              Code sent to <span className="text-foreground">{email}</span>
            </p>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-widest">
                verification code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                required
                autoComplete="one-time-code"
                inputMode="numeric"
                autoFocus
                className="w-full bg-transparent border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring font-mono tracking-widest"
              />
            </div>

            {error && <p className="text-xs text-destructive break-all">{error}</p>}

            <button
              type="submit"
              disabled={otp.length !== 6 || registering}
              className="w-full border border-foreground bg-foreground text-background px-4 py-2.5 text-sm hover:bg-transparent hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {registering ? "creating account..." : "verify & create account →"}
            </button>

            <button
              type="button"
              onClick={() => { setStep("register"); setOtp(""); setError(""); }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ← back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
