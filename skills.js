const BRANCHES = {
  a: ["a1", "a2", "a3", "a4", "a5", "a6", "a7"],
  b: ["b1", "b2", "b3", "b4", "b5", "b6", "b7"],
  c: ["c1", "c2", "c3", "c4", "c5", "c6", "c7"],
};
function countUnlocked(branch) {
  return BRANCHES[branch].filter((k) => playerState.skills[k]).length;
}

const SKILL_DATA = {
  a1: {
    name: "One Two Combo",
    description:
      "(Active) Strikes twice in quick succession. Scales with STR & DEX",
    requiresText: "None",
    requires: () => true,
  },
  a2: {
    name: "Marvelous",
    description: "(Passive) Gain small amount of energy per successful hit",
    requiresText: "a1 unlocked",
    requires: () => playerState.skills.a1,
  },
  a3: {
    name: "Spike Adrenaline",
    description: "(Active) Sacrifice som Health for a rush of adrenaline",
    requiresText: "a1 unlocked",
    requires: () => playerState.skills.a1,
  },
  a4: {
    name: "Mighty Cranial Strike",
    description: "(Active) Powerful strike",
    requiresText: "a1 unlocked",
    requires: () => playerState.skills.a1,
  },
  a5: {
    name: "Die Hard",
    description: "(passive) You regain some health if below 30% HP every turn.",
    requiresText: "any of a2, a3 or a4 unlocked.",
    requires: () =>
      playerState.skills.a2 || playerState.skills.a3 || playerState.skills.a4,
  },
  a6: {
    name: "Force of Nature",
    description: "(Passive) +4 to all stats.",
    requiresText: "any of a2, a3 or a4 unlocked.",
    requires: () =>
      playerState.skills.a2 || playerState.skills.a3 || playerState.skills.a4,

    onUnlock() {
      const stats = playerState.stats;
      stats.strength += 4;
      stats.dexterity += 4;
      stats.vitality += 4;
      stats.vitality += 4;
      stats.willpower += 4;
      stats.intellect += 4;
      // recalculate stats
      const d = getDerivedStats(playerState.stats);
      playerState.maxHp = d.maxHp;
      playerState.maxEnergy = d.maxEnergy;
      log("Force of nature: +4 to all stats.");
    },
  },
  a7: {
    name: "Power Smash",
    description:
      "(Active ability) Very powerful, but at the cost of some of your own health.",
    requiresText: "a5 or a6 unlocked.",
    requires: () => playerState.skills.a5 || playerState.skills.a6,
  },
  // Discipline
  b1: {
    name: "Defensive Strike",
    description: "(Active) Strike once and gain small amount of block.",
    requiresText: "none.",
    requires: () => true,
  },
  b2: {
    name: "Inspired by the Elements",
    description: "(Passive) Gain block at the start of every turn.",
    requiresText: "b1 unlocked.",
    requires: () => playerState.skills.b1,
  },
  b3: {
    name: "Engaging Strike",
    description: "(Active) Strike once and enter Alert Stance.",
    requiresText: "b1 unlocked.",
    requires: () => playerState.skills.b1,
  },
  b4: {
    name: "flurry",
    description: "(Active) Strike four times.",
    requiresText: "b1 unlocked.",
    requires: () => playerState.skills.b1,
  },
  b5: {
    name: "Body Positive",
    description: "(Passive) Strike now also scales with resilience.",
    requiresText: "b2, b3 or b4 unlocked.",
    requires: () =>
      playerState.skills.b2 || playerState.skills.b3 || playerState.skills.b4,
  },
  b6: {
    name: "Defensive State of Mind",
    description:
      "(Passive) 40% of your unused block is carried over to your next turn(70% with bc2).",
    requiresText: "b2, b3 or b4 unlocked.",
    requires: () =>
      playerState.skills.b2 || playerState.skills.b3 || playerState.skills.b4,
  },
  b7: {
    name: "Evasive Maneuver",
    description: "(Active) Gain a decent amount of block.",
    requiresText: "b5 or b6 unlocked.",
    requires: () => playerState.skills.b5 || playerState.skills.b6,
  },
  //spirit
  c1: {
    name: "Pulsating Forcefield",
    description:
      "(Active) Deal damage to an enemy and you gain block (scales with INT and WIS).",
    requiresText: "none.",
    requires: () => true,
  },
  c2: {
    name: "Focus Mind",
    description:
      "(Active) Gain some energy now and a little bit at the start of every turn.",
    requiresText: "c1 unlocked.",
    requires: () => playerState.skills.c1,
  },
  c3: {
    name: "Time Dabble",
    description: "(Active) Gain 2 ap.",
    requiresText: "c1 unlocked.",
    requires: () => playerState.skills.c1,
  },
  c4: {
    // subject to change(dmg and cost to scale with current energy)
    name: "Chi Blast",
    description: "(Active) High damage (Scales with LVL, WIS and INT).",
    requiresText: "c1 unlocked.",
    requires: () => playerState.skills.c1,
  },
  c5: {
    name: "Unlock Spirit",
    description:
      "(Passive) Empower Focus Mind, Energy Harvest and Spiritual Trickery.",
    requiresText: "c2, c3 or c4 unlocked.",
    requires: () =>
      playerState.skills.c2 || playerState.skills.c3 || playerState.skills.c4,
  },
  c6: {
    name: "Unlock Time",
    description:
      "(Passive) Remove the per turn limit for Time Dabble, but the energy cost gets increased per use for that turn.",
    requiresText: "c2, c3 or c4 unlocked.",
    requires: () =>
      playerState.skills.c2 || playerState.skills.c3 || playerState.skills.c4,
  },
  c7: {
    name: "Energy Harvest",
    description:
      "(Active) Trigger Pulsating Forcefield once and accumulate energy.",
    requiresText: "c5 or c6 unlocked.",
    requires: () => playerState.skills.c5 || playerState.skills.c6,
  },
  // Force - discipline Crossbranch
  ab1: {
    name: "Sweeping Flurry",
    description: "(Active) Strike each enemy 4 times.",
    requiresText: "a7 and b7 unlocked.",
    requires: () => playerState.skills.a7 && playerState.skills.b7,
  },
  ab2: {
    name: "Strength Beyond Measure",
    description: "(Passive) Permanently gain +6 STR, +3 DEX, +3 VIT, +3 RES.",
    requiresText: "ab1 unlocked.",
    requires: () => playerState.skills.ab1,
    onUnlock() {
      const s = playerState.stats;
      s.strength += 6;
      s.dexterity += 3;
      s.vitality += 3;
      s.resilience += 3;

      const d = getDerivedStats(playerState.stats);
      playerState.maxHp = d.maxHp;
      playerState.maxEnergy = d.maxEnergy;
      log("Strength beyond measure: +6 STR, +3 DEX, +3 VIT, +3 RES.");
    },
  },
  ab3: {
    name: "Retaliation Specialist",
    description: "(Passive) +15% Retaliation chance.",
    requiresText: "ab1 unlocked.",
    requires: () => playerState.skills.ab1,
  },
  //Discipline - Spirit Cross
  bc1: {
    name: "Spiritual Trickery",
    description: "(Active) Gain block and accumulate energy twice.",
    requiresText: "b7 and c7 unlocked.",
    requires: () => playerState.skills.b7 && playerState.skills.c7,
  },
  bc2: {
    name: "Dual Potency",
    description:
      "(Passive) Energyharvest trigger c1 twice. Defensive state of mind retains 70% of remaining block.",
    requiresText: "bc1 unlocked.",
    requires: () => playerState.skills.bc1,
  },
  bc3: {
    name: "Spiritual Awekening",
    description: "(Passive) Gain 100 MaxHP and 100 MaxEnergy.",
    requiresText: "bc1 unlocked.",
    requires: () => playerState.skills.bc1,
    onUnlock() {
      playerState.maxHp += 100;
      playerState.maxEnergy += 100;
      playerState.hp += 100;
      playerState.energy += 100;
      log("Spritual Awakening: +100 MaxHp and +100 MaxEnergy.");
    },
  },
  //Misc
  r1: {
    name: "Prepared",
    description:
      "(Passive) Gain block (RES), energy (WIS/2), and HP (VIT/2) each turn.",
    requiresText: "3 unlocked in each branch (3x a, 3x b and 3x c.).",
    requires: () =>
      countUnlocked("a") >= 3 &&
      countUnlocked("b") >= 3 &&
      countUnlocked("c") >= 3,
  },
  r2: {
    name: "Master of Discipline",
    description:
      "(Passive) Every second time strike is triggered gain +1 flat dmg this combat.",
    requiresText: "5 unlocked in force + 5 in discipline",
    requires: () => countUnlocked("a") >= 5 && countUnlocked("b") >= 5,
  },
  r3: {
    name: "Limit Break",
    description:
      "(Passive) You can surpass MaxHealth and MaxEnergy in combat. ",
    requiresText: "5 unlocked in force + 5 in spirit.",
    requires: () => countUnlocked("a") >= 5 && countUnlocked("c") >= 5,
  },
  r4: {
    name: "Defensive spirits",
    description: "(Passive) placeholder (NOT IMPLEMENTED)",
    requiresText: "5 unlocked in discipline + 5 in spirit.",
    requires: () => countUnlocked("b") >= 5 && countUnlocked("c") >= 5,
  },
  r5: {
    name: "Unlocked Pendant",
    description: "(Passive) Gain 10 block at the start of every player turn.",
    requiresText: "WorldReqPlaceholder.",
    requires: () => false, //placehold
  },
  r6: {
    name: "Divine Knowledge",
    description: "(Passive) +1 MaxAp",
    requiresText: "Some scroll Placeholder.",
    requires: () =>
      countUnlocked("a") >= 7 &&
      countUnlocked("b") >= 7 &&
      countUnlocked("c") >= 7,
    onUnlock() {
      log("Divine Knowledge: +1 MaxAp.");
    },
  },
};
function unlockSkill(key) {
  if (playerState.skillPoints <= 0) {
    log("No skillpoints remaining.");
    render();
    return;
  }
  if (playerState.skills[key]) {
    log("Already unlocked");
    return;
  }
  if (!SKILL_DATA[key].requires()) {
    log(`Requirements not met: ${SKILL_DATA[key].requiresText}`);
    render();
    return;
  }
  playerState.skills[key] = true;
  playerState.skillPoints -= 1;
  log(`Unlocked ${SKILL_DATA[key].name}.`);
  if (SKILL_DATA[key].onUnlock) {
    SKILL_DATA[key].onUnlock();
  }
  render();
}
