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
    description: "(Passive) descriptionplaceholder",
    requiresText: "a1 unlocked",
    requires: () => playerState.skills.a1,
  },
  a3: {
    name: "Spike Adrenaline",
    description: "(Active) descri placehold",
    requiresText: "a1 unlocked",
    requires: () => playerState.skills.a1,
  },
  a4: {
    name: "Mighty Cranial Strike",
    description:
      "(Active) Strikes twice in quick succession. Scales with STR & DEX",
    requiresText: "a1 unlocked",
    requires: () => playerState.skills.a1,
  },
  a5: {
    name: "Fiery Resolve",
    description:
      "(Active ability) Strikes twice in quick succession. Scales with STR & DEX",
    requiresText: "any of a2, a3 or a4 unlocked.",
    requires: () =>
      playerState.skills.a2 || playerState.skills.a3 || playerState.skills.a4,
  },
  a6: {
    name: "Force of Nature",
    description:
      "(Passive) +4 to all stats and every second time strike is triggered gain +1 flat dmg this combat.",
    requiresText: "any of a2, a3 or a4 unlocked.",
    requires: () =>
      playerState.skills.a2 || playerState.skills.a3 || playerState.skills.a4,
  },
  a7: {
    name: "One Two Combo",
    description:
      "(Active ability) Strikes twice in quick succession. Scales with STR & DEX",
    requiresText: "a5 or a6 unlocked.",
    requires: () => playerState.skills.a5 || playerState.skills.a6,
  },
  // Discipline
  b1: {
    name: "Defensive Strike",
    description: "(Active)",
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
    description: "(Active) Five consecutive hits with lesser power.",
    requiresText: "b1 unlocked.",
    requires: () => playerState.skills.b1,
  },
  b5: {
    name: "Body Positive",
    description: "(Passive) Retaliation now also scales with resilience.",
    requiresText: "b2, b3 or b4 unlocked.",
    requires: () =>
      playerState.skills.b2 || playerState.skills.b3 || playerState.skills.b4,
  },
  b6: {
    name: "Defensive State of Mind",
    description:
      "(Passive) 40% of your unused block is carried over to your next turn.",
    requiresText: "b2, b3 or b4 unlocked.",
    requires: () =>
      playerState.skills.b2 || playerState.skills.b3 || playerState.skills.b4,
  },
  b7: {
    name: "Evasive Maneuver",
    description: "(Active) placehold",
    requiresText: "b5 or b6 unlocked.",
    requires: () => playerState.skills.b5 || playerState.skills.b6,
  },
  //spirit
  c1: {
    name: "Pulsating Forcefield",
    description: "(Active)",
    requiresText: "none.",
    requires: () => true,
  },
  c2: {
    name: "Focus Mind",
    description: "(Active) Gain block at the start of every turn.",
    requiresText: "c1 unlocked.",
    requires: () => playerState.skills.c1,
  },
  c3: {
    name: "Time Dabble",
    description: "(Active) placehold.",
    requiresText: "c1 unlocked.",
    requires: () => playerState.skills.c1,
  },
  c4: {
    name: "Chi Blast",
    description: "(Active) Gain block at the start of every turn.",
    requiresText: "c1 unlocked.",
    requires: () => playerState.skills.c1,
  },
  c5: {
    name: "Unlock Spirit",
    description: "(Passive) Empower Focus Mind and Energy Harvest.",
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
    description: "(Active) placehold",
    requiresText: "c5 or c6 unlocked.",
    requires: () => playerState.skills.c5 || playerState.skills.c6,
  },
  // Force - discipline Crossbranch
  ab1: {
    name: "Sweeping Flurry",
    description: "(Active)",
    requiresText: "a7 and b7 unlocked.",
    requires: () => playerState.skills.a7 && playerState.skills.b7,
  },
  ab2: {
    name: "Strength Beyond Measure",
    description: "(Passive)",
    requiresText: "ab1 unlocked.",
    requires: () => playerState.skills.ab1,
  },
  ab3: {
    name: "Retaliation Specialist",
    description: "(Passive)",
    requiresText: "ab1 unlocked.",
    requires: () => playerState.skills.ab1,
  },
  //Discipline - Spirit Cross
  bc1: {
    name: "Spiritual Trickery",
    description: "(Active)",
    requiresText: "b7 and c7 unlocked.",
    requires: () => playerState.skills.b7 && playerState.skills.c7,
  },
  bc2: {
    name: "Dual Potency",
    description: "(Passive)",
    requiresText: "bc1 unlocked.",
    requires: () => playerState.skills.bc1,
  },
  bc3: {
    name: "Spiritual Awekening",
    description: "(Passive)",
    requiresText: "bc1 unlocked.",
    requires: () => playerState.skills.bc1,
  },
  //Misc
  r1: {
    name: "Prepared",
    description: "(Passive)",
    requiresText: "3 unlocked in each branch (3x a, 3x b and 3x c.).",
    requires: () =>
      countUnlocked("a") >= 3 &&
      countUnlocked("b") >= 3 &&
      countUnlocked("c") >= 3,
  },
  r2: {
    name: "Master of Discipline",
    description: "(Passive)",
    requiresText: "5 unlocked in force + 5 in discipline",
    requires: () => countUnlocked("a") >= 5 && countUnlocked("b") >= 5,
  },
  r3: {
    name: "Limit Break",
    description: "(Passive)",
    requiresText: "5 unlocked in force + 5 in spirit.",
    requires: () => countUnlocked("a") >= 5 && countUnlocked("c") >= 5,
  },
  r4: {
    name: "Defensive spirits",
    description: "(Passive)",
    requiresText: "5 unlocked in discipline + 5 in spirit.",
    requires: () => countUnlocked("b") >= 5 && countUnlocked("c") >= 5,
  },
  r5: {
    name: "Unlocked Pendant",
    description: "(Passive)",
    requiresText: "WorldReqPlaceholder.",
    requires: () => false, //placehold
  },
  r6: {
    name: "Divine Knowledge",
    description: "(Passive)",
    requiresText: "WorldReqPlaceholder.",
    requires: () => false, //placehold
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
  render();
}
