const COUNTER_THRESHOLDS = {
  physLabour: [
    { at: 10, stats: { vitality: 1 } },
    { at: 20, stats: { resilience: 1 } },
    { at: 30, stats: { vitality: 1 } },
    { at: 40, stats: { resilience: 1 } },
    { at: 50, stats: { vitality: 2, resilience: 2 }, unlock: "physLabour" },
    { at: 70, stats: { vitality: 1 } },
    { at: 90, stats: { resilience: 1 } },
    { at: 120, stats: { vitality: 1 } },
    { at: 140, stats: { resilience: 1 } },
    { at: 150, stats: { vitality: 3 } },
    { at: 175, stats: { vitality: 2 } },
    { at: 200, stats: { vitality: 2 }, unlock: "physLabour2" },
    { at: 250, stats: { resilience: 2 } },
    { at: 300, stats: { vitality: 2, resilience: 3 } },
    { at: 350, stats: { vitality: 2 } },
    { at: 400, stats: { vitality: 2 } },
    { at: 450, stats: { vitality: 3 } },
    { at: 500, stats: { vitality: 4 } },
  ],
  broadMind: [
    { at: 10, stats: { intellect: 1 } },
    { at: 20, stats: { willpower: 1 } },
    { at: 30, stats: { intellect: 1 } },
    { at: 40, stats: { intellect: 1 } },
    { at: 50, stats: { intellect: 2, willpower: 2 }, unlock: "broadMind" },
    { at: 70, stats: { willpower: 1 } },
    { at: 90, stats: { intellect: 1 } },
    { at: 120, stats: { willpower: 1 } },
    { at: 140, stats: { intellect: 2 } },
    { at: 150, stats: { intellect: 3 } },
    { at: 175, stats: { willpower: 2 } },
    { at: 200, stats: { intellect: 2 }, unlock: "broadMind2" },
    { at: 250, stats: { intellect: 2 } },
    { at: 300, stats: { willpower: 2 } },
    { at: 350, stats: { intellect: 3 } },
    { at: 400, stats: { willpower: 4 } },
    { at: 450, stats: { intellect: 5 } },
    { at: 500, stats: { intellect: 5 } },
  ],
  becomeFlex: [
    { at: 10, stats: { dexterity: 1 } },
    { at: 20, stats: { dexterity: 1 } },
    { at: 30, stats: { dexterity: 1 } },
    { at: 40, stats: { dexterity: 1 } },
    { at: 50, stats: { dexterity: 2 }, unlock: "becomeFlex" },
    { at: 70, stats: { dexterity: 1 } },
    { at: 90, stats: { dexterity: 1 } },
    { at: 120, stats: { dexterity: 1 } },
    { at: 140, stats: { dexterity: 2 } },
    { at: 150, stats: { dexterity: 3 } },
    { at: 175, stats: { dexterity: 2 } },
    { at: 200, stats: { dexterity: 2 }, unlock: "becomeFlex2" },
    { at: 250, stats: { dexterity: 3 } },
    { at: 300, stats: { dexterity: 2 } },
    { at: 350, stats: { dexterity: 2 } },
    { at: 400, stats: { dexterity: 2 } },
    { at: 450, stats: { dexterity: 2 } },
    { at: 500, stats: { dexterity: 4 } },
  ],
  harnessPow: [
    { at: 10, stats: { strength: 1 } },
    { at: 20, stats: { strength: 1 } },
    { at: 30, stats: { strength: 1 } },
    { at: 40, stats: { strength: 1 } },
    { at: 50, stats: { strength: 2 }, unlock: "harnessPow" },
    { at: 70, stats: { strength: 1 } },
    { at: 90, stats: { strength: 1 } },
    { at: 120, stats: { strength: 1 } },
    { at: 140, stats: { strength: 1 } },
    { at: 150, stats: { strength: 3 } },
    { at: 175, stats: { strength: 2 } },
    { at: 200, stats: { strength: 2 }, unlock: "harnessPow2" },
    { at: 250, stats: { strength: 3 } },
    { at: 300, stats: { strength: 2 } },
    { at: 350, stats: { strength: 2 } },
    { at: 400, stats: { strength: 2 } },
    { at: 450, stats: { strength: 2 } },
    { at: 500, stats: { strength: 4 } },
  ],
};
function incrementCounter(key, amount = 1) {
  if (!(key in playerState.counters)) {
    console.warn(`unknown counter${key}`);
    return;
  }
  playerState.counters[key] += amount;
  checkCounterThresholds(key);
}
function checkCounterThresholds(key) {
  const current = playerState.counters[key];
  const claimed = playerState.claimedThresholds[key];
  const thresholds = COUNTER_THRESHOLDS[key];

  if (!thresholds) return;
  let statChanged = false;

  thresholds.forEach((threshold) => {
    //skip if not yet reached
    if (current < threshold.at) return;
    if (claimed.includes(threshold.at)) return;
    //apply stat bonuses
    Object.entries(threshold.stats).forEach(([stat, amount]) => {
      playerState.stats[stat] += amount;
      statChanged = true;
      log(`[${key}] Threshold ${threshold.at}: +${amount} ${stat}.`);
    });
    // world unlock bool
    if (threshold.unlock) {
      playerState.counterUnlocks[threshold.unlock] = true;
      log(`Milestone reached: ${threshold.unlock} unlocked.`);
    }
    // mark as claimed
    claimed.push(threshold.at);
  });
  //recalc derived stats if vit or wil changed
  if (statChanged) {
    const d = getDerivedStats(playerState.stats);
    playerState.maxHp = d.maxHp;
    playerState.maxEnergy = d.maxEnergy;
    // dont reset current hp/ene, just increase max.
    playerState.hp = Math.min(playerState.hp, playerState.maxHp);
    playerState.energy = Math.min(playerState.energy, playerState.maxEnergy);
  }
}
