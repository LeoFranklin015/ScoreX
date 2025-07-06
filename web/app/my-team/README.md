# My Team Page

## Overview

The My Team page displays all the players that a user has minted as tokens on a 3D football field. This feature uses the `getAllUserTokens` function from the smart contract to fetch the user's minted players and displays them as interactive circles on a football field.

## Features

### 1. **Contract Integration**
- Uses `getAllUserTokens(address user)` function from the `FanBondGame` contract
- Fetches both player IDs and token amounts for the connected wallet
- Handles contract errors gracefully with fallback states

### 2. **Player Data Fetching**
- Calls the `/api/players?id={playerId}` endpoint for each minted player
- Converts API player data to field player format
- Displays player photos, names, positions, and stats

### 3. **3D Football Field Display**
- Interactive 3D football field with player positioning
- Players are positioned in a 4-3-3 formation (11 players max)
- Click on players to view detailed information
- Shows token balance for each player

### 4. **Player Details Sidebar**
- Displays comprehensive player information when selected
- Shows player stats, nationality, age, goals, games played
- Displays token ownership count
- Provides action buttons for future features

### 5. **Responsive Design**
- Works on desktop and mobile devices
- Adaptive layout with proper spacing
- Loading states and error handling

## Technical Implementation

### Components Used

1. **UserTeamField.tsx** - Main component that handles:
   - Contract calls to `getAllUserTokens`
   - API calls to fetch player details
   - 3D field rendering with player positioning
   - Player selection and interaction

2. **my-team/page.tsx** - Page wrapper that provides:
   - Wallet connection check
   - Layout and navigation
   - Player details sidebar
   - Quick stats bar

### Key Functions

```typescript
// Fetches user's minted players from contract
const userTokensData = await publicClient.readContract({
  abi: CURVE_LEAGUE_CONTRACT_ABI,
  address: CURVE_LEAGUE_CONTRACT_ADDRESS,
  functionName: "getAllUserTokens",
  args: [address],
}) as [bigint[], bigint[]]
```

```typescript
// Converts API player to field player with positioning
const convertAPIPlayerToFieldPlayer = (apiPlayer: APIPlayer, index: number, playerId: number, balance: number): FieldPlayer => {
  const position = getSimpleFieldPosition(index)
  return {
    name: apiPlayer.name,
    asset: apiPlayer.photo || "/placeholder.svg?height=65&width=65",
    // ... other properties
    x: position.x,
    y: position.y,
    playerId,
    balance,
  }
}
```

### Field Positioning

Players are positioned in a 4-3-3 formation:
- **Goalkeeper**: Center back (y: 380)
- **Defenders**: 4 players across the back line (y: 280-300)
- **Midfielders**: 3 players in midfield (y: 120-150)
- **Forwards**: 3 players up front (y: -150 to -170)

## Usage

1. **Connect Wallet**: Users must connect their Ledger wallet to view their team
2. **View Team**: The page automatically loads and displays all minted players
3. **Interact**: Click on any player to view detailed information
4. **Navigate**: Use the sidebar to view player stats and actions

## Navigation

- **Navbar**: "My Team" link in the main navigation
- **Dashboard**: "View Full Team" button on the dashboard page
- **Direct URL**: Navigate to `/my-team`

## Error Handling

- **No Wallet**: Shows connection prompt
- **No Players**: Displays empty state with call-to-action
- **API Errors**: Graceful fallback with retry options
- **Contract Errors**: Error messages with retry functionality

## Future Enhancements

- Player trading functionality
- Team formation customization
- Performance analytics
- Social features (share team)
- Mobile-optimized interactions 