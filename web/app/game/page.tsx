"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useLedger } from "../components/Provider";
import { LedgerConnectButton } from "../components/LedgerConnectButton";
import { LabelizedInput } from "../components/LabelizedInput";
import { LabelizedJSON } from "../components/LabelizedJSON";
import { SectionContainer } from "../components/SectionContainer";
import { Divider } from "../components/Divider";
import { footballAPI } from "../lib/football-api";
import { Player } from "../lib/football-api";
import Image from "next/image";

// Contract addresses (update these after deployment)
const FOOTBALL_GAME_CONTRACT_ADDRESS = "0x7268eAfbb4ACb4E0D862AC5a0f6BFc57c0CcAd9A"; // Replace with deployed address
const FXRP_ADDRESS = "0x8b4abA9C4BD7DD961659b02129beE20c6286e17F"; // Replace with actual FXRP address

// Game contract ABI (simplified version based on lottery logic)
const FOOTBALL_GAME_CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "uint256[]", name: "playerIds", type: "uint256[]" },
      { internalType: "uint256", name: "stakeAmount", type: "uint256" },
      { internalType: "string", name: "xrpAddress", type: "string" }
    ],
    name: "createGame",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "gameId", type: "uint256" },
      { internalType: "uint256[]", name: "playerIds", type: "uint256[]" },
      { internalType: "string", name: "xrpAddress", type: "string" }
    ],
    name: "joinGame",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "gameId", type: "uint256" }],
    name: "settleGame",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "gameId", type: "uint256" }],
    name: "processPayout",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "gameId", type: "uint256" }],
    name: "processPayoutInFXRP",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "gameId", type: "uint256" }],
    name: "getGame",
    outputs: [
      { internalType: "uint256", name: "gameId", type: "uint256" },
      { internalType: "address", name: "playerA", type: "address" },
      { internalType: "address", name: "playerB", type: "address" },
      { internalType: "uint256", name: "stakeAmount", type: "uint256" },
      { internalType: "uint8", name: "state", type: "uint8" },
      { internalType: "address", name: "winner", type: "address" },
      { internalType: "uint256", name: "seed", type: "uint256" },
      { internalType: "bool", name: "payoutProcessed", type: "bool" },
      { internalType: "uint256[]", name: "playerIdsA", type: "uint256[]" },
      { internalType: "uint256[]", name: "playerIdsB", type: "uint256[]" },
      { internalType: "uint256[]", name: "scoresA", type: "uint256[]" },
      { internalType: "uint256[]", name: "scoresB", type: "uint256[]" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "nextGameId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
];

const CHAIN_ID = 114; // Flare Testnet

interface GameState {
  gameId: number;
  playerA: string;
  playerB: string;
  stakeAmount: string;
  state: number;
  winner: string;
  seed: string;
  payoutProcessed: boolean;
  playerIdsA: number[];
  playerIdsB: number[];
  scoresA: number[];
  scoresB: number[];
}

export default function FootballGame() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [gameId, setGameId] = useState<number | null>(null);
  const [stakeAmount, setStakeAmount] = useState("10");
  const [xrpAddress, setXrpAddress] = useState("");
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Transaction states
  const [nonce, setNonce] = useState<number | null>(null);
  const [gasLimit, setGasLimit] = useState(300000);
  const [gasPrice, setGasPrice] = useState("30000000000");
  const [unsignedTx, setUnsignedTx] = useState<any>(null);
  const [unsignedTxHex, setUnsignedTxHex] = useState<string | null>(null);
  const [signTransactionOutput, setSignTransactionOutput] = useState<any>();
  const [signTransactionError, setSignTransactionError] = useState<any>();
  const [signTransactionState, setSignTransactionState] = useState<any>();
  const [broadcastHash, setBroadcastHash] = useState<string | null>(null);
  const [broadcastError, setBroadcastError] = useState<any>(null);
  const [broadcastLoading, setBroadcastLoading] = useState(false);

  const {
    getAddress,
    signTransaction,
    broadcastTransaction,
    address,
    keyringEth,
  } = useLedger();

  // Load players on component mount
  useEffect(() => {
    loadPlayers();
  }, []);

  // Fetch nonce when address is set
  useEffect(() => {
    if (address) {
      fetchNonce(address);
    }
  }, [address]);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const topPlayers = await footballAPI.getTopPlayers();
      setPlayers(topPlayers);
    } catch (error) {
      console.error("Error loading players:", error);
      setMessage("Failed to load players");
    } finally {
      setLoading(false);
    }
  };

  const fetchNonce = async (address: string) => {
    const provider = new ethers.JsonRpcProvider(
      "https://coston2-api.flare.network/ext/C/rpc"
    );
    const n = await provider.getTransactionCount(address);
    setNonce(n);
  };

  const handlePlayerSelect = (player: Player) => {
    if (selectedPlayers.length >= 5) {
      setMessage("Maximum 5 players allowed!");
      return;
    }
    
    if (selectedPlayers.find(p => p.id === player.id)) {
      setMessage("Player already selected!");
      return;
    }
    
    setSelectedPlayers([...selectedPlayers, player]);
    setMessage(`Selected ${player.name}`);
  };

  const handlePlayerDeselect = (playerId: number) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId));
  };

  const buildUnsignedTx = async (functionName: string, params: any[]) => {
    if (!address || nonce === null) return;
    
    const iface = new ethers.Interface(FOOTBALL_GAME_CONTRACT_ABI);
    const data = iface.encodeFunctionData(functionName, params);
    
    const tx = {
      to: FOOTBALL_GAME_CONTRACT_ADDRESS,
      value: 0,
      nonce,
      gasLimit,
      gasPrice,
      data,
      chainId: CHAIN_ID,
    };
    
    setUnsignedTx(tx);
    setUnsignedTxHex(ethers.Transaction.from(tx).unsignedSerialized);
  };

  const handleSignTransaction = () => {
    setSignTransactionOutput(undefined);
    setSignTransactionError(undefined);
    setSignTransactionState(undefined);
    if (!unsignedTxHex) return;
    
    signTransaction(
      "44'/60'/0'/0",
      unsignedTxHex,
      setSignTransactionState,
      setSignTransactionOutput,
      setSignTransactionError
    );
  };

  const handleBroadcast = async () => {
    setBroadcastHash(null);
    setBroadcastError(null);
    setBroadcastLoading(true);
    
    try {
      const { v, r, s } = signTransactionOutput;
      const signedTxHex = ethers.Transaction.from({
        ...unsignedTx,
        signature: { v, r, s },
      }).serialized;
      
      const hash = await broadcastTransaction(signedTxHex);
      setBroadcastHash(hash);
      setMessage("Transaction broadcast successfully!");
      
      // Update nonce for next transaction
      if (address) {
        fetchNonce(address);
      }
    } catch (err) {
      setBroadcastError(err);
      setMessage("Transaction failed!");
    } finally {
      setBroadcastLoading(false);
    }
  };

  const createGame = async () => {
    if (selectedPlayers.length !== 5) {
      setMessage("Please select exactly 5 players!");
      return;
    }
    
    if (!xrpAddress) {
      setMessage("Please enter your XRP address!");
      return;
    }
    
    const playerIds = selectedPlayers.map(p => p.id);
    const stakeAmountWei = ethers.parseUnits(stakeAmount, 6); // FXRP has 6 decimals
    
    await buildUnsignedTx("createGame", [playerIds, stakeAmountWei, xrpAddress]);
    setMessage("Ready to create game. Sign the transaction.");
  };

  const joinGame = async () => {
    if (!gameId) {
      setMessage("Please enter a game ID!");
      return;
    }
    
    if (selectedPlayers.length !== 5) {
      setMessage("Please select exactly 5 players!");
      return;
    }
    
    if (!xrpAddress) {
      setMessage("Please enter your XRP address!");
      return;
    }
    
    const playerIds = selectedPlayers.map(p => p.id);
    await buildUnsignedTx("joinGame", [gameId, playerIds, xrpAddress]);
    setMessage("Ready to join game. Sign the transaction.");
  };

  const settleGame = async () => {
    if (!gameId) {
      setMessage("Please enter a game ID!");
      return;
    }
    
    await buildUnsignedTx("settleGame", [gameId]);
    setMessage("Ready to settle game. Sign the transaction.");
  };

  const processPayout = async () => {
    if (!gameId) {
      setMessage("Please enter a game ID!");
      return;
    }
    
    await buildUnsignedTx("processPayout", [gameId]);
    setMessage("Ready to process payout. Sign the transaction.");
  };

  const processPayoutInFXRP = async () => {
    if (!gameId) {
      setMessage("Please enter a game ID!");
      return;
    }
    
    await buildUnsignedTx("processPayoutInFXRP", [gameId]);
    setMessage("Ready to process FXRP payout. Sign the transaction.");
  };

  const getGameInfo = async () => {
    if (!gameId) {
      setMessage("Please enter a game ID!");
      return;
    }
    
    try {
      const provider = new ethers.JsonRpcProvider(
        "https://coston2-api.flare.network/ext/C/rpc"
      );
      const contract = new ethers.Contract(
        FOOTBALL_GAME_CONTRACT_ADDRESS,
        FOOTBALL_GAME_CONTRACT_ABI,
        provider
      );
      
      const game = await contract.getGame(gameId);
      setGameState({
        gameId: Number(game.gameId),
        playerA: game.playerA,
        playerB: game.playerB,
        stakeAmount: ethers.formatUnits(game.stakeAmount, 6),
        state: Number(game.state),
        winner: game.winner,
        seed: game.seed.toString(),
        payoutProcessed: game.payoutProcessed,
        playerIdsA: game.playerIdsA.map((id: any) => Number(id)),
        playerIdsB: game.playerIdsB.map((id: any) => Number(id)),
        scoresA: game.scoresA.map((score: any) => Number(score)),
        scoresB: game.scoresB.map((score: any) => Number(score)),
      });
      setMessage("Game info loaded successfully!");
    } catch (error) {
      console.error("Error getting game info:", error);
      setMessage("Failed to get game info");
    }
  };

  const getGameStateText = (state: number) => {
    switch (state) {
      case 0: return "Created";
      case 1: return "Joined";
      case 2: return "Settled";
      default: return "Unknown";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">⚽ Football Fantasy League</h1>
          <p className="text-green-200">Select your dream team and compete for glory!</p>
        </div>

        <LedgerConnectButton />

        {message && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Player Selection */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🏆 Available Players</h2>
            
            <div className="mb-4">
              <LabelizedInput
                label="Stake Amount (FXRP)"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
              />
              <LabelizedInput
                label="XRP Address"
                value={xrpAddress}
                onChange={(e) => setXrpAddress(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Selected Players ({selectedPlayers.length}/5)
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center gap-2"
                  >
                    <span>{player.name}</span>
                    <button
                      onClick={() => handlePlayerDeselect(player.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {players.map((player) => (
                <div
                  key={player.id}
                  onClick={() => handlePlayerSelect(player)}
                  className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${
                    selectedPlayers.find(p => p.id === player.id)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="text-center">
                    <Image
                      src={player.photo || "/placeholder.svg"}
                      alt={player.name}
                      width={50}
                      height={50}
                      className="mx-auto rounded-full mb-2"
                    />
                    <h4 className="font-semibold text-sm">{player.name}</h4>
                    <p className="text-xs text-gray-600">{player.position}</p>
                    <p className="text-xs text-gray-500">{player.team}</p>
                    <div className="flex justify-between text-xs mt-1">
                      <span>⚽ {player.goals}</span>
                      <span>🎯 {player.assists}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Game Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🎮 Game Actions</h2>
            
            <div className="space-y-4">
              <SectionContainer>
                <h3 className="text-lg font-semibold mb-3">Create New Game</h3>
                <button
                  onClick={createGame}
                  disabled={selectedPlayers.length !== 5 || !xrpAddress}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                  Create Game
                </button>
              </SectionContainer>

              <Divider />

              <SectionContainer>
                <h3 className="text-lg font-semibold mb-3">Join Existing Game</h3>
                <LabelizedInput
                  label="Game ID"
                  value={gameId?.toString() || ""}
                  onChange={(e) => setGameId(Number(e.target.value))}
                />
                <button
                  onClick={joinGame}
                  disabled={selectedPlayers.length !== 5 || !gameId || !xrpAddress}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Join Game
                </button>
              </SectionContainer>

              <Divider />

              <SectionContainer>
                <h3 className="text-lg font-semibold mb-3">Game Management</h3>
                <button
                  onClick={settleGame}
                  disabled={!gameId}
                  className="w-full bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700 disabled:bg-gray-400 mb-2"
                >
                  Settle Game
                </button>
                <button
                  onClick={processPayout}
                  disabled={!gameId}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:bg-gray-400 mb-2"
                >
                  Process Payout (XRP)
                </button>
                <button
                  onClick={processPayoutInFXRP}
                  disabled={!gameId}
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700 disabled:bg-gray-400"
                >
                  Process Payout (FXRP)
                </button>
              </SectionContainer>

              <Divider />

              <SectionContainer>
                <h3 className="text-lg font-semibold mb-3">Game Information</h3>
                <button
                  onClick={getGameInfo}
                  disabled={!gameId}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 disabled:bg-gray-400"
                >
                  Get Game Info
                </button>
              </SectionContainer>
            </div>

            {/* Game State Display */}
            {gameState && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Game Status</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Game ID:</strong> {gameState.gameId}</p>
                  <p><strong>Player A:</strong> {gameState.playerA}</p>
                  <p><strong>Player B:</strong> {gameState.playerB}</p>
                  <p><strong>Stake Amount:</strong> {gameState.stakeAmount} FXRP</p>
                  <p><strong>State:</strong> {getGameStateText(gameState.state)}</p>
                  <p><strong>Winner:</strong> {gameState.winner || "Not determined"}</p>
                  <p><strong>Payout Processed:</strong> {gameState.payoutProcessed ? "Yes" : "No"}</p>
                  <p><strong>Player IDs A:</strong> {gameState.playerIdsA.join(", ")}</p>
                  <p><strong>Player IDs B:</strong> {gameState.playerIdsB.join(", ")}</p>
                  <p><strong>Scores A:</strong> {gameState.scoresA.join(", ")}</p>
                  <p><strong>Scores B:</strong> {gameState.scoresB.join(", ")}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Transaction Section */}
        {keyringEth && unsignedTx && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🔐 Transaction</h2>
            
            <SectionContainer>
              <LabelizedInput
                label="Gas Limit"
                value={gasLimit.toString()}
                onChange={(e) => setGasLimit(Number(e.target.value))}
              />
              <LabelizedInput
                label="Gas Price (wei)"
                value={gasPrice.toString()}
                onChange={(e) => setGasPrice(e.target.value)}
              />
              <LabelizedJSON label="Unsigned Transaction" value={unsignedTx} />
              <LabelizedJSON label="Unsigned Transaction Hex" value={unsignedTxHex} />
              
              <button
                onClick={handleSignTransaction}
                disabled={!unsignedTxHex}
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400"
              >
                Sign Transaction
              </button>
            </SectionContainer>

            {signTransactionError ? (
              <LabelizedJSON label="Sign Transaction Error" value={signTransactionError} />
            ) : (
              <>
                <LabelizedJSON label="Sign Transaction State" value={signTransactionState} />
                <LabelizedJSON label="Sign Transaction Output" value={signTransactionOutput} />
              </>
            )}

            {signTransactionOutput && (
              <SectionContainer>
                <h3 className="text-lg font-semibold mb-3">Broadcast Transaction</h3>
                <button
                  disabled={!signTransactionOutput || broadcastLoading}
                  onClick={handleBroadcast}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {broadcastLoading ? "Broadcasting..." : "Broadcast Transaction"}
                </button>
                
                {broadcastHash && (
                  <div className="mt-2 p-2 bg-green-100 text-green-800 rounded">
                    Transaction Hash: {broadcastHash}
                  </div>
                )}
                
                {broadcastError && (
                  <LabelizedJSON label="Broadcast Error" value={broadcastError} />
                )}
              </SectionContainer>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
