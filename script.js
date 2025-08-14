let heat = 0;
let perClick = 1;
let upgradeCost = 10;

document.getElementById('flame').onclick = () => {
  heat += perClick;
  updateDisplay();
};

document.getElementById('upgrade').onclick = () => {
  if (heat >= upgradeCost) {
    heat -= upgradeCost;
    perClick++;
    upgradeCost = Math.floor(upgradeCost * 1.5);
    updateDisplay();
  }
};

function updateDisplay() {
  document.getElementById('heat').textContent = heat;
  document.getElementById('upgrade').textContent = `Buy Torch (cost: ${upgradeCost} heat)`;
}
