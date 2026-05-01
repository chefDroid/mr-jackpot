/* =====================
   UTILITIES
===================== */
const americanToDecimal = (odds) =>
  odds > 0 ? 1 + odds / 100 : 1 + 100 / Math.abs(odds);

const impliedProb = (odds) =>
  odds > 0 ? 100 / (odds + 100) : Math.abs(odds) / (Math.abs(odds) + 100);

const parlayPayout = (stake, oddsArray) => {
  const decimalOdds = oddsArray.reduce(
    (acc, odds) => acc * americanToDecimal(odds),
    1
  );

  return {
    decimal: decimalOdds.toFixed(2),
    payout: (stake * decimalOdds).toFixed(2)
  };
};

function unitTier(odds) {
  if (odds <= -200) return { label: "HIGH", units: 3, weight: 1.2 };
  if (odds <= -150) return { label: "MODERATE", units: 2, weight: 1.0 };
  return { label: "LOW", units: 1, weight: 0.8 };
}

/* =====================
   FETCH GAMES
===================== */
export async function getGames(sportKey, apiKey) {
  const url = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds?regions=us&markets=h2h,spreads,totals&oddsFormat=american&apiKey=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch games");

  return await res.json();
}

/* =====================
   DATE FILTER
===================== */
const isToday = (dateStr) => {
  const gameDate = new Date(dateStr);
  const now = new Date();

  return (
    gameDate.getUTCDate() === now.getUTCDate() &&
    gameDate.getUTCMonth() === now.getUTCMonth() &&
    gameDate.getUTCFullYear() === now.getUTCFullYear()
  );
};

/* =====================
   BUILD PICKS
===================== */
console.log("PROCESSING GAME:", g.home_team, "vs", g.away_team);
function buildPicks(games) {
  const picks = [];

  for (const g of games) {
    const book = g.bookmakers?.[0];
if (!book) continue;
    const h2h = book?.markets?.find(m => m.key === "h2h");
    const spreads = book?.markets?.find(m => m.key === "spreads");
    const totals = book?.markets?.find(m => m.key === "totals");

    if (!h2h) continue;

    const fav = [...h2h.outcomes].sort((a, b) => a.price - b.price)[0];

    const tier = unitTier(fav.price);
    const confidenceScore = impliedProb(fav.price) * tier.weight;

    picks.push({
      game: `${g.home_team} vs ${g.away_team}`,
      team: fav.name,
      odds: fav.price,
      spread: spreads?.outcomes?.find(o => o.name === fav.name)?.point ?? null,
      total: totals?.outcomes?.[0]?.point ?? null,
      tier,
      confidenceScore
    });
  }

  return picks.sort((a, b) => b.confidenceScore - a.confidenceScore);
}
const usedGames = new Set();

const unique = base.filter(p => {
  if (usedGames.has(p.game)) return false;
  usedGames.add(p.game);
  return true;
});
console.log("TOTAL PICKS BUILT:", picks.length);
/* =====================
   GENERATE PICKS (MAIN ENGINE)
===================== */
console.log("TOTAL GAMES:", allGames.length);
   const allowedSports = [
    "basketball_nba",
    "baseball_mlb",
    "icehockey_nhl",
	"basketball_wnba"
];

   const filteredGames = games.filter(g =>
   allowedSports.includes(g.sport_key)
);

export function generatePicks({ games, bankroll }) {

  const todayGames = games.filter(g => isToday(g.commence_time));
  const futureGames = games.filter(g => !isToday(g.commence_time));

  const todayPicks = buildPicks(todayGames);
  const futurePicks = buildPicks(futureGames);

  const safeTodayPicks =
  todayPicks.length >= 3 ? todayPicks : futurePicks.slice(0, 10);

  /* =====================
     MEDIAN TOTAL (YOUR DISCORD LOGIC)
  ===================== */
  const allPicks = [...todayPicks, ...futurePicks];

  const totalsArr = allPicks
    .filter(p => p.total)
    .map(p => p.total)
    .sort((a, b) => a - b);

  const median =
    totalsArr.length > 0
      ? totalsArr[Math.floor(totalsArr.length / 2)]
      : 145;

  /* =====================
     SLIP BUILDER
  ===================== */
  const buildSlip = (type, pool) => {
    if (!pool || pool.length === 0) {
      return {
        type,
        straights: [],
        parlay: { legs: [], stake: "0.00", payout: "0.00" }
      };
    }

    let base = [...pool];
base = base.sort((a,b)=>b.confidenceScore-a.confidenceScore);
base = unique;

    if (type === "underdog") {
      base = base.filter(p => p.odds > 100);
    }

    if (type === "highroller") {
      base = base.filter(p => p.odds > -150);
    }

    // fallback
    if (base.length < 3) {
      base = [...pool].sort((a, b) => b.confidenceScore - a.confidenceScore);
    }

    /* =====================
       STRAIGHTS (FIXED)
    ===================== */
    const topScore = base[0]?.confidenceScore || 0;

    let straights = base.slice(0, 3).map(p => ({
  ...p,
  amount: (bankroll * (p.tier.units * 0.01)).toFixed(2)
}));

    // hard fallback (prevents empty)
    if (straights.length === 0) {
      straights = base.slice(0, 3).map(p => ({
        ...p,
        amount: (bankroll * (p.tier.units * 0.01)).toFixed(2)
      }));
    }

    /* =====================
       PARLAY (YOUR LOGIC + 1259 STYLE)
    ===================== */

    let legs = [];
const used = new Set();

const addLeg = (pick) => {
  if (!pick || used.has(pick.game)) return;
  used.add(pick.game);
  legs.push(pick);
};

    // ? BASE BEST PICKS
    const ranked = [...base].sort(
      (a, b) => impliedProb(b.odds) - impliedProb(a.odds)
    );

    ranked.forEach(p => addLeg(p));

    // ? SAME GAME STACK (YOUR DISCORD LOGIC)
    const sameGame = ranked.find(p => p.total);

    if (sameGame) {
      legs.push(sameGame);

      // spread leg
      if (sameGame.spread !== null) {
        legs.push({
          ...sameGame,
          team: `${sameGame.team} Spread`
        });
      }

      // total lean using median
      legs.push({
        ...sameGame,
        team: `Total ${
          sameGame.total >= median ? "Under" : "Over"
        } ${sameGame.total}`
      });
    }

    // ? 2 TEAM STRUCTURE
    const twoTeams = ranked.slice(0, 2);
    legs.push(...twoTeams);

    if (twoTeams[0]?.spread !== null) {
      legs.push({
        ...twoTeams[0],
        team: `${twoTeams[0].team} Spread`
      });
    }

    // ? EXTRA DEPTH (your style)
    legs.push(...ranked.slice(2, 5));

    // clean
    legs = legs.slice(0, 8);

    if (legs.length < 2) {
      return {
        type,
        straights,
        parlay: { legs: [], stake: "0.00", payout: "0.00" }
      };
    }

    const oddsArray = legs.map(l => l.odds);

    const stake = bankroll * 0.08;
    const payout = parlayPayout(stake, oddsArray);

    return {
      type,
      straights,
      parlay: {
        legs,
        stake: stake.toFixed(2),
        payout: payout.payout
      }
    };
  };

  /* =====================
     SLIPS
  ===================== */
  const slips = [
  buildSlip("standard", safeTodayPicks),
  buildSlip("standard", safeTodayPicks),
  buildSlip("standard", safeTodayPicks),

  buildSlip("highroller", futurePicks),
  buildSlip("underdog", futurePicks),
  buildSlip("underdog", futurePicks)
];

  /* =====================
     FUTURE GAMES
  ===================== */
  const nextGames = futureGames.slice(0, 15).map(g => ({
    game: `${g.home_team} vs ${g.away_team}`,
    time: g.commence_time,
    location: g.home_team
  }));

  /* =====================
     TOP UNDERDOG
  ===================== */
  const topDog = allPicks.find(p => p.odds > 150) || null;

  return {
    slips,
    nextGames,
    topDog
  };
}