//Router
function renderWorld() {
  if (playerState.currentRoomId) {
    renderRoom(playerState.currentRoomId);
  } else if (playerState.currentAreaId) {
    renderAreaOverview(playerState.currentAreaId);
  } else {
    renderWorldMap();
  }
}
//WorldMap
function renderWorldMap() {
  const app = document.getElementById("app");

  const areaCards = Object.values(AREAS)
    .map((area) => {
      const unlocked = area.isUnlocked();
      const style = `background-color: ${area.color}; opacity: ${unlocked ? "1" : "0.4"};`;

      return `<div class="area-card" style="${style}">
        <strong>${area.name}</strong><br/>
        <em>${unlocked ? area.description : "??? - Locked"}</em><br/><br/>
        <button
        ${unlocked ? "" : "disabled"}
        onclick="enterArea('${area.id}')">
       ${unlocked ? "Enter" : "Locked"}
        </button>
        </div>
        `;
    })
    .join("");

  app.innerHTML = `
  <h1>GAMEPROJECT - WORLD</h1>
  ${renderWorldStatusBar()}
  <hr />
  <button onclick="returnToBase()"> Return to Base </button>
  <h2>World Map</h2>
  <div class="area-grid">
  ${areaCards}
  </div>`;
}

//AREA OVERVIEW show rooms inside area
function renderAreaOverview(areaId) {
  const area = AREAS[areaId];
  const app = document.getElementById("app");

  const roomCards = area.roomIds
    .map((roomId) => {
      const room = ROOMS[roomId];
      if (room.state === "hidden") return ""; //hides hidden rooms

      const cleared = playerState.roomsCleared[roomId];
      const locked = room.state === "locked";
      const style = `
        background-color: ${room.color};
        opacity: ${locked ? "0.4" : "1"};
        height: 80px;
        `;

      return `
        <div class="room-card" style="${style}">
        <strong>${locked ? "???" : room.name}</strong><br/>
        <small>${locked ? "Locked" : cleared ? "Cleared" : room.description}</small>
        <br/><br/>
        <button
        ${locked ? "disabled" : ""}
        onclick="enterRoom('${roomId}')">
        ${locked ? "Locked" : "Enter"}
        </button>
        </div>
        `;
    })
    .join("");

  // wander action in safezone
  const wanderBtn = area.isSafeZone
    ? `
    <button onclick="wanderTown()">
    Wander around town <small>(1 DP)</small>
    </button>
    `
    : "";

  //pending wander event choice
  const wanderEventPanel = playerState.wanderEvent
    ? renderWanderEventPanel(playerState.wanderEvent)
    : "";

  app.innerHTML = `
        <h1>GAMEPROJECT — ${area.name}</h1>
        ${renderWorldStatusBar()}
        <hr />
        <button onclick="openWorld()">World Map</button>
        <button onclick="returnToBase()">Return to Base</button>
        <p><em>${area.description}</em></p>
        <hr />
        ${wanderEventPanel}
        ${wanderBtn}
        <h3>Rooms</h3>
        <div class="room-grid">
            ${roomCards || "<p><em>No rooms yet.</em></p>"}
        </div>
    `;
}
// ROOM SCREEN contents of room
function renderRoom(roomId) {
  const room = ROOMS[roomId];
  const app = document.getElementById("app");
  const cleared = playerState.roomsCleared[roomId];
  //placeholder image/color
  const imageStyle = `
        width: 700px;
        height: 400px;
        background-color: ${room.color};
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
        border-radius: 4px;
    `;

  app.innerHTML = `
    <h1>${room.name}</h1>
    ${renderWorldStatusBar()}
    <hr />
    <button onclick="leaveRoom()">Back to ${AREAS[room.areaId].name}</button>
     <br/><br/>
     
     <div style="${imageStyle}">
     <span style="color:#666; font-size:14px;">[${room.name} - 700x400]</span>
     </div>
     <p> ${room.description} </p>
     <hr />
     <div id="room-actions">
     ${renderRoomContent(room, cleared)}
     </div>
     <hr />
     <div id="log">
     ${renderWorldLog()}
     </div>
     `;
}
//Render inside rooms override
function renderRoomContent(room, cleared) {
  const parts = [];
  // Combat & boss
  if (room.contents.encounterId && !cleared) {
    parts.push(`            <h3>Enemies</h3>
            <button onclick="engageRoomEncounter('${room.id}')">Engage Enemies</button>
            <hr />

    `);
  }
  if (room.contents.bossId && !cleared) {
    parts.push(`<h3> BOSS </h3>
      <button onclick="engageRoomEncounter('${room.id}')">Fight Boss</button>
      <hr />
      `);
  }
  if (cleared && (room.contents.encounterId || room.contents.bossId)) {
    parts.push(`<p><em>Enemies defeated.</em></p><hr />`);
  }
  //NPCs
  if (room.contents.npcId) {
    const npc = NPCS[room.contents.npcId];
    parts.push(`
            <h3>NPC</h3>
            <button onclick="talkToNpc('${npc.id}')">Talk to ${npc.name}</button>
            <hr />
        `);
  }
  //repeatable actions
  const actions = ROOM_ACTIONS[room.id];
  if (actions) {
    parts.push(`<h3>Actions</h3>`);
    Object.entries(actions).forEach(([key, action]) => {
      const canDo =
        action.available() && playerState.dayPoints >= action.dpCost;
      const costParts = [`${action.dpCost} DP`];
      if (action.resourceCost > 0) costParts.push(`${action.resourceCost} res`);
      if (action.goldCost > 0) costParts.push(`${action.goldCost} gold`);
      parts.push(`
        <div class="action-row">
        <button ${canDo ? "" : "disabled"}
        onclick="performRoomAction('${room.id}', '${key}')">
        ${action.label} <small>(${costParts.join(", ")})</small>
        </button>
        <small>${action.description}</small>
        </div>
        `);
    });
    parts.push(`<hr />`);
  }
  //INCOME Collect
  if (room.hasIncome) {
    parts.push(`<h3>Income</h3>`);
    parts.push(renderIncomeSection(room));
    parts.push(`<hr />`);
  }
  //UPGRADES
  if (room.upgradeIds && room.upgradeIds.length > 0) {
    parts.push(`<h3>Upgrades</h3>`);
    parts.push(renderUpgrades(room.upgradeIds));
    parts.push(`<hr />`);
  }
  if (room.id === "ancestralGrounds") {
    const pct = playerState.ancestorHappiness;
    const status =
      pct > 49
        ? "Pleased ancestors - Ancestor blessing available"
        : "Your ancestors are not pleased - Increase the happiness by tending to their graves.";
    parts.push(`
      <h3>Ancestor Happiness</h3>
      <p>${pct}/100 — ${status}</p>
      <div style="background:#333; border-radius:4px; height:12px; width:100%;">
      <div style="background:#6a6; border-radius:4px; height:12px; width:${pct}%;"></div>
      </div>
      <hr />
`);
  }
  if(room.id === "dojo"){
    parts.push(renderMartialArtistQuest());
  }
  if(room.id === "area0_commerce"){
    parts.push(renderMerchantShop());
  }
  if(room.id === "area0_alley"
    && playerState.roomsCleared["area0_alley"]
    && !playerState.eventsTriggered.petChoice){
    parts.push(renderPetChoicePanel());
  }
  //endday button for fully renov rooms.
  if(room.isRoomFullyRenovated){
    parts.push(`<button onclick="endDay()">End day</button>`);
  }
  return parts.length > 0
    ? parts.join("")
    : "<p><em>Nothing to do here</em></p>";
}
//INCOME SECTION
function renderIncomeSection(room) {
  const roomId = room.id;
  const ready = canCollectIncome(roomId);
  const lastDay = playerState.lastCollected[roomId] || 0;
  const collectedToday = lastDay >= playerState.day;
  //Show unlock req
  if (!ready && !collectedToday) {
    let requirements = "";
    if (roomId === "teaHouse") {
      const rCount = playerState.renovateCounts.teaHouse;
      requirements = `Renovate ${rCount}/10 times + purchase first upgrade.`;
    }
    if (roomId === "gamblingDen") {
      const rCount = playerState.renovateCounts.gamblingDen;
      requirements = `Renovate ${rCount}/10 times + purchase first upgrade.`;
    }
    if (roomId === "tradingDocks") {
      const rCount = playerState.renovateCounts.tradingDocks;
      requirements = `Renovate ${rCount}/10 times`;
    }
    return `<p><em>Income locked. Requirements: ${requirements}</em></p>`;
  }
  if (collectedToday) {
    return `<p><em>Income already collected today. Come back tomorrow.</em></p>`;
  }
  return `<p> Daily income is ready to collect!</p>
<button onclick="collectIncome('${roomId}')">Collect income</button>`;
}
function renderUpgrades(upgradeIds) {
  return upgradeIds
    .map((key) => {
      const upgrade = UPGRADES[key];
      const purchased = playerState.upgrades[key];
      const canBuy =
        !purchased &&
        upgrade.requires() &&
        playerState.gold >= upgrade.goldCost;

      return `
    <div class="upgrade-row">
    <strong>${upgrade.name}</strong>
    ${purchased ? "<small>Purchased</small>" : ""}
    <br/>
    <small>${upgrade.description}</small></br>
    ${
      purchased
        ? ""
        : `<button ${canBuy ? "" : "disabled"} onclick="purchaseUpgrade('${key}')">
      Buy <small>(${upgrade.goldCost} gold)</small>
      </button>
      ${
        !upgrade.requires()
          ? `<small><em> Requirements not met.</em></small>`
          : ""
      }`
    }
    </div>`;
    })
    .join("");
}

function renderRoomActions(room, cleared) {
  const parts = [];
  //NPC
  if (room.contents.npcId) {
    const npc = NPCS[room.contents.npcId];
    parts.push(`
            <button onclick="talkToNpc('${npc.id}')">
            Talk to ${npc.name}
            </button>
            `);
  }
  //ENCOUNTER
  if (room.contents.encounterId && !cleared) {
    parts.push(`
            <button onclick="engageRoomEncounter('${room.id}')">
            Engage enemies
            </button>
            `);
  }
  // Cleared notice
  if (cleared) {
    parts.push(`
        <p><em> This room has been cleared.</em></p>`);
  }

  //BOSS PLACEHOLDER
  if (room.contents.bossId && !cleared) {
    parts.push(
      `<button onclick="engageRoomEncounter('${room.id}')">
    Fight boss
    </button>
    `,
    );
  }
  return parts.length > 0
    ? parts.join("")
    : "<p><em>Nothing to do here.</em></p>";
}
//Wander event panel
function renderWanderEventPanel(event) {
  const fightBtn = event.canFight
    ? `<button onclick="engageWanderEvent()">Engage</button>`
    : `<button onclick="engageWanderEvent()">Resolve</button>`;
  return `
    <div class="eventPanel">
    <strong>Event:</strong> ${event.description}<br/><br/>
    ${event.canFight || event.onResolve ? fightBtn : ""}
    <button onclick="ignoreWanderEvent()">Walk Away</button>
    </div>
    <hr />
    `;
}
//SHARED HELPERS
function renderWorldStatusBar() {
  const p = playerState;
  return `
        <div id="status">
            <span>Day ${p.day}</span> |
            <span>DP: ${p.dayPoints}/${p.maxDayPoints}</span> |
            <span>HP: ${p.hp}/${p.maxHp}</span> |
            <span>Gold: ${p.gold}</span> |
            <span>Resources: ${p.resources}</span>|
            <span>Fame: ${p.fame}</span>
            <span>Level: ${p.level}</span> |
        </div>
`;
}
function renderWorldLog() {
  if (gameLog.length === 0) return "<p><em>Nothing yet.</em></p>";
  return gameLog
    .slice()
    .reverse()
    .slice(0, 5) // shows last 5 msg in ww
    .map((msg) => `<p>> ${msg}</p>`)
    .join("");
}
function renderMartialArtistQuest(){
  const stage = playerState.quests.martialArtsTraining;
  const ready = isRoomFullyRenovated("dojo");
  if(!ready && stage === "locked") return "";
  if(stage === "locked"){
    return`
    <h3>Training offer</h3>
    <p>The martial artist is pleased with your dedication to the dojo.</p>
    <button onclick="startMartialArtistQuest()">Begin training</button>
    <hr />
    `;
  }
  if( stage === "active"){
    const count = playerState.questProgress.martialArtistSparCount;
    const done = count >= 5;
    return `
    <h3>Quest: Martial prowess</h3>
    <p>Spar at the dojo. Progress: ${count}/5</p>
    <button ${done ? "" : "disabled"} onclick="turnInMartialArtistQuest()">Complete Quest</button>
    <hr />
    `;
  }
  if(stage === "completed"){
    const price = SKILL_POINT_PRICES[playerState.skillPointPurchases];
    return`
    <h3>Skill point training</h3>
    ${price !== undefined
      ?`<button ${playerState.gold >= price ? "" : "disabled"} onclick="buySkillPoint()">
      Buy Skill Point <small>(${price} gold)</small>
      </button>`
      :`<p><em>Martial Artist: Theres nothing more I can teach you.</em></p>`
    }
    <hr />
    `;
  }
  return "";
}
function renderMerchantShop(){
  const p = playerState;
  return`
  <h3>Old Merchants Wares</h3>
  <div class="upgrade-row">
  <button onclick="buyResource()">Buy 1 resource <small>(5 gold)</small></button>
  </div>
  <div class="upgrade-row">
  <strong>Prendant</strong> ${p.shopPurchases.pendantBought ? "<small>Purchased</small>" : ""}</br>
  <small>Can be unlocked with a skillpoint. (r5)</small><br/>
  ${p.shopPurchases.pendantBought ? "" :
    `<button ${p.gold >= 30 ? "" : "disabled"} onclick"buyPendant()">Buy <small>(30 gold)</small></button>`}
    </div>
    <div class="upgrade-row">
    <strong>Scroll</strong> ${p.shopPurchases.scrollBought ? "<small>Purchased</small>" : ""}<br/>
    <small>Read 10 times to unlock its full potential.</small><br/>
    ${p.shopPurchases.scrollBought ? "" :
      `<button ${p.gold >= 500 ? "" : "disabled"} onclick="buyScroll()">Buy<small>(500 gold)</small></button>`}
      </div>
      <hr />
      `;
}
function renderPetChoicePanel(){
  return`
  <div class="event-panel">
  <strong>A stray animal approaches you in the alley</strong><br/>
  Take it in as a pet? It will stay at your base.<br/><br/>
  <button onclick="choosePet('dog')">Take the Dog</button>
  <button onclick="choosePet('cat')">Take the Cat</button>
  <button onclick="choosePet('none')">Leave it be</button>
  </div>
  <hr />
  `;
}