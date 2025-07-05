import { NextResponse } from 'next/server'
import { footballAPI } from '../../lib/football-api'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const team = searchParams.get('team')
    const league = searchParams.get('league')
    const id = searchParams.get('id')

    // Get specific player stats
    if (id) {
      const playerStats = await footballAPI.getPlayerStats(parseInt(id))
      return NextResponse.json(playerStats)
    }

    // Get players by team
    if (team && league) {
      const players = await footballAPI.getPlayersByTeam(parseInt(team), parseInt(league))
      return NextResponse.json(players)
    }

    // Get top players (default)
    const players = await footballAPI.getTopPlayers()
    return NextResponse.json(players)
  } catch (error) {
    console.error('Error in players API route:', error)
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    )
  }
} 