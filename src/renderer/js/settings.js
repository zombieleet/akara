; ( () => {
    
    "use strict";

    const {
        ipcRenderer: ipc,
        remote: {
            getCurrentWindow,
            dialog
        }
    } = require("electron");

    const { handleWindowButtons } = require("../js/util.js");
    const openSettingsWindow = require("../js/settingsWindow.js");

    const settingsMin = document.querySelector("[data-winop=minimize]");
    const settingsMax = document.querySelector("[data-winop=maximize]");
    const settingsClose = document.querySelector("[data-winop=close]");
    const settingsValue = document.querySelector(".settings-values");
    const textSearch = document.querySelector(".search");
    
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
    
    handleWindowButtons({ close: settingsClose, min: settingsMin, max: settingsMax });
})();
