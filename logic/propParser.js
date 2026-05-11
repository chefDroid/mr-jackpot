export function buildPlayerProps(data, sport) {
  const props = [];

  // --- TANK01 MLB LOGIC (Specific to Hits, Runs, HR, Strikeouts) ---
  if (sport === "baseball_mlb" && Array.isArray(data)) {
    for (const game of data) {
      if (game.playerProps) {
        Object.values(game.playerProps).forEach(player => {
          const betData = player.propBets || player.props; 
          
          if (betData) {
            Object.keys(betData).forEach(propType => {
              const line = betData[propType];
              
              // This ensures Strikeouts, Hits, Runs, and HRs are all captured
              props.push({
                player: player.playerName || "Unknown Player",
                stat: propType.replace(/_/g, ' ').toUpperCase(), 
                pick: `Over ${line.over || line.under || "N/A"}`,
                odds: line.overOdds || line.odds || 0,
                game: `${game.home} vs ${game.away}`,
                confidence: Math.abs(line.overOdds || 0),
                sport: "baseball_mlb"
              });
            });
          }
        });
      }
    }
    return props.sort((a, b) => b.confidence - a.confidence);
  }

  // --- NEW PLAYER-PROPS API LOGIC (For UFC, Soccer, WNBA, etc.) ---
  // This handles the format from player-props.p.rapidapi.com
  if (Array.isArray(data) && data[0]?.event_id) {
     for (const event of data) {
        if (event.markets) {
           event.markets.forEach(market => {
              market.outcomes.forEach(outcome => {
                 props.push({
                    player: outcome.description || "Unknown Player",
                    stat: market.name || "Prop",
                    pick: `${outcome.name} ${outcome.point || ""}`,
                    odds: outcome.price || 0,
                    game: event.name || sport,
                    confidence: Math.abs(outcome.price || 0),
                    sport: sport
                 });
              });
           });
        }
     }
     return props.sort((a, b) => b.confidence - a.confidence);
  }

  // --- ORIGINAL ODDS API LOGIC (NBA) ---
  for (const game of data) {
    const bookmakers = game.bookmakers || [];
    for (const book of bookmakers) {
      const markets = book.markets || [];
      for (const market of markets) {
        const statName = market.key || market.name || "Unknown Stat";
        for (const outcome of market.outcomes || []) {
          let pick = (outcome.name && outcome.point !== undefined) 
            ? `${outcome.name} ${outcome.point}` 
            : (outcome.name || "N/A");

          props.push({
            player: outcome.description || outcome.player || "Unknown Player",
            stat: statName,
            pick,
            odds: outcome.price || 0,
            game: `${game.home_team} vs ${game.away_team}`,
            confidence: Math.abs(outcome.price || 0),
            sport: game.sport_key || "unknown"
          });
        }
      }
    }
  }

  return props.sort((a, b) => b.confidence - a.confidence);
}
