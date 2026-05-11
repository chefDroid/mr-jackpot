const NHL_MARKETS = [
  "player_points",
  "player_goals",
  "player_assists"
].join(",");

// ~/mr-jackpot/api/jackpot-api/src/services/nhlService.js

export async function fetchNHLProps(apiKey) {
  const url = `https://player-props.p.rapidapi.com/v1/sports/icehockey_nhl/events`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'player-props.p.rapidapi.com',
      'x-rapidapi-key': apiKey,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) throw new Error("NHL Fetch Failed");

  const data = await res.json();
  return data || [];
}
