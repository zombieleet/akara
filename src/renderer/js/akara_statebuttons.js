"use strict";

( ({ ipcRenderer: ipc }) => {

    const akaraMin = document.querySelector(".window-min");
    const akaraMax = document.querySelector(".window-max");
    const akaraClose = document.querySelector(".window-close");



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
        akaraMax.classList.remove("fa-window-maximize");
        akaraMax.classList.add("fa-window-restore");
    });

    ipc.on("window-is-not-max", () => {
        akaraMax.classList.remove("fa-window-restore");
        akaraMax.classList.add("fa-window-maximize");
    });

    ipc.on("akara::quiting", () => {
        localStorage.removeItem("DONT_SHOW_VOLUME_WARNING");
    });
    
})(require("electron"));



