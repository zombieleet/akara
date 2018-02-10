"use strict";

( ({ ipcRenderer: ipc }) => {

    const akaraMin = document.querySelector("[data-winop=minimize]");
    const akaraMax = document.querySelector("[data-winop=maximize]");
    const akaraClose = document.querySelector("[data-winop=close]");

    const {
        applyButtonConfig
    } = require("../js/util.js");



    akaraMin.addEventListener("click", () => {
        ipc.send("window-minimize");
    });

    akaraMax.addEventListener("click", () => {
        ipc.send("window-maximize");
    });

    akaraClose.addEventListener("click", () => {
        ipc.send("window-close");
    });

    ipc.on("window-is-max", () => {
        // dont restore back to max
        akaraMax.removeAttribute("class");
        applyButtonConfig(akaraMax, "window-buttons", "maximize");
    });

    ipc.on("window-is-not-max", () => {
        // restore back to max
        akaraMax.removeAttribute("class");
        applyButtonConfig(akaraMax, "window-buttons", "maximize");
    });

    ipc.on("akara::quiting", () => {
        localStorage.removeItem("DONT_SHOW_VOLUME_WARNING");
    });
    
})(require("electron"));



