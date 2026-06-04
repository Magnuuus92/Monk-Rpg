function render() {
  //Router
  if (playerState.combat !== null) {
    renderCombat();
  } else if (currentScreen === "skillTree") {
    renderSkillTree();
  } else if (currentScreen === "renderWorld") {
    renderWorld();
  } else if (currentScreen === "saveLoad") {
    renderSaveLoad();
  } else {
    renderBase();
  }
}

function renderBase() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <h1>GAMEPROJECT</h1>
    ${renderStatusBar()}

    <hr />
    <h2> Base Camp </h2>
    <p> choose how to spend your day.</p>
    ${renderStatAllocation()}
    <div id="actions">${renderBaseActions()}
    </div>
    <hr />

    <div id="log">
    ${renderGameLog()}
    </div>
    `;
}
function renderStatAllocation() {
  if (playerState.statPoints <= 0) return "";
  const s = playerState.stats;
  function statRow(label, key) {
    return `
    <div>
    <span>${label}: ${s[key]}</span>
    <button onclick="spendStatPoint('${key}')">+</button>
    </div>
    `;
  }
  return `
  <div id="stat-allocation">
  <h3> Spend your stat points. (${playerState.statPoints} remaining)</h3>
  ${statRow("Strength", "strength")}
  ${statRow("Dexterity", "dexterity")}
  ${statRow("Vitality", "vitality")}
  ${statRow("Resilience", "resilience")}
  ${statRow("Willpower", "willpower")}
  ${statRow("Intellect", "intellect")}
  </div>
  <hr />
  `;
}
function renderStatusBar() {
  const p = playerState;
  return `
    <div id="status">
    
    <span>Day ${p.day}</span> |
    <span>Actions remaining: ${p.dayPoints}/ ${p.maxDayPoints}</span> |
    
    <span> Health: ${p.hp} / ${p.maxHp} </span>
    <span> Energy: ${p.energy} / ${p.maxEnergy} </span>
    <span> Gold: ${p.gold}</span>
    <span> Level: ${p.level}</span>
   </div>
    `;
}
function renderBaseActions() {
  function btn(label, cost, onclick) {
    const canAfford = playerState.dayPoints >= cost;
    const disabled = canAfford ? "" : "disabled";
    return `
    <button ${disabled} onclick="${onclick}">
    ${label} <small>(${cost} DP)</small>
    </button>
    `;
  }
  const nextArea = playerState.areasConquered.indexOf(false); // subject to change !Travelstyle!
  const travelLabel =
    nextArea !== -1 ? `Travel to Area ${nextArea + 1}` : "No areas left";
  const travelDisabled =
    nextArea === -1 || playerState.dayPoints < 1 ? "disabled" : "";
  return `
  ${btn("Rest", 1, "rest()")}
  ${btn("Train", 1, "train()")}
  ${btn("Scout Area", 1, "scoutArea()")} 
  <button ${travelDisabled} onclick="travelToNextArea()">
  ${travelLabel} <small>(1 DP)</small>
  <button onclick="openWorld()"> World Map</button>
  </button>
  <br /><br />
  <button onclick="openSkillTree()">
  Skill Tree (SP: ${playerState.skillPoints})
  </button>
  <button onclick="currentScreen = 'saveLoad'; render();">Save / Load</button> 
  <button onclick="fightTestDummy()">Fight test dummy</button>
  <button onclick="endDay()">End Day</button>
  `;
}
function renderSaveLoad() {
  const app = document.getElementById("app");

  const slots = ["slot1", "slot2", "slot3"];
  const autoInfo = getSlotInfo("autosave");

  const slotRows = slots
    .map((slot) => {
      const info = getSlotInfo(slot);
      return `
    <div class="save-slot">
    <strong>${slot}</strong> -
    ${
      info
        ? `Day ${info.day} | Level ${info.level} | ${info.timestamp}`
        : "<em> Empty </em>"
    }
    <br/>
    <button onclick="saveGame('${slot}'); render();">Save</button>
    <button ${info ? "" : "disabled"} onclick="loadGame('${slot}')">Load</button>
    <button ${info ? "" : "disabled"} onclick="deleteSave('${slot}'); render();">Delete</button>
    </div>
    `;
    })
    .join("");
  app.innerHTML = `
  <h1> GAMEPROJECT - Save / Load</h1>
  <button onclick="currentScreen = 'base'; render();">Back to base</button>
  <hr />
  
  <h3>Save Slots<h3/>
  ${slotRows}
  
  <hr />
  <h3>Auto Save</h3>
  <div class="save-slot">
  ${
    autoInfo
      ? `Day ${autoInfo.day} | Lvl ${autoInfo.level} | ${autoInfo.timestamp}
    <br/>
    <button onclick="loadGame('autoSave')">Load Auto-Save</button>
    <button onclick="deleteSave('autoSave'); render();">Delete Auto-save</button>`
      : "<em>Empty..</em>"
  }
  </div>
  `;
}

function renderGameLog() {
  if (gameLog.length === 0) return "<p><em>Nothing yet</em></p>";

  return gameLog
    .slice()
    .reverse()
    .map((msg) => `<p>> ${msg}</p>`)
    .join("");
}

function renderSkillTree() {
  const app = document.getElementById("app");
  app.innerHTML = `
  <h1> GAMEPROJECT - Skill Tree</h1>
  <p>Skill Points: ${playerState.skillPoints}</p>
  <button onclick="closeSkillTree()"> Back to Base</button>
  <hr />
  
  <h3>Force / Discipline / Spirit</h3>
  <div class="skill-grid">
  <div class="skill-col">
  <h4> Force (A) </h4>
  ${["a1", "a2", "a3", "a4", "a5", "a6", "a7"].map(renderSkillNode).join("")}
  </div>
  <div class="skill-col">
  <h4> Discipline (B) </h4>
    ${["b1", "b2", "b3", "b4", "b5", "b6", "b7"].map(renderSkillNode).join("")}
  </div>
  <div class="skill-col">
  <h4> Spirit (C) </h4>
  ${["c1", "c2", "c3", "c4", "c5", "c6", "c7"].map(renderSkillNode).join("")}
  </div>
  </div>
  
  <hr />
  <h3> Cross Branch</h3>
  <div class="skill-grid">
  <div class="skill-col">
  <h4> Force + Discipline </h4>
  ${["ab1", "ab2", "ab3"].map(renderSkillNode).join("")}

  </div>
  <div class="skill-col">
  <h4> Discipline + Spirit </h4>
${["bc1", "bc2", "bc3"].map(renderSkillNode).join("")}
  </div>
  </div>
  <hr />
  <h3>Misc</h3>
  <div class="skill-grid">
  ${["r1", "r2", "r3", "r4", "r5", "r6"]
    .map(
      (k) => `
    <div class="skill-col">${renderSkillNode(k)}</div>
    `,
    )
    .join("")}
    </div>
    `;
}
function renderSkillNode(key) {
  const skill = SKILL_DATA[key];
  const unlocked = playerState.skills[key];
  const canUnlock =
    !unlocked && playerState.skillPoints > 0 && skill.requires();
  const nodeClass = unlocked ? "skill-node unlocked" : "skill-node";

  return `
<div class="${nodeClass}">
<strong>${skill.name}</strong><br/>
<em>${skill.description}</em><br/>
<small>Req: ${skill.requiresText}</small><br/>
${
  unlocked
    ? `<span> UNLOCKED</span>`
    : `<button ${canUnlock ? "" : "disabled"}
  onclick="unlockSkill('${key}')">
  Unlock
  </button>`
} </div>
`;
}
