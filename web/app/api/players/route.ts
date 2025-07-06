import { NextResponse } from 'next/server'
import { footballAPI } from '../../lib/football-api'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const id = searchParams.get('id')
    console.log(id)
    // Get specific player stats
    if (id) {
      const playerStats = await fetch(`https://v3.football.api-sports.io/players?id=${id}&season=2019`, {
        headers: {
          'x-apisports-key': "cbb21f9359defd28350ffdeeb943e5d7",
          "x-rapidapi-host": "v3.football.api-sports.io",
        }
      })
      const data = await playerStats.json()
      console.log(data.response[0])
      console.log(JSON.stringify(data.response[0], null, 2))
      return NextResponse.json(data.response[0])
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