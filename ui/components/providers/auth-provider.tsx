// Auth context — provides user session across app
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getUserByPubkey, createUser } from "@/lib/api";
import { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  needsRegistration: boolean;
  registerUser: (userName: string, email: string, avatarId?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  isLoading: true,
  needsRegistration: false,
  registerUser: async () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const STORAGE_KEY = "enigma_session";

function getStoredSession(): { userName: string; publicKey: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeSession(userName: string, publicKey: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ userName, publicKey }));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { publicKey, connected, connecting, disconnect } = useWallet();

  const [user, setUser] = useState<User | null>(null);
  // Start loading if a session exists in storage — prevents premature redirect on refresh.
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === "undefined") return true;
    return !!getStoredSession();
  });
  const [needsRegistration, setNeedsRegistration] = useState(false);

  // Phase 1: restore from localStorage on first mount.
  // Runs before the wallet adapter has had a chance to reconnect.
  useEffect(() => {
    const session = getStoredSession();
    if (!session) return;
    getUserByPubkey(session.publicKey)
      .then((fetched) => {
        if (fetched) setUser(fetched);
        else clearSession();
      })
      .catch(() => clearSession())
      .finally(() => setIsLoading(false));
  }, []);

  // Phase 2: react to wallet connection state.
  // Only acts when the wallet is fully connected — never clears the user on
  // transient disconnected states (e.g., the moment before auto-reconnect).
  useEffect(() => {
    if (connecting) return;
    if (!connected || !publicKey) return;

    // Wallet connected — verify and refresh.
    getUserByPubkey(publicKey.toString())
      .then((fetched) => {
        if (fetched) {
          storeSession(fetched.user_name, publicKey.toString());
          setUser(fetched);
          setNeedsRegistration(false);
        } else {
          clearSession();
          setUser(null);
          setNeedsRegistration(true);
        }
      })
      .catch(() => {
        setNeedsRegistration(true);
      });
  }, [connected, connecting, publicKey]);

  const registerUser = useCallback(
    async (userName: string, email: string, avatarId?: string) => {
      if (!publicKey) throw new Error("Wallet not connected");

      const newUser = await createUser({
        user_name: userName,
        email,
        sol_public_key: publicKey.toString(),
        avatar_id: avatarId,
      });

      storeSession(userName, publicKey.toString());
      setUser(newUser);
      setNeedsRegistration(false);
    },
    [publicKey]
  );

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setNeedsRegistration(false);
    disconnect();
  }, [disconnect]);

  return (
    <AuthContext.Provider value={{ user, isLoading, needsRegistration, registerUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
