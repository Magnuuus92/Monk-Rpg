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
//strike() dmg + b5 bonus and flatbonus formula
function calcStrikeDamage(flatBonus = 0) {
  const p = playerState;
  const base = Math.floor(
    p.level + 1 + p.stats.strength / 2 + p.stats.dexterity / 2,
  );
  const b5 = playerState.skills.b5 ? p.stats.resilience : 0;
  return base + b5 + flatBonus;
}
//per turn energy gain and used for accumulateEnergy
function calcEnergyGain() {
  const p = playerState;
  let gain = Math.max(
    1,
    Math.round(p.level / 10 + p.stats.willpower / 5 + p.stats.intellect / 5),
  );
  if (playerState.skills.c5) {
    gain += Math.round(p.stats.willpower / 5 + p.stats.intellect / 5);
  }
  return gain;
}
//TRIGGER FUNCTIONS:
//Strike (a1,b1,b3,b4 and ab1) and basick attack.
function triggerStrike(target) {
  const combat = playerState.combat;
  //Master of DISICPILINe (r2): stacking flatdmg per 2nd strike.
  combat.strikeCount += 1;
  if (playerState.skills.r2 && combat.strikeCount % 2 === 0) {
    combat.flatDmgBonus += 1;
    combatLog(
      `Master of Discipline: +1 flat damage (Total: ${combat.flatDmgBonus}).`,
    );
  }
  const damage = calcStrikeDamage(combat.flatDmgBonus);
  applyDamageToEnemy(target, damage);
  combatLog(`Strike hits ${target.name} for ${damage}.`);
  //marvelous (a2) energy gain per hit
  if (playerState.skills.a2 && target.isAlive()) {
    const p = playerState;
    const gain = Math.floor(
      1 + p.level / 5 + p.stats.willpower / 5 + p.stats.vitality / 5,
    );
    playerState.energy = Math.min(
      playerState.maxEnergy,
      playerState.energy + gain,
    );
    combatLog(`Marvelous: +${gain} energy.`);
    checkEnemiesDead();
  }
}
function triggerForcefield(target) {
  const p = playerState;
  const damage = Math.floor(
    p.level + 5 + p.stats.intellect + p.stats.willpower / 2,
  );
  const block = Math.floor(
    p.level + p.stats.intellect + p.stats.willpower + p.stats.resilience / 2,
  );
  applyDamageToEnemy(target, damage);
  playerState.combat.block += block;
  combatLog(
    `Forcefield: ${damage} dmg to ${target.name}, you gained ${block} block.`,
  );
  checkEnemiesDead();
}
//Accumulate ENergy (c2, c7 and bc1)
function triggerAccumulateEnergy() {
  const gain = calcEnergyGain();
  ((playerState.combat.accumulatedEnergy += gain),
    combatLog(
      `Energy accumulated: +${gain}. (Total Pool: ${playerState.combat.accumulatedEnergy}).`,
    ));
}
//ALERT STANCE
function triggerAlertStance() {
  playerState.combat.alertStance = true;
  combatLog("Alert Stance: 40% chance to retaliate when struck.");
}
//-----SKILL ACTIVATION
//SELECT SKILL
function selectSkill(key) {
  const skill = COMBAT_SKILLS[key];
  if (!skill) return;
  if (!canAffordSkill(key)) {
    combatLog("Cannot afford skill.");
    render();
    return;
  }
  if (skill.needsTarget) {
    playerState.combat.pendingSkill = key;
    combatLog(`${skill.name} - click a target.`);
    render();
  } else {
    useSkill(key, null);
  }
}
//pay cost and run execute
function useSkill(key, targetIndex) {
  if (!COMBAT_SKILLS[key]) return;
  if (!canAffordSkill(key)) {
    combatLog("Cannot afford this skill.");
    render();
    return;
  }
  paySkillCost(key);
  COMBAT_SKILLS[key].execute(targetIndex);
  checkAp();
  render();
}
//cancel pending skill
function cancelSkill() {
  playerState.combat.pendingSkill = null;
  combatLog("Skill cancelled.");
  render();
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
function train() {
  if (!spendDP(1)) return;
  const xpGain = 1000;
  playerState.experience += xpGain;
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
  log(`Day ${playerState.day} begins.`);
  render();
}
//-----WORLD HELPERS
//subject to change
function getNextAreaIndex() {
  return playerState.areasConquered.indexOf(false);
}

function checkLevelUp() {
  const lvlVal = 0;
  const xpNeeded = playerState.level * 100;
  forEach(playerState.experience >= xpNeeded);
  {
    playerState.experience - xpNeeded;
    return lvlVal++;
  }
  forEach(lvlVal > 0);
  {
    playerState.level++;
    playerState.skillPoints += 1;
    playerState.statPoints += 2;
    return;
  }
  const d = getDerivedStats(playerState.stats);
  playerState.maxHp = d.maxHp;
  playerState.maxEnergy = d.maxEnergy;
  playerState.hp = d.maxHp;
  playerState.energy = d.maxEnergy;

  log(
    `level up! you are now level ${playerState.level}. Gained 1 skillpoint and 2 statpoints.`,
  );
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
// COMBAT START
function startCombat(areaIndex) {
  playerState.hp = playerState.maxHp;
  playerState.energy = playerState.maxEnergy;
  const enemies = buildEncounter(areaIndex);
  playerState.combat = {
    enemies: enemies,
    turn: 1,
    actionPoints: 2,
    maxAp: 2,
    alertStance: false,
    result: null,
    block: 0,
    blockCarryover: 0,
    strikeCount: 0,
    flatDmgBonus: 0,
    timeDabbleUses: 0,
    pendingSkill: null,
    accumulatedEnergy: 0,
    log: [`Combat begins. Turn 1.`],
  };
  render();
}

function endCombat(victory) {
  // change this after enemies are made. xp and gold reward determined by enemies.
  if (victory) {
    const xpReward = 50 * (playerState.currentArea + 1);
    const goldReward = 10 * (playerState.currentArea + 1);
    playerState.experience += xpReward;
    playerState.gold += goldReward;
    log(`Victory! Gained ${xpReward} Exp and ${goldReward} gold.`);
    checkLevelUp();
    playerState.areasConquered[playerState.currentArea] = true;
  } else {
    log("Defeated you respawn at base.");
    playerState.hp = Math.floor(playerState.maxHp * 0.5);
  }
  playerState.combat = null;
  playerState.currentArea = null;
  render();
}
//COMBAT PLAYER ACTIONS
function spendAp(amount) {
  if (playerState.combat.actionPoints < amount) {
    log("Not enough Ap.");
    render();
    return false;
  }
  playerState.combat.actionPoints -= amount;
  return true;
}
function combatLog(message) {
  playerState.combat.log.push(message);
  if (playerState.combat.log.length > 30) playerState.combat.log.shift();
}
// basic attack or execute pending skill
function playerStrike(enemyIndex) {
  const combat = playerState.combat;
  //execute pending skill by clicking enemy
  if (combat.pendingSkill) {
    const key = combat.pendingSkill;
    combat.pendingSkill = null;
    useSkill(key, enemyIndex);
    return;
  }
  // basic attack(trigger strike)
  if (!spendAp(1)) return;
  const enemy = getAliveEnemy(enemyIndex);
  if (!enemy) {
    render();
    return;
  }
  triggerStrike(enemy);
  checkAp();
  render();
}
function playerEndTurn() {
  combatLog("Ending player turn.");
  checkEnemiesDead();
  enemyTurn();
}

//ENEMY TURN COMBAT
function enemyTurn() {
  const combat = playerState.combat;
  const enemies = combat.enemies.filter((e) => e.isAlive());
  for (const enemy of enemies) {
    let ap = enemy.maxAp;
    while (ap > 0) {
      const moveKey =
        enemy.moves[Math.floor(Math.random() * enemy.moves.length)];
      const move = ENEMY_MOVES[moveKey];

      if (!move) {
        ap--;
        continue;
      }

      if (moveKey === "motivate") {
        const allies = enemies.filter((e) => e !== enemy && e.isAlive());
        if (allies.length > 0) {
          const t = allies[Math.floor(Math.random() * allies.length)];
          t.str += 1;
          combatLog(`${enemy.name} motivates ${t.name} (+1 to STR).`);
        } else {
          combatLog(
            `${enemy.name} tries to motivate, but sadly has no allies left.`,
          );
        }
      } else if (moveKey === "block") {
        move.execute(enemy, playerState);
        combatLog(`${enemy.name} blocks.`);
      } else {
        const result = move.execute(enemy, playerState);
        combatLog(result);

        if (combat.alertStance && playerState.hp > 0) {
          const threshold = playerState.skills.ab3 ? 0.55 : 0.4;
          const roll = Math.random();
          if (roll < threshold) {
            combatLog(`Alert! you retaliate against ${enemy.name}!`);
            triggerStrike(enemy);
          } else {
            combatLog(`Alert stance - No retaliations triggered.`);
          }
        }
      }
      ap--;
      if (playerState.hp <= 0) break;
    }
    if (playerState.hp <= 0) break;
  }
  //player defeated during combat on enemy turn
  if (playerState.hp <= 0) {
    combatLog("You have been defeated.");
    combat.result = "defeat";
    render();
    return;
  }
  //DEFENSIVE STATE OF MIND (b6/bc2) carry over %block
  if (playerState.skills.b6 && combat.block > 0) {
    const pct = playerState.skills.bc2 ? 0.7 : 0.4;
    const carryover = Math.floor(combat.block * pct);
    combat.blockCarryover = carryover;
    combatLog(`You retain ${carryover} from your unused block.`);
  }
  startNextPlayerTurn();
}
// COMBAT - TURN MANAGEMENT
function startNextPlayerTurn() {
  const combat = playerState.combat;
  const p = playerState;

  combat.turn += 1;
  combat.actionPoints = combat.maxAp;
  combat.alertStance = false;
  combat.timeDabbleUses = 0;
  //BLOCK CARRYOVER
  combat.block = combat.blockCarryover;
  combat.blockCarryover = 0;
  // DIEHARD a5
  if (playerState.skills.a5 && p.hp < p.maxHp * 0.3) {
    const heal = Math.floor(p.maxHp * 0.12);
    p.hp = Math.min(p.maxHp, p.hp + heal);
    combatLog(`Die Hard: You're not dying yet.. +${heal} HP.`);
  }
  //INspired by the elements (b2)
  if (playerState.skills.b2) {
    const block = Math.floor(
      p.stats.dexterity + p.level / 2 + p.stats.resilience,
    );
    combat.block += block;
    combatLog(`The elements inspire you.. +${block}Block.`);
  }
  //passive energy gain
  const energyGain = calcEnergyGain() + combat.accumulatedEnergy;
  p.energy = Math.min(p.maxEnergy, p.energy + energyGain);
  combatLog(
    `Turn: ${combat.turn}. You gain ${energyGain} Energy. Block: ${combat.block}.`,
  );
  render();
}

// End turn at 0 ap subject to change
function checkAp() {
  if (playerState.combat && playerState.combat.actionPoints <= 0) {
    combatLog("No ap remaining.");
    enemyTurn(); // subject to change.
  }
}
//check for dead enemies. if all dead victory
function checkEnemiesDead() {
  const combat = playerState.combat;
  combat.enemies.forEach((e) => {
    if (e.hp <= 0 && e.hp !== -999) {
      combatLog(`${e.name} is deafeated.`);
      e.hp = -999;
    }
  });
  if (combat.enemies.every((e) => !e.isAlive())) {
    combatLog("ALL enemies have been defeated!");
    combat.result = "victory";
  }
}
//apply damage to enemy  after removing block
function applyDamageToEnemy(enemy, rawDamage) {
  if (enemy.block > 0) {
    const blocked = Math.min(enemy.block, rawDamage);
    enemy.block -= blocked;
    rawDamage -= blocked;
    if (blocked > 0) combatLog(`${enemy.name} blocks ${blocked} damage.`);
  }
  enemy.hp = Math.max(0, enemy.hp - rawDamage);
}

function fightTestDummy() {
  playerState.currentArea = 0;
  const enemies = [
    createEnemy(SHADOW_CLAN.scTestDummy),
    createEnemy(SHADOW_CLAN.scTestDummy),
  ];
  playerState.hp = playerState.maxHp;
  playerState.energy = playerState.maxEnergy;
  playerState.combat = {
    enemies: enemies,
    turn: 1,
    actionPoints: 2,
    maxAp: 2,
    alertStance: false,
    result: null,
    block: 0,
    blockCarryover: 0,
    strikeCount: 0,
    flatDmgBonus: 0,
    timeDabbleUses: 0,
    pendingSkill: null,
    accumulatedEnergy: 0,
    log: [`testing turn 1`],
  };
  render();
}

log("Welcome to the base camp. Choose your action.");
render();
