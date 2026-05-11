function impliedProb(odds) {

  if (!odds) return 0;

  if (odds > 0) {
    return 100 / (odds + 100);
  }

  return Math.abs(odds) /
    (Math.abs(odds) + 100);
}

/* =========================
   CONFIDENCE ENGINE
========================= */

function confidenceScore(prop) {

  let score =
    impliedProb(prop.odds) * 100;

  // FAVOR OVERS
  if (
    prop.pick &&
    prop.pick.toLowerCase().includes("over")
  ) {
    score += 4;
  }

  // FAVOR LOW LINES
  if (
    prop.line &&
    prop.line <= 1.5
  ) {
    score += 6;
  }

  // FAVOR STRONG FAVORITES
  if (prop.odds <= -180) {
    score += 10;
  }

  // FAVOR MLB HITS/RUNS
  if (
    prop.stat &&
    (
      prop.stat.includes("HITS") ||
      prop.stat.includes("RUNS")
    )
  ) {
    score += 5;
  }

  // FAVOR ASSISTS SLIGHTLY
  if (
    prop.stat &&
    prop.stat.toLowerCase().includes("assist")
  ) {
    score += 3;
  }

  // RANDOMIZER
  score += Math.random() * 3;

  return Math.round(score);
}

/* =========================
   MAIN PARSER
========================= */

export function buildPlayerProps(
  data,
  sport
) {

  const bestProps = new Map();

  /* =========================
     SAVE BEST PROP ONLY
  ========================= */

  const addProp = (prop) => {

    prop.confidence =
      confidenceScore(prop);

    const key =
      `${prop.player}_${prop.stat}`;

    const existing =
      bestProps.get(key);

    // KEEP STRONGEST SIDE ONLY
    if (
      !existing ||
      prop.confidence >
        existing.confidence
    ) {
      bestProps.set(key, prop);
    }
  };

  /* =========================
     MLB CUSTOM API
  ========================= */

  if (
    sport === "baseball_mlb" &&
    Array.isArray(data)
  ) {

    for (const game of data) {

      if (!game.playerProps) continue;

      Object.values(game.playerProps)
        .forEach(player => {

        const betData =
          player.propBets ||
          player.props;

        if (!betData) return;

        Object.keys(betData)
          .forEach(propType => {

          const line =
            betData[propType];

          const prop = {

            player:
              player.playerName ||
              "Unknown Player",

            stat:
              propType
                .replace(/_/g, " ")
                .toUpperCase(),

            line:
              line.over ||
              line.under ||
              0,

            pick:
              `Over ${
                line.over ||
                line.under ||
                "N/A"
              }`,

            odds:
              line.overOdds ||
              line.odds ||
              0,

            game:
              `${game.home} vs ${game.away}`,

            sport:
              "baseball_mlb"
          };

          addProp(prop);
        });
      });
    }

    return [...bestProps.values()]
      .sort(
        (a, b) =>
          b.confidence - a.confidence
      )
      .slice(0, 50);
  }

  /* =========================
     RAPID API FORMAT
  ========================= */

  if (
    Array.isArray(data) &&
    data[0]?.event_id
  ) {

    for (const event of data) {

      if (!event.markets) continue;

      event.markets.forEach(market => {

        (market.outcomes || [])
          .forEach(outcome => {

          const prop = {

            player:
              outcome.description ||
              "Unknown Player",

            stat:
              market.name ||
              "Prop",

            line:
              outcome.point || 0,

            pick:
              `${outcome.name} ${
                outcome.point || ""
              }`,

            odds:
              outcome.price || 0,

            game:
              event.name || sport,

            sport
          };

          addProp(prop);
        });
      });
    }

    return [...bestProps.values()]
      .sort(
        (a, b) =>
          b.confidence - a.confidence
      )
      .slice(0, 50);
  }

  /* =========================
     ODDS API FORMAT
  ========================= */

  for (const game of data) {

    const bookmakers =
      game.bookmakers || [];

    for (const book of bookmakers) {

      const markets =
        book.markets || [];

      for (const market of markets) {

        const statName =
          market.key ||
          market.name ||
          "Unknown Stat";

        for (
          const outcome of
          market.outcomes || []
        ) {

          const prop = {

            player:
              outcome.description ||
              outcome.player ||
              "Unknown Player",

            stat:
              statName,

            line:
              outcome.point || 0,

            pick:
              outcome.point !== undefined
                ? `${outcome.name} ${outcome.point}`
                : outcome.name,

            odds:
              outcome.price || 0,

            game:
              `${game.home_team} vs ${game.away_team}`,

            sport:
              game.sport_key ||
              "unknown"
          };

          addProp(prop);
        }
      }
    }
  }

  /* =========================
     FINAL SORT
  ========================= */

  return [...bestProps.values()]
    .sort(
      (a, b) =>
        b.confidence - a.confidence
    )
    .slice(0, 50);
}