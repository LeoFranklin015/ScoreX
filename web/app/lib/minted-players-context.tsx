"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Player } from '@/lib/football-api'

interface MintedPlayersContextType {
  mintedPlayers: Player[]
  addMintedPlayer: (player: Player) => void
  removeMintedPlayer: (playerId: number) => void
  isMinted: (playerId: number) => boolean
  canMintMore: boolean
  mintedCount: number
  MAX_MINTED_PLAYERS: number
}

const MintedPlayersContext = createContext<MintedPlayersContextType | undefined>(undefined)

export function MintedPlayersProvider({ children }: { children: ReactNode }) {
  const [mintedPlayers, setMintedPlayers] = useState<Player[]>([])
  const MAX_MINTED_PLAYERS = 11

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('mintedPlayers')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setMintedPlayers(parsed)
      } catch (error) {
        console.error('Error loading minted players:', error)
      }
    }
  }, [])

  // Save to localStorage whenever mintedPlayers changes
  useEffect(() => {
    localStorage.setItem('mintedPlayers', JSON.stringify(mintedPlayers))
  }, [mintedPlayers])

  const addMintedPlayer = (player: Player) => {
    setMintedPlayers(prev => {
      // Check if player is already minted
      if (prev.find(p => p.id === player.id)) {
        return prev
      }
      
      // Check if we've reached the limit
      if (prev.length >= MAX_MINTED_PLAYERS) {
        alert(`You can only mint ${MAX_MINTED_PLAYERS} players per season!`)
        return prev
      }
      
      return [...prev, player]
    })
  }

  const removeMintedPlayer = (playerId: number) => {
    setMintedPlayers(prev => prev.filter(p => p.id !== playerId))
  }

  const isMinted = (playerId: number) => {
    return mintedPlayers.some(p => p.id === playerId)
  }

  const canMintMore = mintedPlayers.length < MAX_MINTED_PLAYERS
  const mintedCount = mintedPlayers.length

  return (
    <MintedPlayersContext.Provider value={{
      mintedPlayers,
      addMintedPlayer,
      removeMintedPlayer,
      isMinted,
      canMintMore,
      mintedCount,
      MAX_MINTED_PLAYERS
    }}>
      {children}
    </MintedPlayersContext.Provider>
  )
}

export function useMintedPlayers() {
  const context = useContext(MintedPlayersContext)
  if (context === undefined) {
    throw new Error('useMintedPlayers must be used within a MintedPlayersProvider')
  }
  return context
} 