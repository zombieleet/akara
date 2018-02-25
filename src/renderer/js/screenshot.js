; ( () => {
    "use strict";
    const {
        remote : {
            getCurrentWindow
        }
        
    } = require("electron");

    
    const screenshotCancel = document.querySelector(".screenshot-cancel");
    const windowClose = document.querySelector(".screenshot-close");


    screenshotCancel.addEventListener("click", () => {
        getCurrentWindow().close();
    });

    windowClose.addEventListener("click", () => {
        getCurrentWindow().close();
    });
    
})();
