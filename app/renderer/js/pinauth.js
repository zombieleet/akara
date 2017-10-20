( () => {
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
        tClient,
        youtubeClient,
        cache,
        uploadYoutubeVideo
    } = require("../js/util.js");

    const fs = require("fs");

    const cacheToken = token =>
        fs.writeFileSync(cache, JSON.stringify(token));
    
    const validateAuth = Object.defineProperties({}, {
        twitter: {
            value(pin) {
                console.log(pin);
                tClient.get("oauth/access_token", { oauth_verifier: pin }, (...args) => {
                    console.log(args);
                });
            }
        },
        youtube: {
            value(pin) {
                // code goes here
                youtubeClient.getToken( pin, (err,token) => {
                    if ( err )
                        return dialog.showErrorBox(
                            "Error validiating pin",
                            `${pin} cannot be validated`
                        );
                    
                    youtubeClient.credentials = token;
                    cacheToken(token);
                    return uploadYoutubeVideo(youtubeClient);
                });
            }
        },
        facebook: {
            value(pin) {
                // code goes here
                console.log(pin);
            }
        }
    });

    share.addEventListener("click", evt => {

        const pin = inputPin.value;

        if ( /^\s{0,}$/.test(pin) )
            return dialog.showErrorBox(
                "No Pin",
                "Enter a pin in the input pin field"
            );

        const {
            browserWindowOptions: {
                __akaraType
            }
        } = getCurrentWindow()
            .getParentWindow()
            .webContents;

        return validateAuth[__akaraType](pin);
    });

    close.addEventListener("click", evt => getCurrentWindow().close());
})();
