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
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/ui/collapsible";
import {
  ChevronDown,
  Target,
  Loader2,
  User,
  ArrowRight,
  Trophy,
  Users,
  ChevronLeft,
} from "lucide-react";
import { Player, League, Team } from "../lib/football-api";
import ProfileCard from "../components/ProfileCard";
import Aurora from "../components/Aurora";
import StarBorder from "../components/StarBorder";
import PerformancePredictionGraph from "../components/PerformancePredictionGraph";
import { getEnhancedAuroraColors } from "../lib/team-colors";
import { useMintedPlayers } from "../lib/minted-players-context";
import { publicClient } from "../lib/client";
import {
  CURVE_LEAGUE_CONTRACT_ABI,
  CURVE_LEAGUE_CONTRACT_ADDRESS,
  PLAYER_LIST_CONTRACT_ABI,
  PLAYER_LIST_CONTRACT_ADDRESS,
} from "../lib/const";
import { useLedger } from "../components/Provider";
import { LedgerConnectButton } from "../components/LedgerConnectButton";
import { ethers } from "ethers";
import { useRouter, useSearchParams } from "next/navigation";

// Stepper step definitions
const MINT_STEPS = [
  { key: "fetchPrice", label: "Fetching price" },
  { key: "fetchNonce", label: "Fetching nonce" },
  { key: "buildTx", label: "Building transaction" },
  { key: "sign", label: "Signing on Ledger" },
  { key: "broadcast", label: "Broadcasting transaction" },
  { key: "done", label: "Done" },
];

export default function Mint() {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [bondAmount, setBondAmount] = useState([1000]);

  const [players, setPlayers] = useState<Player[]>([]);

  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profile card state
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [selectedPlayerForProfile, setSelectedPlayerForProfile] =
    useState<Player | null>(null);
  const [auroraColors, setAuroraColors] = useState<string[]>([
    "#00ffaa",
    "#3A29FF",
    "#FF94B4",
  ]);
  const [activeTab, setActiveTab] = useState<"mint" | "performance">("mint");
  const [playerTokenCounts, setPlayerTokenCounts] = useState<
    Record<number, number>
  >({});

  // Use minted players context
  const {
    mintedPlayers: mintedPlayersFromContext,
    addMintedPlayer,
    isMinted,
    canMintMore,
    mintedCount,
    MAX_MINTED_PLAYERS,
  } = useMintedPlayers();

  const { address, keyringEth, signTransaction, broadcastTransaction } =
    useLedger();

  // Mint logic state
  const [mintLoading, setMintLoading] = useState(false);
  const [mintError, setMintError] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [stepStatus, setStepStatus] = useState<
    Record<string, "pending" | "in_progress" | "done" | "error">
  >({});
  const [stepError, setStepError] = useState<Record<string, string>>({});
  const [broadcastHash, setBroadcastHash] = useState<string | null>(null);
  const [signTransactionOutput, setSignTransactionOutput] = useState<any>();
  const [signTransactionError, setSignTransactionError] = useState<any>();
  const [signTransactionState, setSignTransactionState] = useState<any>();
  const [gasLimit, setGasLimit] = useState(150000);
  const [gasPrice, setGasPrice] = useState("30000000000"); // 30 gwei

  const [modalOpen, setModalOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Verification state
  const [isVerified, setIsVerified] = useState(false);
  const [nullifier, setNullifier] = useState<string | null>(null);

  // Check for verification params in URL
  useEffect(() => {
    const verifiedParam = searchParams.get("verified");
    const idParam = searchParams.get("id");
    if (verifiedParam === "true" && idParam) {
      setIsVerified(true);
      // Fetch nullifier from external API
      fetch(
        `https://9fd8-83-144-23-156.ngrok-free.app/events/player/${idParam}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data && data.nullifier) {
            setNullifier(data.nullifier);
          }
        });
    }
  }, [searchParams]);

  useEffect(() => {
    fetchPlayersFromContract();
  }, []);

  useEffect(() => {
    if (mintLoading) {
      setModalOpen(true);
    } else if (
      stepStatus["done"] === "done" &&
      !mintError &&
      !signTransactionError
    ) {
      // Only auto-close if successful and no error
      const timeout = setTimeout(() => setModalOpen(false), 10000);
      return () => clearTimeout(timeout);
    } // else: do not auto-close if error
  }, [mintLoading, stepStatus["done"], mintError, signTransactionError]);

  const fetchPlayersFromContract = async () => {
    try {
      setLoadingPlayers(true);
      setError(null);

      // Fetch player IDs from contract
      const playerIds = await publicClient.readContract({
        abi: PLAYER_LIST_CONTRACT_ABI,
        address: PLAYER_LIST_CONTRACT_ADDRESS,
        functionName: "getAllPlayerIds",
        args: [],
      });

      console.log("📋 Player IDs from contract:", playerIds);

      // Convert BigInt array to number array
      const playerIdNumbers = (playerIds as bigint[]).map((id: bigint) =>
        Number(id)
      );
      console.log("📋 Converted player IDs:", playerIdNumbers);

      // Fetch player details for each ID
      const playerPromises = playerIdNumbers.map(async (playerId: number) => {
        try {
          const response = await fetch(`/api/players?id=${playerId}`);
          if (!response.ok) {
            console.warn(`Failed to fetch player ${playerId}`);
            return null;
          }
          const playerStatsData = await response.json();

          // Convert PlayerStats to Player format
          if (
            playerStatsData &&
            playerStatsData.player &&
            playerStatsData.statistics &&
            playerStatsData.statistics.length > 0
          ) {
            // Use the first statistics entry (usually the most relevant one)
            const stats = playerStatsData.statistics[0];

            const player: Player = {
              id: playerStatsData.player.id,
              name: playerStatsData.player.name,
              team: stats.team?.name || "Unknown",
              position: stats.games?.position || "Unknown",
              goals: stats.goals?.total || 0,
              assists: stats.goals?.assists || 0,
              value: 50000000, // Default value
              popularity: 75, // Default popularity
              avatar:
                playerStatsData.player.photo ||
                "/placeholder.svg?height=64&width=64",
              photo:
                playerStatsData.player.photo ||
                "/placeholder.svg?height=64&width=64",
              nationality: playerStatsData.player.nationality || "Unknown",
              age: playerStatsData.player.age || 25,
              market_value: 50000000, // Default market value
              current_season_stats: {
                goals: stats.goals?.total || 0,
                assists: stats.goals?.assists || 0,
                appearances: stats.games?.appearences || 0,
                rating: parseFloat(stats.games?.rating) || 0,
              },
            };

            return player;
          }

          return null;
        } catch (err) {
          console.warn(`Error fetching player ${playerId}:`, err);
          return null;
        }
      });

      const playerResults = await Promise.all(playerPromises);
      const validPlayers = playerResults.filter(
        (player: Player | null): player is Player => player !== null
      );

      console.log("📋 Fetched players:", validPlayers);
      setPlayers(validPlayers);

      // Fetch token sales from contract for each player
      const tokenSalesPromises = validPlayers.map(async (player: Player) => {
        try {
          const tokensSold = (await publicClient.readContract({
            abi: CURVE_LEAGUE_CONTRACT_ABI,
            address: CURVE_LEAGUE_CONTRACT_ADDRESS,
            functionName: "tokensSold",
            args: [BigInt(player.id)],
          })) as bigint;

          return {
            playerId: player.id,
            tokensSold: Number(tokensSold),
          };
        } catch (err) {
          console.warn(
            `Error fetching token sales for player ${player.id}:`,
            err
          );
          return {
            playerId: player.id,
            tokensSold: 0,
          };
        }
      });

      const tokenSalesResults = await Promise.all(tokenSalesPromises);
      const newTokenCounts: Record<number, number> = {};

      tokenSalesResults.forEach(({ playerId, tokensSold }) => {
        // Calculate available tokens (100 - tokens sold)
        const availableTokens = Math.max(0, 100 - tokensSold);
        newTokenCounts[playerId] = availableTokens;
      });

      console.log("📋 Token sales data:", tokenSalesResults);
      console.log("📋 Available tokens:", newTokenCounts);

      if (Object.keys(newTokenCounts).length > 0) {
        setPlayerTokenCounts((prev) => ({ ...prev, ...newTokenCounts }));
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load players from contract"
      );
      console.error("Error fetching players from contract:", err);
    } finally {
      setLoadingPlayers(false);
    }
  };

  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayer(player);
  };

  const handlePlayerProfileClick = (player: Player) => {
    setSelectedPlayerForProfile(player);
    setShowProfileCard(true);
    setActiveTab("mint");
    // Update aurora colors based on player's team
    const teamColors = getEnhancedAuroraColors(player.team);
    setAuroraColors(teamColors);

    // Initialize token count if not exists
    if (!playerTokenCounts[player.id]) {
      setPlayerTokenCounts((prev) => ({ ...prev, [player.id]: 100 }));
    }
  };

  const handleMintToken = (player: Player) => {
    if (isMinted(player.id)) {
      alert("You have already minted a token for this player!");
      return;
    }

    if (!canMintMore) {
      alert(`You can only mint ${MAX_MINTED_PLAYERS} players per season!`);
      return;
    }

    if ((playerTokenCounts[player.id] || 100) <= 0) {
      alert("No tokens available for this player!");
      return;
    }

    // Add player to minted context
    addMintedPlayer(player);

    // Decrease token count
    setPlayerTokenCounts((prev) => ({
      ...prev,
      [player.id]: (prev[player.id] || 100) - 1,
    }));

    setShowProfileCard(false);
    alert(`Successfully minted token for ${player.name}!`);
  };

  const getAvailableTokens = (playerId: number): number => {
    return playerTokenCounts[playerId] || 100;
  };

  const hasUserMinted = (playerId: number): boolean => {
    return isMinted(playerId);
  };

  const projectedReward = Math.floor(bondAmount[0] * 0.15);
  const bondPower = Math.floor(bondAmount[0] / 100);

  const formatValue = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const renderPlayerSelection = () => (
    <Card className="glitch-border bg-zinc-900/50">
      <CardHeader>
        <CardTitle className="pixel-font text-lime-400">
          Select Player
        </CardTitle>
        <CardDescription>
          Choose your player from the available pool
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadingPlayers ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-lime-400" />
            <span className="ml-2 text-zinc-400">Loading players...</span>
          </div>
        ) : players.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <User className="h-12 w-12 text-zinc-600 mb-4" />
            <p className="text-zinc-400 text-center">
              No players found in the contract
            </p>
            <Button
              variant="ghost"
              onClick={fetchPlayersFromContract}
              className="mt-2 text-lime-400 hover:text-lime-300"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((player) => (
              <Card
                key={player.id}
                className={`cursor-pointer hover-pulse transition-all ${
                  selectedPlayer?.id === player.id
                    ? "border-lime-400 bg-lime-400/10"
                    : "border-zinc-700 hover:border-purple-500"
                }`}
                onClick={() => handlePlayerSelect(player)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-700 flex items-center justify-center">
                      {player.photo &&
                      player.photo !== "/placeholder.svg?height=64&width=64" ? (
                        <img
                          src={player.photo}
                          alt={player.name}
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
                      <div className="font-bold text-white">{player.name}</div>
                      <div className="text-sm text-zinc-400">
                        {player.position}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {player.nationality} • {player.age}y
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center">
                      <div className="text-lime-400 font-bold">
                        {player.goals}
                      </div>
                      <div className="text-zinc-400">Goals</div>
                    </div>
                    <div className="text-center">
                      <div className="text-fuchsia-500 font-bold">
                        {player.assists}
                      </div>
                      <div className="text-zinc-400">Assists</div>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-400 font-bold">
                        {player.current_season_stats?.rating?.toFixed(1) ||
                          "0.0"}
                      </div>
                      <div className="text-zinc-400">Rating</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-zinc-500">
                    Value: {formatValue(player.market_value)}
                  </div>

                  {/* Token Availability */}
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Tokens:</span>
                    <span
                      className={`font-bold ${
                        getAvailableTokens(player.id) > 50
                          ? "text-lime-400"
                          : getAvailableTokens(player.id) > 10
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {getAvailableTokens(player.id)}/100
                    </span>
                  </div>

                  {/* Token Sales Progress Bar */}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                      <span>Sold: {100 - getAvailableTokens(player.id)}</span>
                      <span>Available: {getAvailableTokens(player.id)}</span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-2">
                      <div
                        className="bg-lime-400 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${getAvailableTokens(player.id)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {hasUserMinted(player.id) && (
                    <div className="mt-2 bg-lime-900/30 border border-lime-400/50 rounded px-2 py-1">
                      <p className="text-lime-400 text-xs text-center">
                        ✓ Minted
                      </p>
                    </div>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    className={`w-full mt-3 ${
                      hasUserMinted(player.id)
                        ? "border-lime-400 text-lime-400 bg-lime-400/10"
                        : getAvailableTokens(player.id) <= 0
                        ? "border-red-400 text-red-400 opacity-50"
                        : "border-lime-400 text-lime-400 hover:bg-lime-400 hover:text-zinc-900"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayerProfileClick(player);
                    }}
                    disabled={
                      getAvailableTokens(player.id) <= 0 &&
                      !hasUserMinted(player.id)
                    }
                  >
                    {hasUserMinted(player.id)
                      ? "View Minted"
                      : getAvailableTokens(player.id) <= 0
                      ? "Sold Out"
                      : "View Profile"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Fetch price for a player
  const fetchPrice = async (playerId: number) => {
    try {
      const result = await publicClient.readContract({
        address: CURVE_LEAGUE_CONTRACT_ADDRESS,
        abi: CURVE_LEAGUE_CONTRACT_ABI,
        functionName: "getPrice",
        args: [playerId],
      });
      return (result as bigint).toString();
    } catch (err) {
      throw err;
    }
  };

  // Helper to update step status
  const updateStep = (
    step: string,
    status: "pending" | "in_progress" | "done" | "error",
    errorMsg?: string
  ) => {
    setStepStatus((prev) => ({ ...prev, [step]: status }));
    if (errorMsg) setStepError((prev) => ({ ...prev, [step]: errorMsg }));
  };

  const handleMint = async () => {
    if (!selectedPlayerForProfile) return;
    // Remove redirect logic; only mint if verified

    // Do nothing, mint button should be disabled/hidden if not verified

    setMintLoading(true);
    setMintError(null);
    setBroadcastHash(null);
    setSignTransactionOutput(undefined);
    setSignTransactionError(undefined);
    setSignTransactionState(undefined);
    setCurrentStep("fetchPrice");
    setStepStatus({});
    setStepError({});
    try {
      // 1. Fetch price
      updateStep("fetchPrice", "in_progress");

      const freshPrice = await fetchPrice(1);
      console.log(freshPrice);
      if (!freshPrice) throw new Error("Failed to fetch price");
      updateStep("fetchPrice", "done");
      setCurrentStep("fetchNonce");
      // 2. Fetch nonce
      updateStep("fetchNonce", "in_progress");
      if (!address) throw new Error("No address");
      const provider = new ethers.JsonRpcProvider(
        "https://coston2-api.flare.network/ext/C/rpc"
      );
      const n = await provider.getTransactionCount(address);
      console.log(n);
      updateStep("fetchNonce", "done");
      setCurrentStep("buildTx");
      // 3. Build unsigned tx
      updateStep("buildTx", "in_progress");
      const iface = new ethers.Interface(CURVE_LEAGUE_CONTRACT_ABI);
      const data = iface.encodeFunctionData("mintPlayer", [BigInt(1)]);
      const tx = {
        to: CURVE_LEAGUE_CONTRACT_ADDRESS,
        value: freshPrice,
        nonce: n,
        gasLimit,
        gasPrice,
        data,
        chainId: 114,
      };
      console.log(tx);
      console.log(data);
      const unsignedHex = ethers.Transaction.from(tx).unsignedSerialized;
      updateStep("buildTx", "done");
      setCurrentStep("sign");
      // 4. Sign transaction
      updateStep("sign", "in_progress");
      await new Promise<void>((resolve, reject) => {
        signTransaction(
          "44'/60'/0'/0",
          unsignedHex,
          setSignTransactionState,
          (output: any) => {
            setSignTransactionOutput(output);
            const { v, r, s } = output || {};

            updateStep("sign", "done");
            setCurrentStep("broadcast");
            // 5. Broadcast immediately after signature
            updateStep("broadcast", "in_progress");
            try {
              const signedTxHex = ethers.Transaction.from({
                ...tx,
                signature: { v, r, s },
              }).serialized;
              broadcastTransaction(signedTxHex)
                .then((hash) => {
                  setBroadcastHash(hash);
                  updateStep("broadcast", "done");
                  setCurrentStep("done");
                  updateStep("done", "done");
                  // resolve();
                })
                .catch((err) => {
                  updateStep("broadcast", "error", err.message || String(err));
                  setMintError(err);
                  setCurrentStep("broadcast");
                  // reject(err);
                });
            } catch (err: any) {
              updateStep("broadcast", "error", err.message || String(err));
              setMintError(err);
              setCurrentStep("broadcast");
              // reject(err);
            }
          },
          (err: any) => {
            setSignTransactionError(err);
            updateStep("sign", "error", err.message || String(err));
            setMintError(err);
            setCurrentStep("sign");
            // reject(err);
          }
        );
      });
    } catch (err: any) {
      updateStep(currentStep, "error", err.message || String(err));
      setMintError(err);
    } finally {
      setMintLoading(false);
    }
  };

  // Stepper UI component
  const MintStepper = () => (
    <div className="my-4">
      <ol className="space-y-2">
        {MINT_STEPS.map((step, idx) => {
          const status = stepStatus[step.key] || "pending";
          return (
            <li key={step.key} className="flex items-center gap-2">
              <span
                className={
                  status === "done"
                    ? "text-green-400"
                    : status === "in_progress"
                    ? "text-blue-400 animate-pulse"
                    : status === "error"
                    ? "text-red-400"
                    : "text-zinc-400"
                }
              >
                {status === "done" && "✔"}
                {status === "in_progress" && "●"}
                {status === "error" && "✖"}
                {status === "pending" && idx + 1}
              </span>
              <span className="font-mono text-sm">
                {step.label}
                {status === "error" && stepError[step.key] && (
                  <span className="ml-2 text-xs text-red-400">
                    {stepError[step.key]}
                  </span>
                )}
                {step.key === "done" && broadcastHash && (
                  <span className="ml-2 text-xs text-green-400">
                    Tx Hash: {broadcastHash}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 mb-4">
            <p className="text-red-400 mb-4">Error: {error}</p>
            <Button
              onClick={fetchPlayersFromContract}
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
          Mint Bond
        </h1>
        <p className="text-zinc-400">
          Select your player to mint your fantasy bond.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selection Area */}
        <div className="lg:col-span-2">{renderPlayerSelection()}</div>

        {/* Bond Configuration */}
        <div className="space-y-6">
          <Card className="glitch-border bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="pixel-font text-lime-400">
                Bond Amount
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-zinc-300">Amount (USD)</Label>
                <Input
                  type="number"
                  value={bondAmount[0]}
                  onChange={(e) =>
                    setBondAmount([Number.parseInt(e.target.value) || 0])
                  }
                  className="mt-2 bg-zinc-800 border-zinc-700"
                />
              </div>
              <div>
                <Label className="text-zinc-300">Slider</Label>
                <Slider
                  value={bondAmount}
                  onValueChange={setBondAmount}
                  max={10000}
                  min={100}
                  step={100}
                  className="mt-2"
                />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Bond Power:</span>
                  <span className="text-lime-400 font-bold">{bondPower}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Projected Reward:</span>
                  <span className="text-fuchsia-500 font-bold">
                    ${projectedReward}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selection Summary */}
          <Card className="glitch-border bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="pixel-font text-lime-400">
                Selection Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-400">Player:</span>
                <span className="text-white">
                  {selectedPlayer?.name || "Not selected"}
                </span>
              </div>
              {selectedPlayer && (
                <>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Team:</span>
                    <span className="text-white">{selectedPlayer.team}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Position:</span>
                    <span className="text-white">
                      {selectedPlayer.position}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="glitch-border bg-zinc-900/50">
            <CardHeader>
              <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <CardTitle className="pixel-font text-lime-400">
                    Bond Terms
                  </CardTitle>
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-4">
                    <div className="space-y-3 text-sm">
                      <div>
                        <div className="text-zinc-300 font-medium">
                          Performance Window
                        </div>
                        <div className="text-zinc-400">Next 30 days</div>
                      </div>
                      <div>
                        <div className="text-zinc-300 font-medium">
                          Maturity Rules
                        </div>
                        <div className="text-zinc-400">
                          Auto-mature on performance targets
                        </div>
                      </div>
                      <div>
                        <div className="text-zinc-300 font-medium">Resale</div>
                        <div className="text-zinc-400">
                          Available anytime on marketplace
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </CardHeader>
          </Card>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="w-full pixel-font bg-lime-400 text-zinc-950 hover:bg-lime-500 hover-pulse"
                disabled={!selectedPlayer || !address || !keyringEth}
              >
                <Target className="mr-2 h-4 w-4" />
                {selectedPlayer
                  ? !address || !keyringEth
                    ? "Connect Wallet to Mint"
                    : "Mint Bond"
                  : "Select Player First"}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-lime-400">
              <DialogHeader>
                <DialogTitle className="pixel-font text-lime-400">
                  Confirm Bond Mint
                </DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Review your bond details before minting
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 bg-zinc-800 rounded">
                  <div className="text-sm text-zinc-400">Selection</div>
                  <div className="text-lg font-bold text-white">
                    {selectedPlayer?.name}
                  </div>
                  <div className="text-sm text-zinc-500">
                    {selectedPlayer?.team} • {selectedPlayer?.position}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-800 rounded">
                    <div className="text-sm text-zinc-400">Amount</div>
                    <div className="text-lg font-bold text-lime-400">
                      ${bondAmount[0]}
                    </div>
                  </div>
                  <div className="p-4 bg-zinc-800 rounded">
                    <div className="text-sm text-zinc-400">Bond Power</div>
                    <div className="text-lg font-bold text-fuchsia-500">
                      {bondPower}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-zinc-800 rounded">
                  <div className="text-sm text-zinc-400">
                    Player Stats (Current Season)
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="text-center">
                      <div className="text-lime-400 font-bold">
                        {selectedPlayer?.goals}
                      </div>
                      <div className="text-xs text-zinc-400">Goals</div>
                    </div>
                    <div className="text-center">
                      <div className="text-fuchsia-500 font-bold">
                        {selectedPlayer?.assists}
                      </div>
                      <div className="text-xs text-zinc-400">Assists</div>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-400 font-bold">
                        {selectedPlayer?.current_season_stats?.rating?.toFixed(
                          1
                        ) || "0.0"}
                      </div>
                      <div className="text-xs text-zinc-400">Rating</div>
                    </div>
                  </div>
                </div>
                <Button className="w-full pixel-font bg-lime-400 text-zinc-950 hover:bg-lime-500">
                  Confirm Mint
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Player Profile Card with Aurora Background */}
      {showProfileCard && selectedPlayerForProfile && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-6xl h-[90vh] flex flex-col lg:flex-row rounded-2xl overflow-hidden border border-zinc-800">
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
                    selectedPlayerForProfile.photo ||
                    "/placeholder.svg?height=600&width=600"
                  }
                  name={selectedPlayerForProfile.name}
                  title={`${selectedPlayerForProfile.position} • ${selectedPlayerForProfile.nationality}`}
                  handle={selectedPlayerForProfile.team
                    .toLowerCase()
                    .replace(/\s+/g, "")}
                  status={`${selectedPlayerForProfile.goals}G • ${
                    selectedPlayerForProfile.assists
                  }A • ${
                    selectedPlayerForProfile.current_season_stats?.rating?.toFixed(
                      1
                    ) || "0.0"
                  }⭐`}
                  contactText={
                    hasUserMinted(selectedPlayerForProfile.id)
                      ? "Already Minted"
                      : "View Details"
                  }
                  className="profile-card-popup-split"
                  showUserInfo={false}
                />
              </div>
            </div>

            {/* Right Side - Tabbed Content */}
            <div className="relative z-10 flex-1 flex flex-col p-4 lg:p-8">
              <div className="max-w-md mx-auto w-full">
                {/* Tab Headers */}
                <div className="flex border-b border-zinc-700 mb-6">
                  <button
                    onClick={() => setActiveTab("mint")}
                    className={`px-6 py-3 font-semibold transition-all duration-200 ${
                      activeTab === "mint"
                        ? "text-lime-400 border-b-2 border-lime-400"
                        : "text-zinc-400 hover:text-zinc-300"
                    }`}
                  >
                    Mint
                  </button>
                  <button
                    onClick={() => setActiveTab("performance")}
                    className={`px-6 py-3 font-semibold transition-all duration-200 ${
                      activeTab === "performance"
                        ? "text-lime-400 border-b-2 border-lime-400"
                        : "text-zinc-400 hover:text-zinc-300"
                    }`}
                  >
                    Performance Analytics
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === "mint" && (
                  <div className="space-y-6">
                    {/* Token Stats */}
                    <div className="bg-zinc-900/60 backdrop-blur-sm rounded-xl p-6 border border-zinc-700">
                      <h3 className="text-xl font-bold text-white mb-4">
                        Token Availability
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-300">
                            Available Tokens:
                          </span>
                          <span className="text-lime-400 font-bold text-lg">
                            {getAvailableTokens(selectedPlayerForProfile.id)}
                            /100
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-zinc-400">
                          <span>
                            Sold:{" "}
                            {100 -
                              getAvailableTokens(selectedPlayerForProfile.id)}
                          </span>
                          <span>
                            Available:{" "}
                            {getAvailableTokens(selectedPlayerForProfile.id)}
                          </span>
                        </div>
                        <div className="w-full bg-zinc-700 rounded-full h-3">
                          <div
                            className="bg-lime-400 h-3 rounded-full transition-all duration-300"
                            style={{
                              width: `${getAvailableTokens(
                                selectedPlayerForProfile.id
                              )}%`,
                            }}
                          />
                        </div>
                        {hasUserMinted(selectedPlayerForProfile.id) && (
                          <div className="bg-lime-900/50 border border-lime-400 rounded-lg p-3">
                            <p className="text-lime-400 text-sm font-medium">
                              ✓ You have already minted a token for this player
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Player Stats */}
                    <div className="bg-zinc-900/60 backdrop-blur-sm rounded-xl p-6 border border-zinc-700">
                      <h3 className="text-xl font-bold text-white mb-4">
                        Season Performance
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-lime-400">
                            {selectedPlayerForProfile.goals}
                          </div>
                          <div className="text-sm text-zinc-400">Goals</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">
                            {selectedPlayerForProfile.assists}
                          </div>
                          <div className="text-sm text-zinc-400">Assists</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400">
                            {selectedPlayerForProfile.current_season_stats?.rating?.toFixed(
                              1
                            ) || "0.0"}
                          </div>
                          <div className="text-sm text-zinc-400">Rating</div>
                        </div>
                      </div>
                    </div>

                    {/* Only Mint Button (Verify removed) */}
                    <div className="bg-zinc-900/60 backdrop-blur-sm rounded-xl p-6 border border-zinc-700 flex flex-col gap-2">
                      {!address ||
                        (!keyringEth && (
                          <div className="mb-4 flex flex-col items-center">
                            <LedgerConnectButton />
                            <span className="mt-2 text-red-400 text-sm">
                              Please connect your Ledger wallet to mint.
                            </span>
                          </div>
                        ))}
                      <StarBorder
                        as="button"
                        className="w-full"
                        color="#00ffaa"
                        speed="3s"
                        onClick={handleMint}
                        disabled={
                          mintLoading ||
                          hasUserMinted(selectedPlayerForProfile.id) ||
                          getAvailableTokens(selectedPlayerForProfile.id) <=
                            0 ||
                          !address ||
                          !keyringEth
                        }
                        style={{
                          pointerEvents: "auto",
                          opacity:
                            mintLoading ||
                            hasUserMinted(selectedPlayerForProfile.id) ||
                            getAvailableTokens(selectedPlayerForProfile.id) <=
                              0 ||
                            !address ||
                            !keyringEth
                              ? 0.5
                              : 1,
                        }}
                        title={
                          hasUserMinted(selectedPlayerForProfile.id)
                            ? "Already minted."
                            : getAvailableTokens(selectedPlayerForProfile.id) <=
                              0
                            ? "Sold out."
                            : !address || !keyringEth
                            ? "Connect wallet to mint."
                            : ""
                        }
                      >
                        {mintLoading
                          ? `Minting...`
                          : !address || !keyringEth
                          ? "Connect Wallet to Mint"
                          : hasUserMinted(selectedPlayerForProfile.id)
                          ? "Already Minted"
                          : getAvailableTokens(selectedPlayerForProfile.id) <= 0
                          ? "Sold Out"
                          : "Mint Token"}
                      </StarBorder>
                      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                        <DialogContent>
                          <div className="flex flex-col items-center justify-center min-h-[200px] w-full">
                            <div className="mb-4 animate-spin rounded-full border-4 border-lime-400 border-t-transparent h-12 w-12" />
                            <MintStepper />
                            {/* Show all errors, not just broadcast */}
                            {(mintError ||
                              signTransactionError ||
                              Object.values(stepError).some(Boolean)) && (
                              <div className="mt-4 text-xs text-red-400 break-all w-full">
                                <div className="font-bold mb-1">Error:</div>
                                {mintError && (
                                  <div className="mb-1">
                                    {typeof mintError === "object"
                                      ? JSON.stringify(mintError, null, 2)
                                      : String(mintError)}
                                  </div>
                                )}
                                {signTransactionError && (
                                  <div className="mb-1">
                                    {typeof signTransactionError === "object"
                                      ? JSON.stringify(
                                          signTransactionError,
                                          null,
                                          2
                                        )
                                      : String(signTransactionError)}
                                  </div>
                                )}
                                {Object.entries(stepError).map(([step, err]) =>
                                  err ? (
                                    <div key={step} className="mb-1">
                                      {step}: {err}
                                    </div>
                                  ) : null
                                )}
                                <Button
                                  className="mt-4 w-full"
                                  variant="outline"
                                  onClick={() => setModalOpen(false)}
                                >
                                  Close
                                </Button>
                              </div>
                            )}
                            {stepStatus["done"] === "done" &&
                              broadcastHash &&
                              !mintError &&
                              !signTransactionError && (
                                <div className="mt-4 text-xs text-zinc-400">
                                  This will close in 10 seconds. Copy your Tx
                                  Hash if needed.
                                </div>
                              )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                )}

                {activeTab === "performance" && (
                  <div className="overflow-y-auto max-h-[70vh] pr-2">
                    <PerformancePredictionGraph
                      player={selectedPlayerForProfile}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
