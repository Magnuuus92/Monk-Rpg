function openWorld() {
  // TEST if only works from base.
  playerState.currentAreaId = null;
  playerState.currentRoomId = null;
  currentScreen = "world";
  render();
}
//return to base
function returnToBase() {
  playerState.currentAreaId = null;
  playerState.currentRoomId = null;
  currentScreen = "base";
  render();
}
//Enter area from world map
function enterArea(areaId) {
  const area = AREAS[areaId];
  if (!area) return;
  if (!area.isUnlocked()) {
    log(`${area.name} is not available for you.`);
    render();
    return;
  }
  playerState.currentAreaId = areaId;
  playerState.currentRoomId = null;
  //refresh room state upon entering
  refreshRoomStates(areaId);
  log(`You enter ${area.name}.`);
  render();
}
//return to area overview from room
function leaveRoom() {
  playerState.currentRoomId = null;
  render();
}
//enter a specific room
function enterRoom(roomId) {
  const room = ROOMS[roomId];
  if (!room) return;
  //recheck unlock conditions
  if (room.state === "locked") {
    log(`${room.name} is not available to you.`);
    render();
    return;
  }
  if (room.state === "hidden") {
    return;
  }
  playerState.currentRoomId = roomId;
  log(`You enter ${room.name}.`);
  render();
}
//ROOM STATE MANAGEMENT
function refreshRoomStates(areaId) {
  const area = AREAS[areaId];
  if (!area) return;

  area.roomIds.forEach((roomId) => {
    const room = ROOMS[roomId];
    if (!room || !room.unlockCondition) return;

    if (room.unlockCondition()) {
      //was hidden. now visible and unlocked
      if (room.state === "hidden") room.state = "unlocked";
      //was locked. now unlocked
      if (room.state === "locked") room.state = "unlocked";
    }
  });
}
//NPC INTERACTIONS
function talkToNpc(npcId) {
  const npc = NPCS[npcId];
  if (!npc) return;
  log(`${npc.name}: "${npc.dialogue}"`);
  npc.onTalk(playerState);

  //refresh room states (TALK might unlock stuff)
  if (playerState.currentAreaId) {
    refreshRoomStates(playerState.currentAreaId);
  }
  render();
}
const ROOM_ACTIONS = {
  //TEAHOUSE
  teaHouse: {
    workHarvest: {
      label: "Work Harvest",
      description: "10 gold + 2 resources.",
      dpCost: 1,
      resourceCost: 0,
      goldCost: 0,
      available: () => true,
      execute() {
        ((playerState.gold += 10),
          (playerState.resources += 2),
          incrementCounter("physLabour", 1));
        log(
          "Your harvest tea leaves and clear out brush. +10 gold and +2 resources.",
        );
      },
    },
    renovate: {
      label: "Renovate",
      description: "Fix teahouse. (10 resources)",
      dpCost: 1,
      resourceCost: 10,
      goldCost: 0,
      available: () => playerState.resources >= 10,
      execute() {
        playerState.resources -= 10;
        playerState.renovateCounts.teaHouse += 1;
        incrementCounter("physLabour", 1);
        const count = playerState.renovateCounts.teaHouse;
        log(`Teahouse renovated. (${count}/10 until fully functional.)`);
      },
    },
    teaCeremony: {
      label: "Tea ceremony.",
      description: "Restore hp and energy.",
      dpCost: 1,
      resourceCost: 0,
      goldCost: 0,
      available: () => true, // SUBJECT TO CHANGE renovated 10 or renovated bool
      execute() {
        playerState.hp = playerState.maxHp;
        playerState.energy = playerState.maxEnergy;
        incrementCounter("broadMind", 1);
        log("You brew and drink ceremonial grade green tea.");
      },
    },
  },
  //DOJO
  dojo: {
    sparring: {
      label: "Sparring",
      description: "+10 exp while also making you stronger and more dexterous.",
      dpCost: 1,
      resourceCost: 0,
      goldCost: 0,
      available: () => true, //SUBJECT TO CHANGE
      execute() {
        playerState.experience += 10;
        incrementCounter("becomeFlex", 1);
        incrementCounter("harnessPow", 1);
        checkLevelUp();
        if(playerState.quests.martialArtsTraining === "active") {
          playerState.questProgress.martialArtistSparCount += 1;
        }
        log("You spar at the dojo +10 exp.");
      },
    },
    renovate: {
      label: "Renovate",
      description: "Fix the dojo. (5 resources)",
      dpCost: 1,
      resourceCost: 5,
      goldCost: 0,
      available: () => playerState.resources >= 5,
      execute() {
        playerState.resources -= 5;
        playerState.renovateCounts.dojo += 1;
        incrementCounter("physLabour", 1);
        const count = playerState.renovateCounts.dojo;
        log(`Dojo renovated. (${count}/10 until fully functional.)`);
      },
    },

    workTrainer: {
      label: "Work Trainer",
      description: "10 gold. Flexible work.",
      dpCost: 1,
      resourceCost: 0,
      goldCost: 0,
      available: () => true, // SUBJECT TO CHANGE
      execute() {
        ((playerState.gold += 10), incrementCounter("becomeFlex", 1));
        log("You work as a martial arts trainer. +10 gold.");
      },
    },
  },
  gamblingDen: {
    renovate: {
      label: "Renovate",
      description: "Fix the gambling den. (15 resources)",
      dpCost: 1,
      resourceCost: 15,
      goldCost: 0,
      available: () => playerState.resources >= 15,
      execute() {
        playerState.resources -= 15;
        playerState.renovateCounts.gamblingDen += 1;
        incrementCounter("physLabour", 1);
        const count = playerState.renovateCounts.gamblingDen;
        log(`Gambling den renovated. (${count}/10 until fully functional.)`);
      },
    },
    gamble: {
      label: "Gamble",
      description: "Try to win gold gambling.",
      dpCost: 1,
      resourceCost: 0,
      goldCost: 10,
      available: () => playerState.gold >= 10,
      execute() {
        incrementCounter("becomeFlex", 1);
        if (Math.random() < 0.5) {
          playerState.gold += 10;
          log("You win! +10 gold.");
        } else {
          playerState.gold -= 10;
          log("You lost.. -10 gold.");
        }
      },
    },
    socialize: {
      label: "Socialize",
      description:
        "Strike up a conversation with patrons. You might get some valueable intel.",
      dpCost: 1,
      resourceCost: 0,
      goldCost: 0,
      available: () => true,
      execute() {
        incrementCounter("broadMind", 1);
        trySocialUnlock();
      },
    },
    workBouncer: {
      label: "Work as a bouncer",
      description:
        "Work as a bouncer. +20 gold. Some shifts are heavier than others..",
      dpCost: 1,
      resourceCost: 0,
      goldCost: 0,
      available: () => true,
      execute() {
        playerState.gold += 20;
        incrementCounter("harnessPow", 1);
        log("You work as a bouncer. You gained 20 gold.");
      },
    },
  },
  //ARENA
  arena: {
    renovate: {
      label: "Renovate",
      description: "Fix the arena. (15 resources)",
      dpCost: 1,
      resourceCost: 15,
      goldCost: 0,
      available: () => playerState.resources >= 15,
      execute() {
        playerState.resources -= 15;
        playerState.renovateCounts.arena += 1;
        incrementCounter("physLabour", 1);
        const count = playerState.renovateCounts.arena;
        log(`Arena renovated. (${count}/10 until fully functional.)`);
      },
    },
    battle: {
      label: "Battle",
      description: "Fight a customized encounter.",
      dpCost: 1,
      resourceCost: 0,
      goldCost: 0,
      available: () => true,
      execute() {
        incrementCounter("harnessPow", 1);
        startArenaBattle();
      },
    },
  },
  //TRADING DOCKS
  tradingDocks: {
    renovate: {
      label: "Renovate",
      description: "Fix the docks. (12 resources)",
      dpCost: 1,
      resourceCost: 12,
      goldCost: 0,
      available: () => playerState.resources >= 12,
      execute() {
        playerState.resources -= 12;
        playerState.renovateCounts.tradingDocks += 1;
        incrementCounter("physLabour", 1);
        const count = playerState.renovateCounts.tradingDocks;
        log(`Docks renovated. (${count}/10 until fully functional.)`);
      },
    },
    talkToForeigners: {
      label: "Talk to foreigners",
      description:
        "Talk to foreign merchants, you might learn something useful.",
      dpCost: 1,
      resourceCost: 0,
      goldCost: 0,
      available: () => true, //SUBJECT TO CHANGE
      execute() {
        incrementCounter("broadMind", 1);
        trySocialUnlock();
      },
    },
    worHauling: {
      label: "Work hauling goods for merchants",
      description:
        "Work as a hauler. +30 gold. Some shifts are heavier than others..",
      dpCost: 1,
      resourceCost: 0,
      goldCost: 0,
      available: () => true,
      execute() {
        playerState.gold += 30;
        incrementCounter("physLabour", 1);
        log("You haul cargo all day. You gained 30 gold.");
      },
    },
  },
  ancestralGrounds: {
    renovate: {
      label: "Renovate",
      description:
        "Renovate the burial grounds of your ancestors.(20 resources)",
      dpCost: 1,
      resourceCost: 20,
      goldCost: 0,
      available: () => playerState.resources >= 20,
      execute() {
        playerState.resources -= 20;
        playerState.renovateCounts.ancestralGrounds += 1;
        incrementCounter("physLabour", 1);
        const count = playerState.renovateCounts.ancestralGrounds;
        log(`Burial grounds renovated. (${count}/10 until fully functional.)`);
      },
    },
    workGroundsKeeper: {
      label: "Work as a Groundskeeper.",
      description: " +20 gold, +20 ancestor happiness",
      dpCost: 1,
      resourceCost: 0,
      goldCost: 0,
      available: () => true,
      execute() {
        playerState.gold += 20;
        playerState.ancestorHappiness = Math.min(
          100,
          playerState.ancestorHappiness + 20,
        );
        incrementCounter("broadMind", 1);
        log(
          `You tend the grounds. +20 gold, +20 ancestor happiness. Ancestor Hapiness: (${playerState.ancestorHappiness}/100).`,
        );
      },
    },
  },
};
//ROOM DEVELOPMENT
function isRoomFullyRenovated(roomId){
  const count = playerState.renovateCounts[roomId];
  if (count === undefined || count < 10) return false;
  const room = ROOMS[roomId];
  if(room.upgradeIds && room.upgradeIds.length > 0){
    return room.upgradeIds.every(key => playerState.upgrades[key]);
  }
  return true;
}
//MARTIAL ARTIST Quest
function startMartialArtistQuest() {
  if(playerState.quests.martialArtsTraining !== "locked") return;
  if(!isRoomFullyRenovated("dojo")) {
    log("The dojo is not yet renovated.");
    render();
    return;
  }
  playerState.quests.martialArtsTraining = "active";
  playerState.questProgress.martialArtistSparCount = 0;
  log("Quest started: Prove your dedication to the martial arts. Spar 5 times at the dojo.");
  render();
}
function turnInMartialArtistQuest() {
  if(playerState.quests.martialArtsTraining !== "active") return;
  if(playerState.questProgress.martialArtistSparCount < 5){
    log("You are not ready yet. Prove your dedication by sparring.");
    render();
    return;
  }
  playerState.quests.martialArtsTraining = "completed";
  log("Quest completed! The will now help you learn new skills for a price.");
  render();
}
//SKILLPOINT SHOP martialARTIST
const SKILL_POINT_PRICES = [50,100,200,300,400,500,600,700,800,900,1000,1200,1500,2000,2500,3000];

function buySkillPoint() {
  const price =SKILL_POINT_PRICES[playerState.skillPointPurchases];
  if( price === undefined) {
    log("The martial Artist has nothing left to teach you.");
    render();
    return;
  }
  if(playerState.gold < price){
    log(`Not enough gold. Need ${price}.`);
    render();
    return;
  }
  playerState.gold -= price;
  playerState.skillPoints += 1;
  playerState.skillPointPurchases += 1;
  log(`Purchased one skillpoint for ${price} gold.`);
  render();
}
//OLDMERCHANT SHOP
function buyResource(){
  const cost = 5;
  if(playerState.gold < cost) {log("Not enough gold."); render(); return;}
  playerState.gold -= cost;
  playerState.resources += 1;
  //log(`Bought 1 resource for ${cost} gold.`) This floods the log.
  render();
}
function buyResource10(){
    const cost = 50;
  if(playerState.gold < cost) {log("Not enough gold."); render(); return;}
  playerState.gold -= cost;
  playerState.resources += 10;
  render();
}
function buyPendant(){
  if(playerState.shopPurchases.pendantBought){log("Already Purchased."); return;}
  const cost = 30;
  if(playerState.gold < cost) {log("Not enough gold."); render(); return;}
   playerState.gold -= cost;
   playerState.shopPurchases.pendantBought = true;
   log("Purchased the pendant. Use a skillpoint to unlock its true potential.");
   render();
}
function buyScroll() {
  if(playerState.shopPurchases.scrollBought){log("Already Purchased."); return;}
  const cost = 500;
   if(playerState.gold < cost) {log("Not enough gold. This is a very rare scroll. Dont try to haggle."); render(); return;}
      playerState.gold -= cost;
   playerState.shopPurchases.scrollBought = true;
    log("Purchased the scroll. You should study it to learn about its true potential.");
    render();
}
//read scroll at base
function readScroll(){
  if (!spendDP(1)) return;
  if(!playerState.shopPurchases.scrollBought) {log("You dont have the scroll."); render(); return;  }
  if(playerState.shopPurchases.scrollReadsUsed >= 10){
    log("You have learned all the scrolls teachings.");
    render();
    return;
  }
  incrementCounter("broadMind", 1);
  playerState.shopPurchases.scrollReadsUsed += 1;
  log(`You study the scroll. (${playerState.shopPurchases.scrollReadsUsed}/10)`);
  render();
}
function choosePet(type){
  if(playerState.eventsTriggered.petChoice) return;
  playerState.pets.hasPet = type !== "none";
  playerState.pets.type = type === "none" ? null : type;
  playerState.eventsTriggered.petChoice = true;
  log(type === "none"
    ? "You decide against taking on a pet right now."
    : `You have adopted a ${type}! It will stay with you at your base.`);
  render();
}

function performRoomAction(roomId, actionKey) {
  const actions = ROOM_ACTIONS[roomId];
  if (!actions) return;
  const action = actions[actionKey];
  if (!action) return;

  //check availability
  if (!action.available()) {
    log("Not possible right now.");
    render();
    return;
  }
  //DP CHECK
  if (!spendDP(action.dpCost)) return;
  //resource cost CHECK
  if (action.resourceCost > 0 && playerState.resources < action.resourceCost) {
    playerState.dayPoints += action.dpCost; //refund dp
    log(`Not enough resources. Need ${action.resourceCost}.`);
    render();
    return;
  }
  //Gold CHECK
  if (action.goldCost > 0 && playerState.gold < action.goldCost) {
    playerState.dayPoints += action.dpCost; //refund dp
    log(`Not enough gold. Need ${action.goldCost}.`);
    render();
    return;
  }
  action.execute();
  render();
}
//Purchase upgrade
function purchaseUpgrade(upgradeKey) {
  const upgrade = UPGRADES[upgradeKey];
  if (!upgrade) return;
  if (playerState.upgrades[upgradeKey]) {
    log("Already upgraded.");
    return;
  }
  if (!upgrade.requires()) {
    log(`Requirements not met for upgrade ${upgrade.name}`);
    render();
    return;
  }
  if (playerState.gold < upgrade.goldCost) {
    log(`Not enough gold. Need ${upgrade.goldCost}`);
    render();
    return;
  }
  playerState.gold -= upgrade.goldCost;
  playerState.upgrades[upgradeKey] = true;
  log(`Purchased: ${upgrade.name}.`);

  // on purchase effects (nothing yet)
  if (upgrade.onPurchase) upgrade.onPurchase();
  render();
}
//INCOME COLLECTION
function canCollectIncome(roomId) {
  const lastDay = playerState.lastCollected[roomId] || 0;
  if (lastDay >= playerState.day) return false;
  if (roomId === "teaHouse") {
    return (
      playerState.renovateCounts.teaHouse >= 10 && playerState.upgrades.teaUp1
    );
  }
  if (roomId === "gamblingDen") {
    return (
      playerState.renovateCounts.gamblingDen >= 10 &&
      playerState.upgrades.gamblingUp1
    );
  }
  if (roomId === "tradingDocks") {
    return playerState.renovateCounts.tradingDocks >= 10;
  }
  return false;
}
function collectIncome(roomId) {
  if (!canCollectIncome(roomId)) {
    log("No income to collect yet.");
    render();
    return;
  }
  let goldGain = 0;
  let resourceGain = 0;
  const fame = playerState.fame;

  if (roomId === "teaHouse") {
    if (fame < 500) goldGain = randBetween(6, 25);
    else if (fame >= 500 && fame < 1000) goldGain = randBetween(20, 30);
    else goldGain = randBetween(35, 50);
    if (playerState.upgrades.teaUp5) resourceGain = randBetween(1, 5);
  }
  if (roomId === "gamblingDen") {
    const up2 = playerState.upgrades.gamblingUp2;
    const up3 = playerState.upgrades.gamblingUp3;
    if (fame < 800) {
      goldGain = up2 ? randBetween(12, 30) : randBetween(10, 25);
    } else if (fame < 1500) {
      goldGain = up2 ? randBetween(35, 50) : randBetween(30, 40);
    } else {
      if (up2 && up3) goldGain = randBetween(50, 200);
      else if (up2) goldGain = randBetween(50, 145);
      else goldGain = randBetween(30, 100);
    }
  }
  if (roomId === "tradingDocks") {
    resourceGain = 20;
  }
  playerState.gold += goldGain;
  playerState.resources += resourceGain;
  playerState.lastCollected[roomId] = playerState.day;

  let msg = `Income collected from ${ROOMS[roomId].name}.`;
  if (goldGain > 0) msg += ` +${goldGain} gold.`;
  if (resourceGain > 0) msg += ` +${resourceGain} resources.`;
  log(msg);
  render();
}
function degradeAncestorHappiness() {
  if (playerState.ancestorHappiness > 0) {
    playerState.ancestorHappiness = Math.max(
      0,
      playerState.ancestorHappiness - 5,
    );
  }
}
function ancestorsArePleased() {
  return playerState.ancestorHappiness > 49;
}

// WANDER ACTION (dp cost)
function wanderTown() {
  if (!spendDP(1)) return;
  //randomize which event will trigger
  const event = WANDER_EVENTS[Math.floor(Math.random() * WANDER_EVENTS.length)];
  //store pending event so render can show the choice
  playerState.wanderEvent = event;
  log(`Wandering: ${event.description}`);
  render();
}
//player choose to engage wander encounter
function engageWanderEvent() {
  const event = playerState.wanderEvent;
  if (!event) return;
  if (!event.canFight) {
    if (event.onResolve) event.onResolve();
    playerState.wanderEvent = null;
    render();
    return;
  }
  playerState.wanderEvent = null;
  playerState.currentAreaId = "area0";

  const enemies = event.encounter();
  playerState.hp = playerState.maxHp; //these set hp and en to max. subject to change
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
    log: [`${event.description} Turn 1.`],
  };
  render();
}
//Player ignore Wnder event
function ignoreWanderEvent() {
  playerState.wanderEvent = null;
  log("You walk away..");
  render();
}
// Room encounter (trigger combat from room)
function engageRoomEncounter(roomId) {
  const room = ROOMS[roomId];
  if (!room) return;
  const encounterId = room.contents.encounterId || room.contents.bossId;
  if (!encounterId) return;
  // These encounters are subject to change. (encounter table later)
  const encounterMap = {
    alleyAmbush: () => [
      createEnemy(SHADOW_CLAN.scHenchman),
      createEnemy(SHADOW_CLAN.scWeakling),
    ],
    shadowClanPatrol: () => [
      createEnemy(SHADOW_CLAN.scHenchman),
      createEnemy(SHADOW_CLAN.scWeakling),
      createEnemy(SHADOW_CLAN.scHenchman),
    ],
    shadowClanElite: () => [
      createEnemy(SHADOW_CLAN.scNinja),
      createEnemy(SHADOW_CLAN.scLieutenant),
      createEnemy(SHADOW_CLAN.scSalesPerson),
      createEnemy(SHADOW_CLAN.scHenchman),
    ],
    shadowClanBoss: () => [
      createEnemy(SHADOW_CLAN.scNinja),
      createEnemy(SHADOW_CLAN.scSalesPerson),
      createEnemy(SHADOW_CLAN.scLieutenant),
      createEnemy(SHADOW_CLAN.scHenchman),
      createEnemy(SHADOW_CLAN.scHenchman),
      createEnemy(SHADOW_CLAN.scKarambe),
    ],
  };
  const buildFn = encounterMap[encounterId];
  if (!buildFn) return;

  playerState.hp = playerState.maxHp; // Subject to change?
  playerState.energy = playerState.maxEnergy;

  playerState.combat = {
    enemies: buildFn(),
    turn: 1,
    actionPoints: 2, //subject to change/test
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
    sourceRoomId: room.id,
    isBossFight: !!room.contents.bossId,
    log: [`You engage enemies in ${room.name}. Turn 1.`],
  };
  render();
}
function markRoomCleared(roomId) {
  if(!roomId) return;
  playerState.roomsCleared[roomId] = true;
  if(playerState.currentAreaId) refreshRoomStates(playerState.currentAreaId);
}
function startArenaBattle() {
  const maxEnemies = playerState.upgrades.arenaUp2 ? 7 : 3;
  //random encounter from SHADOW_CLAN enemies. might do selection down the line
  const pool = object.values(SHADOW_CLAN).filter(e => e.name !== "Test Dummy");
  const shuffled = pool.sort(() => Math.random() - 0.5);
  const enemies = shuffled.slice(0, maxEnemies).map(createEnemy);

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
    sourceRoomId: "arena", //UNSURE about this one
    isBossFight: false,
    log: [`You enter the arena. Turn 1.`],
  };
  render();
}
function randBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function trySocialUnlock() {
  const available = Object.keys(playerState.socialUnlocks).filter(
    k => !playerState.socialUnlocks[k]
  );
  if(available.length === 0){
    log("You know everything worth knowing about this place.")
    return;
  }
  if (Math.random() < 0.05) {
    const key = available[Math.floor(Math.random() *available.length)];
    playerState.socialUnlocks[key] = true;
    log(`New contract: ${key} unlocked!`);
  } else {
    log("You socialize but nothing comes of it.");
  }
  }
