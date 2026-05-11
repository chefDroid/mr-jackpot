 import {
  getGames,
  generatePicks
} from '../../../logic/picksEngine.js';

import {
  buildPlayerProps

} from '../../../logic/propParser.js';

import
 { fetchAllSports
} from './services/aggregator.js';
export default {
  async fetch(request, env) {

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Content-Type": "application/json"
    };

    // =========================
    // CORS PRE-FLIGHT
    // =========================
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // =========================
    // PICKS ENDPOINT
    // =========================
    if (url.pathname === "/picks") {

      const cacheKey = new Request(url.toString(), request);
      const cache = caches.default;

      // 🔥 CACHE CHECK
      let response = await cache.match(cacheKey);
      if (response) {
        console.log("✅ CACHE HIT");
        return response;
      }

      console.log("❌ CACHE MISS");

      const bankroll = Number(url.searchParams.get("bankroll")) || 100;

      try {
        const sports = [
          "basketball_nba",
          "basketball_wnba",
          "americanfootball_nfl",
          "baseball_mlb",
          "icehockey_nhl",
          "basketball_ncaab",
          "americanfootball_ncaaf",
          "soccer_usa_mls",
          "mma_mixed_martial_arts"
        ];

        let allGames = [];

        for (const sport of sports) {
          try {
            const games = await getGames(sport, env.ODDS_API_KEY);

            if (Array.isArray(games)) {
              allGames.push(...games);
            }

          } catch (e) {
            console.log(`Failed ${sport}`, e.message);
          }
        }

        console.log("TOTAL GAMES:", allGames.length);

        const data = generatePicks({
          games: allGames,
          bankroll
        });

        if (!data || !data.slips) {
          return new Response(JSON.stringify({
            error: "No slips generated",
            debug: data
          }), {
            status: 500,
            headers: corsHeaders
          });
        }

        response = new Response(JSON.stringify(data), {
          headers: {
            ...corsHeaders,
            "Cache-Control": "public, max-age=300"
          }
        });

        await cache.put(cacheKey, response.clone());

        return response;

      } catch (err) {
        return new Response(JSON.stringify({
          error: err.message
        }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }
// =========================
// PLAYER PROPS ENDPOINT
// =========================
// =========================
// NBA PLAYER PROPS
// =========================
if (url.pathname === "/props") {

  const sport = url.searchParams.get("sport");

  if (!sport) {
    return new Response(JSON.stringify({
      error: "Missing sport param"
    }), { status: 400, headers: corsHeaders });
  }

  const cacheKey = new Request(request.url);
  const cache = caches.default;

  let response = await cache.match(cacheKey);
  if (response) return response;

  try {

    const props = await fetchAllSports(env, sport);

    const parsed = buildPlayerProps(props, sport);

    response = new Response(JSON.stringify({
      props: parsed
    }), {
      headers: {
        ...corsHeaders,
        "Cache-Control": "public, max-age=120"
      }
    });

    await cache.put(cacheKey, response.clone());
    return response;

  } catch (err) {
    return new Response(JSON.stringify({
      error: err.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
    // =========================
    // EMAIL UNLOCK
    // =========================
    if (url.pathname === "/unlock" && request.method === "POST") {
      try {
        const { email } = await request.json();

        if (!email) {
          return new Response(JSON.stringify({ error: "No email" }), {
            status: 400,
            headers: corsHeaders
          });
        }

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: "Mr Jackpot <onboarding@https://chefdroid.github.io/mr-jackpot/>",
            to: email,
            subject: "🔥 Welcome to Mr Jackpot",
            html: `
              <h1>🔥 Welcome to Mr Jackpot</h1>
              <p>You just unlocked premium picks.</p>
              <p>Use code: <b>KASGOAT20</b></p>
              <a href="https://chefdroid.github.io/vip.html">
                ENTER DASHBOARD
              </a>
            `
          })
        });

        return new Response(JSON.stringify({ success: true }), {
          headers: corsHeaders
        });

      } catch (err) {
        return new Response(JSON.stringify({
          error: err.message
        }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // =========================
    // DEFAULT
    // =========================
    return new Response(JSON.stringify({
      status: "ok",
      message: "Mr Jackpot API Running"
    }), {
      headers: corsHeaders
    });
  }
};
