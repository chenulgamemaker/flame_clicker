let heat = 0;
let perClick = 1;
let upgradeCost = 10;

// Load saved data if it exists
if (localStorage.getItem("flameData")) {
  let saved = JSON.parse(localStorage.getItem("flameData"));
  heat = saved.heat;
  perClick = saved.perClick;
  upgradeCost = saved.upgradeCost;
}

document.getElementById('flame').onclick = () => {
  heat += perClick;
  saveGame();
  updateDisplay();
};

document.getElementById('upgrade').onclick = () => {
  if (heat >= upgradeCost) {
    heat -= upgradeCost;
    perClick++;
    upgradeCost = Math.floor(upgradeCost * 1.5);
    saveGame();
    updateDisplay();
  }
};

function updateDisplay() {
  document.getElementById('heat').textContent = heat;
  document.getElementById('upgrade').textContent = `Buy Torch (cost: ${upgradeCost} heat)`;
}

function saveGame() {
  let gameData = {
    heat: heat,
    perClick: perClick,
    upgradeCost: upgradeCost
  };
  localStorage.setItem("flameData", JSON.stringify(gameData));
}

// Initial display update
updateDisplay();
