const AREA_COLORS = {
  base: "#1a2a1a", // home base
  area0: "#2a2a1a", // town
  area1: "#1a1a2a", // Shadow Clan territory
  area2: "#2a1a2a", // Afterlife Cult
  area3: "#2a1a1a", //  Graveyard
  area4: "#1a2a2a", //  Syndicate
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
      player.npcVisited["mayor"] = true;
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
      player.npcVisited["trainer1"] = true;
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
    unlockCondition: () => playerState.npcVisited["mayor"] === true,
    contents: {
      npcId: null,
      eventId: "alleyAmbush",
      encounterId: null,
      bossId: null,
    },
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
    roomIds: ["area1_east", "area1_entertainment", "area1_mansion"],
  },
  area2: {
    id: "area2",
    name: "Afterlife Cult Grounds",
    description: "Placeholder.",
    color: AREA_COLORS.area2,
    isUnlocked: () => playerState.worldUnlocks.area2Unlocked,
    isSafeZone: false,
    roomIds: [],
  },
  area3: {
    id: "area3",
    name: "Undead Wastes",
    description: "Placeholder.",
    color: AREA_COLORS.area3,
    isUnlocked: () => playerState.worldUnlocks.area3Unlocked,
    isSafeZone: false,
    roomIds: [],
  },

  area4: {
    id: "area4",
    name: "Syndicate Stronghold",
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
    encounter: () => [createEnemy(shadowClan.scTestDummy)],
  },
  {
    id: "thief",
    description:
      "You witness a thief mugging a citizen at knifepoint. You yell out and the thief starts running. You run after him.",
    canFight: true,
    encounter: () => [createEnemy(shadowClan.scWeakling)],
  },
  {
    id: "boulder",
    description:
      "A large pile of debris is blocking the street. Its making it hard for citizens to pass by. You get to work dismantling it.",
    canFight: true,
    encounter: () => [createEnemy(shadowClan.debris)], //uncertain about this one.
  },
  {
    id: "nothing",
    description: "You had a pleasant and uneventful stroll.",
    canFight: false,
  },
];
