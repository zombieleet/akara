; ( () => {
    const {
        loadUISettingButton
    } = require("../js/util.js");


    window.addEventListener("DOMContentLoaded", () => {
        loadUISettingButton("podcast-buttons", [
            "play", "home", "grid", "list", "uncheck", "check",
            "times", "folder", "close", "add", "download"
        ], "data-podcast-op");
    });
})();
