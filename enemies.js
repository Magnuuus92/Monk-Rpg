const ENEMY_MOVES = {
  lunge: {
    name: "Lunge",
    execute(enemy, player) {
      const damage = 10 + enemy.str * 1;
      applyDamageToPlayer(damage, player);
      return `${enemy.name} lunges at the player dealing ${damage} damage.`;
    },
  },
  kick: {
    name: "Kick",
    execute(enemy, player) {
      const damage = 10 + enemy.str * 2;
      applyDamageToPlayer(damage, player);
      return `${enemy.name} kicks for ${damage} damage.`;
    },
  },

  lashOut: {
    //Lash out: deal (3 + str*1) 3 times
    name: "Lash Out",
    execute(enemy, player) {
      let total = 0;
      for (let i = 0; i < 3; i++) {
        const hit = 3 + enemy.str * 1;
        total += hit;
      }
      applyDamageToPlayer(total, player);
      return `${enemy.name} lashes out 3 times for ${total} damage.`;
    },
  },
  bladeFlurry: {
    name: "Blade Flurry",
    execute(enemy, player) {
      let total = 0;
      for (let i = 0; i < 5; i++) {
        const hit = 10 + enemy.str * 2;
        total += hit;
      }
      applyDamageToPlayer(total, player);
      return `${enemy.name} attacks with 5 swift cuts for ${total} damage.`;
    },
  },

  block: {
    name: "Block",
    execute(enemy, player) {
      const blockAmount = 10 + enemy.str * 2;
      enemy.block = (enemy.block || 0) + blockAmount;
      return `${enemy.name} blocks, gaining ${blockAmount} block.`;
    },
  },
  guard: {
    name: "Guard",
    execute(enemy, player) {
      // subject to change: guard give block to ally. remember to change in combat aswell
      const blockAmount = 10 + enemy.str * 3;
      enemy.block = (enemy.block || 0) + blockAmount;
      return `${enemy.name} guards, gaining ${blockAmount} block.`;
    },
  },

  cut: {
    name: "Cut",
    execute(enemy, player) {
      const damage = 20;
      applyDamageToPlayer(damage, player);
      return `${enemy.name} cuts for ${damage} damage.`;
    },
  },

  panic: {
    name: "Panic",
    execute(enemy, player) {
      return `${enemy.name} panics and does nothing.`;
    },
  },
  motivate: {
    name: "Motivate",
    execute(enemy, player) {
      //logic in combat js
      return `${enemy.name} motivates an ally (+1 STR).`;
    },
  },
  supplyArmaments: {
    name: "Supply Armaments",
    execute(enemy, player) {
      return `${enemy.name} supplys an ally(+3 STR).`;
    },
  },
  exist: {
    name: "Exist",
    execute(enemy, player) {
      return `${enemy.name} just exists..`;
    },
  },
  bite: {
    name: "Bite",
    execute(enemy, player) {
      const damage = 15 + enemy.str * 2;
      applyDamageToPlayer(damage, player);
      return `${enemy.name} bites for ${damage} damage.`;
    },
  },
  snarl: {
    name: "Snarl",
    execute(enemy, player) {
      return `${enemy.name} is snarling menacingly.`;
    },
  },
  motivateAll: {
    name: "Motivate All",
    execute(enemy, player) {
      // no logic yet
      return `${enemy.name} motivates all allies (+1 STR).`;
    },
  },

  deadlyBite: {
    name: "Deadly Bite",
    execute(enemy, player) {
      const damage = 30 + enemy.str * 2;
      applyDamageToPlayer(damage, player);
      return `${enemy.name} Bites viciously for ${damage} damage.`;
    },
  },
  zoneOut: {
    name: "Zone Out",
    execute(enemy, player) {
      return `${enemy.name} Lost focus and does nothing.`;
    },
  },
  scratch: {
    name: "Scratch",
    execute(enemy, player) {
      const damage = 25 + enemy.str * 1;
      applyDamageToPlayer(damage, player);
      return `${enemy.name} scratches dealing ${damage} damage.`;
    },
  },
  uppercut: {
    name: "Uppercut",
    execute(enemy, player) {
      const damage = 40 + enemy.str * 2;
      applyDamageToPlayer(damage, player);
      return `${enemy.name} Does an uppercut dealing ${damage} damage.`;
    },
  },
  daggerThrow: {
    name: "Dagger Throw",
    execute(enemy, player) {
      const damage = 20 + enemy.str * 4;
      applyDamageToPlayer(damage, player);
      return `${enemy.name} is hurling daggers at you, dealing ${damage} damage.`;
    },
  },

  weakPartyHeal: {
    name: "Weak Party Heal",
    execute(enemy, player) {
      const healAmount = 20 + enemy.str * 3;
      playerState.combat.enemies
        .filter((e) => e.isAlive())
        .forEach((e) => {
          e.hp = Math.min(e.maxHp, e.hp + healAmount);
        });
      return `${enemy.name} heals all allies for ${healAmount} hp.`;
    },
  },

  partyHeal: {
    name: "Party Heal",
    execute(enemy, player) {
      const healAmount = 30 + enemy.str * 4;
      playerState.combat.enemies
        .filter((e) => e.isAlive())
        .forEach((e) => {
          e.hp = Math.min(e.maxHp, e.hp + healAmount);
        });
      return `${enemy.name} heals all allies for ${healAmount} hp.`;
    },
  },
  potentPartyHeal: {
    name: "Potent Party Heal",
    execute(enemy, player) {
      const healAmount = 40 + enemy.str * 5;
      playerState.combat.enemies
        .filter((e) => e.isAlive())
        .forEach((e) => {
          e.hp = Math.min(e.maxHp, e.hp + healAmount);
        });
      return `${enemy.name} heals all allies for ${healAmount} hp.`;
    },
  },
};

function applyDamageToPlayer(rawDamage, player) {
  const combat = playerState.combat;
  if (combat.block > 0) {
    const blocked = Math.min(combat.block, rawDamage);
    combat.block -= blocked;
    rawDamage -= blocked;
  }
  player.hp = Math.max(0, player.hp - rawDamage);
}

function createEnemy(template) {
  return {
    name: template.name,
    hp: template.hp,
    maxHp: template.maxHp,
    str: template.str,
    ap: template.ap,
    maxAp: template.ap,
    block: 0,
    moves: template.moves,
    //buffPriority: template.buffPriority, Maybe later
    //protectPriority: template.protectPriority,
    xpReward: template.xpReward,
    goldMin: template.goldMin,
    goldMax: template.goldMax,
    fameReward: template.fameReward,
    isAlive() {
      return this.hp > 0;
    },
  };
}
const SHADOW_CLAN = {
  scHenchman: {
    name: "SC Henchman",
    hp: 60,
    maxHp: 60,
    str: 2,
    ap: 1,
    maxAp: 1,
    moves: ["lunge", "kick", "block"],
    xpReward: 10,
    goldMin: 1,
    goldMax: 5,
    fameReward: 1,
  },

  scLieutenant: {
    name: "SC Lieutenant",
    hp: 100,
    maxHp: 100,
    str: 3,
    ap: 1,
    maxAp: 1,
    moves: ["lunge", "kick", "block"],
    xpReward: 10,
    goldMin: 1,
    goldMax: 5,
    fameReward: 1,
  },

  scNinja: {
    name: "SC Ninja",
    hp: 50,
    maxHp: 50,
    str: 3,
    ap: 1,
    maxAp: 1,
    moves: ["cut", "block", "lashOut"],
    xpReward: 10,
    goldMin: 1,
    goldMax: 5,
    fameReward: 1,
  },

  scWeakling: {
    name: "SC Weakling",
    hp: 60,
    maxHp: 60,
    str: 1,
    ap: 1,
    maxAp: 1,
    moves: ["lashOut", "panic"],
    xpReward: 10,
    goldMin: 1,
    goldMax: 5,
    fameReward: 1,
  },

  scSalesPerson: {
    name: "SC Sales Person",
    hp: 80,
    maxHp: 80,
    str: 2,
    ap: 1,
    maxAp: 1,
    moves: ["lunge", "block", "motivate"],
    xpReward: 10,
    goldMin: 1,
    goldMax: 5,
    fameReward: 1,
  },
  scTestDummy: {
    name: "DumDum",
    hp: 50,
    maxHp: 50,
    str: 1,
    ap: 1,
    maxAp: 1,
    moves: ["lunge", "block", "weakPartyHeal"],
    xpReward: 10,
    goldMin: 1,
    goldMax: 5,
    fameReward: 1,
  },
  debris: {
    name: "Big pile debris",
    hp: 250,
    maxHp: 250,
    str: 0,
    ap: 1,
    maxAp: 1,
    moves: ["exist"],
    xpReward: 40,
    goldMin: 0,
    goldMax: 0,
    fameReward: 3,
  },
};
const AFTERLIFE_CULT = {
  alcHenchman: {
    name: "ALC Henchman",
    hp: 100,
    maxHp: 100,
    str: 2,
    ap: 1,
    maxAp: 1,
    moves: ["lunge", "kick", "block"],
    xpReward: 10,
    goldMin: 1,
    goldMax: 5,
    fameReward: 1,
  },
  alcLieutenant: {
    name: "ALC Lieutenant",
    hp: 150,
    maxHp: 150,
    str: 3,
    ap: 1,
    maxAp: 1,
    moves: ["lunge", "kick", "block", "motivate"],
    xpReward: 10,
    goldMin: 1,
    goldMax: 5,
    fameReward: 1,
  },
  alcFanatic: {
    name: "ALC Fanatic",
    hp: 90,
    maxHp: 90,
    str: 1,
    ap: 1,
    maxAp: 1,
    moves: ["lash Out", "panic"],
    xpReward: 10,
    goldMin: 1,
    goldMax: 5,
    fameReward: 1,
  },
  alcRecruiter: {
    name: "ALC Recruiter",
    hp: 190,
    maxHp: 190,
    str: 3,
    ap: 1,
    maxAp: 1,
    Moves: ["cut", "block", "lashOut"],
    xpReward: 10,
    goldMin: 1,
    goldMax: 5,
    fameReward: 2,
  },
  alcHound: {
    name: "ALC Hound",
    hp: 110,
    maxHp: 110,
    str: 2,
    ap: 1,
    moves: ["lunge", "bite", "snarl"],
    xpReward: 10,
    goldMin: 1,
    goldMax: 5,
    fameReward: 1,
  },
};
const UNDEAD = {
  udZombie: {
    name: "UD Zombie",
    hp: 100,
    maxHp: 100,
    str: 4,
    ap: 1,
    maxAp: 1,
    moves: ["lunge", "cut", "zoneOut"],
    xpReward: 12,
    goldMin: 2,
    goldMax: 7,
    fameReward: 1,
  },
  udDog: {
    name: "UD Dog",
    hp: 140,
    maxHp: 140,
    str: 4,
    ap: 1,
    maxAp: 1,
    moves: ["lunge", "deadlyBite"],
    xpReward: 15,
    goldMin: 2,
    goldMax: 8,
    fameReward: 1,
  },
  udGhoul: {
    name: "UD Ghoul",
    hp: 200,
    maxHp: 200,
    str: 3,
    ap: 1,
    maxAp: 1,
    moves: ["scratch", "block", "lashOut"],
    xpReward: 20,
    goldMin: 3,
    goldMax: 7,
    fameReward: 1,
  },
  udZumobie: {
    name: "UD Zumobie",
    hp: 500,
    maxHp: 500,
    str: 7,
    ap: 1,
    maxAp: 1,
    moves: ["lashOut", "block", "kick"],
    xpReward: 50,
    goldMin: 4,
    goldMax: 7,
    fameReward: 4,
  },
  udFeralGhoul: {
    name: "UD Feral Ghoul",
    hp: 270,
    maxHp: 270,
    str: 10,
    ap: 1,
    maxAp: 1,
    moves: ["lunge", "deadlyBite", "zoneOut"],
    xpReward: 20,
    goldMin: 2,
    goldMax: 7,
    fameReward: 2,
  },
  udWitch: {
    name: "UD Witch",
    hp: 150,
    maxHp: 150,
    str: 1,
    ap: 1,
    maxAp: 1,
    moves: ["motivateAll", "partyHeal", "weakPartyHeal", "zoneOut"],
    xpReward: 15,
    goldMin: 2,
    goldMax: 7,
    fameReward: 1,
  },
  udVampire: {
    name: "UD Vampire",
    hp: 140,
    maxHp: 140,
    str: 6,
    ap: 1,
    maxAp: 1,
    moves: ["weakPartyHeal", "deadlyBite", "snarl", "motivate"],
    xpReward: 12,
    goldMin: 2,
    goldMax: 7,
    fameReward: 1,
  },
};

const MISC_ENEMIES = {
  debris: {
    name: "Big pile debris",
    hp: 250,
    maxHp: 250,
    str: 0,
    ap: 1,
    maxAp: 1,
    moves: ["exist"],
    xpReward: 10,
    goldMin: 1,
    goldMax: 5,
    fameReward: 1,
  },
};

function rollGold(enemy) {
  return (
    Math.floor(Math.random() * (enemy.goldMax - enemy.goldMin + 1)) +
    enemy.goldMin
  );
}
