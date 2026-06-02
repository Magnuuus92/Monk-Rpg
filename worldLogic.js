//WORLD navigation
//open map from base only?
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
function enterRoom() {
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
  if (!event || !event.canFight) return;
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
    alerStance: false,
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
  if (!room || !room.contents.encounterId) return;
  // These encounters are subject to change. (encounter table later)
  const encounterMap = {
    shadowClanPatrol: () => [
      createEnemy(SHADOW_CLAN.scHenchman),
      createEnemy(SHADOW_CLAN.scWeakling),
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
    ],
  };
  const buildFn = encounterMap[room.contents.encounterId];
  if (!buildFn) return;

  playerState.hp = playerState.maxHp; // Subject to change?
  playerState.energy = playerState.maxEnergy;

  playerState.combat ={
enemies = buildFn(),
turn: 1,
actionPoints: 2,//subject to change/test
maxAp: 2 + (playerState.skills.r6 ? 1 : 0),
alerStance: false,
result: null,
block: 0,
blockCarryover: 0,
strikeCount:       0,
flatDmgBonus:      0,
timeDabbleUses:    0,
pendingSkill:      null,
accumulatedEnergy: 0,
log:[`You engage enemies in ${room.name}. Turn 1.`],
  };
  render();
}
