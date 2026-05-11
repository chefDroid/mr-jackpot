// ~/mr-jackpot/api/jackpot-api/src/services/mlbService.js

export async function fetchMLBProps(apiKey) {
  // Tank01 needs date in YYYYMMDD format
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const gameDate = `${year}${month}${day}`;

  const url = `https://tank01-mlb-live-in-game-real-time-statistics.p.rapidapi.com/getMLBBettingOdds?gameDate=${gameDate}&playerProps=true&itemFormat=list`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'tank01-mlb-live-in-game-real-time-statistics.p.rapidapi.com',
      'x-rapidapi-key': apiKey,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) throw new Error("MLB Fetch Failed");

  const data = await res.json();
  
  // Important: Tank01 puts the actual list in data.body
  return data.body || [];
}
