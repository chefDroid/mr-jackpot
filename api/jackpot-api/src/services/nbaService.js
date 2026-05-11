const NBA_MARKETS = [
  "player_points",
  "player_rebounds",
  "player_assists"
].join(",");

export async function fetchNBAProps(apiKey) {

  // GET NBA EVENTS
  const eventsRes = await fetch(
    `https://api.the-odds-api.com/v4/sports/basketball_nba/events?apiKey=${apiKey}`
  );

  if (!eventsRes.ok) {
    throw new Error("Failed NBA events fetch");
  }

  const events = await eventsRes.json();

  let allProps = [];

  // LIMIT EVENTS
  const limitedEvents = events.slice(0, 3);

  for (const event of limitedEvents) {

    try {

      // ✅ EVENT-SPECIFIC ODDS
      const oddsRes = await fetch(
        `https://api.the-odds-api.com/v4/sports/basketball_nba/events/${event.id}/odds` +
        `?apiKey=${apiKey}` +
        `&regions=us` +
        `&markets=${NBA_MARKETS}` +
        `&bookmakers=draftkings` +
        `&oddsFormat=american`
      );

      if (!oddsRes.ok) {
        console.log("FAILED EVENT:", event.id);
        continue;
      }

      const data = await oddsRes.json();

      // IMPORTANT
      allProps.push(data);

    } catch (e) {
      console.log("NBA PROP ERROR:", e.message);
    }
  }

  return allProps;
}
