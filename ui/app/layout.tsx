import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/providers/wallet-provider";
import { AuthProvider } from "@/components/providers/auth-provider";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Enigma — API Monetization on Solana",
  description: "The API monetization platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistMono.variable} antialiased`}>
        <WalletProvider>
          <AuthProvider>{children}</AuthProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
