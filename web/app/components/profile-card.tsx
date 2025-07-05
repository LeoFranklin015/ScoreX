"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Button } from "../components/ui/button"
import { MapPin, Calendar, Ruler, Weight, Trophy, Target, TrendingUp, User, Activity, AlertCircle, X } from "lucide-react"
import { Player, PlayerProfile, footballAPI } from "../lib/football-api"

interface ProfileCardProps {
  player: Player | null
  onClose: () => void
  isVisible: boolean
}

export function ProfileCard({ player, onClose, isVisible }: ProfileCardProps) {
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (player && isVisible) {
      fetchPlayerProfile(player.id)
    }
  }, [player, isVisible])

  const fetchPlayerProfile = async (playerId: number) => {
    try {
      setLoading(true)
      const profile = await footballAPI.getPlayerProfile(playerId)
      setPlayerProfile(profile)
    } catch (error) {
      console.error('Error fetching player profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!player || !isVisible) return null

  const currentStats = playerProfile?.statistics?.[0] || null
  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="profile-card-container animate-in fade-in-0 duration-300">
        <Card className="w-full max-w-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border-0 shadow-2xl overflow-hidden relative">
          {/* Spotlight Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-lime-400/10 via-transparent to-purple-400/10 pointer-events-none" />
          
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-zinc-400 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm"
          >
            <X className="h-4 w-4" />
          </Button>

          <CardContent className="p-0">
            {/* Header Section */}
            <div className="relative p-8 pb-4">
              <div className="flex items-start space-x-6">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-lime-400/30 shadow-lg">
                    <AvatarImage src={player.photo} alt={player.name} className="object-cover" />
                    <AvatarFallback className="bg-zinc-700 text-lime-400 text-2xl">
                      <User className="w-12 h-12" />
                    </AvatarFallback>
                  </Avatar>
                  {/* Glow Effect */}
                  <div className="absolute inset-0 w-24 h-24 rounded-full bg-lime-400/20 blur-xl -z-10" />
                </div>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-1 bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                      {player.name}
                    </h2>
                    <p className="text-zinc-400 text-lg">{player.team}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-lime-400 text-zinc-900 hover:bg-lime-300 font-medium">
                      {player.position}
                    </Badge>
                    <Badge variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400/10">
                      {player.nationality}
                    </Badge>
                    <Badge variant="outline" className="border-zinc-400 text-zinc-400 hover:bg-zinc-400/10">
                      {player.age} years
                    </Badge>
                    {currentStats?.games?.captain && (
                      <Badge variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10">
                        Captain
                      </Badge>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-lime-400">{formatValue(player.market_value)}</div>
                    <div className="text-sm text-zinc-400">Market Value</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="px-8 pb-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:border-lime-400/50 transition-colors">
                  <Target className="h-6 w-6 text-lime-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{player.goals}</div>
                  <div className="text-xs text-zinc-400">Goals</div>
                </div>
                
                <div className="text-center p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:border-purple-400/50 transition-colors">
                  <TrendingUp className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{player.assists}</div>
                  <div className="text-xs text-zinc-400">Assists</div>
                </div>
                
                <div className="text-center p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:border-orange-400/50 transition-colors">
                  <Activity className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{player.current_season_stats.rating.toFixed(1)}</div>
                  <div className="text-xs text-zinc-400">Rating</div>
                </div>
                
                <div className="text-center p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:border-blue-400/50 transition-colors">
                  <Trophy className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{player.current_season_stats.appearances}</div>
                  <div className="text-xs text-zinc-400">Apps</div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="px-8 pb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white mb-3">Personal Info</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-lime-400" />
                      <span className="text-zinc-400">Team:</span>
                      <span className="text-white">{player.team}</span>
                    </div>
                    {playerProfile?.player?.birth?.place && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4 text-purple-400" />
                        <span className="text-zinc-400">Birth:</span>
                        <span className="text-white">{playerProfile.player.birth.place}</span>
                      </div>
                    )}
                    {playerProfile?.player?.height && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Ruler className="h-4 w-4 text-blue-400" />
                        <span className="text-zinc-400">Height:</span>
                        <span className="text-white">{playerProfile.player.height}</span>
                      </div>
                    )}
                    {playerProfile?.player?.weight && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Weight className="h-4 w-4 text-orange-400" />
                        <span className="text-zinc-400">Weight:</span>
                        <span className="text-white">{playerProfile.player.weight}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white mb-3">Performance</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Minutes:</span>
                      <span className="text-white">{currentStats?.games?.minutes || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Shots:</span>
                      <span className="text-white">{currentStats?.shots?.total || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Pass Acc:</span>
                      <span className="text-white">{currentStats?.passes?.accuracy || 0}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Tackles:</span>
                      <span className="text-white">{currentStats?.tackles?.total || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-400 mx-auto mb-2"></div>
                  <span className="text-zinc-400 text-sm">Loading profile...</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 