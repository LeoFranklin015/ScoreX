// Team color mappings based on common team colors
const TEAM_COLORS: Record<string, string[]> = {
  // Premier League
  'manchester united': ['#DA020E', '#FFB81C', '#000000'],
  'manchester city': ['#6CABDD', '#FFB81C', '#1C2C5B'],
  'arsenal': ['#EF0107', '#FFB81C', '#9C824A'],
  'liverpool': ['#C8102E', '#FFB81C', '#00B2A9'],
  'chelsea': ['#034694', '#FFB81C', '#034694'],
  'tottenham': ['#132257', '#FFB81C', '#132257'],
  'leicester': ['#003090', '#FFB81C', '#FFB81C'],
  'west ham': ['#7A263A', '#F3D459', '#1BB1E7'],
  'everton': ['#003399', '#FFB81C', '#003399'],
  'aston villa': ['#95BFE5', '#FFB81C', '#7A003C'],
  'newcastle': ['#241F20', '#FFB81C', '#241F20'],
  'wolves': ['#FDB913', '#231F20', '#FDB913'],
  'crystal palace': ['#1B458F', '#A7A5A6', '#C4122E'],
  'brighton': ['#0057B8', '#FFB81C', '#0057B8'],
  'burnley': ['#6C1D45', '#FFB81C', '#99D6EA'],
  'southampton': ['#D71920', '#FFB81C', '#130C0E'],
  'leeds': ['#FFB81C', '#1D428A', '#FFB81C'],
  'norwich': ['#FFF200', '#00A650', '#FFF200'],
  'watford': ['#FBEE23', '#ED2939', '#11210C'],
  'brentford': ['#FF2222', '#FFB81C', '#FF2222'],

  // La Liga
  'real madrid': ['#FEBE10', '#00529F', '#FEBE10'],
  'barcelona': ['#A50044', '#004D98', '#EDBB00'],
  'atletico madrid': ['#CE3524', '#FFB81C', '#CE3524'],
  'sevilla': ['#D4AF37', '#C41E3A', '#D4AF37'],
  'real sociedad': ['#0066CC', '#FFB81C', '#0066CC'],
  'villarreal': ['#FFE135', '#FFB81C', '#FFE135'],
  'valencia': ['#FF8200', '#000000', '#FF8200'],
  'real betis': ['#00954C', '#FFB81C', '#00954C'],
  'athletic bilbao': ['#EE2523', '#FFB81C', '#EE2523'],
  'celta vigo': ['#7BA7D7', '#FFB81C', '#7BA7D7'],

  // Serie A
  'juventus': ['#000000', '#FFB81C', '#000000'],
  'inter milan': ['#0068A8', '#FFB81C', '#000000'],
  'ac milan': ['#FB090B', '#000000', '#FB090B'],
  'napoli': ['#004B87', '#FFB81C', '#004B87'],
  'roma': ['#FFB81C', '#8B0000', '#FFB81C'],
  'lazio': ['#87CEEB', '#FFB81C', '#87CEEB'],
  'atalanta': ['#1C2951', '#FFB81C', '#1C2951'],
  'fiorentina': ['#7B68EE', '#FFB81C', '#7B68EE'],
  'sassuolo': ['#00A86B', '#000000', '#00A86B'],
  'torino': ['#8B0000', '#FFB81C', '#8B0000'],

  // Bundesliga
  'bayern munich': ['#DC143C', '#FFB81C', '#DC143C'],
  'borussia dortmund': ['#FFE135', '#000000', '#FFE135'],
  'rb leipzig': ['#DD0741', '#FFB81C', '#DD0741'],
  'bayer leverkusen': ['#E32221', '#000000', '#E32221'],
  'borussia monchengladbach': ['#00A76A', '#FFB81C', '#00A76A'],
  'wolfsburg': ['#65B32E', '#FFB81C', '#65B32E'],
  'eintracht frankfurt': ['#E1000F', '#000000', '#E1000F'],
  'hertha berlin': ['#005CA9', '#FFB81C', '#005CA9'],
  'schalke': ['#0066CC', '#FFB81C', '#0066CC'],
  'hoffenheim': ['#1C63B7', '#FFB81C', '#1C63B7'],

  // Ligue 1
  'psg': ['#004170', '#FFB81C', '#CE1126'],
  'marseille': ['#2FAEE0', '#FFB81C', '#2FAEE0'],
  'lyon': ['#0066CC', '#FFB81C', '#C41E3A'],
  'lille': ['#CE1126', '#FFB81C', '#CE1126'],
  'monaco': ['#CE1126', '#FFB81C', '#CE1126'],
  'nice': ['#CE1126', '#000000', '#CE1126'],
  'rennes': ['#CE1126', '#000000', '#CE1126'],
  'strasbourg': ['#29AAE3', '#FFB81C', '#29AAE3'],
  'bordeaux': ['#1C2951', '#FFB81C', '#1C2951'],
  'saint-etienne': ['#00A86B', '#FFB81C', '#00A86B'],
};

// Default fallback colors
const DEFAULT_COLORS = ['#00ffaa', '#3A29FF', '#FF94B4'];

export function getTeamColors(teamName: string): string[] {
  if (!teamName) return DEFAULT_COLORS;
  
  // Normalize team name for lookup
  const normalizedTeam = teamName.toLowerCase().trim();
  
  // Try exact match first
  if (TEAM_COLORS[normalizedTeam]) {
    return TEAM_COLORS[normalizedTeam];
  }
  
  // Try partial matches
  for (const [team, colors] of Object.entries(TEAM_COLORS)) {
    if (normalizedTeam.includes(team) || team.includes(normalizedTeam)) {
      return colors;
    }
  }
  
  // If no match found, return default colors
  return DEFAULT_COLORS;
}

// Generate color variations based on base team colors
export function getAuroraColors(teamName: string): string[] {
  const baseColors = getTeamColors(teamName);
  
  // Use the first color as primary, second as accent, third as highlight
  // If only one color, create variations
  if (baseColors.length === 1) {
    return [baseColors[0], '#FFB81C', baseColors[0]];
  } else if (baseColors.length === 2) {
    return [baseColors[0], baseColors[1], baseColors[0]];
  } else {
    return baseColors.slice(0, 3);
  }
}

// Get complementary colors for better aurora effect
export function getEnhancedAuroraColors(teamName: string): string[] {
  const baseColors = getAuroraColors(teamName);
  
  // Ensure we have good contrast and variety for aurora effect
  return [
    baseColors[0],           // Primary team color
    '#FFB81C',               // Golden accent (works well with most colors)
    baseColors[2] || baseColors[1] || baseColors[0]  // Secondary color
  ];
} 