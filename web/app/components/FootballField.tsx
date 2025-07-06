"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "../components/ui/button"
import Image from "next/image"
import { useMintedPlayers } from "../lib/minted-players-context"
import { Player as APIPlayer } from "../lib/football-api"
import { Users } from "lucide-react"
import "./football-field.css"
import Link from "next/link"



// Player data
const playersData = {
  home: [
    {
      name: "Pizarro",
      asset: "/placeholder.svg?height=65&width=65",
      origin: "Peru",
      height: "1.84m",
      shirt: "14",
      pos: "Forward",
      dob: "36",
      goals: 1,
      games: 16,
      x: 110,
      y: -190,
    },
    {
      name: "Robben",
      asset: "/placeholder.svg?height=65&width=65",
      origin: "Holland",
      height: "1.80m",
      shirt: "10",
      pos: "Forward",
      dob: "32",
      goals: 19,
      games: 30,
      x: -110,
      y: -190,
    },
    {
      name: "Ribery",
      asset: "/placeholder.svg?height=65&width=65",
      origin: "France",
      height: "1.70m",
      shirt: "7",
      pos: "Midfield",
      dob: "32",
      goals: 9,
      games: 22,
      x: 150,
      y: 50,
    },
    {
      name: "Schweinsteiger",
      asset: "/placeholder.svg?height=65&width=65",
      origin: "Germany",
      height: "1.87m",
      shirt: "24",
      pos: "Forward",
      dob: "31",
      goals: 21,
      games: 3,
      x: 0,
      y: 100,
    },
    {
      name: "Martinez",
      asset: "/placeholder.svg?height=65&width=65",
      origin: "Spain",
      height: "1.90m",
      shirt: "8",
      pos: "Midfield",
      dob: "28",
      goals: 0,
      games: 2,
      x: -150,
      y: 50,
    },
    {
      name: "Alaba",
      asset: "/placeholder.svg?height=65&width=65",
      origin: "Austria",
      height: "1.80m",
      shirt: "27",
      pos: "Defence",
      dob: "24",
      goals: 5,
      games: 27,
      x: -200,
      y: 180,
    },
    {
      name: "Lahm",
      asset: "/placeholder.svg?height=65&width=65",
      origin: "Germany",
      height: "1.70",
      shirt: "21",
      pos: "Defence",
      dob: "32",
      goals: 2,
      games: 25,
      x: 200,
      y: 180,
    },
    {
      name: "Benatia",
      asset: "/placeholder.svg?height=65&width=65",
      origin: "France",
      height: "1.87m",
      shirt: "5",
      pos: "Defence",
      dob: "31",
      goals: 21,
      games: 1,
      x: 100,
      y: 300,
    },
    {
      name: "Dante",
      asset: "/placeholder.svg?height=65&width=65",
      origin: "Brazil",
      height: "1.87m",
      shirt: "4",
      pos: "Defence",
      dob: "32",
      goals: 0,
      games: 34,
      x: -100,
      y: 300,
    },
    {
      name: "Neuer",
      asset: "/placeholder.svg?height=65&width=65",
      origin: "Germany",
      height: "1.93m",
      shirt: "1",
      pos: "Goalie",
      dob: "29",
      goals: 0,
      games: 48,
      x: 0,
      y: 410,
    },
  ],
  away: [
    {
      name: "Benzema",
      asset: "/placeholder.svg?height=65&width=65",
      origin: "France",
      height: "1.87m",
      shirt: "9",
      pos: "Forward",
      dob: "36",
      goals: 1,
      games: 16,
      x: 110,
      y: -190,
    },
    {
      name: "Bale",
      asset: "/placeholder.svg?height=65&width=65",
      origin: "Wales",
      height: "1.83m",
      shirt: "11",
      pos: "Midfield",
      dob: "26",
      goals: 19,
      games: 30,
      x: -110,
      y: -190,
    },
    {
      name: "Carvajal",
      asset: "/placeholder.svg?height=65&width=65",
      origin: "Spain",
      height: "1.70m",
      shirt: "15",
      pos: "Defender",
      dob: "32",
      goals: 9,
      games: 22,
      x: 150,
      y: 50,
    },
    {
      name: "Silva",
      asset: "/placeholder.svg?height=65&width=65",
      origin: "Brazil",
      height: "1.87m",
      shirt: "16",
      pos: "Forward",
      dob: "22",
      goals: 21,
      games: 3,
      x: 0,
      y: 100,
    },
    {
      name: "Kroos",
      asset: "/placeholder.svg?height=65&width=65",
      origin: "Germany",
      height: "1.82",
      shirt: "8",
      pos: "Midfield",
      dob: "25",
      goals: 0,
      games: 2,
      x: -150,
      y: 50,
    },
    {
      name: "Modric",
      asset: "/placeholder.svg?height=65&width=65",
      origin: "Croatia",
      height: "1.74m",
      shirt: "19",
      pos: "Midfield",
      dob: "30",
      goals: 5,
      games: 27,
      x: -200,
      y: 180,
    },
    {
      name: "Nacho",
      asset: "/placeholder.svg?height=65&width=65",
      origin: "Germany",
      height: "1.79",
      shirt: "18",
      pos: "Defence",
      dob: "25",
      goals: 2,
      games: 25,
      x: 200,
      y: 180,
    },
    {
      name: "Ramos",
      asset: "/placeholder.svg?height=65&width=65",
      origin: "Spain",
      height: "1.83m",
      shirt: "4",
      pos: "Defence",
      dob: "31",
      goals: 21,
      games: 1,
      x: 100,
      y: 300,
    },
    {
      name: "Pepe",
      asset: "/placeholder.svg?height=65&width=65",
      origin: "Brazil",
      height: "1.88m",
      shirt: "3",
      pos: "Defence",
      dob: "32",
      goals: 0,
      games: 34,
      x: -100,
      y: 300,
    },
    {
      name: "Casillas",
      asset: "/placeholder.svg?height=65&width=65",
      origin: "Spain",
      height: "1.85m",
      shirt: "1",
      pos: "Goalie",
      dob: "34",
      goals: 0,
      games: 48,
      x: 0,
      y: 410,
    },
  ],
}

interface Player {
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
}

// Simple positioning - just place players in a basic formation
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

// Convert API player to field player
const convertAPIPlayerToFieldPlayer = (apiPlayer: APIPlayer, index: number): Player => {
  const position = getSimpleFieldPosition(index)
  
  return {
    name: apiPlayer.name,
    asset: apiPlayer.photo || "/placeholder.svg?height=65&width=65",
    origin: apiPlayer.nationality,
    height: "N/A", // Height not available in API Player interface
    shirt: (index + 1).toString(),
    pos: apiPlayer.position,
    dob: apiPlayer.age.toString(),
    goals: apiPlayer.goals,
    games: apiPlayer.current_season_stats.appearances,
    x: position.x,
    y: position.y,
  }
}

interface PlayerComponentProps {
  player: Player
  isActive: boolean
  isVisible: boolean
  onClick: () => void
}

interface FootballFieldProps {
  title?: string
  subtitle?: string
  homeTeamData?: Player[]
  awayTeamData?: Player[]
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
      </div>
      {isActive && (
        <div className="ff-player__selection-indicator">
          <div className="ff-selection-pulse"></div>
        </div>
      )}
    </div>
  )
}

export default function FootballField({
  title = "FOOTBALL LEAGUE",
  subtitle = "Interactive 3D football field with team lineups",
  homeTeamData = playersData.home,
  awayTeamData = playersData.away,
  showHeader = false,
  className = "",
  height = "100vh",
  onPlayerSelect,
}: FootballFieldProps) {
  const [isHome, setIsHome] = useState(true)
  const [activePlayer, setActivePlayer] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const worldRef = useRef<HTMLDivElement>(null)
  const terrainRef = useRef<HTMLDivElement>(null)
  
  // Get minted players from context
  const { mintedPlayers, mintedCount } = useMintedPlayers()

  // Convert minted players to field players
  const mintedFieldPlayers = mintedPlayers.map((player, index) => {
    return convertAPIPlayerToFieldPlayer(player, index)
  })

  // Use minted players if available, otherwise show empty field
  const currentPlayers = mintedFieldPlayers.length > 0 ? mintedFieldPlayers : []

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // Remove team switching since we only show minted players

  const handlePlayerClick = (playerName: string) => {
    if (activePlayer === playerName) {
      // Clicking the same player deselects
      setActivePlayer(null)
      onPlayerSelect?.(null)
    } else {
      // Select new player
      setActivePlayer(playerName)
      const selectedPlayer = currentPlayers.find(p => p.name === playerName)
      onPlayerSelect?.(selectedPlayer)
      
      // Scroll to top of page when player is selected
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }

  const handleClosePlayer = () => {
    setActivePlayer(null)
    onPlayerSelect?.(null)
  }

  const focusedPlayer = currentPlayers.find((p) => p.name === activePlayer)

  return (
    <div className={`ff-container ${className}`} style={{ height }}>
      {showHeader && (
        <div className="ff-header">
          <h1 className="ff-heading">{title}</h1>
          <p className="ff-subheading">{subtitle}</p>
          <div className="ff-match-info">
            <span className="ff-match-date">Next Match: Tuesday, 19:45</span>
          </div>
          <div className="ff-team-info">
            <div className="text-center">
              <span className="text-lime-400 font-bold text-lg">Your Team</span>
              <div className="text-sm text-zinc-400 mt-1">
                {mintedCount}/11 players minted
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="ff-stage" onClick={activePlayer ? handleClosePlayer : undefined}>
                  <div
            ref={worldRef}
            className={`ff-world ${activePlayer ? "ff-focused" : ""}`}
            style={{
              transform: focusedPlayer
                ? `translateZ(-200px) translateX(${-focusedPlayer.x}px) translateY(${focusedPlayer.y > 0 ? -(focusedPlayer.y / 2) : -focusedPlayer.y}px)`
                : "translateZ(-200px)",
            }}
          >
                      <div className="ff-team">
              {currentPlayers.length === 0 ? (
                <div className="ff-empty-field">
                  <div className="ff-empty-message">
                  <Link href="/mint">
                      <Button className="bg-lime-600 hover:bg-lime-700 text-white mt-1">
                        <Users className="w-4 h-4 mr-2" />
                        Mint Players
                      </Button>
                    </Link>
                    <h3>No Players Minted</h3>
                    <p>Go to the Mint page to start building your team!</p>
                    <p className="text-sm text-zinc-400 mt-2">You can mint up to 11 players per season</p>

                  </div>
                </div>
              ) : (
                currentPlayers.map((player) => (
                  <PlayerComponent
                    key={`${player.name}-minted`}
                    player={player}
                    isActive={activePlayer === player.name}
                    isVisible={!activePlayer || activePlayer === player.name}
                    onClick={() => handlePlayerClick(player.name)}
                  />
                ))
              )}
            </div>

          <div
            ref={terrainRef}
            className="ff-terrain"
            style={{
              opacity: activePlayer ? 0.66 : 1,
            }}
          >
            <div className="ff-field ff-field--alt"></div>
            <div className="ff-field ff-ground">
              <div className="ff-field__texture ff-field__texture--gradient"></div>
              <div className="ff-field__texture ff-field__texture--gradient-b"></div>
              <div className="ff-field__texture ff-field__texture--grass"></div>
              <div className="ff-field__line ff-field__line--goal"></div>
              <div className="ff-field__line ff-field__line--goal ff-field__line--goal--far"></div>
              <div className="ff-field__line ff-field__line--outline"></div>
              <div className="ff-field__line ff-field__line--penalty"></div>
              <div className="ff-field__line ff-field__line--penalty-arc"></div>
              <div className="ff-field__line ff-field__line--penalty-arc ff-field__line--penalty-arc--far"></div>
              <div className="ff-field__line ff-field__line--mid"></div>
              <div className="ff-field__line ff-field__line--circle"></div>
              <div className="ff-field__line ff-field__line--penalty ff-field__line--penalty--far"></div>
              {/* Corner arcs */}
              <div className="ff-field__line ff-field__line--corner ff-field__line--corner--tl"></div>
              <div className="ff-field__line ff-field__line--corner ff-field__line--corner--tr"></div>
              <div className="ff-field__line ff-field__line--corner ff-field__line--corner--bl"></div>
              <div className="ff-field__line ff-field__line--corner ff-field__line--corner--br"></div>
            </div>
            <div className="ff-field__side ff-field__side--front"></div>
            <div className="ff-field__side ff-field__side--left"></div>
            <div className="ff-field__side ff-field__side--right"></div>
            <div className="ff-field__side ff-field__side--back"></div>
          </div>
        </div>

        {isLoading && <div className="ff-loading">LOADING...</div>}
      </div>
    </div>
  )
}

// Export types for external use
export type { Player, FootballFieldProps } 