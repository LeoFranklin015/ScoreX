"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  Search,
  Filter,
  Download,
  Send,
  Eye,
  CreditCard,
  Zap
} from "lucide-react"
import { useVerification } from "../lib/verification-context"

interface PayoutPlayer {
  id: number
  name: string
  team: string
  position: string
  avatar: string
  bondValue: number
  performanceScore: number
  payoutAmount: number
  status: 'pending' | 'completed' | 'failed'
  lastPayout: string
  totalPaid: number
  roi: number
}

interface Transaction {
  id: string
  playerName: string
  amount: number
  date: string
  status: 'pending' | 'completed' | 'failed'
  txHash?: string
  type: 'performance' | 'bond_reward' | 'dividend'
}

export default function PayoutPage() {
  const router = useRouter()
  const { verifiedPlayer, isPlayerVerified, clearVerification } = useVerification()
  const [players, setPlayers] = useState<PayoutPlayer[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isProcessing, setIsProcessing] = useState(false)
  const [totalPayouts, setTotalPayouts] = useState(0)
  const [pendingPayouts, setPendingPayouts] = useState(0)
  const [successfulPayouts, setSuccessfulPayouts] = useState(0)
  const [failedPayouts, setFailedPayouts] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Check verification status and redirect if not verified
  useEffect(() => {
    if (!isPlayerVerified()) {
      router.push('/verify')
      return
    }
    
    if (verifiedPlayer) {
      // Create player payout data from verified player
      const playerPayoutData: PayoutPlayer = {
        id: 1,
        name: verifiedPlayer.name,
        team: verifiedPlayer.playerProfile.team,
        position: verifiedPlayer.playerProfile.position,
        avatar: "/placeholder.svg",
        bondValue: verifiedPlayer.playerProfile.bondValue,
        performanceScore: verifiedPlayer.playerProfile.performanceScore,
        payoutAmount: verifiedPlayer.playerProfile.pendingPayout,
        status: 'pending',
        lastPayout: verifiedPlayer.playerProfile.lastPayout,
        totalPaid: verifiedPlayer.playerProfile.totalPaid,
        roi: verifiedPlayer.playerProfile.roi
      }

      // Create transaction data for the verified player
      const playerTransactions: Transaction[] = [
        {
          id: "tx_current",
          playerName: verifiedPlayer.name,
          amount: verifiedPlayer.playerProfile.pendingPayout,
          date: new Date().toISOString(),
          status: 'pending',
          type: 'performance'
        },
        {
          id: "tx_last",
          playerName: verifiedPlayer.name,
          amount: verifiedPlayer.playerProfile.pendingPayout * 0.8,
          date: verifiedPlayer.playerProfile.lastPayout + "T14:20:00Z",
          status: 'completed',
          txHash: "0x1234567890abcdef...",
          type: 'bond_reward'
        },
        {
          id: "tx_prev",
          playerName: verifiedPlayer.name,
          amount: verifiedPlayer.playerProfile.pendingPayout * 0.6,
          date: "2024-01-10T09:15:00Z",
          status: 'completed',
          txHash: "0xfedcba0987654321...",
          type: 'dividend'
        }
      ]

      setPlayers([playerPayoutData])
      setTransactions(playerTransactions)

      // Calculate totals based on verified player
      setTotalPayouts(verifiedPlayer.playerProfile.pendingPayout)
      setPendingPayouts(1)
      setSuccessfulPayouts(2)
      setFailedPayouts(0)
    }
    
    setIsLoading(false)
  }, [verifiedPlayer, isPlayerVerified, router])

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.team.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || player.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const handlePlayerSelect = (playerId: number) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId) 
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    )
  }

  const handleBulkPayout = async () => {
    if (selectedPlayers.length === 0) return
    
    setIsProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Update player statuses
    setPlayers(prev => prev.map(player => 
      selectedPlayers.includes(player.id) 
        ? { ...player, status: 'completed' as const }
        : player
    ))
    
    setSelectedPlayers([])
    setIsProcessing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-lime-400/20 text-lime-400'
      case 'pending': return 'bg-yellow-400/20 text-yellow-400'
      case 'failed': return 'bg-red-400/20 text-red-400'
      default: return 'bg-zinc-400/20 text-zinc-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'failed': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const stats = verifiedPlayer ? [
    {
      title: "Pending Payout",
      value: `$${verifiedPlayer.playerProfile.pendingPayout.toFixed(2)}`,
      change: "Ready to claim",
      icon: DollarSign,
      color: "text-lime-400",
    },
    {
      title: "Total Earned",
      value: `$${verifiedPlayer.playerProfile.totalPaid.toFixed(2)}`,
      change: "All time",
      icon: CheckCircle,
      color: "text-lime-400",
    },
    {
      title: "Bond Value",
      value: `$${verifiedPlayer.playerProfile.bondValue.toLocaleString()}`,
      change: "Current value",
      icon: Clock,
      color: "text-fuchsia-500",
    },
    {
      title: "ROI",
      value: `${verifiedPlayer.playerProfile.roi.toFixed(1)}%`,
      change: verifiedPlayer.playerProfile.roi > 0 ? "Profit" : "Loss",
      icon: TrendingUp,
      color: verifiedPlayer.playerProfile.roi > 0 ? "text-lime-400" : "text-red-400",
    },
  ] : [
    {
      title: "Total Payouts",
      value: `$${totalPayouts.toLocaleString()}`,
      change: "+12.3%",
      icon: DollarSign,
      color: "text-lime-400",
    },
    {
      title: "Pending Payouts",
      value: pendingPayouts.toString(),
      change: "Processing",
      icon: Clock,
      color: "text-yellow-400",
    },
    {
      title: "Successful Payouts",
      value: successfulPayouts.toString(),
      change: "+5 today",
      icon: CheckCircle,
      color: "text-lime-400",
    },
    {
      title: "Average ROI",
      value: "18.8%",
      change: "+2.1%",
      icon: TrendingUp,
      color: "text-fuchsia-500",
    },
  ]

  // Show loading state while checking verification
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400 mx-auto"></div>
            <p className="text-zinc-400 mt-4">Verifying access...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="pixel-font text-4xl font-bold text-lime-400 mb-2">
              {verifiedPlayer ? `${verifiedPlayer.name}'s Payouts` : 'Player Payouts'}
            </h1>
            <p className="text-zinc-400">
              {verifiedPlayer 
                ? `Welcome back, ${verifiedPlayer.name}! Here are your sponsorship payouts and bond rewards.`
                : 'Manage performance-based payouts and bond rewards for your players'
              }
            </p>
          </div>
          <div className="flex items-center gap-4">
            {verifiedPlayer && (
              <div className="text-right">
                <p className="text-sm text-zinc-500">Verified Player</p>
                <p className="text-lg font-semibold text-lime-400">{verifiedPlayer.name}</p>
                <p className="text-xs text-zinc-400">{verifiedPlayer.playerProfile.team}</p>
              </div>
            )}
            <Button
              onClick={() => {
                clearVerification()
                router.push('/verify')
              }}
              variant="outline"
              className="border-red-400/20 text-red-400 hover:bg-red-400/10"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-zinc-900 border-lime-400/20 hover:border-lime-400/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-100">{stat.value}</div>
              <p className="text-xs text-zinc-500">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="payouts" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-zinc-900 border-lime-400/20">
          <TabsTrigger value="payouts" className="pixel-font data-[state=active]:bg-lime-400 data-[state=active]:text-zinc-950">
            Active Payouts
          </TabsTrigger>
          <TabsTrigger value="history" className="pixel-font data-[state=active]:bg-lime-400 data-[state=active]:text-zinc-950">
            Transaction History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payouts" className="space-y-6">
          {/* Simplified controls for single player */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-zinc-900 border-lime-400/20 text-zinc-100"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-zinc-900 border border-lime-400/20 rounded-md text-zinc-100 pixel-font"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleBulkPayout}
                disabled={selectedPlayers.length === 0 || isProcessing}
                className="pixel-font bg-lime-400 text-zinc-950 hover:bg-lime-500 disabled:bg-zinc-600"
              >
                <Send className="mr-2 h-4 w-4" />
                {isProcessing ? "Processing..." : `Claim Payout (${selectedPlayers.length})`}
              </Button>
              <Button variant="outline" className="pixel-font border-lime-400/20 text-lime-400 hover:bg-lime-400/10">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Player Payout Table */}
          <Card className="bg-zinc-900 border-lime-400/20">
            <CardHeader>
              <CardTitle className="pixel-font text-lime-400">
                {verifiedPlayer ? `${verifiedPlayer.name}'s Payout Details` : 'Player Payouts'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-lime-400/20">
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedPlayers.length === filteredPlayers.length && filteredPlayers.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPlayers(filteredPlayers.map(p => p.id))
                          } else {
                            setSelectedPlayers([])
                          }
                        }}
                        className="rounded border-lime-400/20"
                      />
                    </TableHead>
                    <TableHead className="pixel-font text-lime-400">Player</TableHead>
                    <TableHead className="pixel-font text-lime-400">Performance</TableHead>
                    <TableHead className="pixel-font text-lime-400">Bond Value</TableHead>
                    <TableHead className="pixel-font text-lime-400">Payout Amount</TableHead>
                    <TableHead className="pixel-font text-lime-400">Status</TableHead>
                    <TableHead className="pixel-font text-lime-400">ROI</TableHead>
                    <TableHead className="pixel-font text-lime-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlayers.map((player) => (
                    <TableRow key={player.id} className="border-lime-400/10 hover:bg-zinc-800/50">
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedPlayers.includes(player.id)}
                          onChange={() => handlePlayerSelect(player.id)}
                          className="rounded border-lime-400/20"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img 
                            src={player.avatar} 
                            alt={player.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <div className="font-medium text-zinc-100">{player.name}</div>
                            <div className="text-sm text-zinc-400">{player.team}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="text-zinc-100">{player.performanceScore}</div>
                          <div className="w-20 bg-zinc-800 rounded-full h-2">
                            <div 
                              className="bg-lime-400 h-2 rounded-full" 
                              style={{ width: `${player.performanceScore}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-100">${player.bondValue.toLocaleString()}</TableCell>
                      <TableCell className="text-zinc-100 font-medium">${player.payoutAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(player.status)} capitalize`}>
                          {getStatusIcon(player.status)}
                          <span className="ml-1">{player.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className={`font-medium ${player.roi > 0 ? 'text-lime-400' : 'text-red-400'}`}>
                        {player.roi > 0 ? '+' : ''}{player.roi.toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="border-lime-400/20 text-lime-400 hover:bg-lime-400/10">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="border-fuchsia-500/20 text-fuchsia-500 hover:bg-fuchsia-500/10">
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="bg-zinc-900 border-lime-400/20">
            <CardHeader>
              <CardTitle className="pixel-font text-lime-400">
                {verifiedPlayer ? `${verifiedPlayer.name}'s Transaction History` : 'Transaction History'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-lime-400/20">
                    <TableHead className="pixel-font text-lime-400">Transaction ID</TableHead>
                    <TableHead className="pixel-font text-lime-400">Player</TableHead>
                    <TableHead className="pixel-font text-lime-400">Amount</TableHead>
                    <TableHead className="pixel-font text-lime-400">Type</TableHead>
                    <TableHead className="pixel-font text-lime-400">Date</TableHead>
                    <TableHead className="pixel-font text-lime-400">Status</TableHead>
                    <TableHead className="pixel-font text-lime-400">TX Hash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id} className="border-lime-400/10 hover:bg-zinc-800/50">
                      <TableCell className="font-mono text-zinc-100">{tx.id}</TableCell>
                      <TableCell className="text-zinc-100">{tx.playerName}</TableCell>
                      <TableCell className="text-zinc-100 font-medium">${tx.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-fuchsia-500/20 text-fuchsia-500 capitalize">
                          {tx.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-400">
                        {new Date(tx.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(tx.status)} capitalize`}>
                          {getStatusIcon(tx.status)}
                          <span className="ml-1">{tx.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tx.txHash ? (
                          <a 
                            href={`https://etherscan.io/tx/${tx.txHash}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-lime-400 hover:text-lime-300 underline font-mono text-sm"
                          >
                            {tx.txHash.slice(0, 10)}...
                          </a>
                        ) : (
                          <span className="text-zinc-500">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 