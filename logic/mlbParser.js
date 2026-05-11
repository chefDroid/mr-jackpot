import { fetchMLBProps } from './mlbService.js';

async function displayOdds() {
  const apiKey = '3043d1bd9amsh6708022bf838595p1e94b7jsnf87ae4eb31d9';
  const games = await fetchMLBProps(apiKey);

  const container = document.getElementById('odds-container');

  games.forEach(game => {
    const gameEl = document.createElement('div');
    gameEl.className = 'game-card';
    gameEl.innerHTML = `
      <h3>${game.away} @ ${game.home}</h3>
      <p>Date: ${game.gameDate}</p>
      <div class="props">
        <span>Status: ${game.gameStatus}</span>
      </div>
    `;
    container.appendChild(gameEl);
  });
}
