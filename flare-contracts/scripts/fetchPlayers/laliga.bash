#!/bin/bash

LEAGUE_ID=140
SEASON=2024

echo "Fetching La Liga teams for season $SEASON..."

TEAM_IDS=$(curl -s -H "x-apisports-key: $API_KEY" \
  "https://v3.football.api-sports.io/teams?league=$LEAGUE_ID&season=$SEASON" \
  | jq '.response[].team.id')

echo "Total teams found: $(echo "$TEAM_IDS" | wc -l)"
echo "Fetching players..."

for TEAM_ID in $TEAM_IDS; do
  PAGE=1
  while : ; do
    RESPONSE=$(curl -s -H "x-apisports-key: $API_KEY" \
      "https://v3.football.api-sports.io/players?team=$TEAM_ID&season=$SEASON&page=$PAGE")

    PLAYER_IDS=$(echo "$RESPONSE" | jq '.response[].player.id')

    if [ -z "$PLAYER_IDS" ] || [ "$PLAYER_IDS" = "null" ]; then
      break
    fi

    echo "$PLAYER_IDS"

    TOTAL_PAGES=$(echo "$RESPONSE" | jq '.paging.total')
    if [ "$PAGE" -ge "$TOTAL_PAGES" ]; then
      break
    fi

    PAGE=$((PAGE+1))
  done
done
