import { NextResponse } from 'next/server'
import { footballAPI } from '@/lib/football-api'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const league = searchParams.get('league')

    if (!league) {
      return NextResponse.json(
        { error: 'League parameter is required' },
        { status: 400 }
      )
    }

    console.log(`🔍 Fetching teams for league: ${league}`)
    const teams = await footballAPI.getTeamsByLeague(parseInt(league))
    console.log(`✅ Successfully fetched ${teams.length} teams for league ${league}`)
    
    // Ensure we always return an array
    if (!Array.isArray(teams)) {
      console.error('❌ Teams data is not an array:', teams)
      return NextResponse.json([])
    }
    
    return NextResponse.json(teams)
  } catch (error) {
    console.error('❌ Error in teams API route:', error)
    // Return empty array instead of error to prevent frontend crashes
    return NextResponse.json([])
  }
} 