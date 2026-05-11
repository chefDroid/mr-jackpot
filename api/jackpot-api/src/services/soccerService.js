const SOCCER_MARKETS = [
  "player_goals",
  "player_shots_on_target"
].join(",");

export async function fetchSoccerProps(apiKey) {

  const oddsRes = await fetch(
    `https://api.the-odds-api.com/v4/sports/soccer_mls/odds` +
    `?apiKey=${apiKey}` +
    `&regions=us` +
    `&markets=${SOCCER_MARKETS}` +
    `&bookmakers=draftkings` +
    `&oddsFormat=american`
  );

  if (!oddsRes.ok) {
    throw new Error("Failed Soccer props fetch");
  }

  return await oddsRes.json();
}
