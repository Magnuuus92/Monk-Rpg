const API_URL = "https://gameserver-production-4761.up.railway.app/api";

function getToken(){
  return localStorage.getItem("gameproject_token");
}
function isLoggedIn(){
  return getToken() !== null;
}
function getStoredUsername(){
  return localStorage.getItem("gameproject_username") || "";
}
function storeAuth(token, username){
  localStorage.setItem("gameproject_token", token);
  localStorage.setItem("gameproject_username", username);
}
function clearAuth(){
    localStorage.removeItem("gameproject_token");
  localStorage.removeItem("gameproject_username");
}
//API helper
async function apiCall(method, path, body = null) {
  const headers = {
    "Content-Type": "application/json",
  };
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const options = {
    method,
    headers,
  };
  if (body !== null){
    options.body = JSON.stringify(body);
  }
  const response = await fetch(`${API_URL}${path}`, options);
  const data = await response.json().catch(() =>({}));

  return {ok: response.ok, status: response.status, data};
}
async function registerUser(username, password) {
  const result = await apiCall("POST", "/auth/register", {username, password});

  if(result.ok){
    storeAuth(result.data.token, result.data.username);
    log(`Welcome, ${result.data.username}! Account created.`);
    currentScreen = "base";
    render();
  }else{
      log(`Registration failed: ${result.data.error || "Unknown error."}`);
        render();
  }
}
async function loginUser(username, password){
  const result = await apiCall("POST", "/auth/login", {username, password});

  if(result.ok){
    storeAuth(result.data.token, result.data.username);
    log(`Welcome back, ${result.data.username}!`);
    currentScreen = "base";
    render();

  }else {
            log(`Login failed: ${result.data.error || "Invalid credentials."}`);
        render();
  }
}
function logoutUser() {
clearAuth();
log("Logged out.");
currentScreen = "saveLoad";
render();
}

//prepare player state for saving - strip all functions.
function serializeState() {
 return JSON.stringify(playerState, (key, value) => {
      // strip functions
      if (typeof value === "function") return undefined;
      return value;
    });
}
//rebuild playerstate from loaded save
function deserializeState(stateJson) {
  const saved =JSON.parse(stateJson);
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
async function saveGame(slot) {
  if(!isLoggedIn()){
    log("You need to be logged in to save.");
    render();
    return;
  }
  const body = {
    stateJson: serializeState(),
    //timestamp: new Date().toLocaleString(), UNSURE remove
    day: playerState.day,
    level: playerState.level,
    characterName: playerState.name || "Hero",
  };
const result = await apiCall("POST", `/saves/${slot}`, body);
if(result.ok){
        log(`Saved to ${slot === "autosave" ? "auto-save" : slot}.`);
    } else {
        log(`Save failed: ${result.data.error || "Server error."}`);
    }
    render();
}
//auto save at endDay
async function autoSave() {
 if(!isLoggedIn()) return;

 const body = {
      stateJson: serializeState(),
    day: playerState.day,
    level: playerState.level,
    characterName: playerState.name || "Hero",
 };
 await apiCall("POST", "/saves/autosave", body).catch(()=> {});
}

//LOAD 
async function loadGame(slot) {
 
  if (!isLoggedIn()) {
    log("You are not logged in. Log in to load.");
    render();
    return;
  }
const result = await apiCall("GET", `/saves/${slot}`);

if (result.ok)
{
  deserializeState(result.data.stateJson);
  currentScreen = "base";
  playerState.combat = null;
  log(`Loaded from ${slot === "autosave" ? "auto-save" : slot}.`);
  render();
} else{
  log(`Load failed: ${result.data.error || "No save found."}`);
  render();
}
}
// DELETE SAVEDATA FROM SLOT
async function deleteSave(slot) {
  if(!isLoggedIn()) return;
  const result = await apiCall("DELETE", `/saves/${slot}`);
  if(result.ok){
    log(`${slot} deleted.`);
  }else{
    log(`Delete failed: ${result.data.error || "server error."}`);
  }
  render();
}

//READ SLOT INFO
let cachedSlotInfo = null;
async function fetchSlotInfo() {
if (!isLoggedIn()){
  cachedSlotInfo = null;
  return;
}
const result = await apiCall("GET", "/saves");
if(result.ok) {
  cachedSlotInfo = result.data;
}else{
  cachedSlotInfo = null;
}
}
async function getSlotInfo(slot) {
  if(!cachedSlotInfo) return null;
  return cachedSlotInfo.find(s => s.slot && s.hasData) || null;
}
