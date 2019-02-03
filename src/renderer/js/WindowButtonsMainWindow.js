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

    const { ipcRenderer: ipc }  = require("electron");
    const { applyButtonConfig } = require("../js/Util.js");
    
    const min    = document.querySelector("[data-winop=minimize]");
    const max    = document.querySelector("[data-winop=maximize]");
    const close  = document.querySelector("[data-winop=close]");
    
    window.addEventListener("DOMContentLoaded", () => {
        console.log("fired first page, duh");
        applyButtonConfig(max,"window-buttons", "maximize");
        applyButtonConfig(min, "window-buttons", "minimize");
        applyButtonConfig(close, "window-buttons", "close");
    });

    min.addEventListener("click", () => {
        ipc.send("window-minimize");
    });

    max.addEventListener("click", () => {
        ipc.send("window-maximize");
    });

    close.addEventListener("click", () => {
        ipc.send("window-close");
    });

    ipc.on("window-is-max", () => {
        // dont restore back to max
        max.removeAttribute("class");
        applyButtonConfig(max, "window-buttons", "restore");
    });

    ipc.on("window-is-not-max", () => {
        // restore back to max
        max.removeAttribute("class");
        applyButtonConfig(max, "window-buttons", "maximize");
    });

})();
