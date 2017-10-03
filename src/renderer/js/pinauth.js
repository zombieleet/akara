; ( () => {
    "use strict";
    const inputPin = document.querySelector(".inputpin-input");
    const share = document.querySelector(".inputpin-pin");
    const close = document.querySelector(".inputpin-close");
    
    const {
        remote: {
            dialog,
            BrowserWindow,
            getCurrentWindow
        }
    } = require("electron");

    const {
        tClient
    } = require("../js/util.js");
    
    share.addEventListener("click", evt => {
        
        const pin = inputPin.value;
        
        if ( /^\s{0,}$/.test(pin) )
            return dialog.showErrorBox(
                "No Pin",
                "Enter a pin in the input pin field"
            );

        tClient.get("oauth/access_token", { oauth_verifier: pin }, (...args) => {
            console.log(args);
        });
        
    });

    close.addEventListener("click", evt => getCurrentWindow().close());
})();
