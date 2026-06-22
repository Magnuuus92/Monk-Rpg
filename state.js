function getDerivedStats(stats) {
  return {
    maxHp: 50 + stats.vitality * 8 + stats.resilience * 3,
    maxEnergy: 50 + stats.willpower * 8 + stats.intellect * 3,
  };
}
const baseStats = {
  strength: 5,
  dexterity: 5,
  vitality: 5,
  resilience: 5,
  willpower: 5,
  intellect: 5,
};
const derived = getDerivedStats(baseStats);

const playerState = {
  name: "Hero",
  level: 1,
  experience: 0,
  skillPoints: 15,
  statPoints: 0,
  stats: { ...baseStats },
  hp: derived.maxHp,
  maxHp: derived.maxHp,
  energy: derived.maxEnergy,
  maxEnergy: derived.maxEnergy,
  //currencies
  gold: 10,
  fame: 0,
  resources: 0,
  ancestorHappiness: 0,
  skills: {
    //force branch
    a1: false,
    a2: false,
    a3: false,
    a4: false,
    a5: false,
    a6: false,
    a7: false,

    //discipline branc
    b1: false,
    b2: false,
    b3: false,
    b4: false,
    b5: false,
    b6: false,
    b7: false,

    //spirit branch
    c1: false,
    c2: false,
    c3: false,
    c4: false,
    c5: false,
    c6: false,
    c7: false,

    // force + dicipline
    ab1: false,
    ab2: false,
    ab3: false,

    //discipline + spirit
    bc1: false,
    bc2: false,
    bc3: false,

    //misc branch
    r1: false,
    r2: false,
    r3: false,
    r4: false,
    r5: false,
    r6: false,
  },

  day: 1,
  dayPoints: 5,
  maxDayPoints: 5,
  socialUnlocks: {
    northernCards: false,
    neighbourKids: false,
    trainingGear: false,
  },
  upgrades: {
    teaUp1: false,
    teaUp2: false,
    teaUp3: false,
    teaUp4: false,
    teaUp5: false,
    dojoUp1: false,
    gamblingUp1: false,
    gamblingUp2: false,
    gamblingUp3: false,
    arenaUp1: false,
    arenaUp2: false,
    tradeUp1: false,
    tradeUp2: false,
    tradeUp3: false,
    tradeUp4: false,
    ancUp1: false,
    ancUp2: false,
  },
  renovateCounts: {
    teaHouse: 0,
    dojo: 0,
    gamblingDen: 0,
    arena: 0,
    tradingDocks: 0,
    ancestralGrounds: 0,
  },
  lastCollected: {
    teaHouse: 0,
    gamblingDen: 0,
    tradingDocks: 0,
  },
  worldUnlocks: {
    area0Unlocked: true,
    area1Unlocked: false,
    area2Unlocked: false,
    area3Unlocked: false,
    area4Unlocked: false,
    area1Conquered: false,
    area2Conquered: false,
    area3Conquered: false,
    area4Conquered: false,
  },
  currentAreaId: null,
  currentRoomId: null,
  areasConquered: [false, false, false, false],
  roomsCleared: {},
  npcsVisited: {},
  wanderEvent: null,
  combat: null,

  counters: {
    physLabour: 0,
    broadMind: 0,
    becomeFlex: 0,
    harnessPow: 0,
  },
  claimedThresholds: {
    physLabour: [],
    broadMind: [],
    becomeFlex: [],
    harnessPow: [],
  },
  counterUnlocks: {
    physLabour: false,
    physLabour2: false,
    broadMind: false,
    broadMind2: false,
    becomeFlex: false,
    becomeFlex2: false,
    harnessPow: false,
    harnessPow2: false,
  },
};
