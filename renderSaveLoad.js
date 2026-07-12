function renderSaveLoad(){
    const app = document.getElementById("app");

    if(!isLoggenIn()){
        renderAuth();
        return;
    }
    const slots = ["slot1", "slot2", "slot3", "autosave"]
const autoInfo = getSlotInfo("autosave");
const slotRows
}