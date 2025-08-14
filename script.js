/* Flame Clicker 2.0 — Upgrades, Achievements (with rewards), Settings, and Stats */
const SAVE_KEY = "flame_v2_save";

const version = "v2.0";

// ======= State =======
const state = {
  heat: 0,
  lifetimeHeat: 0,
  perClickBase: 1,
  perSecondBase: 0,
  clickMult: 1,
  secondMult: 1,
  totalClicks: 0,
  upgradesBought: 0,
  startedAt: Date.now(),
  settings: { sound: false, lightTheme: false },
  shopItems: [],
  achievements: {}
};

// ======= Number Format =======
function fmt(n){
  if (!isFinite(n)) return "∞";
  const suffix = ["","K","M","B","T","Qa","Qi","Sx","Sp","Oc","No","Dc"];
  let i=0;
  while (n>=1000 && i<suffix.length-1){ n/=1000; i++; }
  const num = (i===0? Math.floor(n).toString() : n.toFixed(2));
  return num.replace(/\.00$/,"")+suffix[i];
}

// ======= Upgrades (prices per your sequence + a few more big tiers) =======
const priceList = [
  10, 50, 100, 1_000, 5_000, 10_000, 50_000, 100_000, 500_000,
  1_000_000, 10_000_000, 100_000_000, 500_000_000, 1_000_000_000,
  5_000_000_000, 10_000_000_000, 50_000_000_000, 100_000_000_000,
  500_000_000_000, 1_000_000_000_000, 5_000_000_000_000, 10_000_000_000_000,
  50_000_000_000_000, 100_000_000_000_000, 200_000_000_000_000,
  500_000_000_000_000, 1_000_000_000_000_000, 5_000_000_000_000_000,
  10_000_000_000_000_000, 50_000_000_000_000_000, 100_000_000_000_000_000,
  200_000_000_000_000_000, 500_000_000_000_000_000, 1_000_000_000_000_000_000,
  // extra tiers:
  10_000_000_000_000_000_000n, 100_000_000_000_000_000_000n, 1_000_000_000_000_000_000_000n
].map(Number); // coerce to Number for simplicity

const names = [
  "Spark", "Match", "Torch", "Candle", "Campfire", "Bonfire", "Lantern", "Fire Pit", "Blazing Torch",
  "Molten Ember", "Flame Totem", "Inferno", "Lava Pool", "Magma Geyser", "Volcano",
  "Meteor Blaze", "Sun Fragment", "Solar Flare", "Sun Core", "Phoenix Feather",
  "Supernova Spark", "Supernova Core", "Magma Planet", "Inferno Star", "Nebula Fire",
  "Galaxy Flame", "Galactic Forge", "Quasar Blaze", "Quasar Core", "Hypernova",
  "Black Hole Forge", "Cosmic Flame", "Eternal Inferno", "Universe Flame Core",
  "Omniflame", "Cosmic Confluence", "Stellar Furnace"
];

// For each price, alternate per-click/per-second bonuses.
// Bonus sizing: generous, scales with price but capped to avoid overflow.
state.shopItems = priceList.map((price, i) => ({
  name: names[i] || `Upgrade ${i+1}`,
  baseCost: price,
  owned: 0,
  type: (i % 2 === 0) ? "click" : "second",
  add: Math.max(1, Math.floor(price / 10)),   // base additive bonus
  growth: 10                                   // each purchase makes it 10x cost (your jump pattern)
}));

function currentCost(item){
  return Math.floor(item.baseCost * Math.pow(item.growth, item.owned));
}

function recalcTotals(){
  let pc = 1, ps = 0;
  for (const it of state.shopItems){
    if (it.type==="click") pc += it.add * it.owned;
    else ps += it.add * it.owned;
  }
  // Achievements may add multipliers
  state.perClickBase = pc;
  state.perSecondBase = ps;
}

// Effective rates with multipliers
function perClick(){ return Math.max(0, state.perClickBase * state.clickMult); }
function perSecond(){ return Math.max(0, state.perSecondBase * state.secondMult); }

// ======= Achievements (with rewards) =======
const ACH = [
  { id:"first_click",  title:"First Spark", desc:"Make your first click.", when: s=>s.totalClicks>=1, reward: s=>{ s.perClickBase+=1; }, rewardText:"+1 per click" },
  { id:"heat_1k",      title:"Warm Hands", desc:"Earn 1,000 total heat.", when: s=>s.lifetimeHeat>=1e3, reward: s=>{ s.perClickBase+=2; }, rewardText:"+2 per click" },
  { id:"heat_1m",      title:"Heating Up", desc:"Earn 1,000,000 total heat.", when: s=>s.lifetimeHeat>=1e6, reward: s=>{ s.perSecondBase+=50; }, rewardText:"+50 per second" },
  { id:"heat_1b",      title:"On Fire", desc:"Earn 1,000,000,000 total heat.", when: s=>s.lifetimeHeat>=1e9, reward: s=>{ s.perSecondBase+=500; }, rewardText:"+500 per second" },
  { id:"heat_1t",      title:"Inferno", desc:"Earn 1,000,000,000,000 total heat.", when: s=>s.lifetimeHeat>=1e12, reward: s=>{ s.clickMult*=2; }, rewardText:"x2 per click" },
  { id:"heat_1q",      title:"Sun-Touched", desc:"Earn 1 Quadrillion total heat.", when: s=>s.lifetimeHeat>=1e15, reward: s=>{ s.secondMult*=2; }, rewardText:"x2 per second" },
  { id:"clicks_100",   title:"Tap Novice", desc:"Make 100 clicks.", when: s=>s.totalClicks>=100, reward: s=>{ s.perClickBase+=5; }, rewardText:"+5 per click" },
  { id:"clicks_1k",    title:"Tap Pro", desc:"Make 1,000 clicks.", when: s=>s.totalClicks>=1000, reward: s=>{ s.perClickBase+=25; }, rewardText:"+25 per click" },
  { id:"buyer_10",     title:"Shopper", desc:"Buy 10 upgrades.", when: s=>s.upgradesBought>=10, reward: s=>{ s.secondMult*=1.1; }, rewardText:"+10% per second" },
  { id:"buyer_25",     title:"Tycoon", desc:"Buy 25 upgrades.", when: s=>s.upgradesBought>=25, reward: s=>{ s.secondMult*=1.2; }, rewardText:"+20% per second" }
];

// ======= DOM =======
const el = {
  heat: document.getElementById("heat"),
  perClick: document.getElementById("perClick"),
  perSecond: document.getElementById("perSecond"),
  flameBtn: document.getElementById("flameBtn"),
  shop: document.getElementById("shop"),
  shopSearch: document.getElementById("shopSearch"),
  tabs: Array.from(document.querySelectorAll(".tab")),
  tabBodies: {
    achievements: document.getElementById("achievements"),
    stats: document.getElementById("tab-stats"),
  },
  stat: {
    totalHeat: document.getElementById("statTotalHeat"),
    clicks: document.getElementById("statClicks"),
    upgrades: document.getElementById("statUpgrades"),
    time: document.getElementById("statTime"),
    ver: document.getElementById("statVersion")
  },
  popupContainer: document.getElementById("popupContainer"),
  settingsModal: document.getElementById("settingsModal"),
  btnSettings: document.getElementById("btnSettings"),
  toggleSound: document.getElementById("toggleSound"),
  toggleTheme: document.getElementById("toggleTheme"),
  btnReset: document.getElementById("btnReset"),
  btnClose: document.getElementById("btnClose"),
  btnExport: document.getElementById("btnExport"),
  importFile: document.getElementById("importFile")
};

el.stat.ver.textContent = version;

// ======= Save / Load =======
function save(){
  const data = {
    ...state,
    // Only persist necessary props
    achievements: state.achievements,
    shopItems: state.shopItems
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}
function load(){
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return;
  try{
    const data = JSON.parse(raw);
    Object.assign(state, data);
  }catch(_){}
}

// ======= UI Updates =======
function updateStatsUI(){
  el.heat.textContent = fmt(state.heat);
  el.perClick.textContent = fmt(perClick());
  el.perSecond.textContent = fmt(perSecond());
  el.stat.totalHeat.textContent = fmt(state.lifetimeHeat);
  el.stat.clicks.textContent = fmt(state.totalClicks);
  el.stat.upgrades.textContent = fmt(state.upgradesBought);
  const secs = Math.max(0, Math.floor((Date.now() - state.startedAt)/1000));
  const h = Math.floor(secs/3600), m = Math.floor((secs%3600)/60), s = secs%60;
  el.stat.time.textContent = `${h}h ${m}m ${s}s`;
}

function pop(text){
  const d = document.createElement("div");
  d.className = "pop";
  d.textContent = text;
  el.popupContainer.appendChild(d);
  setTimeout(()=> d.remove(), 900);
}

function renderShop(){
  const q = (el.shopSearch.value||"").toLowerCase();
  el.shop.innerHTML = "";
  state.shopItems.forEach((item, idx)=>{
    if (q && !item.name.toLowerCase().includes(q)) return;
    const cost = currentCost(item);
    const canBuy = Math.floor(state.heat) >= cost;
    const card = document.createElement("div");
    card.className = "shop-item";
    card.innerHTML = `
      <h3>${item.name}</h3>
      <div class="row">
        <div class="owned">Owned: ${item.owned}</div>
        <div class="cost">Cost: ${fmt(cost)}</div>
      </div>
      <div class="row">
        <div>${item.type==="click" ? `+${fmt(item.add)} / click` : `+${fmt(item.add)} / sec`}</div>
        <button class="buy" ${canBuy?"":"disabled"}>Buy</button>
      </div>
    `;
    card.querySelector("button.buy").addEventListener("click", ()=>buy(idx));
    el.shop.appendChild(card);
  });
}

function renderAchievements(){
  const ul = el.tabBodies.achievements;
  ul.innerHTML = "";
  ACH.forEach(def=>{
    const li = document.getElementById("tplAchItem").content.firstElementChild.cloneNode(true);
    li.dataset.ach = def.id;
    li.querySelector(".ach-title").textContent = def.title;
    li.querySelector(".ach-desc").textContent = def.desc;
    li.querySelector(".ach-reward").textContent = `Reward: ${def.rewardText}`;
    const got = !!state.achievements[def.id];
    li.querySelector(".ach-status").textContent = got ? "Unlocked" : "Locked";
    li.querySelector(".ach-status").style.color = got ? "var(--good)" : "var(--warn)";
    ul.appendChild(li);
  });
}

// ======= Core Game Logic =======
function clickFlame(){
  const add = perClick();
  state.heat += add;
  state.lifetimeHeat += add;
  state.totalClicks += 1;
  pop(`+${fmt(add)}`);
  updateStatsUI();
  checkAchievements();
  save();
}

function buy(idx){
  const it = state.shopItems[idx];
  const cost = currentCost(it);
  if (Math.floor(state.heat) < cost) return;
  state.heat -= cost;
  it.owned += 1;
  state.upgradesBought += 1;
  recalcTotals();
  updateStatsUI();
  renderShop();
  checkAchievements();
  save();
}

function tick(dt){
  const add = perSecond()*dt;
  state.heat += add;
  state.lifetimeHeat += add;
}

// ======= Achievements Unlocking =======
function checkAchievements(){
  let changed = false;
  ACH.forEach(def=>{
    if (state.achievements[def.id]) return;
    if (def.when(state)){
      state.achievements[def.id] = true;
      // apply reward
      def.reward(state);
      recalcTotals();
      changed = true;
      pop(`🏆 ${def.title}`);
    }
  });
  if (changed){
    renderAchievements();
    updateStatsUI();
    save();
  }
}

// ======= Settings =======
function applyTheme(){
  if (state.settings.lightTheme) document.documentElement.classList.add("light");
  else document.documentElement.classList.remove("light");
}

function resetGame(){
  if (!confirm("Reset ALL progress? This cannot be undone.")) return;
  localStorage.removeItem(SAVE_KEY);
  location.reload();
}

// ======= Tabs =======
document.querySelectorAll(".tab").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".tabbody").forEach(x=>x.classList.remove("active"));
    const target = btn.dataset.tab;
    document.getElementById("tab-"+target).classList.add("active");
  });
});

// ======= Boot =======
load();
recalcTotals();
updateStatsUI();
renderShop();
renderAchievements();

// Settings init
el.btnSettings.addEventListener("click", ()=> el.settingsModal.showModal());
el.btnClose.addEventListener("click", ()=> el.settingsModal.close());
el.toggleSound.checked = !!state.settings.sound;
el.toggleTheme.checked = !!state.settings.lightTheme;
el.toggleSound.addEventListener("change", e=>{
  state.settings.sound = e.target.checked;
  save();
});
el.toggleTheme.addEventListener("change", e=>{
  state.settings.lightTheme = e.target.checked;
  applyTheme(); save();
});
applyTheme();

el.btnReset.addEventListener("click", resetGame);

// Export / Import
el.btnExport.addEventListener("click", ()=>{
  const blob = new Blob([localStorage.getItem(SAVE_KEY) || "{}"], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "flame-clicker-save.json"; a.click();
  URL.revokeObjectURL(url);
});
el.importFile.addEventListener("change", async (e)=>{
  const file = e.target.files?.[0]; if (!file) return;
  const text = await file.text();
  localStorage.setItem(SAVE_KEY, text);
  location.reload();
});

// Search
el.shopSearch.addEventListener("input", renderShop);

// Click + Loop
el.flameBtn.addEventListener("click", clickFlame);

let last = performance.now();
function loop(now){
  const dt = Math.max(0, (now-last)/1000);
  last = now;
  tick(dt);
  updateStatsUI();
  // re-render shop occasionally to update buttons enabled/disabled
  if (Math.floor(now/200)%2===0) renderShop();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

