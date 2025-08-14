let heat = 0;
let perClick = 1;
let perSecond = 0;

// Full price list from your request
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

// Names for upgrades
const names = [
  "Torch", "Candle", "Campfire", "Bonfire", "Lantern", "Fire Pit", "Blazing Torch",
  "Molten Ember", "Flame Totem", "Inferno", "Lava Pool", "Magma Geyser", "Volcano",
  "Firestorm", "Meteor Blaze", "Sun Fragment", "Solar Flare", "Sun Core",
  "Phoenix Feather", "Supernova Spark", "Supernova Core", "Magma Planet",
  "Inferno Star", "Nebula Fire", "Galaxy Flame", "Galactic Forge", "Quasar Blaze",
  "Quasar Core", "Hypernova", "Black Hole Forge", "Cosmic Flame", "Eternal Inferno",
  "Universe Flame Core", "Omniflame"
];

// Build shop items
let shopItems = priceList.map((price, i) => ({
  name: names[i] || `Upgrade ${i+1}`,
  cost: price,
  perClick: i % 2 === 0 ? Math.floor(price / 10) : 0,
  perSecond: i % 2 === 1 ? Math.floor(price / 10) : 0,
  owned: 0
}));

// Load save if exists
if (localStorage.getItem("flameSave")) {
  let save = JSON.parse(localStorage.getItem("flameSave"));
  heat = save.heat;
  perClick = save.perClick;
  perSecond = save.perSecond;
  shopItems = save.shopItems;
}

document.getElementById("flame").onclick = () => {
  heat += perClick;
  updateDisplay();
  saveGame();
};

function renderShop() {
  const shopDiv = document.getElementById("shop");
  shopDiv.innerHTML = "<h2>Shop</h2>";
  shopItems.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "shop-item";
    div.innerHTML = `
      <strong>${item.name}</strong> (Owned: ${item.owned})<br>
      Cost: ${formatNumber(item.cost)}<br>
      ${item.perClick ? `+${formatNumber(item.perClick)} per click` : ""}
      ${item.perSecond ? `+${formatNumber(item.perSecond)} per sec` : ""}<br>
      <button ${heat < item.cost ? "disabled" : ""}>Buy</button>
    `;
    div.querySelector("button").onclick = () => buyUpgrade(index);
    shopDiv.appendChild(div);
  });
}

function buyUpgrade(index) {
  let item = shopItems[index];
  if (heat >= item.cost) {
    heat -= item.cost;
    item.owned++;
    perClick += item.perClick;
    perSecond += item.perSecond;
    updateDisplay();
    renderShop();
    saveGame();
  }
}

// Passive income
setInterval(() => {
  heat += perSecond;
  updateDisplay();
  saveGame();
}, 1000);

function updateDisplay() {
  document.getElementById("heat").textContent = formatNumber(heat);
  document.getElementById("perClick").textContent = formatNumber(perClick);
  document.getElementById("perSecond").textContent = formatNumber(perSecond);
}

function saveGame() {
  localStorage.setItem("flameSave", JSON.stringify({
    heat,
    perClick,
    perSecond,
    shopItems
  }));
}

function formatNumber(num) {
  const units = ["", "K", "M", "B", "T", "Q"];
  let unitIndex = 0;
  while (num >= 1000 && unitIndex < units.length - 1) {
    num /= 1000;
    unitIndex++;
  }
  return num.toFixed(2).replace(/\.00$/, "") + units[unitIndex];
}

renderShop();
updateDisplay();

