"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { TrendingUp, Users, DollarSign, Zap, ArrowUpRight, Activity } from "lucide-react"
import FootballField from "../components/FootballField"
import PlayerDashboard from "../components/PlayerDashboard"
import { Player as APIPlayer } from "../lib/football-api"
import { useMintedPlayers } from "../lib/minted-players-context"
import { publicClient } from "../lib/client"
import { CURVE_LEAGUE_CONTRACT_ADDRESS, CURVE_LEAGUE_CONTRACT_ABI, PLAYER_LIST_CONTRACT_ADDRESS, PLAYER_LIST_CONTRACT_ABI } from "../lib/const"
import { formatEther } from "viem"

export default function Dashboard() {
  const [isAnimating, setIsAnimating] = useState(false)
  const [selectedPlayerStats, setSelectedPlayerStats] = useState<any>(null)
  const [selectedPlayer, setSelectedPlayer] = useState<APIPlayer | null>(null)
  const [showPlayerDashboard, setShowPlayerDashboard] = useState(false)
  
  // Contract data states
  const [totalLiquidity, setTotalLiquidity] = useState<string>("0")
  const [activePlayers, setActivePlayers] = useState<number>(0)
  const [seasonActive, setSeasonActive] = useState<boolean>(false)
  const [curveCoefficient, setCurveCoefficient] = useState<string>("0")
  const [loading, setLoading] = useState(true)
  
  // Use minted players context
  const { isMinted } = useMintedPlayers()

  // Fetch contract data
  const fetchContractData = async () => {
    try {
      setLoading(true)
      
      // Fetch total liquidity
      const liquidity = await publicClient.readContract({
        abi: CURVE_LEAGUE_CONTRACT_ABI,
        address: CURVE_LEAGUE_CONTRACT_ADDRESS,
        functionName: "getTotalLiquidity",
        args: [],
      }) as bigint
      
      setTotalLiquidity(formatEther(liquidity))
      
      // Fetch active players count
      const playerIds = await publicClient.readContract({
        abi: PLAYER_LIST_CONTRACT_ABI,
        address: PLAYER_LIST_CONTRACT_ADDRESS,
        functionName: "getAllPlayerIds",
        args: [],
      }) as bigint[]
      
      setActivePlayers(playerIds.length)
      
      // Fetch season active status
      const isSeasonActive = await publicClient.readContract({
        abi: CURVE_LEAGUE_CONTRACT_ABI,
        address: CURVE_LEAGUE_CONTRACT_ADDRESS,
        functionName: "seasonActive",
        args: [],
      }) as boolean
      
      setSeasonActive(isSeasonActive)
      
      // Fetch curve coefficient
      const coefficient = await publicClient.readContract({
        abi: CURVE_LEAGUE_CONTRACT_ABI,
        address: CURVE_LEAGUE_CONTRACT_ADDRESS,
        functionName: "CURVE_COEFFICIENT",
        args: [],
      }) as bigint
      
      setCurveCoefficient(formatEther(coefficient))
      
    } catch (error) {
      console.error("Error fetching contract data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContractData()
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchContractData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Generate consistent player ID from name
  const generatePlayerIdFromName = (name: string): number => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      const char = name.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  // Handle player selection from football field
  const handlePlayerSelect = (playerData: any) => {
    if (playerData) {
      // Convert field player back to API player format with consistent ID
      const playerId = generatePlayerIdFromName(playerData.name);
      const apiPlayer: APIPlayer = {
        id: playerId,
        name: playerData.name,
        team: 'Your Team',
        position: playerData.pos || 'Midfielder',
        goals: playerData.goals || 0,
        assists: 0,
        value: Math.floor(Math.random() * 100000) + 50000,
        popularity: Math.floor(Math.random() * 100),
        avatar: playerData.asset || '/placeholder.svg',
        photo: playerData.asset || '/placeholder.svg',
        nationality: playerData.origin || 'Unknown',
        age: parseInt(playerData.dob) || 25,
        market_value: Math.floor(Math.random() * 100000) + 50000,
        current_season_stats: {
          goals: playerData.goals || 0,
          assists: Math.floor(Math.random() * 10),
          appearances: Math.floor(Math.random() * 30) + 10,
          rating: Math.random() * 2 + 7
        }
      }
      
      setSelectedPlayer(apiPlayer)
      setShowPlayerDashboard(true)
      
      // Keep old stats for overview cards
      setSelectedPlayerStats({
        bondValue: Math.floor(Math.random() * 500) + 200,
        currentPrice: Math.floor(Math.random() * 300) + 150,
        entryPrice: Math.floor(Math.random() * 250) + 100,
        roi: (Math.random() * 60) - 20,
        playerName: playerData.name
      })
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 500)
    } else {
      setSelectedPlayerStats(null)
      setSelectedPlayer(null)
      setShowPlayerDashboard(false)
    }
  }

  // Handle back button from player dashboard
  const handleBackToDashboard = () => {
    setShowPlayerDashboard(false)
    setSelectedPlayer(null)
    setSelectedPlayerStats(null)
  }

  // Dynamic stats based on selected player or portfolio overview
  const stats: Array<{
    title: string;
    value: string;
    change: string;
    icon: any;
    color: string;
    player?: string;
    animated?: boolean;
  }> = selectedPlayerStats ? [
    {
      title: "Current Bond Value",
      value: `$${selectedPlayerStats.currentPrice}`,
      change: `${selectedPlayerStats.roi >= 0 ? '+' : ''}${selectedPlayerStats.roi.toFixed(1)}%`,
      icon: DollarSign,
      color: "text-lime-400",
      player: selectedPlayerStats.playerName,
    },
    {
      title: "Entry Price",
      value: `$${selectedPlayerStats.entryPrice}`,
      change: "At mint",
      icon: Users,
      color: "text-fuchsia-500",
      player: selectedPlayerStats.playerName,
    },
    {
      title: "ROI Since Mint",
      value: `${selectedPlayerStats.roi >= 0 ? '+' : ''}${selectedPlayerStats.roi.toFixed(1)}%`,
      change: selectedPlayerStats.roi >= 0 ? "Profit" : "Loss",
      icon: TrendingUp,
      color: selectedPlayerStats.roi >= 0 ? "text-lime-400" : "text-red-400",
      animated: isAnimating,
      player: selectedPlayerStats.playerName,
    },
    {
      title: "Price Difference",
      value: `$${selectedPlayerStats.currentPrice - selectedPlayerStats.entryPrice}`,
      change: selectedPlayerStats.currentPrice > selectedPlayerStats.entryPrice ? "Gain" : "Loss",
      icon: Zap,
      color: selectedPlayerStats.currentPrice > selectedPlayerStats.entryPrice ? "text-lime-400" : "text-red-400",
      player: selectedPlayerStats.playerName,
    },
  ] : [
    {
      title: "Total Bonded Value",
      value: loading ? "Loading..." : `${parseFloat(totalLiquidity).toFixed(2)} ETH`,
      change: "+8.2%",
      icon: DollarSign,
      color: "text-lime-400",
    },
    {
      title: "Active Players",
      value: loading ? "Loading..." : activePlayers.toString(),
      change: "+3",
      icon: Users,
      color: "text-fuchsia-500",
    },
    {
      title: "Season Status",
      value: loading ? "Loading..." : (seasonActive ? "ACTIVE" : "INACTIVE"),
      change: seasonActive ? "Live" : "Ended",
      icon: Activity,
      color: seasonActive ? "text-green-400" : "text-red-400",
    },
    {
      title: "Curve Coefficient",
      value: loading ? "Loading..." : `${parseFloat(curveCoefficient).toFixed(6)} ETH`,
      change: "Fixed",
      icon: Zap,
      color: "text-purple-400",
    },
  ]

  // Show PlayerDashboard if a player is selected and showPlayerDashboard is true
  if (showPlayerDashboard && selectedPlayer) {
    const isPlayerMinted = isMinted(selectedPlayer.id);
    return (
      <PlayerDashboard 
        player={selectedPlayer}
        isMinted={isPlayerMinted}
        onBack={handleBackToDashboard}
        onSell={() => {
          alert('Sell functionality coming soon!')
          // Don't automatically go back - let user stay on the dashboard
        }}
      />
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="pixel-font text-4xl font-bold text-lime-400 mb-2">Dashboard</h1>
        <p className="text-zinc-400">
          {selectedPlayerStats 
            ? `Viewing ${selectedPlayerStats.playerName}'s bond performance` 
            : "Welcome back, degen. Your empire awaits."
          }
        </p>
        {selectedPlayerStats && (
          <button 
            onClick={() => handlePlayerSelect(null)}
            className="text-xs text-zinc-500 hover:text-lime-400 mt-1 underline"
          >
            ← Back to portfolio overview
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className={`glitch-border bg-zinc-900/50 ${stat.animated ? "animate-pulse" : ""} ${selectedPlayerStats ? 'border-lime-400/30' : ''}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-300">
                {stat.title}
                {stat.player && (
                  <div className="text-xs text-lime-400 font-normal mt-1">
                    {stat.player}
                  </div>
                )}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold pixel-font ${stat.color}`}>{stat.value}</div>
              <p className="text-xs text-zinc-500 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Football Field */}
      <FootballField 
        title="YOUR TEAM FORMATION"
        subtitle="Click on any player to view their bond performance"
        height="700px"
        className="rounded-lg border border-zinc-800 bg-zinc-900/50"
        onPlayerSelect={handlePlayerSelect}
      />
    </div>
  )
}
