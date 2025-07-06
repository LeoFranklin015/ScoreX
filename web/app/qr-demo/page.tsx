"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import PlayerQRCode from "../components/PlayerQRCode";
import { Users, QrCode, Smartphone, Shield } from "lucide-react";
import { useVerification } from "../lib/verification-context";

export default function QRDemoPage() {
  const { verifiedPlayer, isPlayerVerified } = useVerification();
  const [playerName, setPlayerName] = useState("Kylian Mbappé");
  const [playerId, setPlayerId] = useState("mbappe_001");

  const samplePlayers = [
    { name: "Kylian Mbappé", id: "mbappe_001", team: "Real Madrid" },
    { name: "Erling Haaland", id: "haaland_002", team: "Manchester City" },
    { name: "Lionel Messi", id: "messi_003", team: "Inter Miami" },
    { name: "Jude Bellingham", id: "bellingham_004", team: "Real Madrid" },
    { name: "Pedri", id: "pedri_005", team: "Barcelona" },
  ];

  const selectPlayer = (player: { name: string; id: string; team: string }) => {
    setPlayerName(player.name);
    setPlayerId(player.id);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="pixel-font text-4xl font-bold text-lime-400 mb-2">
                Player QR Code Demo
              </h1>
              <p className="text-zinc-400">
                Generate QR codes for footballers to verify their identity and access sponsorship payouts
              </p>
            </div>
            {isPlayerVerified() && verifiedPlayer && (
              <div className="bg-zinc-900 border border-lime-400/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-lime-400" />
                  <span className="text-lime-400 font-semibold">Player Verified</span>
                </div>
                <p className="text-zinc-300 text-sm">{verifiedPlayer.name}</p>
                <p className="text-zinc-500 text-xs">{verifiedPlayer.playerProfile.team}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Controls */}
          <div className="space-y-6">
            <Card className="bg-zinc-900 border-lime-400/20">
              <CardHeader>
                <CardTitle className="pixel-font text-lime-400 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Player Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="playerName">Player Name</Label>
                  <Input
                    id="playerName"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="bg-zinc-800 border-lime-400/20 text-zinc-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="playerId">Player ID</Label>
                  <Input
                    id="playerId"
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value)}
                    className="bg-zinc-800 border-lime-400/20 text-zinc-100"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-lime-400/20">
              <CardHeader>
                <CardTitle className="pixel-font text-lime-400">Quick Select</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {samplePlayers.map((player) => (
                  <Button
                    key={player.id}
                    onClick={() => selectPlayer(player)}
                    variant={playerId === player.id ? "default" : "outline"}
                    className={`w-full justify-start ${
                      playerId === player.id
                        ? "bg-lime-400 text-zinc-950 hover:bg-lime-500"
                        : "border-lime-400/20 text-lime-400 hover:bg-lime-400/10"
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-medium">{player.name}</div>
                      <div className="text-xs opacity-70">{player.team}</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-lime-400/20">
              <CardHeader>
                <CardTitle className="pixel-font text-lime-400 flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  How it Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-lime-400 text-zinc-950 rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-200">Scan QR Code</p>
                      <p className="text-xs text-zinc-400">
                        Player scans the QR code with their phone camera
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-lime-400 text-zinc-950 rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-200">3D Interaction</p>
                      <p className="text-xs text-zinc-400">
                        Interactive 3D lanyard card with physics simulation
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-lime-400 text-zinc-950 rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-200">Self Protocol</p>
                      <p className="text-xs text-zinc-400">
                        Mock identity verification using Self Protocol
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-lime-400 text-zinc-950 rounded-full flex items-center justify-center text-sm font-bold">
                      4
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-200">Payout Access</p>
                      <p className="text-xs text-zinc-400">
                        Access to sponsorship payout dashboard
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side - QR Code */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <PlayerQRCode
                playerName={playerName}
                playerId={playerId}
                verificationUrl="/verify"
              />
            </div>
          </div>
        </div>

        {/* Test Instructions */}
        <div className="mt-8">
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="pixel-font text-fuchsia-500 flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Testing Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-zinc-300">
                <strong>Desktop:</strong> Click "Open" button to test the verification flow
              </p>
              <p className="text-sm text-zinc-300">
                <strong>Mobile:</strong> Scan the QR code with your phone camera to open the verification page
              </p>
              <p className="text-sm text-zinc-300">
                <strong>Development:</strong> The QR code links to your local development server
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 