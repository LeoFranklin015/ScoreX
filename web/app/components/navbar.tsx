"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "../components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu"
import { Badge } from "../components/ui/badge"
import { Wallet, User, LogOut, Shield } from "lucide-react"
import { useVerification } from "../lib/verification-context"

export function Navbar() {
  const pathname = usePathname()
  const [isConnected, setIsConnected] = useState(false)
  const { verifiedPlayer, isPlayerVerified, clearVerification } = useVerification()

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Mint", href: "/mint" },
    { name: "Verify", href: "/verify" },
    { name: "Player Payouts", href: "/payout" },
    { name: "Market", href: "/market" },
    { name: "Matches", href: "/matches" },
    { name: "Leaderboard", href: "/leaderboard" },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-sm border-b border-lime-400/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="pixel-font text-2xl font-bold text-lime-400 glitch-border p-2">RB</div>
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
            
            {!isConnected ? (
              <Button
                onClick={() => setIsConnected(true)}
                className="pixel-font bg-lime-400 text-zinc-950 hover:bg-lime-500 hover-pulse"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="text-sm text-zinc-400">0x1234...5678</div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/avatars/01.png" alt="Avatar" />
                        <AvatarFallback>DG</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-zinc-900 border-lime-400/20">
                    <DropdownMenuItem className="pixel-font">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    {isPlayerVerified() && (
                      <DropdownMenuItem 
                        className="pixel-font text-red-400" 
                        onClick={() => {
                          clearVerification()
                          setIsConnected(false)
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Clear Verification
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="pixel-font" onClick={() => setIsConnected(false)}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
