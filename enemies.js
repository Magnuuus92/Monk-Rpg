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

  block: {
    name: "Block",
    execute(enemy, player) {
      const blockAmount = 10 + enemy.str * 2;
      enemy.block = (enemy.block || 0) + blockAmount;
      return `${enemy.name} blocks, gaining ${blockAmount} block.`;
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
      //subject to change
      return `${enemy.name} motivates an ally (+1 STR).`;
    },
  },
  exist: {
    name: "Exist",
    execute(enemy, player) {
      return `${enemy.name} just exists..`;
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
    isAlive() {
      return this.hp > 0;
    },
  };
}

const SHADOW_CLAN = {
  scHenchman: {
    name: "SC Henchman",
    hp: 60,
    str: 2,
    ap: 1,
    moves: ["lunge", "kick", "block"],
  },

  scLieutenant: {
    name: "SC Lieutenant",
    hp: 100,
    str: 3,
    ap: 1,
    moves: ["lunge", "kick", "block"],
  },

  scNinja: {
    name: "SC Ninja",
    hp: 50,
    str: 3,
    ap: 1,
    moves: ["cut", "block", "lashOut"],
  },

  scWeakling: {
    name: "SC Weakling",
    hp: 60,
    str: 1,
    ap: 1,
    moves: ["lashOut", "panic"],
  },

  scSalesPerson: {
    name: "SC Sales Person",
    hp: 80,
    str: 2,
    ap: 1,
    moves: ["lunge", "block", "motivate"],
  },
  scTestDummy: {
    name: "DumDum",
    hp: 50,
    str: 1,
    ap: 1,
    moves: ["lunge", "block"],
  },
  debris: {
    name: "Big pile debris",
    hp: 250,
    str: 0,
    ap: 1,
    moves: ["exist"],
  },
};
const MISC_ENEMIES = {
  debris: {
    name: "Big pile debris",
    hp: 250,
    str: 0,
    ap: 1,
    moves: ["exist"],
  },
};
