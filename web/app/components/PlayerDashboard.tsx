"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { ArrowLeft, TrendingUp, DollarSign, Users, BarChart3 } from "lucide-react"
import Image from "next/image"
import { Player as APIPlayer } from "../lib/football-api"
import StarBorder from "../components/StarBorder"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface PlayerDashboardProps {
  player: APIPlayer
  isMinted?: boolean
  onBack: () => void
  onSell?: () => void
}

const getRandomBondData = (player: APIPlayer) => {
  const entryPrice = Math.floor(Math.random() * 150) + 50 // $50-200
  const currentValue = entryPrice + (Math.random() * 100 - 20) // +/- variation
  const roiPercent = ((currentValue - entryPrice) / entryPrice) * 100
  const priceDifference = currentValue - entryPrice
  
  return {
    entryPrice,
    currentValue: Math.max(currentValue, 20),
    roiPercent,
    priceDifference,
    bondCreatedDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    fanTokensAvailable: Math.floor(Math.random() * 50) + 10
  }
}

const getRandomPlayerStats = () => ({
  speed: Math.floor(Math.random() * 40) + 60,
  shooting: Math.floor(Math.random() * 40) + 60,
  passing: Math.floor(Math.random() * 40) + 60,
  defending: Math.floor(Math.random() * 40) + 40,
  dribbling: Math.floor(Math.random() * 40) + 50,
  physicality: Math.floor(Math.random() * 40) + 50
})

const getPlayerStatsChartData = (stats: any) => {
  return Object.entries(stats).map(([stat, value]) => ({
    name: stat.charAt(0).toUpperCase() + stat.slice(1),
    value: value as number,
    fullName: stat
  }))
}

export default function PlayerDashboard({ player, isMinted = false, onBack, onSell }: PlayerDashboardProps) {
  const bondData = getRandomBondData(player)
  const playerStats = getRandomPlayerStats()
  const chartData = getPlayerStatsChartData(playerStats)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'stats' | 'trading'>('overview')

  const formatCurrency = (amount: number) => `$${Math.floor(amount)}`
  const formatPercentage = (percent: number) => `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`
  
  // Define colors based on minted status
  const themeColors = isMinted 
    ? { primary: "#FFD700", secondary: "#FFA500", accent: "#FFEF99" } // Gold theme
    : { primary: "#a3e635", secondary: "#84cc16", accent: "#bef264" } // Lime theme

  return (
    <div className="min-h-screen bg-black text-white p-3">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-4 mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className={isMinted 
              ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10"
              : "text-lime-400 hover:text-lime-300 hover:bg-lime-400/10"
            }
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to portfolio overview
          </Button>
          {isMinted && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <span className="text-lg">🏆</span>
              MINTED
            </div>
          )}
        </div>
        <h1 className={`text-2xl font-bold mb-1 ${isMinted ? 'text-yellow-400' : 'text-lime-400'}`}>
          {isMinted ? 'Gold Bond Dashboard' : 'Dashboard'}
        </h1>
        <p className="text-zinc-400 text-sm">Viewing {player.name}'s bond performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Card className={`bg-zinc-900/50 p-3 ${isMinted ? 'border-yellow-400/30' : 'border-zinc-800'}`}>
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-xs text-zinc-400">Current Bond Value</p>
              <p className="text-xs text-zinc-500">{player.name}</p>
            </div>
            <DollarSign className={`h-4 w-4 ${isMinted ? 'text-yellow-400' : 'text-lime-400'}`} />
          </div>
          <div className="space-y-1">
            <p className={`text-xl font-bold ${isMinted ? 'text-yellow-400' : 'text-lime-400'}`}>{formatCurrency(bondData.currentValue)}</p>
            <p className="text-xs text-zinc-400">↗ {formatPercentage(bondData.roiPercent)}</p>
          </div>
        </Card>

        <Card className={`bg-zinc-900/50 p-3 ${isMinted ? 'border-yellow-400/30' : 'border-zinc-800'}`}>
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-xs text-zinc-400">Entry Price</p>
              <p className="text-xs text-zinc-500">{player.name}</p>
            </div>
            <Users className={`h-4 w-4 ${isMinted ? 'text-yellow-400' : 'text-purple-400'}`} />
          </div>
          <div className="space-y-1">
            <p className={`text-xl font-bold ${isMinted ? 'text-yellow-400' : 'text-purple-400'}`}>{formatCurrency(bondData.entryPrice)}</p>
            <p className="text-xs text-zinc-400">↗ At mint</p>
          </div>
        </Card>

        <Card className={`bg-zinc-900/50 p-3 ${isMinted ? 'border-yellow-400/30' : 'border-zinc-800'}`}>
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-xs text-zinc-400">ROI Since Mint</p>
              <p className="text-xs text-zinc-500">{player.name}</p>
            </div>
            <TrendingUp className={`h-4 w-4 ${isMinted ? 'text-yellow-400' : 'text-lime-400'}`} />
          </div>
          <div className="space-y-1">
            <p className={`text-xl font-bold ${isMinted ? 'text-yellow-400' : 'text-lime-400'}`}>{formatPercentage(bondData.roiPercent)}</p>
            <p className="text-xs text-zinc-400">↗ {bondData.priceDifference >= 0 ? 'Profit' : 'Loss'}</p>
          </div>
        </Card>

        <Card className={`bg-zinc-900/50 p-3 ${isMinted ? 'border-yellow-400/30' : 'border-zinc-800'}`}>
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-xs text-zinc-400">Price Difference</p>
              <p className="text-xs text-zinc-500">{player.name}</p>
            </div>
            <BarChart3 className={`h-4 w-4 ${isMinted ? 'text-yellow-400' : 'text-lime-400'}`} />
          </div>
          <div className="space-y-1">
            <p className={`text-xl font-bold ${isMinted ? 'text-yellow-400' : 'text-lime-400'}`}>{formatCurrency(Math.abs(bondData.priceDifference))}</p>
            <p className="text-xs text-zinc-400">↗ {bondData.priceDifference >= 0 ? 'Gain' : 'Loss'}</p>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Section - Bond Created Date */}
          <div className="space-y-3">
            <Card className="bg-zinc-800/50 border-red-500/20 p-3">
              <h3 className="text-red-400 font-semibold mb-1 text-sm">Bond created date</h3>
              <p className="text-white text-sm">{bondData.bondCreatedDate}</p>
            </Card>
            
            {/* Fan Token Section */}
            <Card className="bg-zinc-800/50 border-red-500/20 p-3">
              <h3 className="text-red-400 font-semibold mb-2 text-sm">Fan token price and availability</h3>
              
              {/* Sample fan tokens */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex -space-x-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-zinc-700 border-2 border-zinc-600 flex items-center justify-center">
                      <Image
                        src={`/placeholder.svg?height=32&width=32&text=${i}`}
                        alt={`Fan ${i}`}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    </div>
                  ))}
                </div>
                <div className="text-lime-400 font-semibold text-sm">
                  {bondData.fanTokensAvailable} available
                </div>
              </div>
              
              <StarBorder as="div" className="w-full">
                <Button 
                  onClick={onSell}
                  className={`w-full border-0 ${isMinted 
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-black' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                  size="sm"
                >
                  {isMinted ? 'Sell Gold Bond' : 'Sell'}
                </Button>
              </StarBorder>
            </Card>
          </div>

          {/* Center Section - Player Image */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative mb-2">
              <div className={`w-12 h-12 rounded-full bg-zinc-800 border-2 flex items-center justify-center overflow-hidden ${isMinted ? 'border-yellow-400/20' : 'border-lime-400/20'}`}>
                <Image
                  src={player.photo || `/placeholder.svg?height=48&width=48&text=${player.name}`}
                  alt={player.name}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              </div>
              {/* Glow effect */}
              <div className={`absolute inset-0 rounded-full blur-xl -z-10 ${isMinted ? 'bg-yellow-400/10' : 'bg-lime-400/10'}`}></div>
            </div>
            
            <h2 className="text-lg font-bold text-white mb-1">{player.name}</h2>
            <Badge variant="outline" className={`text-xs ${isMinted ? 'border-yellow-400 text-yellow-400' : 'border-lime-400 text-lime-400'}`}>
              {player.position}
            </Badge>
          </div>

          {/* Right Section - Player Stats */}
          <div className="space-y-3">
            <Card className="bg-zinc-800/50 border-purple-500/20 p-3">
              <h3 className="text-purple-400 font-semibold mb-2 text-sm">Player stats as graph</h3>
              
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorStats" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isMinted ? "#FFD700" : "#a3e635"} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={isMinted ? "#FFD700" : "#a3e635"} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#a1a1aa', fontSize: 10 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#a1a1aa', fontSize: 10 }}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#18181b', 
                        border: '1px solid #3f3f46',
                        borderRadius: '6px',
                        color: isMinted ? '#FFD700' : '#a3e635'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={isMinted ? "#FFD700" : "#a3e635"} 
                      fillOpacity={1} 
                      fill="url(#colorStats)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              {/* Stats summary */}
              <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
                {Object.entries(playerStats).map(([stat, value]) => (
                  <div key={stat} className="text-center">
                    <div className="text-zinc-400 capitalize">{stat}</div>
                    <div className={`font-semibold ${isMinted ? 'text-yellow-400' : 'text-lime-400'}`}>{value}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Additional Stats */}
            <Card className={`bg-zinc-800/50 p-3 ${isMinted ? 'border-yellow-500/20' : 'border-lime-500/20'}`}>
              <h3 className={`font-semibold mb-2 text-sm ${isMinted ? 'text-yellow-400' : 'text-lime-400'}`}>Season Performance</h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Goals</span>
                  <span className="text-white">{player.goals || Math.floor(Math.random() * 20)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Assists</span>
                  <span className="text-white">{player.assists || Math.floor(Math.random() * 15)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Appearances</span>
                  <span className="text-white">{Math.floor(Math.random() * 30) + 10}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Rating</span>
                  <span className={isMinted ? 'text-yellow-400' : 'text-lime-400'}>{(Math.random() * 2 + 7).toFixed(1)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 