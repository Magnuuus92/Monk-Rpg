function renderCombat() {
  const app = document.getElementById("app");
  const combat = playerState.combat;
  const p = playerState;

  app.innerHTML = `
<h1>GAMEPROJECT - Combat</h1>
<p>
Turn ${combat.turn} |
AP: ${combat.actionPoints}/${combat.maxAp} |
HP: ${p.hp}/${p.maxHp} |
Energy: ${p.energy}/${p.maxEnergy} |
Block: ${combat.block}
${combat.alertStance ? "| <strong> ALERT </strong>" : ""}
</p>
<hr />

<h3>Enemies</h3>
<div id="enemies">
${renderEnemies()}
</div>


<hr />

<h3>Actions</h3>
<div id="combat-actions">
${renderCombatActions()}
</div>

<hr />
<h3>Combat Log</h3>
<div id="combat-log">
${renderCombatLog()}
</div>
`;
}

function renderEnemies() {
  return playerState.combat.enemies
    .map((enemy, index) => {
      if (!enemy.isAlive()) {
        return `<span style="opacity:0.4;">[${enemy.name}: DEFEATED]</span><br/>`;
      }
      const blockText = enemy.block > 0 ? ` | Block: ${enemy.block}` : "";
      return `
  <div class="enemy-card">
  <strong>${enemy.name}</strong><br/>
  HP: ${enemy.hp}/${enemy.maxHp} |
  STR: ${enemy.str} |
  AP: ${enemy.maxAp}
  ${blockText}
  <br/>
  <button onclick="playerStrike(${index})">
  Strike <small>(1 AP) </small>
  </button>
  </div>
  `;
    })
    .join("");
}

function renderCombatActions() {
  const combat = playerState.combat;

  if (combat.result === "victory") {
    return `<button onclick="endCombat(true)">Return to base</button>`;
  }
  if (combat.result === "defeat") {
    return `<button onclick="endCombat(false)">Respawn at base</button>`;
  }
  //pending skill + cancel option
  if (combat.pendingSkill) {
    const skillName = COMBAT_SKILLS[combat.pendingSkill].name;
    return `
  <p><em>Select a target for <strong>${skillName}</strong>...</em></p>
  <button onclick="cancelSkill()">Cancel</button> 
  `;
  }

  const skillButtons = renderCombatSkillButtons();
  return `${skillButtons}
<br /><br />
<button onclick="playerEndTurn()">END TURN</button>
`;
}
//1 btn per unlocked skill
function renderCombatSkillButtons() {
  const activatedKeys = Object.keys(COMBAT_SKILLS).filter(
    (key) => playerState.skills[key],
  );
  if (activatedKeys.length === 0) {
    return `<p><em>No skills unlocked. Use basic strike (click an enemy).</em></p>`;
  }
  return activatedKeys
    .map((key) => {
      const skill = COMBAT_SKILLS[key];
      const affordable = canAffordSkill(key);
      const costLabel = getCostDisplay(key);

      return `
  <button ${affordable ? " " : "disabled"}
  onclick="selectSkill('${key}')">
  ${skill.name} <small> ${costLabel}</small>
  </button>
  `;
    })
    .join("");
}

function renderCombatLog() {
  const log = playerState.combat.log;
  if (log.length === 0) return "<p><em>No events yet.</em></p>";
  return log
    .slice()
    .reverse()
    .map((msg) => `<p>> ${msg}</p>`)
    .join("");
}
