export interface Player {
  id: number
  name: string
  team: string
  position: string
  goals: number
  assists: number
  value: number
  popularity: number
  avatar: string
  photo: string
  nationality: string
  age: number
  market_value: number
  current_season_stats: {
    goals: number
    assists: number
    appearances: number
    rating: number
  }
}

export interface Team {
  id: number
  name: string
  logo: string
  founded: number
  venue: string
  code: string
  country: string
}

export interface League {
  id: number
  name: string
  country: string
  logo: string
  flag: string
  season: number
}

export interface PlayerStats {
  player: {
    id: number
    name: string
    firstname: string
    lastname: string
    age: number
    birth: {
      date: string
      place: string
      country: string
    }
    nationality: string
    height: string
    weight: string
    injured: boolean
    photo: string
  }
  statistics: Array<{
    team: {
      id: number
      name: string
      logo: string
    }
    league: {
      id: number
      name: string
      country: string
      logo: string
      flag: string
      season: number
    }
    games: {
      appearences: number
      lineups: number
      minutes: number
      number: number
      position: string
      rating: string
      captain: boolean
    }
    goals: {
      total: number
      conceded: number
      assists: number
      saves: number
    }
  }>
}

export interface PlayerProfile {
  player: {
    id: number
    name: string
    firstname: string
    lastname: string
    age: number
    birth: {
      date: string
      place: string
      country: string
    }
    nationality: string
    height: string
    weight: string
    injured: boolean
    photo: string
  }
  statistics: Array<{
    team: {
      id: number
      name: string
      logo: string
    }
    league: {
      id: number
      name: string
      country: string
      logo: string
      flag: string
      season: number
    }
    games: {
      appearences: number
      lineups: number
      minutes: number
      number: number
      position: string
      rating: string
      captain: boolean
    }
    substitutes: {
      in: number
      out: number
      bench: number
    }
    shots: {
      total: number
      on: number
    }
    goals: {
      total: number
      conceded: number
      assists: number
      saves: number
    }
    passes: {
      total: number
      key: number
      accuracy: number
    }
    tackles: {
      total: number
      blocks: number
      interceptions: number
    }
    duels: {
      total: number
      won: number
    }
    dribbles: {
      attempts: number
      success: number
      past: number
    }
    fouls: {
      drawn: number
      committed: number
    }
    cards: {
      yellow: number
      yellowred: number
      red: number
    }
    penalty: {
      won: number
      commited: number
      scored: number
      missed: number
      saved: number
    }
  }>
}

class FootballAPI {
  private apiKey: string
  private apiHost: string
  private apiUrl: string
  private currentSeason: string

  constructor() {
    this.apiKey = process.env.FOOTBALL_API_KEY || ''
    this.apiHost = process.env.FOOTBALL_API_HOST || 'api-football-v1.p.rapidapi.com'
    this.apiUrl = process.env.FOOTBALL_API_URL || 'https://api-football-v1.p.rapidapi.com/v3'
    this.currentSeason = '2024'
  }

  private async makeRequest(endpoint: string, params?: Record<string, string>): Promise<any> {
    if (!this.apiKey) {
      console.log('🔄 Using fallback data (no API key configured)')
      throw new Error('No API key configured')
    }

    const url = new URL(`${this.apiUrl}${endpoint}`)
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': this.apiKey,
        'X-RapidAPI-Host': this.apiHost
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getLeagues(): Promise<League[]> {
    try {
      const response = await this.makeRequest('/leagues')
      
      // Map API response to League interface
      const leagues: League[] = response.response.map((item: any) => ({
        id: item.league.id,
        name: item.league.name,
        country: item.country.name,
        logo: item.league.logo, // Use actual logo URL from API
        flag: item.country.flag, // Use actual flag URL from API
        season: item.seasons[0]?.year || 2024
      }))
      
      return leagues
    } catch (error) {
      // Silently fall back to mock data with real images
      const fallbackLeagues = this.getFallbackLeagues()
      
      // Log league logos being served
      console.log(`🌍 Available Leagues:`)
      fallbackLeagues.forEach(league => {
        console.log(`⚽ ${league.name} (${league.country}): ${league.logo}`)
      })
      
      return fallbackLeagues
    }
  }

  async getTeamsByLeague(leagueId: number): Promise<Team[]> {
    try {
      const response = await this.makeRequest(`/teams?league=${leagueId}&season=2024`)
      
      // Map API response to Team interface
      const teams: Team[] = response.response.map((item: any) => ({
        id: item.team.id,
        name: item.team.name,
        logo: item.team.logo, // Use actual logo URL from API
        founded: item.team.founded,
        venue: item.venue.name,
        code: item.team.code,
        country: item.team.country
      }))
      
      return teams
    } catch (error) {
      // Silently fall back to mock data with real images
      const fallbackTeams = this.getFallbackTeams(leagueId)
      
      // Log team logos being served
      console.log(`📋 Teams for league ${leagueId}:`)
      fallbackTeams.forEach(team => {
        console.log(`🏆 ${team.name}: ${team.logo}`)
      })
      
      // Ensure we always return an array, even if empty
      return fallbackTeams || []
    }
  }

  async getPlayersByTeam(teamId: number, leagueId: number): Promise<Player[]> {
    try {
      const response = await this.makeRequest(`/players?team=${teamId}&league=${leagueId}&season=2024`)
      
      // Map API response to Player interface
      const players: Player[] = response.response
        .filter((item: any) => item.statistics[0]?.games?.position !== 'Goalkeeper')
        .map((item: any) => {
          const stats = item.statistics[0] || {}
          return {
            id: item.player.id,
            name: item.player.name,
            team: stats.team?.name || 'Unknown',
            position: stats.games?.position || 'Unknown',
            goals: stats.goals?.total || 0,
            assists: stats.goals?.assists || 0,
            value: this.calculatePlayerValue(stats),
            popularity: this.calculatePopularity(stats),
            avatar: item.player.photo, // Use actual photo URL from API
            photo: item.player.photo, // Use actual photo URL from API
            nationality: item.player.nationality,
            age: item.player.age,
            market_value: this.calculatePlayerValue(stats),
            current_season_stats: {
              goals: stats.goals?.total || 0,
              assists: stats.goals?.assists || 0,
              appearances: stats.games?.appearences || 0,
              rating: parseFloat(stats.games?.rating) || 0
            }
          }
        })
      
      return players
    } catch (error) {
      // Silently fall back to mock data with real images
      return this.getFallbackPlayersByTeam(teamId)
    }
  }

  async getTopPlayers(): Promise<Player[]> {
    try {
      const response = await this.makeRequest('/players/topscorers?league=39&season=2024')
      
      // Map API response to Player interface
      const players: Player[] = response.response.map((item: any) => {
        const stats = item.statistics[0] || {}
        return {
          id: item.player.id,
          name: item.player.name,
          team: stats.team?.name || 'Unknown',
          position: stats.games?.position || 'Unknown',
          goals: stats.goals?.total || 0,
          assists: stats.goals?.assists || 0,
          value: this.calculatePlayerValue(stats),
          popularity: this.calculatePopularity(stats),
          avatar: item.player.photo, // Use actual photo URL from API
          photo: item.player.photo, // Use actual photo URL from API
          nationality: item.player.nationality,
          age: item.player.age,
          market_value: this.calculatePlayerValue(stats),
          current_season_stats: {
            goals: stats.goals?.total || 0,
            assists: stats.goals?.assists || 0,
            appearances: stats.games?.appearences || 0,
            rating: parseFloat(stats.games?.rating) || 0
          }
        }
      })
      
      return players
    } catch (error) {
      // Silently fall back to mock data with real images
      return this.getFallbackPlayers()
    }
  }

  async getPlayerStats(playerId: number): Promise<PlayerStats[]> {
    try {
      const response = await this.makeRequest(`/players?id=${playerId}&season=2019`)
      
      // Map API response to PlayerStats interface
      const playerStats: PlayerStats[] = response.response.map((item: any) => {
        const stats = item.statistics[0] || {}
        return {
          player: {
            id: item.player.id,
            name: item.player.name,
            firstname: item.player.firstname,
            lastname: item.player.lastname,
            age: item.player.age,
            birth: {
              date: item.player.birth?.date,
              place: item.player.birth?.place,
              country: item.player.birth?.country
            },
            nationality: item.player.nationality,
            height: item.player.height,
            weight: item.player.weight,
            injured: item.player.injured,
            photo: item.player.photo // Use actual photo URL from API
          },
          statistics: [{
            team: {
              id: stats.team?.id,
              name: stats.team?.name,
              logo: stats.team?.logo // Use actual logo URL from API
            },
            league: {
              id: stats.league?.id,
              name: stats.league?.name,
              country: stats.league?.country,
              logo: stats.league?.logo, // Use actual logo URL from API
              flag: stats.league?.flag, // Use actual flag URL from API
              season: stats.league?.season
            },
            games: stats.games || {},
            substitutes: stats.substitutes || {},
            shots: stats.shots || {},
            goals: stats.goals || {},
            passes: stats.passes || {},
            tackles: stats.tackles || {},
            duels: stats.duels || {},
            dribbles: stats.dribbles || {},
            fouls: stats.fouls || {},
            cards: stats.cards || {},
            penalty: stats.penalty || {}
          }]
        }
      })
      
      return playerStats
    } catch (error) {
      console.error('Error fetching player stats:', error)
      return []
    }
  }

  async getTeams(): Promise<Team[]> {
    try {
      const response = await this.makeRequest('/teams', {
        league: '39', // Premier League
        season: this.currentSeason
      })

      return response.response?.map((item: any) => ({
        id: item.team.id,
        name: item.team.name,
        logo: item.team.logo,
        founded: item.team.founded,
        venue: item.venue?.name || 'Unknown',
        code: item.team.code || '',
        country: item.team.country || ''
      })) || []
    } catch (error) {
      console.error('Error fetching teams:', error)
      return []
    }
  }

  async getPlayerProfile(playerId: number): Promise<PlayerProfile | null> {
    try {
      const response = await this.makeRequest(`/players/profiles?player=${playerId}`)
      
      if (!response.response || response.response.length === 0) {
        return null
      }
      
      return response.response[0] as PlayerProfile
    } catch (error) {
      console.error('Error fetching player profile:', error)
      return null
    }
  }

  async searchPlayerProfiles(searchTerm: string): Promise<PlayerProfile[]> {
    try {
      const response = await this.makeRequest(`/players/profiles?search=${encodeURIComponent(searchTerm)}`)
      
      return response.response || []
    } catch (error) {
      console.error('Error searching player profiles:', error)
      return []
    }
  }

  private mapPlayerData(item: any): Player {
    const stats = item.statistics?.[0] || {}
    const goals = stats.goals?.total || 0
    const assists = stats.goals?.assists || 0
    const rating = parseFloat(stats.games?.rating || '0')
    const appearances = stats.games?.appearences || 0
    
    // Calculate estimated market value based on performance
    const baseValue = 30000000 // Base value for active players
    const performanceMultiplier = Math.max(1, (goals * 3 + assists * 2 + rating * 2) / 10)
    const estimatedValue = Math.floor(baseValue * performanceMultiplier)

    return {
      id: item.player.id,
      name: item.player.name,
      team: stats.team?.name || 'Unknown',
      position: this.normalizePosition(stats.games?.position || 'Unknown'),
      goals,
      assists,
      value: estimatedValue,
      popularity: Math.floor(Math.min(100, (goals * 4 + assists * 3 + rating * 8))),
      avatar: item.player.photo || '/placeholder.svg?height=64&width=64',
      photo: item.player.photo || '/placeholder.svg?height=64&width=64',
      nationality: item.player.nationality || 'Unknown',
      age: item.player.age || 0,
      market_value: estimatedValue,
      current_season_stats: {
        goals,
        assists,
        appearances,
        rating: rating || 0
      }
    }
  }

  private normalizePosition(position: string): string {
    if (!position || position === 'Unknown') return 'Unknown'
    
    const pos = position.toLowerCase()
    if (pos.includes('attack') || pos.includes('forward')) return 'Forward'
    if (pos.includes('midfield')) return 'Midfielder'
    if (pos.includes('defence') || pos.includes('defender')) return 'Defender'
    if (pos.includes('goalkeeper') || pos.includes('keeper')) return 'Goalkeeper'
    return position
  }

  private calculatePlayerValue(stats: any): number {
    const goals = stats.goals?.total || 0
    const assists = stats.goals?.assists || 0
    const appearances = stats.games?.appearences || 0
    const rating = parseFloat(stats.games?.rating) || 0
    
    // Base value calculation based on performance metrics
    const baseValue = 10000000 // 10M base
    const goalMultiplier = goals * 2000000 // 2M per goal
    const assistMultiplier = assists * 1500000 // 1.5M per assist
    const appearanceMultiplier = appearances * 500000 // 500K per appearance
    const ratingMultiplier = rating * 5000000 // 5M per rating point
    
    return Math.min(baseValue + goalMultiplier + assistMultiplier + appearanceMultiplier + ratingMultiplier, 200000000)
  }

  private calculatePopularity(stats: any): number {
    const goals = stats.goals?.total || 0
    const assists = stats.goals?.assists || 0
    const appearances = stats.games?.appearences || 0
    const rating = parseFloat(stats.games?.rating) || 0
    
    // Popularity calculation (0-100 scale)
    const basePopularity = 50
    const goalBonus = goals * 2
    const assistBonus = assists * 1
    const appearanceBonus = appearances * 0.5
    const ratingBonus = rating * 5
    
    return Math.min(Math.max(basePopularity + goalBonus + assistBonus + appearanceBonus + ratingBonus, 0), 100)
  }

  private getFallbackLeagues(): League[] {
    return [
      {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb.svg',
        season: 2024
      },
      {
        id: 140,
        name: 'La Liga',
        country: 'Spain',
        logo: 'https://media.api-sports.io/football/leagues/140.png',
        flag: 'https://media.api-sports.io/flags/es.svg',
        season: 2024
      },
      {
        id: 78,
        name: 'Bundesliga',
        country: 'Germany',
        logo: 'https://media.api-sports.io/football/leagues/78.png',
        flag: 'https://media.api-sports.io/flags/de.svg',
        season: 2024
      },
      {
        id: 135,
        name: 'Serie A',
        country: 'Italy',
        logo: 'https://media.api-sports.io/football/leagues/135.png',
        flag: 'https://media.api-sports.io/flags/it.svg',
        season: 2024
      },
      {
        id: 61,
        name: 'Ligue 1',
        country: 'France',
        logo: 'https://media.api-sports.io/football/leagues/61.png',
        flag: 'https://media.api-sports.io/flags/fr.svg',
        season: 2024
      }
    ]
  }

  private getFallbackTeams(leagueId: number): Team[] {
    if (leagueId === 39) { // Premier League
      return [
        { id: 33, name: 'Manchester United', logo: 'https://media.api-sports.io/football/teams/33.png', founded: 1878, venue: 'Old Trafford', code: 'MUN', country: 'England' },
        { id: 34, name: 'Newcastle United', logo: 'https://media.api-sports.io/football/teams/34.png', founded: 1892, venue: 'St. James Park', code: 'NEW', country: 'England' },
        { id: 40, name: 'Liverpool', logo: 'https://media.api-sports.io/football/teams/40.png', founded: 1892, venue: 'Anfield', code: 'LIV', country: 'England' },
        { id: 42, name: 'Arsenal', logo: 'https://media.api-sports.io/football/teams/42.png', founded: 1886, venue: 'Emirates Stadium', code: 'ARS', country: 'England' },
        { id: 50, name: 'Manchester City', logo: 'https://media.api-sports.io/football/teams/50.png', founded: 1880, venue: 'Etihad Stadium', code: 'MCI', country: 'England' },
        { id: 49, name: 'Chelsea', logo: 'https://media.api-sports.io/football/teams/49.png', founded: 1905, venue: 'Stamford Bridge', code: 'CHE', country: 'England' },
        { id: 47, name: 'Tottenham', logo: 'https://media.api-sports.io/football/teams/47.png', founded: 1882, venue: 'Tottenham Hotspur Stadium', code: 'TOT', country: 'England' },
        { id: 66, name: 'Aston Villa', logo: 'https://media.api-sports.io/football/teams/66.png', founded: 1874, venue: 'Villa Park', code: 'AVL', country: 'England' },
        { id: 48, name: 'West Ham', logo: 'https://media.api-sports.io/football/teams/48.png', founded: 1895, venue: 'London Stadium', code: 'WHU', country: 'England' },
        { id: 35, name: 'Bournemouth', logo: 'https://media.api-sports.io/football/teams/35.png', founded: 1890, venue: 'Vitality Stadium', code: 'BOU', country: 'England' }
      ]
    } else if (leagueId === 140) { // La Liga
      return [
        { id: 541, name: 'Real Madrid', logo: 'https://media.api-sports.io/football/teams/541.png', founded: 1902, venue: 'Santiago Bernabéu', code: 'RMA', country: 'Spain' },
        { id: 529, name: 'Barcelona', logo: 'https://media.api-sports.io/football/teams/529.png', founded: 1899, venue: 'Camp Nou', code: 'BAR', country: 'Spain' },
        { id: 530, name: 'Atlético Madrid', logo: 'https://media.api-sports.io/football/teams/530.png', founded: 1903, venue: 'Wanda Metropolitano', code: 'ATM', country: 'Spain' },
        { id: 533, name: 'Sevilla', logo: 'https://media.api-sports.io/football/teams/533.png', founded: 1890, venue: 'Ramón Sánchez Pizjuán', code: 'SEV', country: 'Spain' },
        { id: 548, name: 'Real Sociedad', logo: 'https://media.api-sports.io/football/teams/548.png', founded: 1909, venue: 'Reale Arena', code: 'RSO', country: 'Spain' },
        { id: 532, name: 'Valencia', logo: 'https://media.api-sports.io/football/teams/532.png', founded: 1919, venue: 'Mestalla', code: 'VAL', country: 'Spain' }
      ]
    } else if (leagueId === 78) { // Bundesliga
      return [
        { id: 173, name: 'Bayern Munich', logo: 'https://media.api-sports.io/football/teams/173.png', founded: 1900, venue: 'Allianz Arena', code: 'BAY', country: 'Germany' },
        { id: 165, name: 'Borussia Dortmund', logo: 'https://media.api-sports.io/football/teams/165.png', founded: 1909, venue: 'Signal Iduna Park', code: 'BVB', country: 'Germany' },
        { id: 174, name: 'RB Leipzig', logo: 'https://media.api-sports.io/football/teams/174.png', founded: 2009, venue: 'Red Bull Arena', code: 'RBL', country: 'Germany' },
        { id: 164, name: 'Bayer Leverkusen', logo: 'https://media.api-sports.io/football/teams/164.png', founded: 1904, venue: 'BayArena', code: 'B04', country: 'Germany' },
        { id: 163, name: 'Eintracht Frankfurt', logo: 'https://media.api-sports.io/football/teams/163.png', founded: 1899, venue: 'Deutsche Bank Park', code: 'SGE', country: 'Germany' },
        { id: 172, name: 'VfB Stuttgart', logo: 'https://media.api-sports.io/football/teams/172.png', founded: 1893, venue: 'Mercedes-Benz Arena', code: 'VFB', country: 'Germany' }
      ]
    } else if (leagueId === 135) { // Serie A
      return [
        { id: 496, name: 'Juventus', logo: 'https://media.api-sports.io/football/teams/496.png', founded: 1897, venue: 'Allianz Stadium', code: 'JUV', country: 'Italy' },
        { id: 497, name: 'AS Roma', logo: 'https://media.api-sports.io/football/teams/497.png', founded: 1927, venue: 'Stadio Olimpico', code: 'ROM', country: 'Italy' },
        { id: 489, name: 'AC Milan', logo: 'https://media.api-sports.io/football/teams/489.png', founded: 1899, venue: 'San Siro', code: 'MIL', country: 'Italy' },
        { id: 505, name: 'Inter Milan', logo: 'https://media.api-sports.io/football/teams/505.png', founded: 1908, venue: 'San Siro', code: 'INT', country: 'Italy' },
        { id: 487, name: 'Lazio', logo: 'https://media.api-sports.io/football/teams/487.png', founded: 1900, venue: 'Stadio Olimpico', code: 'LAZ', country: 'Italy' },
        { id: 500, name: 'Atalanta', logo: 'https://media.api-sports.io/football/teams/500.png', founded: 1907, venue: 'Gewiss Stadium', code: 'ATA', country: 'Italy' }
      ]
    } else if (leagueId === 61) { // Ligue 1
      return [
        { id: 85, name: 'Paris Saint Germain', logo: 'https://media.api-sports.io/football/teams/85.png', founded: 1970, venue: 'Parc des Princes', code: 'PSG', country: 'France' },
        { id: 81, name: 'Marseille', logo: 'https://media.api-sports.io/football/teams/81.png', founded: 1899, venue: 'Stade Vélodrome', code: 'OM', country: 'France' },
        { id: 80, name: 'Lyon', logo: 'https://media.api-sports.io/football/teams/80.png', founded: 1950, venue: 'Groupama Stadium', code: 'OL', country: 'France' },
        { id: 84, name: 'AS Monaco', logo: 'https://media.api-sports.io/football/teams/84.png', founded: 1924, venue: 'Stade Louis II', code: 'MON', country: 'France' },
        { id: 79, name: 'Lille', logo: 'https://media.api-sports.io/football/teams/79.png', founded: 1944, venue: 'Stade Pierre-Mauroy', code: 'LIL', country: 'France' },
        { id: 82, name: 'Rennes', logo: 'https://media.api-sports.io/football/teams/82.png', founded: 1901, venue: 'Roazhon Park', code: 'REN', country: 'France' }
      ]
    }
    // Return default Premier League teams for unknown leagues
    console.log(`⚠️  Unknown league ID: ${leagueId}, returning default Premier League teams`)
    return [
      { id: 33, name: 'Manchester United', logo: 'https://media.api-sports.io/football/teams/33.png', founded: 1878, venue: 'Old Trafford', code: 'MUN', country: 'England' },
      { id: 42, name: 'Arsenal', logo: 'https://media.api-sports.io/football/teams/42.png', founded: 1886, venue: 'Emirates Stadium', code: 'ARS', country: 'England' },
      { id: 40, name: 'Liverpool', logo: 'https://media.api-sports.io/football/teams/40.png', founded: 1892, venue: 'Anfield', code: 'LIV', country: 'England' },
      { id: 50, name: 'Manchester City', logo: 'https://media.api-sports.io/football/teams/50.png', founded: 1880, venue: 'Etihad Stadium', code: 'MCI', country: 'England' },
      { id: 49, name: 'Chelsea', logo: 'https://media.api-sports.io/football/teams/49.png', founded: 1905, venue: 'Stamford Bridge', code: 'CHE', country: 'England' },
      { id: 47, name: 'Tottenham', logo: 'https://media.api-sports.io/football/teams/47.png', founded: 1882, venue: 'Tottenham Hotspur Stadium', code: 'TOT', country: 'England' }
    ]
  }

  private getFallbackPlayersByTeam(teamId: number): Player[] {
    const teamPlayers: Record<number, Player[]> = {
      // Manchester United
      33: [
        { id: 1001, name: "Marcus Rashford", team: "Manchester United", position: "Forward", goals: 12, assists: 5, value: 85000000, popularity: 88, avatar: "https://media.api-sports.io/football/players/1001.png", photo: "https://media.api-sports.io/football/players/1001.png", nationality: "England", age: 26, market_value: 85000000, current_season_stats: { goals: 12, assists: 5, appearances: 22, rating: 7.2 }},
        { id: 1002, name: "Bruno Fernandes", team: "Manchester United", position: "Midfielder", goals: 8, assists: 12, value: 75000000, popularity: 85, avatar: "https://media.api-sports.io/football/players/1002.png", photo: "https://media.api-sports.io/football/players/1002.png", nationality: "Portugal", age: 29, market_value: 75000000, current_season_stats: { goals: 8, assists: 12, appearances: 25, rating: 7.8 }},
        { id: 1003, name: "Casemiro", team: "Manchester United", position: "Midfielder", goals: 3, assists: 4, value: 45000000, popularity: 78, avatar: "https://media.api-sports.io/football/players/1003.png", photo: "https://media.api-sports.io/football/players/1003.png", nationality: "Brazil", age: 31, market_value: 45000000, current_season_stats: { goals: 3, assists: 4, appearances: 20, rating: 6.9 }},
        { id: 1004, name: "Alejandro Garnacho", team: "Manchester United", position: "Winger", goals: 6, assists: 3, value: 35000000, popularity: 82, avatar: "https://media.api-sports.io/football/players/1004.png", photo: "https://media.api-sports.io/football/players/1004.png", nationality: "Argentina", age: 19, market_value: 35000000, current_season_stats: { goals: 6, assists: 3, appearances: 18, rating: 7.1 }}
      ],
      // Arsenal
      42: [
        { id: 1005, name: "Bukayo Saka", team: "Arsenal", position: "Winger", goals: 10, assists: 14, value: 120000000, popularity: 92, avatar: "https://media.api-sports.io/football/players/1005.png", photo: "https://media.api-sports.io/football/players/1005.png", nationality: "England", age: 22, market_value: 120000000, current_season_stats: { goals: 10, assists: 14, appearances: 24, rating: 8.1 }},
        { id: 1006, name: "Martin Ødegaard", team: "Arsenal", position: "Midfielder", goals: 7, assists: 9, value: 85000000, popularity: 87, avatar: "https://media.api-sports.io/football/players/1006.png", photo: "https://media.api-sports.io/football/players/1006.png", nationality: "Norway", age: 25, market_value: 85000000, current_season_stats: { goals: 7, assists: 9, appearances: 22, rating: 7.7 }},
        { id: 1007, name: "Gabriel Jesus", team: "Arsenal", position: "Forward", goals: 9, assists: 6, value: 65000000, popularity: 84, avatar: "https://media.api-sports.io/football/players/1007.png", photo: "https://media.api-sports.io/football/players/1007.png", nationality: "Brazil", age: 27, market_value: 65000000, current_season_stats: { goals: 9, assists: 6, appearances: 19, rating: 7.4 }},
        { id: 1008, name: "Kai Havertz", team: "Arsenal", position: "Midfielder", goals: 11, assists: 4, value: 70000000, popularity: 86, avatar: "https://media.api-sports.io/football/players/1008.png", photo: "https://media.api-sports.io/football/players/1008.png", nationality: "Germany", age: 24, market_value: 70000000, current_season_stats: { goals: 11, assists: 4, appearances: 23, rating: 7.6 }}
      ],
      // Liverpool
      40: [
        { id: 1009, name: "Mohamed Salah", team: "Liverpool", position: "Forward", goals: 18, assists: 12, value: 85000000, popularity: 95, avatar: "https://media.api-sports.io/football/players/306.png", photo: "https://media.api-sports.io/football/players/306.png", nationality: "Egypt", age: 31, market_value: 85000000, current_season_stats: { goals: 18, assists: 12, appearances: 25, rating: 8.3 }},
        { id: 1010, name: "Darwin Núñez", team: "Liverpool", position: "Forward", goals: 13, assists: 7, value: 75000000, popularity: 89, avatar: "https://media.api-sports.io/football/players/1010.png", photo: "https://media.api-sports.io/football/players/1010.png", nationality: "Uruguay", age: 24, market_value: 75000000, current_season_stats: { goals: 13, assists: 7, appearances: 22, rating: 7.8 }},
        { id: 1011, name: "Luis Díaz", team: "Liverpool", position: "Winger", goals: 8, assists: 9, value: 65000000, popularity: 86, avatar: "https://media.api-sports.io/football/players/1011.png", photo: "https://media.api-sports.io/football/players/1011.png", nationality: "Colombia", age: 27, market_value: 65000000, current_season_stats: { goals: 8, assists: 9, appearances: 21, rating: 7.5 }},
        { id: 1012, name: "Ryan Gravenberch", team: "Liverpool", position: "Midfielder", goals: 3, assists: 5, value: 45000000, popularity: 78, avatar: "https://media.api-sports.io/football/players/1012.png", photo: "https://media.api-sports.io/football/players/1012.png", nationality: "Netherlands", age: 22, market_value: 45000000, current_season_stats: { goals: 3, assists: 5, appearances: 20, rating: 7.2 }}
      ],
      // Manchester City
      50: [
        { id: 1013, name: "Erling Haaland", team: "Manchester City", position: "Forward", goals: 22, assists: 4, value: 180000000, popularity: 96, avatar: "https://media.api-sports.io/football/players/1100.png", photo: "https://media.api-sports.io/football/players/1100.png", nationality: "Norway", age: 23, market_value: 180000000, current_season_stats: { goals: 22, assists: 4, appearances: 24, rating: 8.4 }},
        { id: 1014, name: "Phil Foden", team: "Manchester City", position: "Midfielder", goals: 9, assists: 8, value: 95000000, popularity: 91, avatar: "https://media.api-sports.io/football/players/1469.png", photo: "https://media.api-sports.io/football/players/1469.png", nationality: "England", age: 23, market_value: 95000000, current_season_stats: { goals: 9, assists: 8, appearances: 23, rating: 7.9 }},
        { id: 1015, name: "Bernardo Silva", team: "Manchester City", position: "Midfielder", goals: 5, assists: 11, value: 80000000, popularity: 88, avatar: "https://media.api-sports.io/football/players/652.png", photo: "https://media.api-sports.io/football/players/652.png", nationality: "Portugal", age: 29, market_value: 80000000, current_season_stats: { goals: 5, assists: 11, appearances: 25, rating: 7.7 }},
        { id: 1016, name: "Jeremy Doku", team: "Manchester City", position: "Winger", goals: 4, assists: 6, value: 55000000, popularity: 83, avatar: "https://media.api-sports.io/football/players/1016.png", photo: "https://media.api-sports.io/football/players/1016.png", nationality: "Belgium", age: 22, market_value: 55000000, current_season_stats: { goals: 4, assists: 6, appearances: 19, rating: 7.3 }}
      ],
      // Chelsea
      49: [
        { id: 1017, name: "Cole Palmer", team: "Chelsea", position: "Midfielder", goals: 14, assists: 9, value: 85000000, popularity: 89, avatar: "https://media.api-sports.io/football/players/1017.png", photo: "https://media.api-sports.io/football/players/1017.png", nationality: "England", age: 21, market_value: 85000000, current_season_stats: { goals: 14, assists: 9, appearances: 23, rating: 8.0 }},
        { id: 1018, name: "Enzo Fernández", team: "Chelsea", position: "Midfielder", goals: 4, assists: 7, value: 95000000, popularity: 85, avatar: "https://media.api-sports.io/football/players/1018.png", photo: "https://media.api-sports.io/football/players/1018.png", nationality: "Argentina", age: 23, market_value: 95000000, current_season_stats: { goals: 4, assists: 7, appearances: 22, rating: 7.4 }},
        { id: 1019, name: "Nicolas Jackson", team: "Chelsea", position: "Forward", goals: 11, assists: 5, value: 45000000, popularity: 81, avatar: "https://media.api-sports.io/football/players/1019.png", photo: "https://media.api-sports.io/football/players/1019.png", nationality: "Senegal", age: 22, market_value: 45000000, current_season_stats: { goals: 11, assists: 5, appearances: 21, rating: 7.1 }},
        { id: 1020, name: "Moisés Caicedo", team: "Chelsea", position: "Midfielder", goals: 2, assists: 3, value: 75000000, popularity: 78, avatar: "https://media.api-sports.io/football/players/1020.png", photo: "https://media.api-sports.io/football/players/1020.png", nationality: "Ecuador", age: 22, market_value: 75000000, current_season_stats: { goals: 2, assists: 3, appearances: 24, rating: 7.0 }}
      ]
    }

    return teamPlayers[teamId] || [
      { id: 9999, name: "Sample Player", team: "Sample Team", position: "Forward", goals: 8, assists: 4, value: 50000000, popularity: 75, avatar: "https://media.api-sports.io/football/players/9999.png", photo: "https://media.api-sports.io/football/players/9999.png", nationality: "England", age: 25, market_value: 50000000, current_season_stats: { goals: 8, assists: 4, appearances: 18, rating: 7.0 }}
    ]
  }

  private getFallbackPlayers(): Player[] {
    return [
      {
        id: 1,
        name: "Mohamed Salah",
        team: "Liverpool",
        position: "Forward",
        goals: 15,
        assists: 8,
        value: 85000000,
        popularity: 95,
        avatar: "https://media.api-sports.io/football/players/306.png",
        photo: "https://media.api-sports.io/football/players/306.png",
        nationality: "Egypt",
        age: 31,
        market_value: 85000000,
        current_season_stats: {
          goals: 15,
          assists: 8,
          appearances: 20,
          rating: 7.8
        }
      },
      {
        id: 2,
        name: "Erling Haaland",
        team: "Manchester City",
        position: "Forward",
        goals: 18,
        assists: 3,
        value: 180000000,
        popularity: 92,
        avatar: "https://media.api-sports.io/football/players/1100.png",
        photo: "https://media.api-sports.io/football/players/1100.png",
        nationality: "Norway",
        age: 23,
        market_value: 180000000,
        current_season_stats: {
          goals: 18,
          assists: 3,
          appearances: 18,
          rating: 8.2
        }
      },
      {
        id: 3,
        name: "Bukayo Saka",
        team: "Arsenal",
        position: "Winger",
        goals: 8,
        assists: 12,
        value: 120000000,
        popularity: 88,
        avatar: "https://media.api-sports.io/football/players/1005.png",
        photo: "https://media.api-sports.io/football/players/1005.png",
        nationality: "England",
        age: 22,
        market_value: 120000000,
        current_season_stats: {
          goals: 8,
          assists: 12,
          appearances: 22,
          rating: 7.5
        }
      },
      {
        id: 4,
        name: "Bruno Fernandes",
        team: "Manchester United",
        position: "Midfielder",
        goals: 6,
        assists: 9,
        value: 75000000,
        popularity: 85,
        avatar: "https://media.api-sports.io/football/players/1002.png",
        photo: "https://media.api-sports.io/football/players/1002.png",
        nationality: "Portugal",
        age: 29,
        market_value: 75000000,
        current_season_stats: {
          goals: 6,
          assists: 9,
          appearances: 21,
          rating: 7.2
        }
      }
    ]
  }
}

export const footballAPI = new FootballAPI() 