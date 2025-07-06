"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import Image from "next/image"
import { Player as APIPlayer } from "../lib/football-api"
import { publicClient } from "../lib/client"
import {
  CURVE_LEAGUE_CONTRACT_ABI,
  CURVE_LEAGUE_CONTRACT_ADDRESS,
} from "../lib/const"
import { useLedger } from "./Provider"
import "./football-field.css"
import Link from "next/link"

interface UserToken {
  playerId: number
  balance: number
  player: APIPlayer | null
}

interface FieldPlayer {
  name: string
  asset: string
  origin: string
  height: string
  shirt: string
  pos: string
  dob: string
  goals: number
  games: number
  x: number
  y: number
  playerId: number
  balance: number
}

const getSimpleFieldPosition = (index: number): { x: number; y: number } => {
  // Simple 4-3-3 formation positions (11 players max)
  const positions = [
    // Goalkeeper
    { x: 0, y: 380 },
    // Defenders (4)
    { x: -150, y: 280 },
    { x: -50, y: 300 },
    { x: 50, y: 300 },
    { x: 150, y: 280 },
    // Midfielders (3)
    { x: -80, y: 150 },
    { x: 0, y: 120 },
    { x: 80, y: 150 },
    // Forwards (3)
    { x: -80, y: -150 },
    { x: 0, y: -170 },
    { x: 80, y: -150 },
  ]

  return positions[index] || { x: 0, y: 0 }
}

const convertAPIPlayerToFieldPlayer = (apiPlayer: APIPlayer, index: number, playerId: number, balance: number): FieldPlayer => {
  const position = getSimpleFieldPosition(index)
  
  return {
    name: apiPlayer.name,
    asset: apiPlayer.photo || "/placeholder.svg?height=65&width=65",
    origin: apiPlayer.nationality,
    height: "N/A",
    shirt: (index + 1).toString(),
    pos: apiPlayer.position,
    dob: apiPlayer.age.toString(),
    goals: apiPlayer.goals,
    games: apiPlayer.current_season_stats.appearances,
    x: position.x,
    y: position.y,
    playerId,
    balance,
  }
}

interface PlayerComponentProps {
  player: FieldPlayer
  isActive: boolean
  isVisible: boolean
  onClick: () => void
}

interface UserTeamFieldProps {
  title?: string
  subtitle?: string
  showHeader?: boolean
  className?: string
  height?: string
  onPlayerSelect?: (playerData: any) => void
}

function PlayerComponent({ player, isActive, isVisible, onClick }: PlayerComponentProps) {
  return (
    <div
      className={`ff-player ${isActive ? "ff-active" : ""} ${!isVisible ? "ff-hidden" : ""}`}
      style={{
        transform: `translateX(${player.x}px) translateZ(${player.y}px)`,
      }}
      onClick={onClick}
    >
      <div className="ff-player__placeholder"></div>
      <div className="ff-player__img">
        <Image
          src={player.asset || "/placeholder.svg"}
          alt={player.name}
          width={65}
          height={65}
          className={`rounded-full ${isActive ? 'ring-2 ring-lime-400' : ''}`}
        />
      </div>
      <div className="ff-player__label">
        <span>{player.name}</span>
        <span className="text-xs text-zinc-400">x{player.balance}</span>
      </div>
      {isActive && (
        <div className="ff-player__selection-indicator">
          <div className="ff-selection-pulse"></div>
        </div>
      )}
    </div>
  )
}

export default function UserTeamField({
  title = "YOUR TEAM",
  subtitle = "Your minted players on the football field",
  showHeader = true,
  className = "",
  height = "100vh",
  onPlayerSelect,
}: UserTeamFieldProps) {
  const [userTokens, setUserTokens] = useState<UserToken[]>([])
  const [fieldPlayers, setFieldPlayers] = useState<FieldPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activePlayer, setActivePlayer] = useState<string | null>(null)

  const { address } = useLedger()

  useEffect(() => {
    if (address) {
      fetchUserTokens()
    }
  }, [address])

  const fetchUserTokens = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!address) {
        setError("Please connect your wallet")
        setLoading(false)
        return
      }

      // Get user's tokens from contract using getAllUserTokens
      const userTokensData = await publicClient.readContract({
        abi: CURVE_LEAGUE_CONTRACT_ABI,
        address: CURVE_LEAGUE_CONTRACT_ADDRESS,
        functionName: "getAllUserTokens",
        args: [address],
      }) as [bigint[], bigint[]]

      const [tokenIds, amounts] = userTokensData
      
      console.log("📋 User tokens from contract:", {
        tokenIds: tokenIds.map(t => Number(t)),
        amounts: amounts.map(a => Number(a))
      })

      // Fetch player details for each token
      const tokenPromises = tokenIds.map(async (playerIdBigInt, index) => {
        const playerId = Number(playerIdBigInt)
        const balance = Number(amounts[index])

        try {
          // Fetch player details from API
          const response = await fetch(`/api/players?id=${playerId}`)
          let player: APIPlayer | null = null

          if (response.ok) {
            const playerStatsData = await response.json()
            
            if (playerStatsData && playerStatsData.player && playerStatsData.statistics && playerStatsData.statistics.length > 0) {
              const stats = playerStatsData.statistics[0]
              
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
              }
            }
          }

          return {
            playerId,
            balance,
            player
          }
        } catch (err) {
          console.warn(`Error fetching player ${playerId}:`, err)
          return {
            playerId,
            balance,
            player: null
          }
        }
      })

      const tokens = await Promise.all(tokenPromises)
      const validTokens = tokens.filter(token => token.player !== null)
      
      console.log("📋 Valid user tokens:", validTokens)
      setUserTokens(validTokens)

      // Convert to field players
      const fieldPlayersData = validTokens.map((token, index) => {
        return convertAPIPlayerToFieldPlayer(token.player!, index, token.playerId, token.balance)
      })

      setFieldPlayers(fieldPlayersData)

    } catch (err) {
      console.error("Error fetching user tokens:", err)
      setError("Failed to fetch your team data")
    } finally {
      setLoading(false)
    }
  }

  const handlePlayerClick = (playerName: string) => {
    if (activePlayer === playerName) {
      setActivePlayer(null)
      onPlayerSelect?.(null)
    } else {
      setActivePlayer(playerName)
      const selectedPlayer = fieldPlayers.find(p => p.name === playerName)
      onPlayerSelect?.(selectedPlayer)
    }
  }

  const handleClosePlayer = () => {
    setActivePlayer(null)
    onPlayerSelect?.(null)
  }

  const focusedPlayer = fieldPlayers.find((p) => p.name === activePlayer)

  if (loading) {
    return (
      <div className={`ff-container ${className}`} style={{ height }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400 mx-auto mb-4"></div>
            <p className="text-zinc-400">Loading your team...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`ff-container ${className}`} style={{ height }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={fetchUserTokens} variant="outline">
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`ff-container ${className}`} style={{ height }}>
      {showHeader && (
        <div className="ff-header">
          <h1 className="ff-heading">{title}</h1>
          <p className="ff-subheading">{subtitle}</p>
          <div className="ff-match-info">
            <span className="ff-match-date">Your Team Formation</span>
          </div>
          <div className="ff-team-info">
            <div className="text-center">
              <span className="text-lime-400 font-bold text-lg">Your Squad</span>
              <div className="text-sm text-zinc-400 mt-1">
                {fieldPlayers.length}/11 players minted
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="ff-stage" onClick={activePlayer ? handleClosePlayer : undefined}>
        <div
          className={`ff-world ${activePlayer ? "ff-focused" : ""}`}
          style={{
            transform: focusedPlayer
              ? `translateZ(-200px) translateX(${-focusedPlayer.x}px) translateY(${focusedPlayer.y > 0 ? -(focusedPlayer.y / 2) : -focusedPlayer.y}px)`
              : "translateZ(-200px)",
          }}
        >
          <div className="ff-team">
            {fieldPlayers.length === 0 ? (
              <div className="ff-empty-field">
                <div className="ff-empty-message">
                  <h3>No Players Minted</h3>
                  <p>Go to the Mint page to start building your team!</p>

                  <p className="text-sm text-zinc-400 mt-2">You can mint up to 11 players per season</p>
                </div>
              </div>
            ) : (
              fieldPlayers.map((player) => (
                <PlayerComponent
                  key={`${player.name}-${player.playerId}`}
                  player={player}
                  isActive={activePlayer === player.name}
                  isVisible={true}
                  onClick={() => handlePlayerClick(player.name)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {focusedPlayer && (
        <div className="ff-player-details">
          <div className="ff-player-details__content">
            <div className="ff-player-details__header">
              <h3>{focusedPlayer.name}</h3>
              <Button
                onClick={handleClosePlayer}
                variant="ghost"
                size="sm"
                className="ff-player-details__close"
              >
                ×
              </Button>
            </div>
            <div className="ff-player-details__info">
              <p><strong>Position:</strong> {focusedPlayer.pos}</p>
              <p><strong>Nationality:</strong> {focusedPlayer.origin}</p>
              <p><strong>Age:</strong> {focusedPlayer.dob}</p>
              <p><strong>Goals:</strong> {focusedPlayer.goals}</p>
              <p><strong>Games:</strong> {focusedPlayer.games}</p>
              <p><strong>Tokens Owned:</strong> {focusedPlayer.balance}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 