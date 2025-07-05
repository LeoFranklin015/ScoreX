"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Slider } from "../components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../components/ui/collapsible"
import { ChevronDown, Target, Loader2, User, ArrowRight, Trophy, Users, ChevronLeft } from "lucide-react"
import { Player, League, Team } from "../lib/football-api"
import ProfileCard from "../components/ProfileCard"
import Aurora from "../components/Aurora"
import StarBorder from "../components/StarBorder"
import PerformancePredictionGraph from "../components/PerformancePredictionGraph"
import { getEnhancedAuroraColors } from "../lib/team-colors"
import { useMintedPlayers } from "../lib/minted-players-context"

type SelectionStep = 'league' | 'team' | 'player'

export default function Mint() {
  const [currentStep, setCurrentStep] = useState<SelectionStep>('league')
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [bondAmount, setBondAmount] = useState([1000])
  
  const [leagues, setLeagues] = useState<League[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  
  const [loadingLeagues, setLoadingLeagues] = useState(true)
  const [loadingTeams, setLoadingTeams] = useState(false)
  const [loadingPlayers, setLoadingPlayers] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Profile card state
  const [showProfileCard, setShowProfileCard] = useState(false)
  const [selectedPlayerForProfile, setSelectedPlayerForProfile] = useState<Player | null>(null)
  const [auroraColors, setAuroraColors] = useState<string[]>(['#00ffaa', '#3A29FF', '#FF94B4'])
  const [activeTab, setActiveTab] = useState<'mint' | 'performance'>('mint')
  const [playerTokenCounts, setPlayerTokenCounts] = useState<Record<number, number>>({})
  
  // Use minted players context
  const { mintedPlayers: mintedPlayersFromContext, addMintedPlayer, isMinted, canMintMore, mintedCount, MAX_MINTED_PLAYERS } = useMintedPlayers()

  useEffect(() => {
    fetchLeagues()
  }, [])

  const fetchLeagues = async () => {
    try {
      setLoadingLeagues(true)
      setError(null)
      
      const response = await fetch('/api/leagues')
      
      if (!response.ok) {
        throw new Error('Failed to fetch leagues')
      }
      
      const data = await response.json()
      setLeagues(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leagues')
      console.error('Error fetching leagues:', err)
    } finally {
      setLoadingLeagues(false)
    }
  }

  const fetchTeams = async (leagueId: number) => {
    try {
      setLoadingTeams(true)
      setError(null)
      
      const response = await fetch(`/api/teams?league=${leagueId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch teams')
      }
      
      const data = await response.json()
      console.log('📋 Teams API response:', data)
      setTeams(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teams')
      console.error('Error fetching teams:', err)
    } finally {
      setLoadingTeams(false)
    }
  }

  const fetchPlayers = async (teamId: number, leagueId: number) => {
    try {
      setLoadingPlayers(true)
      setError(null)
      
      const response = await fetch(`/api/players?team=${teamId}&league=${leagueId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch players')
      }
      
      const data = await response.json()
      const playersData = Array.isArray(data) ? data : []
      setPlayers(playersData)
      
      // Initialize random token counts for players (simulating marketplace activity)
      const newTokenCounts: Record<number, number> = {}
      playersData.forEach(player => {
        if (!playerTokenCounts[player.id]) {
          // Generate random token availability (20-100 to simulate marketplace activity)
          const availableTokens = Math.floor(Math.random() * 81) + 20 // 20-100
          newTokenCounts[player.id] = availableTokens
        }
      })
      
      if (Object.keys(newTokenCounts).length > 0) {
        setPlayerTokenCounts(prev => ({ ...prev, ...newTokenCounts }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load players')
      console.error('Error fetching players:', err)
    } finally {
      setLoadingPlayers(false)
    }
  }

  const handleLeagueSelect = (league: League) => {
    setSelectedLeague(league)
    setSelectedTeam(null)
    setSelectedPlayer(null)
    setCurrentStep('team')
    fetchTeams(league.id)
  }

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team)
    setSelectedPlayer(null)
    setCurrentStep('player')
    fetchPlayers(team.id, selectedLeague!.id)
    // Update aurora colors based on selected team
    const teamColors = getEnhancedAuroraColors(team.name)
    setAuroraColors(teamColors)
  }

  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayer(player)
  }

  const handlePlayerProfileClick = (player: Player) => {
    setSelectedPlayerForProfile(player)
    setShowProfileCard(true)
    setActiveTab('mint')
    // Update aurora colors based on player's team
    const teamColors = getEnhancedAuroraColors(player.team)
    setAuroraColors(teamColors)
    
    // Initialize token count if not exists
    if (!playerTokenCounts[player.id]) {
      setPlayerTokenCounts(prev => ({ ...prev, [player.id]: 100 }))
    }
  }

  const handleMintToken = (player: Player) => {
    if (isMinted(player.id)) {
      alert('You have already minted a token for this player!')
      return
    }
    
    if (!canMintMore) {
      alert(`You can only mint ${MAX_MINTED_PLAYERS} players per season!`)
      return
    }
    
    if ((playerTokenCounts[player.id] || 100) <= 0) {
      alert('No tokens available for this player!')
      return
    }
    
    // Add player to minted context
    addMintedPlayer(player)
    
    // Decrease token count
    setPlayerTokenCounts(prev => ({
      ...prev,
      [player.id]: (prev[player.id] || 100) - 1
    }))
    
    setShowProfileCard(false)
    alert(`Successfully minted token for ${player.name}!`)
  }

  const getAvailableTokens = (playerId: number): number => {
    return playerTokenCounts[playerId] || 100
  }

  const hasUserMinted = (playerId: number): boolean => {
    return isMinted(playerId)
  }

  const handleBackToLeague = () => {
    setCurrentStep('league')
    setSelectedLeague(null)
    setSelectedTeam(null)
    setSelectedPlayer(null)
  }

  const handleBackToTeam = () => {
    setCurrentStep('team')
    setSelectedTeam(null)
    setSelectedPlayer(null)
  }

  const projectedReward = Math.floor(bondAmount[0] * 0.15)
  const bondPower = Math.floor(bondAmount[0] / 100)

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        <div className={`flex items-center space-x-2 ${currentStep === 'league' ? 'text-lime-400' : selectedLeague ? 'text-zinc-300' : 'text-zinc-600'}`}>
          <Trophy className="h-5 w-5" />
          <span className="pixel-font">League</span>
        </div>
        <ArrowRight className="h-4 w-4 text-zinc-500" />
        <div className={`flex items-center space-x-2 ${currentStep === 'team' ? 'text-lime-400' : selectedTeam ? 'text-zinc-300' : 'text-zinc-600'}`}>
          <Users className="h-5 w-5" />
          <span className="pixel-font">Team</span>
        </div>
        <ArrowRight className="h-4 w-4 text-zinc-500" />
        <div className={`flex items-center space-x-2 ${currentStep === 'player' ? 'text-lime-400' : selectedPlayer ? 'text-zinc-300' : 'text-zinc-600'}`}>
          <User className="h-5 w-5" />
          <span className="pixel-font">Player</span>
        </div>
      </div>
    </div>
  )

  const renderLeagueSelection = () => (
    <Card className="glitch-border bg-zinc-900/50">
      <CardHeader>
        <CardTitle className="pixel-font text-lime-400">Select League</CardTitle>
        <CardDescription>Choose your preferred football league</CardDescription>
      </CardHeader>
      <CardContent>
        {loadingLeagues ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-lime-400" />
            <span className="ml-2 text-zinc-400">Loading leagues...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leagues.map((league) => (
              <Card
                key={league.id}
                className="cursor-pointer hover-pulse transition-all border-zinc-700 hover:border-lime-400"
                onClick={() => handleLeagueSelect(league)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-700 flex items-center justify-center">
                      {league.logo ? (
                        <img 
                          src={league.logo} 
                          alt={`${league.name} logo`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : (
                        <Trophy className="h-6 w-6 text-lime-400" />
                      )}
                      <Trophy className="h-6 w-6 text-lime-400 hidden" />
                    </div>
                    <div>
                      <div className="font-bold text-white">{league.name}</div>
                      <div className="text-sm text-zinc-400">{league.country}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderTeamSelection = () => (
    <Card className="glitch-border bg-zinc-900/50">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToLeague}
            className="text-zinc-400 hover:text-lime-400"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle className="pixel-font text-lime-400">Select Team</CardTitle>
            <CardDescription>Choose your team from {selectedLeague?.name}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loadingTeams ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-lime-400" />
            <span className="ml-2 text-zinc-400">Loading teams...</span>
          </div>
        ) : teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Users className="h-12 w-12 text-zinc-600 mb-4" />
            <p className="text-zinc-400 text-center">
              No teams found for {selectedLeague?.name}
            </p>
            <Button
              variant="ghost"
              onClick={() => fetchTeams(selectedLeague?.id || 39)}
              className="mt-2 text-lime-400 hover:text-lime-300"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <Card
                key={team.id}
                className="cursor-pointer hover-pulse transition-all border-zinc-700 hover:border-fuchsia-500"
                onClick={() => handleTeamSelect(team)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-700 flex items-center justify-center">
                      {team.logo ? (
                        <img 
                          src={team.logo} 
                          alt={`${team.name} logo`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : (
                        <Users className="h-6 w-6 text-fuchsia-500" />
                      )}
                      <Users className="h-6 w-6 text-fuchsia-500 hidden" />
                    </div>
                    <div>
                      <div className="font-bold text-white">{team.name}</div>
                      <div className="text-sm text-zinc-400">{team.venue}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderPlayerSelection = () => (
          <Card className="glitch-border bg-zinc-900/50">
            <CardHeader>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToTeam}
            className="text-zinc-400 hover:text-lime-400"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
              <CardTitle className="pixel-font text-lime-400">Select Player</CardTitle>
            <CardDescription>Choose your player from {selectedTeam?.name}</CardDescription>
          </div>
        </div>
            </CardHeader>
            <CardContent>
        {loadingPlayers ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-lime-400" />
            <span className="ml-2 text-zinc-400">Loading players...</span>
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
                      {player.photo && player.photo !== "/placeholder.svg?height=64&width=64" ? (
                        <img 
                          src={player.photo} 
                          alt={player.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : (
                        <User className="h-6 w-6 text-lime-400" />
                      )}
                      <User className="h-6 w-6 text-lime-400 hidden" />
                        </div>
                        <div>
                          <div className="font-bold text-white">{player.name}</div>
                      <div className="text-sm text-zinc-400">{player.position}</div>
                      <div className="text-xs text-zinc-500">
                        {player.nationality} • {player.age}y
                      </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center">
                          <div className="text-lime-400 font-bold">{player.goals}</div>
                          <div className="text-zinc-400">Goals</div>
                        </div>
                        <div className="text-center">
                          <div className="text-fuchsia-500 font-bold">{player.assists}</div>
                          <div className="text-zinc-400">Assists</div>
                        </div>
                        <div className="text-center">
                      <div className="text-purple-400 font-bold">{player.current_season_stats.rating.toFixed(1)}</div>
                      <div className="text-zinc-400">Rating</div>
                        </div>
                      </div>
                  <div className="mt-2 text-xs text-zinc-500">
                    Value: {formatValue(player.market_value)}
                  </div>
                  
                  {/* Token Availability */}
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Tokens:</span>
                    <span className={`font-bold ${getAvailableTokens(player.id) > 50 ? 'text-lime-400' : getAvailableTokens(player.id) > 10 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {getAvailableTokens(player.id)}/100
                    </span>
                  </div>
                  
                  {hasUserMinted(player.id) && (
                    <div className="mt-2 bg-lime-900/30 border border-lime-400/50 rounded px-2 py-1">
                      <p className="text-lime-400 text-xs text-center">✓ Minted</p>
                    </div>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className={`w-full mt-3 ${
                      hasUserMinted(player.id) 
                        ? 'border-lime-400 text-lime-400 bg-lime-400/10' 
                        : getAvailableTokens(player.id) <= 0 
                          ? 'border-red-400 text-red-400 opacity-50' 
                          : 'border-lime-400 text-lime-400 hover:bg-lime-400 hover:text-zinc-900'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePlayerProfileClick(player)
                    }}
                    disabled={getAvailableTokens(player.id) <= 0 && !hasUserMinted(player.id)}
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
  )

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 mb-4">
            <p className="text-red-400 mb-4">Error: {error}</p>
            <Button onClick={fetchLeagues} className="bg-lime-400 text-zinc-950 hover:bg-lime-500">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
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
        <h1 className="pixel-font text-4xl font-bold text-lime-400 mb-2">Mint Bond</h1>
        <p className="text-zinc-400">Select your league, team, and player to mint your fantasy bond.</p>
      </div>

      {renderStepIndicator()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selection Area */}
        <div className="lg:col-span-2">
          {currentStep === 'league' && renderLeagueSelection()}
          {currentStep === 'team' && renderTeamSelection()}
          {currentStep === 'player' && renderPlayerSelection()}
        </div>

        {/* Bond Configuration */}
        <div className="space-y-6">
          <Card className="glitch-border bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="pixel-font text-lime-400">Bond Amount</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-zinc-300">Amount (USD)</Label>
                <Input
                  type="number"
                  value={bondAmount[0]}
                  onChange={(e) => setBondAmount([Number.parseInt(e.target.value) || 0])}
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
                  <span className="text-fuchsia-500 font-bold">${projectedReward}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selection Summary */}
          <Card className="glitch-border bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="pixel-font text-lime-400">Selection Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-400">League:</span>
                <span className="text-white">{selectedLeague?.name || 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Team:</span>
                <span className="text-white">{selectedTeam?.name || 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Player:</span>
                <span className="text-white">{selectedPlayer?.name || 'Not selected'}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glitch-border bg-zinc-900/50">
            <CardHeader>
              <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <CardTitle className="pixel-font text-lime-400">Bond Terms</CardTitle>
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-4">
                    <div className="space-y-3 text-sm">
                      <div>
                        <div className="text-zinc-300 font-medium">Performance Window</div>
                        <div className="text-zinc-400">Next 30 days</div>
                      </div>
                      <div>
                        <div className="text-zinc-300 font-medium">Maturity Rules</div>
                        <div className="text-zinc-400">Auto-mature on performance targets</div>
                      </div>
                      <div>
                        <div className="text-zinc-300 font-medium">Resale</div>
                        <div className="text-zinc-400">Available anytime on marketplace</div>
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
                disabled={!selectedPlayer}
              >
                <Target className="mr-2 h-4 w-4" />
                {selectedPlayer ? "Mint Bond" : "Select Player First"}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-lime-400">
              <DialogHeader>
                <DialogTitle className="pixel-font text-lime-400">Confirm Bond Mint</DialogTitle>
                <DialogDescription className="text-zinc-400">Review your bond details before minting</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 bg-zinc-800 rounded">
                  <div className="text-sm text-zinc-400">Selection</div>
                  <div className="text-lg font-bold text-white">{selectedPlayer?.name}</div>
                  <div className="text-sm text-zinc-500">
                    {selectedTeam?.name} • {selectedLeague?.name}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-800 rounded">
                    <div className="text-sm text-zinc-400">Amount</div>
                    <div className="text-lg font-bold text-lime-400">${bondAmount[0]}</div>
                  </div>
                  <div className="p-4 bg-zinc-800 rounded">
                    <div className="text-sm text-zinc-400">Bond Power</div>
                    <div className="text-lg font-bold text-fuchsia-500">{bondPower}</div>
                  </div>
                </div>
                <div className="p-4 bg-zinc-800 rounded">
                  <div className="text-sm text-zinc-400">Player Stats (Current Season)</div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="text-center">
                      <div className="text-lime-400 font-bold">{selectedPlayer?.goals}</div>
                      <div className="text-xs text-zinc-400">Goals</div>
                    </div>
                    <div className="text-center">
                      <div className="text-fuchsia-500 font-bold">{selectedPlayer?.assists}</div>
                      <div className="text-xs text-zinc-400">Assists</div>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-400 font-bold">{selectedPlayer?.current_season_stats.rating.toFixed(1)}</div>
                      <div className="text-xs text-zinc-400">Rating</div>
                    </div>
                  </div>
                </div>
                <Button className="w-full pixel-font bg-lime-400 text-zinc-950 hover:bg-lime-500">Confirm Mint</Button>
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
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                  avatarUrl={selectedPlayerForProfile.photo || "/placeholder.svg?height=600&width=600"}
                  name={selectedPlayerForProfile.name}
                  title={`${selectedPlayerForProfile.position} • ${selectedPlayerForProfile.nationality}`}
                  handle={selectedPlayerForProfile.team.toLowerCase().replace(/\s+/g, '')}
                  status={`${selectedPlayerForProfile.goals}G • ${selectedPlayerForProfile.assists}A • ${selectedPlayerForProfile.current_season_stats.rating.toFixed(1)}⭐`}
                  contactText={hasUserMinted(selectedPlayerForProfile.id) ? "Already Minted" : "View Details"}
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
                    onClick={() => setActiveTab('mint')}
                    className={`px-6 py-3 font-semibold transition-all duration-200 ${
                      activeTab === 'mint'
                        ? 'text-lime-400 border-b-2 border-lime-400'
                        : 'text-zinc-400 hover:text-zinc-300'
                    }`}
                  >
                    Mint
                  </button>
                  <button
                    onClick={() => setActiveTab('performance')}
                    className={`px-6 py-3 font-semibold transition-all duration-200 ${
                      activeTab === 'performance'
                        ? 'text-lime-400 border-b-2 border-lime-400'
                        : 'text-zinc-400 hover:text-zinc-300'
                    }`}
                  >
                    Performance Analytics
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'mint' && (
                  <div className="space-y-6">
                    {/* Token Stats */}
                    <div className="bg-zinc-900/60 backdrop-blur-sm rounded-xl p-6 border border-zinc-700">
                      <h3 className="text-xl font-bold text-white mb-4">Token Availability</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-300">Available Tokens:</span>
                          <span className="text-lime-400 font-bold text-lg">
                            {getAvailableTokens(selectedPlayerForProfile.id)}/100
                          </span>
                        </div>
                        <div className="w-full bg-zinc-700 rounded-full h-2">
                          <div 
                            className="bg-lime-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getAvailableTokens(selectedPlayerForProfile.id)}%` }}
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
                      <h3 className="text-xl font-bold text-white mb-4">Season Performance</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-lime-400">{selectedPlayerForProfile.goals}</div>
                          <div className="text-sm text-zinc-400">Goals</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">{selectedPlayerForProfile.assists}</div>
                          <div className="text-sm text-zinc-400">Assists</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400">
                            {selectedPlayerForProfile.current_season_stats.rating.toFixed(1)}
                          </div>
                          <div className="text-sm text-zinc-400">Rating</div>
                        </div>
                      </div>
                    </div>

                    {/* Mint Button */}
                    <div className="bg-zinc-900/60 backdrop-blur-sm rounded-xl p-6 border border-zinc-700">
                      <StarBorder
                        as="button"
                        className="w-full"
                        color="#00ffaa"
                        speed="3s"
                        onClick={() => handleMintToken(selectedPlayerForProfile)}
                        disabled={hasUserMinted(selectedPlayerForProfile.id) || getAvailableTokens(selectedPlayerForProfile.id) <= 0}
                        style={{ 
                          pointerEvents: "auto",
                          opacity: hasUserMinted(selectedPlayerForProfile.id) || getAvailableTokens(selectedPlayerForProfile.id) <= 0 ? 0.5 : 1
                        }}
                      >
                        {hasUserMinted(selectedPlayerForProfile.id) 
                          ? "Already Minted" 
                          : getAvailableTokens(selectedPlayerForProfile.id) <= 0 
                            ? "Sold Out" 
                            : "Mint Token"}
                      </StarBorder>
                      {!hasUserMinted(selectedPlayerForProfile.id) && getAvailableTokens(selectedPlayerForProfile.id) > 0 && (
                        <p className="text-zinc-400 text-sm text-center mt-3">
                          You can only mint one token per player
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'performance' && (
                  <div className="overflow-y-auto max-h-[70vh] pr-2">
                    <PerformancePredictionGraph player={selectedPlayerForProfile} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
