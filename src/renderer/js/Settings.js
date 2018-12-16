; ( () => {

    "use strict";

    const {
        ipcRenderer: ipc,
        remote: {
            getCurrentWindow,
            dialog
        }
    } = require("electron");

    const { handleWindowButtons, changeShortCutSetting } = require("../js/Util.js");

    const openSettingsWindow  = require("../js/SettingsWindow.js");
    const settingsShortCutKey = require("../js/ShortCutKeys/SettingsShortCutKey.js");


    const settingsMin     = document.querySelector("[data-winop=minimize]");
    const settingsMax     = document.querySelector("[data-winop=maximize]");
    const settingsClose   = document.querySelector("[data-winop=close]");
    const settingsValue   = document.querySelector(".settings-values");
    const textSearch      = document.querySelector(".search");

    settingsValue.addEventListener("click", evt => {

        const { target } = evt;

        if ( ! target.hasAttribute("data-fire") )
            return ;

        try {
            openSettingsWindow[target.getAttribute("data-fire")](evt);
        } catch(ex) {
            console.log(ex);
            dialog.showErrorBox("Not Yet Implemented", `${target.textContent} has not yet be implemented`);
        }
    });

    ipc.on("akara::settings:shortcut", (evt,shKeys) => changeShortCutSetting(settingsShortCutKey,shKeys));
    handleWindowButtons({ close: settingsClose, min: settingsMin, max: settingsMax });

})();
