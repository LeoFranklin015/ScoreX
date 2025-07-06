"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import PlayerQRCode from "../components/PlayerQRCode";
import { Users, QrCode, Smartphone, Shield, Search, Loader2 } from "lucide-react";
import { useVerification } from "../lib/verification-context";

interface PlayerData {
  player: {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    age: number;
    nationality: string;
    photo: string;
  };
  statistics: Array<{
    team: {
      id: number;
      name: string;
      logo: string;
    };
    league: {
      id: number;
      name: string;
      country: string;
    };
    games: {
      position: string;
    };
  }>;
}

export default function QRDemoPage() {
  const { verifiedPlayer, isPlayerVerified } = useVerification();
  const [playerIdInput, setPlayerIdInput] = useState("");
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);

  const samplePlayerIds = [
    { name: "Kylian Mbappé", id: "276", team: "Real Madrid" },
    { name: "Erling Haaland", id: "19956", team: "Manchester City" },
    { name: "Lionel Messi", id: "154", team: "Inter Miami" },
    { name: "Jude Bellingham", id: "42401", team: "Real Madrid" },
    { name: "Pedri", id: "282665", team: "Barcelona" },
  ];

  const fetchPlayerData = async (playerId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/players?id=${playerId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch player data');
      }
      
      const data = await response.json();
      console.log('Player data:', data);
      
      if (data && data.player) {
        setPlayerData(data);
        setShowQRCode(true);
      } else {
        setError('Player not found');
      }
    } catch (err) {
      setError('Failed to fetch player data. Please try again.');
      console.error('Error fetching player:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerIdInput.trim()) {
      fetchPlayerData(playerIdInput.trim());
    }
  };

  const selectSamplePlayer = (samplePlayer: { name: string; id: string; team: string }) => {
    setPlayerIdInput(samplePlayer.id);
    fetchPlayerData(samplePlayer.id);
  };

  const resetDemo = () => {
    setPlayerData(null);
    setShowQRCode(false);
    setPlayerIdInput("");
    setError(null);
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
            {!showQRCode ? (
              <>
                <Card className="bg-zinc-900 border-lime-400/20">
                  <CardHeader>
                    <CardTitle className="pixel-font text-lime-400 flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Enter Player ID
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="playerIdInput">API-Football Player ID</Label>
                        <Input
                          id="playerIdInput"
                          value={playerIdInput}
                          onChange={(e) => setPlayerIdInput(e.target.value)}
                          placeholder="Enter player ID (e.g., 276 for Mbappé)"
                          className="bg-zinc-800 border-lime-400/20 text-zinc-100"
                          disabled={loading}
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={!playerIdInput.trim() || loading}
                        className="w-full bg-lime-400 text-zinc-950 hover:bg-lime-500"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Fetching Player...
                          </>
                        ) : (
                          "Generate QR Code"
                        )}
                      </Button>
                    </form>
                    
                    {error && (
                      <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-3">
                        <p className="text-red-400 text-sm">{error}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-lime-400/20">
                  <CardHeader>
                    <CardTitle className="pixel-font text-lime-400">Quick Select</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {samplePlayerIds.map((player) => (
                      <Button
                        key={player.id}
                        onClick={() => selectSamplePlayer(player)}
                        variant="outline"
                        disabled={loading}
                        className="w-full justify-start border-lime-400/20 text-lime-400 hover:bg-lime-400/10"
                      >
                        <div className="text-left">
                          <div className="font-medium">{player.name}</div>
                          <div className="text-xs opacity-70">{player.team} • ID: {player.id}</div>
                        </div>
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card className="bg-zinc-900 border-lime-400/20">
                  <CardHeader>
                    <CardTitle className="pixel-font text-lime-400 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Player Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {playerData && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={playerData.player.photo} 
                            alt={playerData.player.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="text-lg font-bold text-lime-400">{playerData.player.name}</h3>
                            <p className="text-zinc-400">Age: {playerData.player.age}</p>
                            <p className="text-zinc-400">Nationality: {playerData.player.nationality}</p>
                            {playerData.statistics[0] && (
                              <>
                                <p className="text-zinc-400">Team: {playerData.statistics[0].team.name}</p>
                                <p className="text-zinc-400">Position: {playerData.statistics[0].games.position}</p>
                              </>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={resetDemo}
                          variant="outline"
                          className="w-full border-lime-400/20 text-lime-400 hover:bg-lime-400/10"
                        >
                          Generate Another QR Code
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
            

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
                      <p className="text-sm font-medium text-zinc-200">Enter Player ID</p>
                      <p className="text-xs text-zinc-400">
                        Enter API-Football player ID to fetch real player data
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-lime-400 text-zinc-950 rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-200">Generate QR Code</p>
                      <p className="text-xs text-zinc-400">
                        QR code is generated with the player's information
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-lime-400 text-zinc-950 rounded-full flex items-center justify-center text-sm font-bold">
                      3
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
                      4
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
                      5
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-200">Self Protocol</p>
                      <p className="text-xs text-zinc-400">
                        Mock identity verification using Self Protocol
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
              {showQRCode && playerData ? (
                <PlayerQRCode
                  playerName={playerData.player.name}
                  playerId={playerData.player.id.toString()}
                  verificationUrl="/verify"
                />
              ) : (
                <Card className="bg-zinc-900 border-lime-400/20">
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <QrCode className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                      <p className="text-zinc-400">
                        Enter a player ID to generate QR code
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
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
                <strong>Step 1:</strong> Enter a player ID or use quick select to fetch real player data from API-Football
              </p>
              <p className="text-sm text-zinc-300">
                <strong>Step 2:</strong> Once generated, click "Open" button to test the verification flow
              </p>
              <p className="text-sm text-zinc-300">
                <strong>Mobile:</strong> Scan the QR code with your phone camera to open the verification page
              </p>
              <p className="text-sm text-zinc-300">
                <strong>Development:</strong> The QR code links to your local development server with real player data
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 