const API_URL = "https://jackpot-api.kasgoatpro.workers.dev/picks?bankroll=100";

let slipsData = [];
let currentIndex = 0;

/* =====================
   LOAD DATA
===================== */
async function loadData() {
  try {
    const res = await fetch("https://jackpot-api.kasgoatpro.workers.dev/picks?bankroll=100");
    const data = await res.json();

    console.log("API DATA:", data); // ? DEBUG

    slipsData =
  data.slips ||
  data.data?.slips ||
  data.result?.slips ||
  [];

    renderCards();

  } catch (err) {
    console.error("API ERROR:", err);
  }
}

loadData();
/* =====================
   RENDER CARDS
===================== */
function renderCards() {
  const stack = document.getElementById("cardStack");
  stack.innerHTML = "";

  const visible = slipsData.slice(currentIndex, currentIndex + 3);

  visible.reverse().forEach((slip, i) => {
    const card = createCard(slip);
    card.style.zIndex = i;
    stack.appendChild(card);
    addSwipe(card);
  });
}

/* =====================
   CREATE CARD
===================== */
function createCard(slip) {
  const div = document.createElement("div");
  div.className = "card";

  const straights = slip.straights || [];
  const legs = slip.parlay?.legs || [];

  let html = `<h2>${slip.type.toUpperCase()} SLIP</h2>`;

  straights.forEach(b => {
    html += `
      <div class="bet">
        🔥 ${b.team ?? "N/A"} (${b.odds ?? "N/A"})
        <br/>📏 Spread: ${b.spread ?? "N/A"}
        <br/>📊 Total: ${b.total ?? "N/A"}
      </div>
    `;
  });

  html += `<h3>🎟️ Parlay</h3>`;

  legs.forEach(l => {
    html += `<div class="bet">🏆 ${l.team ?? "N/A"} (${l.odds ?? "N/A"})</div>`;
  });

  html += `<div>💰 Payout: $${slip.parlay?.payout ?? "0.00"}</div>`;

  div.innerHTML = html;
  return div;
}

/* =====================
   SWIPE LOGIC
===================== */
function addSwipe(card) {
  let startX = 0;

  card.addEventListener("mousedown", e => {
    startX = e.clientX;

    document.onmousemove = e2 => {
      let moveX = e2.clientX - startX;
      card.style.transform = `translateX(${moveX}px) rotate(${moveX/10}deg)`;
    };

    document.onmouseup = e3 => {
      let endX = e3.clientX - startX;

      if (Math.abs(endX) > 100) {
        card.style.transform = `translateX(${endX > 0 ? 1000 : -1000}px)`;
        nextCard();
      } else {
        card.style.transform = "";
      }

      document.onmousemove = null;
      document.onmouseup = null;
    };
  });
}

/* =====================
   NEXT CARD
===================== */
function nextCard() {
  currentIndex++;

  if (currentIndex >= 6) {
    showLock();
    return;
  }

  renderCards();
}

/* =====================
   LOCK AFTER 6
===================== */
function showLock() {
  const stack = document.getElementById("cardStack");

  stack.innerHTML = `
    <div class="lock">
      <h2>🔥 Unlock Full Access</h2>
      <p>Enter your email</p>

      <input id="emailInput" placeholder="Email" />
      <br/><br/>

      <button onclick="unlockVIP()">Unlock</button>
    </div>
  `;
}
async function unlockVIP() {
  const email = document.getElementById("emailInput").value;

  if (!email) return alert("Enter email");

  try {
    const res = await fetch("https://jackpot-api.kasgoatpro.workers.dev/unlock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (data.success) {
      alert("🔥 VIP unlocked! Check your email.");

      // redirect
      window.location.href = "vip.html";
    } else {
      alert("Error unlocking");
    }

  } catch (err) {
    console.error(err);
    alert("Unlock failed");
  }
}
/* =====================
   BUTTON ACTION
===================== */
document.getElementById("mrJackpotBtn").addEventListener("click", () => {
  currentIndex = 0;
  renderCards();
});
document.getElementById("joinBtn").onclick = () => {
  window.open("https://discord.gg/bu3M6kN9sx", "_blank");
};
/* =====================
   INIT
===================== */
loadData();
/* =====================
   DEBUG 
===================== */	
console.log("SLIPS DATA:", slipsData);	