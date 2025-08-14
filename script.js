/***** STATE *****/
let heat = 0;
let perClick = 1;
let perSecond = 0;

// Shop definitions
let shopItems = [
  // name, emoji, baseCost, bonus per click, bonus per second, owned, costMultiplier
  { name: "Torch",           icon: "🕯️", base: 10,     pc: 1,    ps: 0, owned: 0, mult: 1.15 },
  { name: "Bonfire",         icon: "🔥",  base: 50,     pc: 0,    ps: 1, owned: 0, mult: 1.15 },
  { name: "Lava Pool",       icon: "🌋",  base: 200,    pc: 5,    ps: 0, owned: 0, mult: 1.18 },
  { name: "Forge",           icon: "⚒️",  base: 500,    pc: 0,    ps: 5, owned: 0, mult: 1.18 },
  { name: "Volcano",         icon: "🌋",  base: 2000,   pc: 0,    ps: 20,owned: 0, mult: 1.2  },
  { name: "Firestorm",       icon: "🌪️", base: 5000,   pc: 50,   ps: 0, owned: 0, mult: 1.22 },
  { name: "Sun Core",        icon: "☀️",  base: 20000,  pc: 0,    ps: 500,owned: 0, mult: 1.25 },
  { name: "Phoenix Feather", icon: "🪶",  base: 100000, pc: 5000, ps: 0, owned: 0, mult: 1.28 }
];

/***** STORAGE *****/
const KEY = "flameData_v1";

function saveGame() {
  localStorage.setItem(KEY, JSON.stringify({
    heat, perClick, perSecond, shopItems
  }));
}

function loadGame() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    heat = data.heat ?? 0;
    perClick = data.perClick ?? 1;
    perSecond = data.perSecond ?? 0;
    if (Array.isArray(data.shopItems)) {
      // Merge to keep future compatibility
      shopItems = shopItems.map((def, i) => {
        const saved = data.shopItems[i];
        return saved ? { ...def, ...saved } : def;
      });
    }
  } catch { /* ignore malformed saves */ }
}

/***** HELPERS *****/
function fmt(n) {
  // short scale formatting
  const units = ["", "K", "M", "B", "T", "Qa", "Qi"];
  let u = 0;
  let num = Math.floor(n);
  while (num >= 1000 && u < units.length - 1) {
    num /= 1000; u++;
  }
  return (u === 0 ? num.toString() : num.toFixed(2)) + units[u];
}

function currentCost(item){
  // geometric growth: base * mult^owned
  const cost = Math.floor(item.base * Math.pow(item.mult, item.owned));
  return Math.max(cost, item.base);
}

/***** RENDER *****/
const heatEl = document.getElementById("heat");
const perClickEl = document.getElementById("perClick");
const perSecondEl = document.getElementById("perSecond");
const shopEl = document.getElementById("shop");

function updateStats(){
  heatEl.textContent = fmt(heat);
  perClickEl.textContent = fmt(perClick);
  perSecondEl.textContent = fmt(perSecond);
}

function renderShop(){
  shopEl.innerHTML = "";
  shopItems.forEach((item, idx) => {
    const cost = currentCost(item);
    const canBuy = heat >= cost;

    const card = document.createElement("div");
    card.className = "shop-item";

    const title = document.createElement("h3");
    title.textContent = `${item.icon} ${item.name}`;
    card.appendChild(title);

    const desc = document.createElement("p");
    const parts = [];
    if (item.pc) parts.push(`+${fmt(item.pc)} / click`);
    if (item.ps) parts.push(`+${fmt(item.ps)} / sec`);
    desc.textContent = parts.join(" • ");
    card.appendChild(desc);

    const rowTop = document.createElement("div");
    rowTop.className = "row";
    const owned = document.createElement("div");
    owned.className = "owned";
    owned.textContent = `Owned: ${item.owned}`;
    const costEl = document.createElement("div");
    costEl.className = "cost";
    costEl.textContent = `Cost: ${fmt(cost)}`;
    rowTop.appendChild(owned);
    rowTop.appendChild(costEl);
    card.appendChild(rowTop);

    const rowBottom = document.createElement("div");
    rowBottom.className = "row";
    const buyBtn = document.createElement("button");
    buyBtn.textContent = canBuy ? "Buy" : "Not enough heat";
    buyBtn.disabled = !canBuy;
    buyBtn.onclick = () => buyItem(idx);
    rowBottom.appendChild(buyBtn);

    card.appendChild(rowBottom);
    shopEl.appendChild(card);
  });
}

/***** GAME LOGIC *****/
function recalcTotals(){
  // Recompute perClick and perSecond from base + items to avoid drift
  let pc = 1, ps = 0;
  for (const it of shopItems){
    pc += it.pc * it.owned;
    ps += it.ps * it.owned;
  }
  perClick = pc;
  perSecond = ps;
}

function clickFlame(){
  heat += perClick;
  updateStats();
  saveGame();
}

function buyItem(index){
  const item = shopItems[index];
  const cost = currentCost(item);
  if (heat < cost) return;
  heat -= cost;
  item.owned += 1;
  recalcTotals();
  updateStats();
  renderShop();
  saveGame();
}

/***** LOOP *****/
let lastTick = Date.now();
function tick(){
  const now = Date.now();
  const dt = Math.max(0, now - lastTick) / 1000; // seconds
  lastTick = now;

  if (perSecond > 0){
    heat += perSecond * dt;
    // prevent fractional dust from looking odd by flooring visually
  }
  updateStats();
  // 10x per second is smooth enough
  setTimeout(tick, 100);
}

/***** UI HOOKUP *****/
document.getElementById("flame").addEventListener("click", clickFlame);
document.getElementById("saveBtn").addEventListener("click", () => { saveGame(); });
document.getElementById("resetBtn").addEventListener("click", () => {
  if (!confirm("Reset all progress? This cannot be undone.")) return;
  localStorage.removeItem(KEY);
  heat = 0; perClick = 1; perSecond = 0;
  shopItems.forEach(it => it.owned = 0);
  updateStats(); renderShop(); saveGame();
});

/***** BOOT *****/
loadGame();
recalcTotals();
updateStats();
renderShop();
tick();
