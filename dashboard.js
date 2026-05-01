async function loadLeague(sport) {
  const res = await fetch(`https://jackpot-api.kasgoatpro.workers.dev/picks?bankroll=100`);
  const data = await res.json();

  const container = document.getElementById("leaguePicks");

  const picks = data.slips?.[0]?.straights || [];

  container.innerHTML = picks.map(p => `
    <div class="bet">
      🔥 ${p.team}
      <br/>Odds: ${p.odds}
      <br/>Spread: ${p.spread}
      <br/>Total: ${p.total}
    </div>
  `).join("");
}
