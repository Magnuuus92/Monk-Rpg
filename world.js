const AREA_COLORS = {
  base: "#1a2a1a", // home base
  area0: "#2a2a1a", // town
  area1: "#1a1a2a", // Shadow Clan territory
  area2: "#2a1a2a", // Afterlife Cult
  area3: "#2a1a1a", //  Graveyard
  area4: "#1a2a2a", //  Syndicate
};

const UPGRADES = {
  teaUp1: {
    key: "teaUp1",
    roomid: "teaHouse",
    name: "Interior improvements",
    description: "Fix teahouse interior.",
    goldCost: 1,
    requires: () => true,
  },
  teaUp2: {
    key: "teaUp2",
    roomid: "teaHouse",
    name: "New business front.",
    description: "Fix teahouse exterior.",
    goldCost: 1,
    requires: () => playerState.upgrades.teaUp1,
  },
  teaUp3: {
    key: "teaUp3",
    roomid: "teaHouse",
    name: "Expand tea production I.",
    description: "Teamaster will start producing a sellable surplus of tea.",
    goldCost: 1,
    requires: () => true,
  },
  teaUp4: {
    key: "teaUp4",
    roomid: "teaHouse",
    name: "Expand tea production II.",
    description: "Further expansion of tea production.",
    goldCost: 1,
    requires: () => playerState.upgrades.teaUp3,
  },
  teaUp5: {
    key: "teaUp5",
    roomid: "teaHouse",
    name: "Employ neighbourhood kids",
    description: "Employs neighbourhood kids to gather resources.",
    goldCost: 1,
    requires: () => playerState.socialUnlocks.neighbourKids,
  },
  dojoUp1: {
    key: "dojoUp1",
    roomid: "dojo",
    name: "Donate",
    description: "Fix the dojo.",
    goldCost: 1,
    requires: () => true,
  },
  gamblingUp1: {
    key: "gamblingUp1",
    roomid: "gamblingDen",
    name: "New facilities",
    description: "Replace worn and damaged interior.",
    goldCost: 1,
    requires: () => true,
  },
  gamblingUp2: {
    key: "gamblingUp2",
    roomid: "gamblingDen",
    name: "Alcohol supply deal",
    description:
      "Get a discount on alcohol by buying in bulk, boosts income significantly.",
    goldCost: 1,
    requires: () => playerState.upgrades.tradeUp3,
  },
  gamblingUp3: {
    key: "gamblingUp3",
    roomid: "gamblingDen",
    name: "Northern cardgames",
    description: "Exotic card games that attracts new customers.",
    goldCost: 1,
    requires: () => playerState.socialUnlocks.northernCard,
  },
  arenaUp1: {
    key: "arenaUp1",
    roomId: "arena",
    name: "Foreign Training Gear",
    description: "Top-quality equipment. Attracts a variety of fighters.",
    goldCost: 1,
    requires: () => playerState.socialUnlocks.trainingGear,
  },
  arenaUp2: {
    key: "arenaUp2",
    roomId: "arena",
    name: "Upgrade Combat Arena",
    description: "Expand the arena. Allows up to 7 enemies in battle.",
    goldCost: 1,
    requires: () => true,
  },
  tradeUp1: {
    key: "tradeUp1",
    roomId: "tradingDocks",
    name: "Better docking",
    description: "Improved dock infrastructure.",
    goldCost: 1,
    requires: () => true,
  },
  tradeUp2: {
    key: "tradeUp2",
    roomId: "tradingDocks",
    name: "Merchant amenities",
    description: "Attracts more traders.",
    goldCost: 1,
    requires: () => true,
  },
  tradeUp3: {
    key: "tradeUp3",
    roomId: "tradingDocks",
    name: "Merchant Deals",
    description:
      "Establishes partnership with merchants.(Unlocks upgrades elsewhere).",
    goldCost: 1,
    requires: () => playerState.upgrades.tradeUp2,
  },
  tradeUp4: {
    key: "tradeUp4",
    roomId: "tradingDocks",
    name: "Overseas tea export",
    description:
      "Set up a deal with merchant to sell your surplus tea overseas at a premium.",
    goldCost: 1,
    requires: () => playerState.upgrades.teaUp2 && playerState.upgrades.teaUp3,
  },
  ancUp1: {
    key: "ancUp1",
    roomId: "ancestralGrounds",
    name: "Fence",
    description: "Fence up the graveyard.(Unlocks graveyard work).",
    goldCost: 1,
    requires: () => true,
  },
  ancUp2: {
    key: "ancUp2",
    roomId: "ancestralGrounds",
    name: "Big Statue",
    description: "Big monument to the ancestors.",
    goldCost: 1,
    requires: () => playerState.upgrades.ancUp1,
  },
};
//npc definition
const NPCS = {
  oldMerchant: {
    id: "oldMerchant",
    name: "Old Merchant",
    type: "shop",
    dialogue: "Hello, take a look at my wares.",
    onTalk(player) {
      log("You browse the merchants wares.");
    },
  },
  mayor: {
    id: "mayor",
    name: "Mayor",
    type: "questGiver",
    dialogue: "Bla blah.",
    onTalk(player) {
      if (!player.worldUnlocks.area1Unlocked) {
        player.worldUnlocks.area1Unlocked = true;
        log(
          "Mayor: The shadow clan is running rampant. I have heard that you used to be a fierce fighter back in your day. Could you help the council with restoring the peace?",
        );
        log("Area 1 is now unlocked.");
      } else {
        log("Mayor: Hows it going?");
      }
      player.npcsVisited["mayor"] = true;
    },
  },
  trainer1: {
    id: "trainer1",
    name: "Kung Fu Teacher",
    type: "trainer",
    dialogue: "Do you want to test your skills with a sparring match?",
    onTalk(player) {
      log(
        "Oh darn! The old arrow to the knee injury is acting up. We will have to sparr some other time. (not yet implemented.)",
      );
      player.npcsVisited["trainer1"] = true;
    },
  },
  teaMaster: {
    id: "teaMaster",
    name: "Tea Master",
    type: "story",
    dialogue: "There is peace in every cup.",
    onTalk(player) {
      log(
        "Tea Master: 'This teahouse has stood for generations. It needs care to survive.'",
      );
      player.npcsVisited["teaMaster"] = true;
    },
  },
  martialArtist: {
    id: "martialArtist",
    name: "Martial Artist",
    type: "trainer",
    dialogue: "Discipline is the foundation of strength.",
    onTalk(player) {
      log("Martial Artist: 'Work hard and the body will follow.'");
      player.npcsVisited["martialArtist"] = true;
    },
  },
  denBoss: {
    id: "denBoss",
    name: "Bogdu",
    type: "questgiver",
    dialogue: "The house always wins.",
    onTalk(player) {
      log("Martial Artist: 'Work hard and the money will follow.'");
      player.npcsVisited["denBoss"] = true;
    },
  },
  fightFanatic: {
    id: "fightFanatic",
    name: "Fight Fanatic",
    type: "story",
    dialogue: "I love a good fight!",
    onTalk(player) {
      log("Fight Fanatic: 'The crowd loves a good show. Give them one.'");
      player.npcsVisited["fightFanatic"] = true;
    },
  },
  dockMaster: {
    id: "dockMaster",
    name: "Dock Master",
    type: "shop",
    dialogue: "Everything comes through here sooner or later.",
    onTalk(player) {
      log(
        "Dock Master: 'Resources for sale, 5 gold each. Buy or sell?' (Not yet implemented.)",
      );
      player.npcsVisited["dockMaster"] = true;
    },
  },

  ancestorSpirit: {
    id: "ancestorSpirit",
    name: "Ancestor spirit",
    type: "story",
    dialogue: "I am your great great great great great grandfather",
    onTalk(player) {
      if (player.ancestorHapiness <= 50) {
        log(
          "Ancestor Spirit: The state of our final resting place is shameful..",
        );
      } else if (player.ancestorHapiness >= 50) {
        log("You honor your ancestors. You have our blessing.");
      }
      player.npcsVisited["ancestorSpirit"] = true;
    },
  },
};

const ROOMS = {
  area0_square: {
    id: "area0_square",
    areaId: "area0",
    name: "Town Square",
    description: "Your old stomping grounds.",
    color: "#3a3a1a",
    state: "unlocked",
    unlockCondition: null,
    contents: {
      npcId: "mayor",
      eventId: null,
      encounterId: null,
      bossId: null,
    },
  },
  area0_commerce: {
    id: "area0_commerce",
    areaId: "area0",
    name: "Commercial district",
    description:
      "A once bustling hub for commerce. Now theres only a few vendors left. Pity..",
    color: "#4a3a1a",
    state: "unlocked",
    unlockCondition: null,
    contents: {
      npcId: "oldMerchant",
      eventId: null,
      encounterId: null,
      bossId: null,
    },
  },
  area0_mountain: {
    id: "area0_mountain",
    areaId: "area0",
    name: "City Heights",
    description: "Elevated above the rest of the city.",
    color: "#3a2a1a",
    state: "unlocked",
    unlockCondition: null,
    contents: {
      npcId: "trainer1",
      eventId: null,
      encounterId: null,
      bossId: null,
    },
  },
  area0_alley: {
    id: "area0_alley",
    areaId: "area0",
    name: "Back lley",
    description: "A narrow alley. People sometimes get mugged here.",
    color: "#2a2a2a",
    state: "locked",
    unlockCondition: () => playerState.npcsVisited["mayor"] === true,
    contents: {
      npcId: null,
      eventId: "alleyAmbush",
      encounterId: null,
      bossId: null,
    },
  },
  teaHouse: {
    id: "teaHouse",
    areaId: "area0",
    name: "Tea House",
    description: "A quiet teahouse off the main road. It has seen better days.",
    color: "#3a4a2a",
    state: "locked",
    unlockCondition: () => playerState.roomsCleared["area0_alley"] === true,
    contents: {
      npcId: "teaMaster",
      eventId: null,
      encounterId: null,
      bossId: null,
    },
    hasIncome: true,
    upgradeIds: ["teaUp1", "teaUp2", "teaUp3", "teaUp4", "teaUp5"],
  },
  dojo: {
    id: "dojo",
    areaId: "area0",
    name: "Dojo",
    description: "A training hall. Dusty but full of potential.",
    color: "#4a3a2a",
    state: "locked",
    unlockCondition: () => playerState.npcsVisited["trainer1"] === true,
    contents: {
      npcId: "martialArtist",
      eventId: null,
      encounterId: null,
      bossId: null,
    },
    hasIncome: false,
    upgradeIds: ["dojoUp1"],
  },

  // AREA1 SHADOWCLAN /INNER CITY
  area1_east: {
    id: "area1_east",
    areaId: "area1",
    name: "Inner city east",
    description: "Placeholder",
    color: "#1a1a3a",
    state: "unlocked",
    unlockCondition: null,
    contents: {
      npcId: null,
      eventId: null,
      encounterId: "shadowClanPatrol",
      bossId: null,
    },
  },
  area1_entertainment: {
    id: "area1_entertainment",
    areaId: "area1",
    name: "Inner city entertainment district",
    description: "Placeholder",
    color: "#1a1a4a",
    state: "locked",
    unlockCondition: () => playerState.roomsCleared["area1_east"] === true,
    contents: {
      npcId: null,
      eventId: null,
      encounterId: "shadowClanElite",
      bossId: null,
    },
  },
  area1_mansion: {
    id: "area1_mansion",
    areaId: "area1",
    name: "Mansion",
    description: "A large rundown mansion.",
    color: "#0a0a3a",
    state: "hidden",
    unlockCondition: () =>
      playerState.roomsCleared["area1_entertainment"] === true,
    contents: {
      npcId: null,
      eventId: null,
      encounterId: null,
      bossId: "shadowClanBoss",
    },
  },
  gamblingDen: {
    id: "gamblingDen",
    areaId: "area1",
    name: "Gambling Den",
    description: "A dimly lit den full of shady characters.",
    color: "#2a1a3a",
    state: "locked",
    unlockCondition: () => true, //playerState.roomsCleared["area1_mansion"] === true, REMOVE! = //
    contents: {
      npcId: "denBoss",
      eventId: null,
      encounterId: null,
      bossId: null,
    },
    hasIncome: true,
    upgradeIds: ["gamblingUp1", "gamblingUp2", "gamblingUp3"],
  },
  arena: {
    id: "arena",
    areaId: "area1",
    name: "Fight Club / Arena",
    description: "The crowd roars. Someone always bleeds here.",
    color: "#3a1a1a",
    state: "locked",
    unlockCondition: () => playerState.fame >= 500,
    contents: {
      npcId: "fightFanatic",
      eventId: null,
      encounterId: null,
      bossId: null,
    },
    hasIncome: false,
    upgradeIds: ["arenaUp1", "arenaUp2"],
  },
  //Area 2 OceanPeak
  tradingDocks: {
    id: "tradingDocks",
    areaId: "area2",
    name: "Trading Docks",
    description: "Ships from distant lands unload their cargo here.",
    color: "#2a2a3a",
    state: "locked",
    unlockCondition: () => true, //playerState.worldUnlocks.area2Conquered === true, REMOVE
    contents: {
      npcId: "dockMaster",
      eventId: null,
      encounterId: null,
      bossId: null,
    },
    hasIncome: true,
    upgradeIds: ["tradeUp1", "tradeUp2", "tradeUp3", "tradeUp4"],
  },
  //Area 3 West placeholder
  ancestralGrounds: {
    id: "ancestralGrounds",
    areaId: "area3",
    name: "Ancestral Grounds",
    description: "Sacred land where the old ones rest.",
    color: "#2a1a2a",
    state: "locked",
    unlockCondition: () => true, //playerState.worldUnlocks.area3Conquered === true, REMOVE LATER
    contents: {
      npcId: "ancestorSpirit",
      eventId: null,
      encounterId: null,
      bossId: null,
    },
    hasIncome: false,
    upgradeIds: ["ancUp1", "ancUp2"],
  },
};

//AREA DEFINITIONS

const AREAS = {
  area0: {
    id: "area0",
    name: "Town",
    description: "placeholder",
    color: AREA_COLORS.area0,
    isUnlocked: () => playerState.worldUnlocks.area0Unlocked,
    isSafeZone: true,
    roomIds: [
      "area0_square",
      "area0_commerce",
      "area0_mountain",
      "area0_alley",
      "teaHouse",
      "dojo",
    ],
  },
  area1: {
    id: "area1",
    name: "Inner City",
    description:
      "The inner city. People come here for entertainment, alcohol and shady business.",
    color: AREA_COLORS.area1,
    isUnlocked: () => playerState.worldUnlocks.area1Unlocked,
    isSafeZone: false,
    roomIds: [
      "area1_east",
      "area1_entertainment",
      "area1_mansion",
      "gamblingDen",
      "arena",
    ],
  },
  area2: {
    id: "area2",
    name: "Afterlife Cult Grounds",
    description: "Placeholder.",
    color: AREA_COLORS.area2,
    isUnlocked: () => playerState.worldUnlocks.area2Unlocked,
    isSafeZone: false,
    roomIds: ["tradingDocks"],
  },
  area3: {
    id: "area3",
    name: "Ancient Burial Grounds",
    description: "Placeholder.",
    color: AREA_COLORS.area3,
    isUnlocked: () => playerState.worldUnlocks.area3Unlocked,
    isSafeZone: false,
    roomIds: ["ancestralGrounds"],
  },

  area4: {
    id: "area4",
    name: "North Placeholder",
    description: "Placeholder.",
    color: AREA_COLORS.area4,
    isUnlocked: () => playerState.worldUnlocks.area4Unlocked,
    isSafeZone: false,
    roomIds: [],
  },
};
const WANDER_EVENTS = [
  {
    id: "sparringChallenge",
    description:
      "A fighter wants to test your mettle. He has challenged you to a sparring duel.",
    canFight: true,
    encounter: () => [createEnemy(SHADOW_CLAN.scTestDummy)],
  },
  {
    id: "thief",
    description:
      "You witness a thief mugging a citizen at knifepoint. You yell out and the thief starts running. You run after him.",
    canFight: true,
    encounter: () => [createEnemy(SHADOW_CLAN.scWeakling)],
  },
  {
    id: "boulder",
    description:
      "A large pile of debris is blocking the street. Its making it hard for citizens to pass by. You get to work dismantling it.",
    canFight: true,
    encounter: () => [createEnemy(SHADOW_CLAN.debris)], //uncertain about this one.
  },
  {
    id: "nothing",
    description: "You had a pleasant and uneventful stroll.",
    canFight: false,
  },
];
