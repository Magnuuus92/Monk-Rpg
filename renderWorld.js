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
        height: 120px;
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
        <button onclick="openWorld()">← World Map</button>
        <button onclick="returnToBase()">← Return to Base</button>
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
  const actions = renderRoomActions(room, cleared);
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
     ${actions}
     </div>
     <hr />
     <div id="log">
     ${renderWorldLog()}
     </div>
     `;
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
    : "";
  return `
    <div class="eventPanel">
    <strong>Event:</strong> ${event.description}<br/><br/>
    ${fightBtn}
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
            <span>Level: ${p.level}</span>
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
