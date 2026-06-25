//standard screen/base and skilltree screen.
const gameLog = [];
let currentScreen = "base";

function openSkillTree() {
  currentScreen = "skillTree";
  render();
}
function closeSkillTree() {
  currentScreen = "base";
  render();
}

function log(message) {
  gameLog.push(message);

  if (gameLog.length > 20) gameLog.shift();
}

// SPEND DAYPOINTS dp
function spendDP(amount) {
  if (playerState.dayPoints < amount) {
    log("not enough DP.");
    render();
    return false;
  }
  playerState.dayPoints -= amount;
  return true;
}
// USELESS REST FUNCTION subject to change
function rest() {
  if (!spendDP(1)) return;
  const healAmount = 20;
  const energyAmount = 30;
  playerState.hp = Math.min(playerState.maxHp, playerState.hp + healAmount);
  playerState.energy = Math.min(
    playerState.maxEnergy,
    playerState.energy + energyAmount,
  );
  log(`You rest. Recovered ${healAmount} HP and ${energyAmount} Energy.`);
  render();
}
// TRAIN for xp
function train() {//HERE
  if (!spendDP(1)) return;
  const xpGain = 20;
  playerState.experience += xpGain;
  playerState.counters.harnessPow += 1;
  log(`You sharpen your skills. Gained ${xpGain} Experience.`);
  checkLevelUp();
  render();
}
//SCOUT AREA subject to change
function scoutArea() {
  if (!spendDP(1)) return;
  const nextArea = getNextAreaIndex();

  if (nextArea === -1) {
    log("Nothing left to scout.");
  } else {
    log(
      `you scout the surroundings of Area ${nextArea + 1}. More info coming soon..`,
    );
  }
  render();
}
// TRAVEL subject to change
function travelToNextArea() {
  if (!spendDP(1)) return;
  const nextArea = getNextAreaIndex();
  if (nextArea === -1) {
    log("All areas have been conquered.");
    render();
    return;
  }
  playerState.currentArea = nextArea;
  log(`You travel to area ${nextArea + 1}.`);
  startCombat(nextArea);
  render();
}
//END DAY
function endDay() {
  playerState.day += 1;
  playerState.dayPoints = playerState.maxDayPoints;
  playerState.currentArea = null;
  degradeAncestorHappiness();
  log(`Day ${playerState.day} begins.`);
  autoSave();
  render();
}
//-----WORLD HELPERS
//subject to change
function getNextAreaIndex() {
  return playerState.areasConquered.indexOf(false);
}

// CHECK LVLUP
function checkLevelUp() {
  while (playerState.experience >= playerState.level * 100) {
    playerState.experience -= playerState.level * 100;
    playerState.level++;
    playerState.skillPoints += 1;
    playerState.statPoints += 2;

    const d = getDerivedStats(playerState.stats);
    playerState.maxHp = d.maxHp;
    playerState.maxEnergy = d.maxEnergy;
    playerState.hp = d.maxHp;
    playerState.energy = d.maxEnergy;

    log(
      `level up! you are now level ${playerState.level}. Gained 1 skillpoint and 2 statpoints.`,
    );
  }
}
//SPEND STATPOINTS
function spendStatPoint(statName) {
  if (playerState.statPoints <= 0) {
    log("No stat points to spend.");
    return;
  }
  playerState.stats[statName] += 1;
  playerState.statPoints -= 1;
  const d = getDerivedStats(playerState.stats);
  playerState.maxHp = d.maxHp;
  playerState.maxEnergy = d.maxEnergy;

  playerState.hp = Math.min(playerState.hp, playerState.maxHp);
  playerState.energy = Math.min(playerState.energy, playerState.maxEnergy);
  log(`${statName} increased to ${playerState.stats[statName]}.`);
  render();
}

log("Welcome to the demo. This is my first project in JS.");
log(
  "Talk to the mayor to get to inner city. Some businesses are available for testing. Some combat encounters are available. skill tree is functional. ",
);
render();
