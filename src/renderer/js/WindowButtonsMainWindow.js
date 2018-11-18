"use strict";

( ({ ipcRenderer: ipc }) => {

    const min = document.querySelector("[data-winop=minimize]");
    const max = document.querySelector("[data-winop=maximize]");
    const close = document.querySelector("[data-winop=close]");

    const {
        applyButtonConfig
    } = require("../js/util.js");


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

    ipc.on("akara::quiting", () => {
        localStorage.removeItem("DONT_SHOW_VOLUME_WARNING");
        localStorage.removeItem("LOOP_CURRENT_VIDEO");
    });

})(require("electron"));
