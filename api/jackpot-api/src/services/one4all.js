// ~/mr-jackpot/api/jackpot-api/src/services/universalService.js

export async function fetchUniversalProps(apiKey, sportKey) {
  // This uses the 'player-props.p.rapidapi.com' API you found
  const url = `https://player-props.p.rapidapi.com/v1/sports/${sportKey}/events`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'player-props.p.rapidapi.com',
      'x-rapidapi-key': apiKey,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) throw new Error(`${sportKey} Fetch Failed`);

  const data = await res.json();
  
  // This API returns an array of events directly
  return data || [];
}
