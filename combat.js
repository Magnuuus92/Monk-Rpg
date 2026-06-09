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
        // copy just with supply arm +3
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
        if (moveKey === "supplyArmaments") {
          const allies = enemies.filter((e) => e !== enemy && e.isAlive());
          if (allies.length > 0) {
            const t = allies[Math.floor(Math.random() * allies.length)];
            t.str += 3;
            combatLog(
              `${enemy.name} supplies ${t.name} with weaponry (+3 to STR).`,
            );
          } else {
            combatLog(
              `${enemy.name} tries to support his allies, but sadly has no allies left.`,
            );
          }
        }
      } else if (moveKey === "block") {
        move.execute(enemy, playerState);
        combatLog(`${enemy.name} blocks.`);
      } else if (moveKey === "guard") {
        move.execute(enemy, playerState);
        combatLog(`${enemy.name} guards.`);
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
  //prepared (r1)
  if (playerState.skills.r1) {
    const block = p.stats.resilience;
    const energy = Math.floor(p.stats.willpower / 2);
    const hp = Math.floor(p.stats.vitality / 3);
    combat.block += block;
    combat.energy += Math.min(combatEnergyCap(), p.energy + energy);
    combat.hp += Math.min(combatHpCap(), p.hp + hp);
    combatLog(`Prepared: +${block} block, +${energy} energy and +${hp} HP.`);
  }
  // unlocked pendant (r5)
  if (playerState.skills.r5) {
    combat.block + 10;
    combatLog(`Unlocked pendant: +10 block.`);
  }
  //passive energy gain + accumulated energy
  const energyGain = calcEnergyGain() + combat.accumulatedEnergy;
  p.energy = Math.min(combatEnergyCap(), p.energy + energyGain);
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
  playerState.combat.accumulatedEnergy += gain;
  combatLog(
    `Energy accumulated: +${gain}. (Total Pool: ${playerState.combat.accumulatedEnergy}).`,
  );
}
//ALERT STANCE
function triggerAlertStance() {
  playerState.combat.alertStance = true;
  combatLog("Alert Stance: 40% chance to retaliate when struck.");
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
  if (playerState.skills.c5) {
    return Math.max(
      1,
      Math.round(
        p.level / 10 + p.stats.intellect / 2.5 + p.stats.willpower / 2.5,
      ),
    );
  }
  return Math.max(
    1,
    Math.round(p.level / 10 + p.stats.intellect / 5 + p.stats.willpower / 5),
  ); // prettier commas?
}
//Remove maxHp/Energy cap if r3unlocked
function combatHpCap() {
  return playerState.skills.r3 ? 99999 : playerState.maxHp;
}
function combatEnergyCap() {
  return playerState.skills.r3 ? 99999 : playerState.maxEnergy;
}
//gain energy in combat helper
function gainEnergyCombat(amount) {
  playerState.energy = Math.min(combatEnergyCap(), playerState.energy + amount);
}
function startCombat(areaIndex) {
  playerState.hp = playerState.maxHp;
  playerState.energy = playerState.maxEnergy;
  const enemies = buildEncounter(areaIndex);
  playerState.combat = {
    enemies: enemies,
    turn: 1,
    actionPoints: 2 + (playerState.skills.r6 ? 1 : 0),
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
  if (victory) {
    let totalXp = 0;
    let totalGold = 0;
    let totalFame = 0;

    playerState.combat.enemies.forEach((e) => {
      totalXp += e.xpReward;
      totalGold += rollGold(e);
      totalFame += e.fameReward;
    });
    playerState.experience += totalXp;
    playerState.gold += totalGold;
    playerState.fame += totalFame;
    log(`Victory! Gained ${totalXp} Exp and ${totalGold} gold.`);
    checkLevelUp();
    //playerState.areasConquered[playerState.currentArea] = true; BOSS will have this!
  } else {
    log("Defeated you respawn at base.");
    playerState.hp = Math.floor(playerState.maxHp * 0.5);
  }
  playerState.combat = null;
  playerState.currentArea = null;
  render();
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
function fightTestDummy() {
  playerState.currentArea = 0;
  const enemies = [
    createEnemy(SHADOW_CLAN.scTestDummy),
    createEnemy(SHADOW_CLAN.scTestDummy),
    createEnemy(SHADOW_CLAN.scLieutenant),
  ];
  playerState.hp = playerState.maxHp;
  playerState.energy = playerState.maxEnergy;
  playerState.combat = {
    enemies: enemies,
    turn: 1,
    actionPoints: 2 + (playerState.skills.r6 ? 1 : 0),
    maxAp: 2 + (playerState.skills.r6 ? 1 : 0),
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
