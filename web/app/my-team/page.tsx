"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { ArrowLeft, Trophy, Users, Target } from "lucide-react"
import UserTeamField from "../components/UserTeamField"
import { useLedger } from "../components/Provider"
import { LedgerConnectButton } from "../components/LedgerConnectButton"
import Link from "next/link"

interface SelectedPlayer {
  name: string
  pos: string
  origin: string
  dob: string
  goals: number
  games: number
  playerId: number
  balance: number
}

export default function MyTeam() {
  const [selectedPlayer, setSelectedPlayer] = useState<SelectedPlayer | null>(null)
  const { address } = useLedger()

  const handlePlayerSelect = (playerData: any) => {
    setSelectedPlayer(playerData)
  }

  if (!address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-lime-400">Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your Ledger wallet to view your minted players
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <LedgerConnectButton />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">My Team</h1>
              <p className="text-zinc-400 text-sm">View your minted players on the field</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-zinc-400">Connected</p>
              <p className="text-xs text-lime-400 font-mono">
                {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative">
        <UserTeamField
          title="YOUR TEAM"
          subtitle="Your minted players on the football field"
          showHeader={true}
          height="calc(100vh - 120px)"
          onPlayerSelect={handlePlayerSelect}
        />
      </div>

      {/* Player Details Sidebar */}
      {selectedPlayer && (
        <div className="fixed top-0 right-0 h-full w-80 bg-zinc-900/95 backdrop-blur-sm border-l border-zinc-800 p-6 overflow-y-auto z-50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Player Details</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPlayer(null)}
              className="text-zinc-400 hover:text-white"
            >
              ×
            </Button>
          </div>

          <div className="space-y-6">
            {/* Player Basic Info */}
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-lg text-white">{selectedPlayer.name}</CardTitle>
                <CardDescription className="text-zinc-400">
                  Player ID: {selectedPlayer.playerId}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Position</span>
                  <span className="text-white font-medium">{selectedPlayer.pos}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Nationality</span>
                  <span className="text-white font-medium">{selectedPlayer.origin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Age</span>
                  <span className="text-white font-medium">{selectedPlayer.dob}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Tokens Owned</span>
                  <span className="text-lime-400 font-bold">x{selectedPlayer.balance}</span>
                </div>
              </CardContent>
            </Card>

            {/* Season Stats */}
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                  Season Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Goals</span>
                  <span className="text-white font-medium">{selectedPlayer.goals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Games Played</span>
                  <span className="text-white font-medium">{selectedPlayer.games}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Goals per Game</span>
                  <span className="text-white font-medium">
                    {selectedPlayer.games > 0 ? (selectedPlayer.goals / selectedPlayer.games).toFixed(2) : '0.00'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center">
                  <Target className="w-5 h-5 mr-2 text-lime-400" />
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  View Full Profile
                </Button>
                <Button className="w-full bg-lime-600 hover:bg-lime-700">
                  Trade Player
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Quick Stats Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-sm border-t border-zinc-800 p-4 z-40">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-8">
            <div className="text-center">
              <p className="text-sm text-zinc-400">Total Players</p>
              <p className="text-lg font-bold text-white">11</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-zinc-400">Total Tokens</p>
              <p className="text-lg font-bold text-lime-400">0</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-zinc-400">Team Value</p>
              <p className="text-lg font-bold text-white">$0</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/mint">
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Mint More Players
              </Button>
            </Link>
            <Link href="/claim">
              <Button size="sm" className="bg-lime-600 hover:bg-lime-700">
                <Trophy className="w-4 h-4 mr-2" />
                Claim Rewards
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 