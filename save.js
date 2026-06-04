//prepare player state for saving - strip all functions.
function serializeState() {
  const state = JSON.parse(
    JSON.stringify(playerState, (key, value) => {
      // strip functions
      if (typeof value === "function") return undefined;
      return value;
    }),
  );
  return state;
}
//rebuild playerstate from loaded save
function deserializeState(saved) {
  // restore scalar values
  Object.assign(playerState, saved);
  //reattach isAlive() to any active combatants. (Might be useful down the line, if save during combat implemented)
  if (playerState.combat && playerState.combat.enemies) {
    playerState.combat.enemies.forEach((e) => {
      e.isAlive = function () {
        return this.hp > 0;
      };
    });
  }
}

//SAVE
//save to slot1,2,3 or autosave
function saveGame(slotKey) {
  const saveData = {
    state: serializeState(),
    timestamp: new Date().toLocaleString(),
    day: playerState.day,
    level: playerState.level,
  };
  try {
    localStorage.setItem(`gameproject_${slotKey}`, JSON.stringify(saveData));
    log(`Game saved to ${slotKey === "autosave" ? "auto-save" : slotKey}.`);
  } catch (e) {
    log("Save failed - storage may be full.");
    console.error("Save error:", e);
  }
}
//auto save at endDay
function autoSave() {
  saveGame("autosave");
}

//LOAD
function loadGame(slotKey) {
  const raw = localStorage.getItem(`gameproject_${slotKey}`);
  if (!raw) {
    log(`no save found in ${slotKey}.`);
    render();
    return;
  }
  try {
    const saveData = JSON.parse(raw);
    deserializeState(saveData.state);
    log(
      `Loaded save from ${slotKey === "autosave" ? "auto-save" : slotKey} - Day ${saveData.day}, Level ${saveData.level}.`,
    );
    //spawn at base when loading
    currentScreen = "base";
    playerState.combat = null;
    render();
  } catch (e) {
    log("Load failed. Save data may be corrupted.");
    console.error("Load error:", e);
  }
}
// DELETE SAVEDATA FROM SLOT
function deleteSave(slotKey) {
  localStorage.removeItem(`gameproject_${slotKey}`);
  log(`${slotKey} deleted.`);
  render();
}
//READ SLOT INFO
function getSlotInfo(slotKey) {
  const raw = localStorage.getItem(`gameproject_${slotKey}`);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    return {
      day: data.day,
      level: data.level,
      timestamp: data.timestamp,
    };
  } catch (e) {
    return null;
  }
}
