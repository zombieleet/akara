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
    } = require("../js/Util.js");

    const { requireSettingsPath } = _require("./constants.js");

        
    const inputPin = document.querySelector(".inputpin-input");
    const share    = document.querySelector(".inputpin-pin");
    const close    = document.querySelector(".inputpin-close");
    const fs       = require("fs");

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
            value(pin) {

                const shareFile = requireSettingsPath("share.json");
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
        } = getCurrentWindow().getParentWindow().webContents;

        return validateAuth[__akaraType](pin);
    });

    close.addEventListener("click", evt => getCurrentWindow().close());
})();
