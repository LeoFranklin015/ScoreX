"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "../components/ui/badge";
import { Wallet, User, LogOut, Shield, Users } from "lucide-react";
import { useVerification } from "../lib/verification-context";
import { LedgerConnectButton } from "../components/LedgerConnectButton";

export function Navbar() {
  const pathname = usePathname();
  const { verifiedPlayer, isPlayerVerified, clearVerification } =
    useVerification();

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Mint", href: "/mint" },
    { name: "My Team", href: "/my-team" },
    { name: "Market", href: "/market" },
    { name: "Matches", href: "/matches" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-sm border-b border-lime-400/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="pixel-font text-2xl font-bold text-lime-400 glitch-border p-2">
              RB
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`pixel-font transition-colors duration-200 ${
                  pathname === item.href
                    ? "text-fuchsia-500 border-b-2 border-fuchsia-500"
                    : "text-zinc-300 hover:text-lime-400"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Verification Status */}
            {isPlayerVerified() && verifiedPlayer && (
              <div className="flex items-center space-x-2">
                <Badge className="bg-lime-400/20 text-lime-400 border-lime-400/20">
                  <Shield className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
                <div className="text-sm text-zinc-400">
                  {verifiedPlayer.name}
                </div>
              </div>
            )}
            <LedgerConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
