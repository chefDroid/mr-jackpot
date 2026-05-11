const UFC_MARKETS = [
  "fight_winner"
].join(",");

export async function fetchUFCProps(apiKey) {

  const oddsRes = await fetch(
    `https://api.the-odds-api.com/v4/sports/mma_mixed_martial_arts/odds` +
    `?apiKey=${apiKey}` +
    `&regions=us` +
    `&markets=${UFC_MARKETS}` +
    `&bookmakers=draftkings` +
    `&oddsFormat=american`
  );

  if (!oddsRes.ok) {
    throw new Error("Failed UFC props fetch");
  }

  return await oddsRes.json();
}
