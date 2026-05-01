import { getGames, generatePicks } from '../../../logic/picksEngine.js';

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
      return new Response(null, {
        headers: corsHeaders
      });
    }

    const url = new URL(request.url);

    // =========================
    // PICKS ENDPOINT
    // =========================
    if (url.pathname === "/picks") {
  const cacheKey = new Request(url.toString(), request);
  const cache = caches.default;

  // 🔥 TRY CACHE FIRST
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
        allGames.push(...games);
      } catch (e) {
        console.log(`Failed ${sport}`);
      }
    }

    const data = generatePicks({
      games: allGames,
      bankroll
    });

    response = new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        // 🔥 CACHE 5 MINUTES
        "Cache-Control": "public, max-age=300"
      }
    });

    // 🔥 SAVE TO CACHE
    await cache.put(cacheKey, response.clone());

    return response;

  } catch (err) {
    return new Response(JSON.stringify({
      error: err.message
    }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
	  // =========================
// EMAIL UNLOCK ENDPOINT
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

    // 🔥 SEND EMAIL USING RESEND
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Mr Jackpot <onboarding@yourdomain.com>",
        to: email,
        subject: "🔥 Welcome to Mr Jackpot",
        html: `
          <h1>🔥 Welcome to Mr Jackpot</h1>
          <p>You just unlocked premium picks.</p>
          <p>Use code: <b>KASGOAT20</b></p>
          <a href="https://chefdroid.github.io/dashboard.html">
            ENTER DASHBOARD
          </a>
        `
      })
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: corsHeaders
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

        // =========================
        // FETCH ALL SPORTS
        // =========================
        for (const sport of sports) {
          try {
            const games = await getGames(sport, env.ODDS_API_KEY);
            if (Array.isArray(games)) {
              allGames.push(...games);
            }
          } catch (e) {
            console.log(`Failed sport: ${sport}`, e.message);
          }
        }

        // =========================
        // GENERATE PICKS
        // =========================
        const data = generatePicks({
          games: allGames,
          bankroll
        });

        // =========================
        // SAFETY CHECK (CRITICAL)
        // =========================
        if (!data || !data.slips) {
          return new Response(JSON.stringify({
            error: "No slips generated",
            debug: data
          }), {
            status: 500,
            headers: corsHeaders
          });
        }

        return new Response(JSON.stringify(data), {
          status: 200,
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
    // DEFAULT ROUTE (FIXED)
    // =========================
    return new Response(JSON.stringify({
      status: "ok",
      message: "Mr Jackpot API Running"
    }), {
      headers: corsHeaders
    });
  }
};
console.log("API KEY EXISTS:", !!env.ODDS_API_KEY);