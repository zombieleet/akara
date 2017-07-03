"use strict";

; ( ({ ipcRenderer: ipc }) => {

    const akaraMin = document.querySelector(".akara-min");
    const akaraMax = document.querySelector(".akara-max");
    const akaraClose = document.querySelector(".akara-close");



    akaraMin.addEventListener("click", () => {
        ipc.send("window-minimize");
    });

    akaraMax.addEventListener("click", () => {
        ipc.send("window-maximize");
    });

    akaraClose.addEventListener("click", () => {
        ipc.send("window-close");
    });
    
})(require("electron"));



