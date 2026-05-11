import { fetchUniversalProps } from "./one4all.js";
import { fetchNBAProps } from "./nbaService.js";
import { fetchWNBAProps } from "./wnbaService.js";
import { fetchMLBProps } from "./mlbService.js";
import { fetchNHLProps } from "./nhlService.js";
import { fetchSoccerProps } from "./soccerService.js";
import { fetchUFCProps } from "./ufcService.js";

export async function fetchAllSports(env, sport) {

  switch (sport) {

    case "basketball_nba":
      return await fetchNBAProps(env.ODDS_API_KEY);

    case "basketball_wnba":
      return await fetchWNBAProps(env.PLAYER_API_KEY);

    case "baseball_mlb":
      return await fetchMLBProps(env.RAPID_API_KEY);

    case "icehockey_nhl":
      return await fetchNHLProps(env.PLAYER_API_KEY);

    case "soccer_mls":
      return await fetchSoccerProps(env.PLAYER_API_KEY);

    case "mma_mixed_martial_arts":
      return await fetchUFCProps(env.PLAYER_API_KEY);

    default:
      return [];
  }
// Use the NEW Universal Service for everything else
  const universalSports = [
    "basketball_wnba", 
    "icehockey_nhl", 
    "mma_mixed_martial_arts", 
    "soccer_usa_mls"
  ];

  if (universalSports.includes(sport)) {
    return await fetchUniversalProps(env.PLAYER_API_KEY, sport);
  }
}
