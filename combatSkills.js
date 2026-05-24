function canAffordSkill(key) {
  const skill = COMBAT_SKILLS[key];
  const combat = playerState.combat;

  if (combat.actionPoints < skill.apCost) return false;

  //timedabble limit turn use without c6
  if (key === "c3" && playerState.skills.c6 && combat.timeDabbleUses >= 1) {
    return false;
  }

  const cost = skill.cost;
  if (cost.type === "energy") {
    //TIMEDABBLE COST SCALING
    const amount = key === "c3" ? 20 + combat.timeDabbleUses * 20 : cost.amount;
    if (playerState.energy < amount) return false;
  }
  if (cost.type === "hpMax") {
    //PREVENT SUICIDE BY HPCOST
    if (playerState.hp <= Math.floor(playerState.maxHp * cost.pct))
      return false;
  }
  if (cost.type === "hpCurrent") {
    if (playerState.hp <= Math.floor(playerState.hp * cost.pct)) return false;
  }
  return true;
}

// Pay4 kinds of Skills
function paySkillCost(key) {
  const skill = COMBAT_SKILLS[key];
  const combat = playerState.combat;

  combat.actionPoints -= skill.apCost;
  const cost = skill.cost;
  //TIMEDABBLE
  if (cost.type === "energy") {
    const amount = key === "c3" ? 20 + combat.timeDabbleUses * 20 : cost.amount;
    playerState.energy -= amount;
  }
  //HP max and current % cost
  if (cost.type === "hpMax") {
    playerState.hp -= Math.floor(playerState.maxHp * cost.pct);
  }
  if (cost.type === "hpCurrent") {
    playerState.hp -= Math.floor(playerState.hp * cost.pct);
  }
} //hereIam

//cost display 4 render
function getCostDisplay(key) {
  const skill = COMBAT_SKILLS[key];
  const combat = playerState.combat;
  const parts = [`${skill.apCost}AP`];

  const cost = skill.cost;
  if (cost.type === "energy") {
    const amount = key === "c3" ? 20 + combat.timeDabbleUses * 20 : cost.amount;
    parts.push(`${amount}EN`);
  }
  if (cost.type === "hpMax") parts.push(`${cost.pct * 100}% maxHP`);
  if (cost.type === "hpCurrent") parts.push(`${cost.pct * 100}% HP`);

  return `(${parts.join(",")})`;
}

//Alive enemy index
function getAliveEnemy(index) {
  const enemy = playerState.combat.enemies[index];
  if (!enemy || !enemy.isAlive()) {
    combatLog("That enemy is defeated.");
    return null;
  }
  return enemy;
}

// Activated skills definitions
const COMBAT_SKILLS = {
  //FORCE BRANCH
  a1: {
    name: "One Two Combo",
    apCost: 1,
    cost: { type: "energy", amount: 20 },
    needsTarget: true,
    execute(targetIndex) {
      const target = getAliveEnemy(targetIndex);
      if (!target) return;
      combatLog("One Two Combo!");
      triggerStrike(target);
      if (target.isAlive()) triggerStrike(target);
    },
  },
  a3: {
    name: "Spike Adrenaline",
    apCost: 1,
    cost: { type: "hpMax", pct: 0.05 },
    needsTarget: false,
    execute() {
      playerState.combat.actionPoints += 2;
      combatLog("Spike Adrenaline: Gained 2 AP!");
    },
  },
  a4: {
    name: "Might Cranial Strike",
    apCost: 1,
    cost: { type: "energy", amount: 30 },
    needsTarget: true,
    execute(targetIndex) {
      const target = getAliveEnemy(targetIndex);
      if (!target) return;
      const p = playerState;
      const damage = Math.floor(
        p.level * 2 + 15 + p.stats.strength * 1.5 + p.stats.dexterity / 2,
      );
      applyDamageToEnemy(target, damage);
      combatLog(`Mighty Cranial Strike hits ${target.name} for ${damage}!`);
      checkEnemiesDead();
    },
  },
  a7: {
    name: "Power Smash",
    apCost: 1,
    cost: { type: "hpCurrent", pct: 0.15 },
    needsTarget: true,
    execute(targetIndex) {
      const target = getAliveEnemy(targetIndex);
      if (!target) return;
      const p = playerState;
      const damage = Math.floor(
        p.level * 2 +
          50 +
          p.stats.strength * 2 +
          p.stats.vitality * 2 +
          p.stats.dexterity / 2,
      );
      applyDamageToEnemy(target, damage);
      combatLog(`Power Smash hits ${target.name} dealing ${damage}!`);
      checkEnemiesDead();
    },
  },
  // DISICPILINE BRANCH
  b1: {
    name: "Defensive Strike",
    apCost: 1,
    cost: { type: "energy", amount: 20 },
    needsTarget: true,
    execute(targetIndex) {
      const target = getAliveEnemy(targetIndex);
      if (!target) return;
      const p = playerState;
      triggerStrike(target);
      const block = Math.floor(
        p.level + 10 + p.stats.dexterity / 2 + p.stats.resilience * 2,
      );
      playerState.combat.block += block;
      combatLog(`Defensive Strike: Gained ${block} block.`);
    },
  },
  b3: {
    name: "Engaging Strike",
    apCost: 1,
    cost: { type: "energy", amount: 40 },
    needsTarget: true,
    execute(targetIndex) {
      const target = getAliveEnemy(targetIndex);
      if (!target) return;
      triggerStrike(target);
      triggerAlertStance();
    },
  },
  b4: {
    name: "Flurry",
    apCost: 1,
    cost: { type: "energy", amount: 40 },
    needsTarget: true,
    execute(targetIndex) {
      const target = getAliveEnemy(targetIndex);
      if (!target) return;
      combatLog("Flurry!");
      for (let i = 0; i < 4; i++) {
        if (!target.isAlive()) break;
        triggerStrike(target);
      }
    },
  },
  b7: {
    name: "Evasive Maneuver",
    apCost: 1,
    cost: { type: "energy", amount: 20 },
    needsTarget: false,
    execute() {
      const p = playerState;
      const block = Math.floor(
        10 + p.stats.dexterity * 2 + p.stats.resilience * 3,
      );
      playerState.combat.block += block;
      combatLog(`Evasive Maneuver: Gained ${block} block.`);
    },
  },
  //SPIRIT BRANCH
  c1: {
    name: "Pulsating Forcefield",
    apCost: 1,
    cost: { type: "energy", amount: 15 },
    needsTarget: true,
    execute(targetIndex) {
      const target = getAliveEnemy(targetIndex);
      if (!target) return;
      triggerForcefield(target);
    },
  },
  c2: {
    name: "Focus Mind",
    apCost: 1,
    cost: { type: "none" },
    needsTarget: false,
    execute() {
      const p = playerState;
      const gain = Math.floor(
        p.level + 10 + p.stats.intellect * 2 + p.stats.willpower * 2,
      );
      playerState.energy = Math.min(
        playerState.maxEnergy,
        playerState.energy + gain,
      );
      combatLog(`Focus Mind: Gained ${gain} energy.`);
      triggerAccumulateEnergy();
    },
  },
  c3: {
    name: "Time Dabble", //subject to change!
    apCost: 1,
    cost: { type: "energy", amount: 20 },
    needsTarget: false,
    execute() {
      const combat = playerState.combat;
      combat.actionPoints += 2;
      combat.timeDabbleUses += 1;
      const nextCost = 20 + combat.timeDabbleUses * 20;
      combatLog(`Time Dabble: +2 AP! Next use costs ${nextCost} Energy.`);
    },
  },
  c4: {
    name: "Chi Blast",
    apCost: 1,
    cost: { type: "energy", amount: 40 },
    needsTarget: true,
    execute(targetIndex) {
      const target = getAliveEnemy(targetIndex);
      if (!target) return;
      const p = playerState;
      const damage = Math.floor(
        p.level * 2 + p.stats.intellect * 2 + p.stats.willpower * 2,
      );
      applyDamageToEnemy(target, damage);
      combatLog(`Chi Blast hits target ${target.name} for ${damage}!`);
      checkEnemiesDead();
    },
  },
  c7: {
    name: "Energy Harvest",
    apCost: 1,
    cost: { type: "energy", amount: 30 },
    needsTarget: true,
    execute(targetIndex) {
      const target = getAliveEnemy(targetIndex);
      if (!target) return;
      combatLog("Energy Harvest!");
      triggerForcefield(target);
      if (playerState.skills.bc2 && target.isAlive()) triggerForcefield(target);
      triggerAccumulateEnergy();
    },
  },

  // CROSS BRANCH
  ab1: {
    name: "Sweeping flurry",
    apCost: 1,
    cost: { type: "energy", amount: 60 },
    needsTarget: false,
    execute() {
      const alive = playerState.combat.enemies.filter((e) => e.isAlive());
      combatLog("Sweeping Flurry - Striking all enemies!");
      for (const enemy of alive) {
        if (!enemy.isAlive()) continue;
        combatLog(`  > ${enemy.name}:`);
        for (let i = 0; i < 4; i++) {
          if (!enemy.isAlive()) break;
          triggerStrike(enemy);
        }
      }
    },
  },
  bc1: {
    name: "Spiritual Trickery",
    apCost: 1,
    cost: { type: "none" },
    needsTarget: false,
    execute() {
      const p = playerState;
      const block = Math.floor(
        p.stats.dexterity +
          p.stats.resilience * 2 +
          p.stats.willpower / 2 +
          p.stats.intellect / 2,
      );
      playerState.combat.block += block;
      combatLog(`Spiritual Trickery: Gained ${block} block.`);
      triggerAccumulateEnergy();
      triggerAccumulateEnergy();
    },
  },
};
