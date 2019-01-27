/* AKM is a highly customizable media player built with electron
   Copyright (C) 2016  Victory Osikwemhe (zombieleet)

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.
   
   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
   
   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
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
