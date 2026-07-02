function renderStats(){
    const app = document.getElementById("app");
    const p = playerState;
    const xpNeeded = p.level * 100;

    app.innerHTML = `
    <h1>${p.name} - STATS</h1>
    <button onclick="currentScreen = 'base'; render();">Back</button>
    <hr />
    <h3>Character</h3>
    <p>
    Level: ${p.level} |
    XP: ${p.experience}/${xpNeeded} |
    Skill Points: ${p.skillPoints} |
    Stat Points: ${p.statPoints}
    </p>
    
    <hr />
    <h3>Base Stats</h3>
    ${renderStatList()}
    
    <hr />
    <h3>Derived Stats</h3>
    <p>Max HP: ${p.maxHp} | Max Energy: ${p.maxEnergy} </p>
    
    <hr />
    <h3>Skills Unlocked</h3>
    ${renderUnlockedSkillsList()}
    
    <hr />
    <h3>Action Counters</h3>
    ${renderCounterProgress()}
    `;
}
function renderStatList(){
    const s = playerState.stats;
    return Object.entries(s).map(([key, value])=>
    `<p>${capitalizeFirst(key)}: ${value}</p>`
).join("");
}

function renderUnlockedSkillsList() {
    const unlocked = Object.keys(playerState.skills).filter(k=> playerState.skills[k]);
    if(unlocked.length === 0) return "<p><em>No skills unlocked yet.</em></p>";
    return unlocked.map(key => {
        const skill = SKILL_DATA[key];
        return `<p><strong>${skill.name}</strong> - <small>${skill.description}</small></p>`;
    }).join("");
}
function renderCounterProgress() {
    const labels = {
        physLabour: "Physical Labour",
        broadMind: "Broadening Mind",
        becomeFlex: "Becoming Flexible",
        harnessPow: "Harnessing Power",
    };
    return Object.entries(playerState.counters).map(([key, value])=> {
        const thresholds = COUNTER_THRESHOLDS[key] || [];
        const next = thresholds.find(t => !playerState.claimedThresholds[key].includes(t.at));
        const nextText = next ? `Next reward at ${next.at}` : "All rewards claimed";
        return` <p><strong>${labels[key] || key}:</strong> ${value} - <small>${nextText}</small></p>`;
    }).join("");
}
function capitalizeFirst(str){
    return str.charAt(0).toUpperCase() + str.slice(1);
}