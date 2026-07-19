function renderSaveLoad() {
  const app = document.getElementById("app");

  if(!isLoggedIn()){
    renderAuth();
    return;
  }

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
  
  <h3>Save Slots</h3>
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
async function openSaveLoad() {
    currentScreen = "saveLoad";
    await fetchSlotInfo();
    render();
}
function renderAuth() {
    const app = document.getElementById("app");
    app.innerHTML = `
        <h1>GAMEPROJECT</h1>
        <button onclick="currentScreen = 'base'; render();">Back to Base</button>
        <hr />
        <h2>Login</h2>
        <div class="auth-form">
            <input type="text"     id="loginUsername" placeholder="Username" /><br/>
            <input type="password" id="loginPassword" placeholder="Password" /><br/>
            <button onclick="handleLogin()">Log In</button>
        </div>
        <hr />
        <h2>Create Account</h2>
        <div class="auth-form">
            <input type="text"     id="regUsername" placeholder="Username (3-20 chars)" /><br/>
            <input type="password" id="regPassword" placeholder="Password (min 6 chars)" /><br/>
            <button onclick="handleRegister()">Register</button>
        </div>
    `;
}
function handleLogin(){
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;

    if(!username || !password){
        log("Enter Both username and password.");
        render();
        return;
    }
    loginUser(username, password);
}
function handleRegister(){
    const username = document.getElementById("regUsername").value.trim();
    const password = document.getElementById("regPassword").value;

      if(!username || !password){
        log("Enter Both username and password.");
        render();
        return;
    }
    registerUser(username, password);
}