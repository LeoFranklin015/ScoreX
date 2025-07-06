import { NextResponse } from 'next/server'
import { footballAPI } from '../../lib/football-api'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const id = searchParams.get('id')
    console.log(id)
    // Get specific player stats
    if (id) {
      // Try current season first (2024), fallback to 2023
      let playerData = null;
      const seasons = [2024, 2023, 2022, 2021];
      
      for (const season of seasons) {
        try {
          console.log(`Trying to fetch player ${id} for season ${season}`);
          const playerStats = await fetch(`https://v3.football.api-sports.io/players?id=${id}&season=${season}`, {
            headers: {
              'x-apisports-key': "cbb21f9359defd28350ffdeeb943e5d7",
              "x-rapidapi-host": "v3.football.api-sports.io",
            }
          });
          
          if (playerStats.ok) {
            const data = await playerStats.json();
            if (data.response && data.response.length > 0) {
              playerData = data.response[0];
              console.log(`Found player data for season ${season}`);
              break;
            }
          }
        } catch (error) {
          console.error(`Error fetching season ${season}:`, error);
        }
      }
      
      if (playerData) {
        console.log('Player data:', playerData);
        console.log(JSON.stringify(playerData, null, 2));
        return NextResponse.json(playerData);
      } else {
        return NextResponse.json({ error: 'Player not found' }, { status: 404 });
      }
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