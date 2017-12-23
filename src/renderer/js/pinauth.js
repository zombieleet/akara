; ( () => {
    "use strict";
    const inputPin = document.querySelector(".inputpin-input");
    const share = document.querySelector(".inputpin-pin");
    const close = document.querySelector(".inputpin-close");

    const {
        ipcRenderer: ipc,
        remote: {
            dialog,
            BrowserWindow,
            getCurrentWindow,
            require: _require
        }
    } = require("electron");

    const {
        tClient,
        youtubeClient,
        cache,
        uploadYoutubeVideo
    } = require("../js/util.js");

    const {
        requireSettingsPath
    } = _require("./constants.js");

    const fs = require("fs");

    const cacheToken = (token,expiry_date) => {
        token.expiry_date = expiry_date;
        fs.writeFileSync(cache, JSON.stringify(token));
    };

    const validateAuth = Object.defineProperties({}, {
        twitter: {
            value(pin) {
                tClient.get("oauth/access_token", { oauth_verifier: pin }, (...args) => {
                    console.log(args);
                });
            }
        },
        youtube: {
            async value(pin) {

                const shareFile = await requireSettingsPath("share.json");
                const shareSettings = require(shareFile);

                youtubeClient.getToken( pin, (err,token) => {
                    
                    if ( err )
                        return dialog.showErrorBox(
                            "Error validiating pin",
                            `${pin} cannot be validated`
                        );

                    youtubeClient.credentials = token;

                    if ( shareSettings.cache_authentication_request === "yes" )
                        cacheToken(token,shareSettings.cache_expire_date);

                    getCurrentWindow().getParentWindow().close();
                    ipc.sendTo(1, "akara::youtube:loggedin:share", youtubeClient);

                    return true;
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
