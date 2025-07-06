"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Loader2,
  User,
  Coins,
  CheckCircle,
  XCircle,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { Player } from "../lib/football-api";
import ProfileCard from "../components/ProfileCard";
import Aurora from "../components/Aurora";
import StarBorder from "../components/StarBorder";
import { getEnhancedAuroraColors } from "../lib/team-colors";
import { publicClient } from "../lib/client";
import {
  CURVE_LEAGUE_CONTRACT_ABI,
  CURVE_LEAGUE_CONTRACT_ADDRESS,
} from "../lib/const";

interface UserToken {
  playerId: number;
  balance: number;
  player: Player | null;
  hasClaimed: boolean;
}

// Hardcoded address for testing
const HARDCODED_ADDRESS = "0xeb636Cf3a27AbF02D75Cd2FA253ac09af0FE1f90";

export default function Claim() {
  const [userTokens, setUserTokens] = useState<UserToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimingToken, setClaimingToken] = useState<number | null>(null);
  const [selectedToken, setSelectedToken] = useState<UserToken | null>(null);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [auroraColors, setAuroraColors] = useState<string[]>([
    "#00ffaa",
    "#3A29FF",
    "#FF94B4",
  ]);

  useEffect(() => {
    fetchUserTokens();
  }, []);

  const fetchUserTokens = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user's game info from contract using hardcoded address
      const userGameInfo = await publicClient.readContract({
        abi: CURVE_LEAGUE_CONTRACT_ABI,
        address: CURVE_LEAGUE_CONTRACT_ADDRESS,
        functionName: "getUserGameInfo",
        args: [HARDCODED_ADDRESS],
      }) as [bigint, bigint[], bigint[]];

      const [totalTokens, playerTokens, tokenBalances] = userGameInfo;
      
      console.log("📋 User game info:", {
        totalTokens: Number(totalTokens),
        playerTokens: playerTokens.map(t => Number(t)),
        tokenBalances: tokenBalances.map(b => Number(b))
      });

      // Fetch player details for each token
      const tokenPromises = playerTokens.map(async (playerIdBigInt, index) => {
        const playerId = Number(playerIdBigInt);
        const balance = Number(tokenBalances[index]);

        try {
          // Check if user has already claimed this token using hardcoded address
          const hasClaimed = await publicClient.readContract({
            abi: CURVE_LEAGUE_CONTRACT_ABI,
            address: CURVE_LEAGUE_CONTRACT_ADDRESS,
            functionName: "hasUserClaimed",
            args: [HARDCODED_ADDRESS, playerIdBigInt],
          }) as boolean;

          // Fetch player details
          const response = await fetch(`/api/players?id=${playerId}`);
          let player: Player | null = null;

          if (response.ok) {
            const playerStatsData = await response.json();
            
            if (playerStatsData && playerStatsData.player && playerStatsData.statistics && playerStatsData.statistics.length > 0) {
              const stats = playerStatsData.statistics[0];
              
              player = {
                id: playerStatsData.player.id,
                name: playerStatsData.player.name,
                team: stats.team?.name || 'Unknown',
                position: stats.games?.position || 'Unknown',
                goals: stats.goals?.total || 0,
                assists: stats.goals?.assists || 0,
                value: 50000000,
                popularity: 75,
                avatar: playerStatsData.player.photo || '/placeholder.svg?height=64&width=64',
                photo: playerStatsData.player.photo || '/placeholder.svg?height=64&width=64',
                nationality: playerStatsData.player.nationality || 'Unknown',
                age: playerStatsData.player.age || 25,
                market_value: 50000000,
                current_season_stats: {
                  goals: stats.goals?.total || 0,
                  assists: stats.goals?.assists || 0,
                  appearances: stats.games?.appearences || 0,
                  rating: parseFloat(stats.games?.rating) || 0
                }
              };
            }
          }

          return {
            playerId,
            balance,
            player,
            hasClaimed
          };
        } catch (err) {
          console.warn(`Error fetching player ${playerId}:`, err);
          return {
            playerId,
            balance,
            player: null,
            hasClaimed: false
          };
        }
      });

      const tokens = await Promise.all(tokenPromises);
      const validTokens = tokens.filter(token => token.player !== null);
      
      console.log("📋 User tokens:", validTokens);
      setUserTokens(validTokens);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load user tokens");
      console.error("Error fetching user tokens:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimToken = async (playerId: number) => {
    // Claim functionality temporarily disabled
    alert("Claim functionality is temporarily disabled");
    return;
  };

  const handleTokenProfileClick = (token: UserToken) => {
    setSelectedToken(token);
    setShowProfileCard(true);
    
    if (token.player) {
      const teamColors = getEnhancedAuroraColors(token.player.team);
      setAuroraColors(teamColors);
    }
  };

  const formatValue = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 mb-4">
            <p className="text-red-400 mb-4">Error: {error}</p>
            <Button
              onClick={fetchUserTokens}
              className="bg-lime-400 text-zinc-950 hover:bg-lime-500"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Background Aurora */}
      <div className="fixed inset-0 -z-10 opacity-20">
        <Aurora
          colorStops={auroraColors}
          blend={0.4}
          amplitude={0.8}
          speed={0.5}
        />
      </div>

      <div className="mb-8">
        <h1 className="pixel-font text-4xl font-bold text-lime-400 mb-2">
          Claim Rewards
        </h1>
        <p className="text-zinc-400">
          View and claim rewards from your player tokens.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tokens List */}
        <div className="lg:col-span-2">
          <Card className="glitch-border bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="pixel-font text-lime-400">
                Your Tokens
              </CardTitle>
              <CardDescription>
                {loading ? "Loading your tokens..." : `${userTokens.length} tokens found`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-lime-400" />
                  <span className="ml-2 text-zinc-400">Loading your tokens...</span>
                </div>
              ) : userTokens.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Coins className="h-12 w-12 text-zinc-600 mb-4" />
                  <p className="text-zinc-400 text-center">
                    You don't have any tokens yet
                  </p>
                  <Button
                    variant="ghost"
                    onClick={() => window.location.href = '/mint'}
                    className="mt-2 text-lime-400 hover:text-lime-300"
                  >
                    Mint Some Tokens
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userTokens.map((token) => (
                    <Card
                      key={token.playerId}
                      className={`glitch-border transition-all ${
                        token.hasClaimed
                          ? "border-green-400 bg-green-400/10"
                          : "border-zinc-700 hover:border-lime-400"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-700 flex items-center justify-center">
                            {token.player?.photo &&
                            token.player.photo !== "/placeholder.svg?height=64&width=64" ? (
                              <img
                                src={token.player.photo}
                                alt={token.player.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  e.currentTarget.nextElementSibling?.classList.remove(
                                    "hidden"
                                  );
                                }}
                              />
                            ) : (
                              <User className="h-6 w-6 text-lime-400" />
                            )}
                            <User className="h-6 w-6 text-lime-400 hidden" />
                          </div>
                          <div>
                            <div className="font-bold text-white">
                              {token.player?.name || `Player ${token.playerId}`}
                            </div>
                            <div className="text-sm text-zinc-400">
                              {token.player?.position || "Unknown"}
                            </div>
                            <div className="text-xs text-zinc-500">
                              {token.player?.nationality || "Unknown"} • {token.player?.age || "N/A"}y
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                          <div className="text-center">
                            <div className="text-lime-400 font-bold">
                              {token.player?.goals || 0}
                            </div>
                            <div className="text-zinc-400">Goals</div>
                          </div>
                          <div className="text-center">
                            <div className="text-fuchsia-500 font-bold">
                              {token.player?.assists || 0}
                            </div>
                            <div className="text-zinc-400">Assists</div>
                          </div>
                          <div className="text-center">
                            <div className="text-purple-400 font-bold">
                              {token.player?.current_season_stats?.rating?.toFixed(1) || '0.0'}
                            </div>
                            <div className="text-zinc-400">Rating</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm mb-3">
                          <span className="text-zinc-400">Token Balance:</span>
                          <span className="text-lime-400 font-bold">
                            {token.balance}
                          </span>
                        </div>

                        {token.hasClaimed ? (
                          <div className="bg-green-900/30 border border-green-400/50 rounded px-2 py-1 mb-3">
                            <p className="text-green-400 text-xs text-center flex items-center justify-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Already Claimed
                            </p>
                          </div>
                        ) : (
                          <div className="bg-yellow-900/30 border border-yellow-400/50 rounded px-2 py-1 mb-3">
                            <p className="text-yellow-400 text-xs text-center flex items-center justify-center">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Ready to Claim
                            </p>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-lime-400 text-lime-400 hover:bg-lime-400 hover:text-zinc-900"
                            onClick={() => handleTokenProfileClick(token)}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <Card className="glitch-border bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="pixel-font text-lime-400">
                Portfolio Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Tokens:</span>
                <span className="text-white font-bold">
                  {userTokens.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Balance:</span>
                <span className="text-lime-400 font-bold">
                  {userTokens.reduce((sum, token) => sum + token.balance, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Claimed Tokens:</span>
                <span className="text-green-400 font-bold">
                  {userTokens.filter(token => token.hasClaimed).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Unclaimed Tokens:</span>
                <span className="text-yellow-400 font-bold">
                  {userTokens.filter(token => !token.hasClaimed).length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="glitch-border bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="pixel-font text-lime-400">
                How Claiming Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="text-zinc-300 font-medium">
                  Performance Rewards
                </div>
                <div className="text-zinc-400">
                  Claim rewards based on player performance
                </div>
              </div>
              <div>
                <div className="text-zinc-300 font-medium">
                  One-Time Claim
                </div>
                <div className="text-zinc-400">
                  Each token can only be claimed once per season
                </div>
              </div>
              <div>
                <div className="text-zinc-300 font-medium">
                  Automatic Calculation
                </div>
                <div className="text-zinc-400">
                  Rewards are calculated based on player stats
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Player Profile Card */}
      {showProfileCard && selectedToken && selectedToken.player && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-4xl h-[80vh] flex flex-col lg:flex-row rounded-2xl overflow-hidden border border-zinc-800">
            {/* Close Button */}
            <button
              onClick={() => setShowProfileCard(false)}
              className="absolute top-4 right-4 z-50 bg-black/60 rounded-full p-2 text-white hover:text-lime-400 hover:bg-black/80 transition-all duration-200 backdrop-blur-sm"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Full Width - Animated Aurora Background */}
            <div className="absolute inset-0 bg-black">
              <Aurora
                colorStops={auroraColors}
                blend={0.6}
                amplitude={1.2}
                speed={0.8}
              />
            </div>

            {/* Left Side - Profile Card */}
            <div className="relative z-10 flex items-center justify-center lg:justify-start p-4 lg:p-8 lg:pl-16">
              <div className="w-full max-w-sm lg:max-w-md">
                <ProfileCard
                  avatarUrl={
                    selectedToken.player.photo ||
                    "/placeholder.svg?height=600&width=600"
                  }
                  name={selectedToken.player.name}
                  title={`${selectedToken.player.position} • ${selectedToken.player.nationality}`}
                  handle={selectedToken.player.team
                    .toLowerCase()
                    .replace(/\s+/g, "")}
                  status={`${selectedToken.player.goals}G • ${
                    selectedToken.player.assists
                  }A • ${selectedToken.player.current_season_stats?.rating?.toFixed(
                    1
                  ) || '0.0'}⭐`}
                  contactText="Token Details"
                  className="profile-card-popup-split"
                  showUserInfo={false}
                />
              </div>
            </div>

            {/* Right Side - Token Details */}
            <div className="relative z-10 flex-1 flex flex-col p-4 lg:p-8">
              <div className="max-w-md mx-auto w-full">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Token Information
                </h3>

                <div className="space-y-6">
                  {/* Token Stats */}
                  <div className="bg-zinc-900/60 backdrop-blur-sm rounded-xl p-6 border border-zinc-700">
                    <h4 className="text-xl font-bold text-white mb-4">
                      Token Details
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Token Balance:</span>
                        <span className="text-lime-400 font-bold text-lg">
                          {selectedToken.balance}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Player ID:</span>
                        <span className="text-white font-bold">
                          {selectedToken.playerId}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Claim Status:</span>
                        <span className={`font-bold ${
                          selectedToken.hasClaimed 
                            ? "text-green-400" 
                            : "text-yellow-400"
                        }`}>
                          {selectedToken.hasClaimed ? "Claimed" : "Unclaimed"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Player Stats */}
                  <div className="bg-zinc-900/60 backdrop-blur-sm rounded-xl p-6 border border-zinc-700">
                    <h4 className="text-xl font-bold text-white mb-4">
                      Season Performance
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-lime-400">
                          {selectedToken.player.goals}
                        </div>
                        <div className="text-sm text-zinc-400">Goals</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          {selectedToken.player.assists}
                        </div>
                        <div className="text-sm text-zinc-400">Assists</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">
                          {selectedToken.player.current_season_stats?.rating?.toFixed(1) || '0.0'}
                        </div>
                        <div className="text-sm text-zinc-400">Rating</div>
                      </div>
                    </div>
                  </div>

                  {/* Claim Action */}
                  <div className="bg-zinc-900/60 backdrop-blur-sm rounded-xl p-6 border border-zinc-700">
                    {selectedToken.hasClaimed ? (
                      <div className="text-center">
                        <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                        <p className="text-green-400 text-lg font-medium">
                          Already Claimed
                        </p>
                        <p className="text-zinc-400 text-sm mt-2">
                          You have already claimed rewards for this token
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <TrendingUp className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                        <p className="text-yellow-400 text-lg font-medium">
                          Ready to Claim
                        </p>
                        <p className="text-zinc-400 text-sm mt-2 mb-4">
                          Claim functionality is temporarily disabled
                        </p>
                        {/* Claim functionality temporarily disabled
                        <StarBorder
                          as="button"
                          className="w-full"
                          color="#00ffaa"
                          speed="3s"
                          onClick={() => handleClaimToken(selectedToken.playerId)}
                          disabled={claimingToken === selectedToken.playerId}
                        >
                          {claimingToken === selectedToken.playerId ? (
                            <div className="flex items-center justify-center">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Claiming...
                            </div>
                          ) : (
                            "Claim Rewards"
                          )}
                        </StarBorder>
                        */}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 