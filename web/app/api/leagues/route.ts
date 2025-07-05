import { NextResponse } from 'next/server'
import { footballAPI } from '@/lib/football-api'

export async function GET() {
  try {
    const leagues = await footballAPI.getLeagues()
    return NextResponse.json(leagues)
  } catch (error) {
    console.error('Error in leagues API route:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leagues' },
      { status: 500 }
    )
  }
} 