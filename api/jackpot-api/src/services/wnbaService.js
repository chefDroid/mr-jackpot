const WNBA_MARKETS = [
  "player_points",
  "player_rebounds",
  "player_assists"
].join(",");

// ~/mr-jackpot/api/jackpot-api/src/services/wnbaService.js

export async function fetchWNBAProps(apiKey) {
  // The Player Props API uses sport keys in the URL
  const url = `https://player-props.p.rapidapi.com/v1/sports/basketball_wnba/events`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'player-props.p.rapidapi.com',
      'x-rapidapi-key': apiKey,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) throw new Error("WNBA Fetch Failed");

  const data = await res.json();
  
  // This API usually returns the array directly or in a nested field
  // The parser I gave you handles the 'event_id' structure inside this data
  return data || [];
}
