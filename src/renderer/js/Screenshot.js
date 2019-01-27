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
        desktopCapturer,
        ipcRenderer: ipc,
        remote : {
            BrowserWindow,
            getCurrentWindow,
            dialog,
            screen,
            require: _require
        }

    } = require("electron");

    const {
        createNewWindow
    } = _require("./newwindow.js");

    
    const {
        handleScreenShot
    } = require("../js/Util.js");


    const path             = require("path");
    const screenshotCancel = document.querySelector(".screenshot-cancel");
    const windowClose      = document.querySelector(".screenshot-close");
    const screenshotOk     = document.querySelector(".screenshot-ok");


    screenshotCancel.addEventListener("click", () => {
        getCurrentWindow().close();
    });

    windowClose.addEventListener("click", () => {
        getCurrentWindow().close();
    });


    screenshotOk.addEventListener("click", () => {
        
        const form = document.querySelector("form");

        let checkedElement = Array.from(form.querySelectorAll("input")).
              filter( el => el.checked );

        checkedElement = checkedElement[0];

        try {
            handleScreenShot[checkedElement.getAttribute("class")]();
        } catch(ex) {
            console.log(ex);
        }
    });

})();
