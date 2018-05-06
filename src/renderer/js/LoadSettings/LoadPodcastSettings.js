; ( () => {
    const {
        loadUISettingButton
    } = require("../js/util.js");


    window.addEventListener("DOMContentLoaded", async () => {
        await loadUISettingButton("podcast-buttons", [
            "play", "home", "grid", "list", "uncheck", "check",
            "times", "folder", "close", "add", "download"
        ], "data-podcast-op");
    });
})();
