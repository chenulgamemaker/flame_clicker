let heat = 0;
let perClick = 1;
let perSecond = 0;

let shopItems = [
  { name: "Torch", cost: 10, perClick: 1, perSecond: 0, owned: 0 },
  { name: "Bonfire", cost: 50, perClick: 0, perSecond: 1, owned: 0 },
  { name: "Lava Pool", cost: 200, perClick: 5, perSecond: 0, owned: 0 },
  { name: "Forge", cost: 500, perClick: 0, perSecond: 5, owned: 0 },
  { name: "Volcano", cost: 2000, perClick: 0, perSecond: 20, owned: 0 },
  { name: "Firestorm", cost: 5000, perClick: 50, perSecond: 0, owned: 0 },
  { name: "Sun Core", cost: 20000, perClick: 0, perSecond: 500, owned: 0 },
  { name: "Phoenix Feather", cost: 100000, perClick: 5000, perSecond: 0, owned: 0 }
];

// Load saved game
if (localStorage.getItem("flameData")) {
  let saved = JSON.parse(localStorage.getItem("flameData"));
  heat = saved.heat;
  perClick = saved.perClick;
  perSecond = saved.perSecond;
  shopItems = saved.shopItems;
}

document.getElementById('flame').onclick = () => {
  heat += perClick;
  saveGame();
  updateDisplay();
};

// Shop rendering
function renderShop() {
  const shopDiv = document.getElementById('shop');
  shopDiv.innerHTML = '';
  shopItems.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'shop-item';
    div.innerHTML = `
      <strong>${item.name}</strong> (Owned: ${item.owned})<br>
      Cost: ${item.cost} heat<br>
      +${item.perClick} per click, +${item.perSecond} per second<br>
      <button onclick="buyItem(${index})">Buy</button>
    `;
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
    item.cost = Math.floor(item.cost * 1.5);
    saveGame();
    updateDisplay();
    renderShop();
  }
}

// Passive income
setInterval(() => {
  heat += perSecond;
  saveGame();
  updateDisplay();
}, 1000);

function updateDisplay() {
  document.getElementById('heat').textContent = heat;
}

function saveGame() {
  let gameData = {
    heat,
    perClick,
    perSecond,
    shopItems
  };
  localStorage.setItem("flameData", JSON.stringify(gameData));
}

renderShop();
updateDisplay();

