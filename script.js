let heat = 0;
let perClick = 1;
let perSecond = 0;

// Price sequence you wanted
const priceList = [
  10, 50, 100, 1_000, 5_000, 10_000, 50_000, 100_000, 500_000,
  1_000_000, 10_000_000, 100_000_000, 500_000_000, 1_000_000_000,
  5_000_000_000, 10_000_000_000, 50_000_000_000, 100_000_000_000,
  500_000_000_000, 1_000_000_000_000, 5_000_000_000_000,
  10_000_000_000_000, 50_000_000_000_000, 100_000_000_000_000,
  200_000_000_000_000, 500_000_000_000_000, 1_000_000_000_000_000,
  5_000_000_000_000_000, 10_000_000_000_000_000,
  50_000_000_000_000_000, 100_000_000_000_000_000,
  200_000_000_000_000_000, 500_000_000_000_000_000,
  1_000_000_000_000_000_000
];

// Fire-themed upgrades
let shopItems = priceList.map((price, i) => ({
  name: [
    "Torch", "Candle", "Campfire", "Bonfire", "Lantern", "Fire Pit", "Blazing Torch",
    "Molten Ember", "Flame Totem", "Inferno", "Lava Pool", "Magma Geyser", "Volcano",
    "Firestorm", "Meteor Blaze", "Sun Fragment", "Solar Flare", "Sun Core",
    "Phoenix Feather", "Supernova Spark", "Supernova Core", "Magma Planet",
    "Inferno Star", "Nebula Fire", "Galaxy Flame", "Galactic Forge", "Quasar Blaze",
    "Quasar Core", "Hypernova", "Black Hole Forge", "Cosmic Flame", "Eternal Inferno",
    "Universe Flame Core", "Omniflame"
  ][i] || `Upgrade ${i+1}`,
  cost: price,
  perClick: i % 2 === 0 ? Math.pow(10, i) : 0, // alternate click/sec upgrades
  perSecond: i % 2 === 1 ? Math.pow(10, i) : 0,
  owned: 0
}));

// Load save
if (localStorage.getItem("flameData")) {
  let saved = JSON.parse(localStorage.getItem("flameData"));
  heat = saved.heat;
  perClick = saved.perClick;
  perSecond = saved.perSecond;
  shopItems = saved.shopItems;
}

document.getElementById("flame").onclick = () => {
  heat += perClick;
  saveGame();
  updateDisplay();
};

function renderShop() {
  const shopDiv = document.getElementById("shop");
  shopDiv.innerHTML = "";
  shopItems.forEach((item, index) => {
    if (heat < item.cost && item.owned === 0) return; // hide until first affordable
    const div = document.createElement("div");
    div.className = "shop-item";
    div.innerHTML = `
      <strong>${item.name}</strong> (Owned: ${item.owned})<br>
      Cost: ${fmt(item.cost)}<br>
      ${item.perClick ? `+${fmt(item.perClick)} per click` : ""}
      ${item.perSecond ? `+${fmt(item.perSecond)} per sec` : ""}<br>
      <button ${heat < item.cost ? "disabled" : ""}>Buy</button>
    `;
    div.querySelector("button").onclick = () => buyItem(index);
    shopDiv.appendChild(div);
  });
}

function buyItem(index) {
  let item = shopItems[index];
  if (heat >= item.cost) {
    heat -= item.cost;
    perClick += item.perClick;
    perSecond += item.perSecond;
    item.owned++;
    saveGame();
    updateDisplay();
    renderShop();
  }
}

setInterval(() => {
  heat += perSecond;
  saveGame();
  updateDisplay();
}, 1000);

function updateDisplay() {
  document.getElementById("heat").textContent = fmt(heat);
}

function saveGame() {
  localStorage.setItem("flameData", JSON.stringify({
    heat,
    perClick,
    perSecond,
    shopItems
  }));
}

// Format numbers
function fmt(num) {
  if (num >= 1e15) return (num/1e15).toFixed(2) + "Q";
  if (num >= 1e12) return (num/1e12).toFixed(2) + "T";
  if (num >= 1e9) return (num/1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num/1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num/1e3).toFixed(2) + "K";
  return Math.floor(num);
}

renderShop();
updateDisplay();
