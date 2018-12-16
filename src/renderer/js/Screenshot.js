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
