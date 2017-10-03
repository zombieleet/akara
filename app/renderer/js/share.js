( () => {
    "use strict";

    const {
        ipcRenderer: ipc,
        remote: {
            BrowserWindow,
            dialog,
            require: _require
        }
    } = require("electron");

    const {
        createNewWindow: shareWindow
    } = _require("./newwindow.js");

    const {
        tClient
    } = require("../js/util.js");

    const share = Object.defineProperties({}, {
        __pinWindow: {
            value() {
                const obj = {
                    title: "InputPin",
                    minimizable: false,
                    maximizable: false,
                    resizable: false,
                    width: 400,
                    height: 300
                    
                };
                return shareWindow(obj, "inputpin.html");
            },
            enumerable: false,
            writable: false,
            configurable: false
        },
        
        __shareWin: {
            
            value(file) {
                
                const obj = {
                    title: "share",
                    frame: true,
                    width: 671,
                    height: 385,
                    id: "shareWindow"
                };
                
                return shareWindow(obj, file);
            },
            enumerable: false,
            writable: false,
            configurable: false
        },
        twitShare: {

            async value() {

                let accessTokens;

                try {
                    accessTokens = await tClient.post("oauth/request_token", { oauth_callback: "oob" });
                } catch(ex) {
                    return dialog.showErrorBox("Error in connection",ex);
                }

                let {
                    oauth_token,
                    //oauth_token_secret,
                    oauth_callback_confirmed
                } = accessTokens;

                if ( oauth_callback_confirmed !== "true" )

                    return dialog.showErrorBox(
                        "Error in Authentication",
                        "Cannot get required information from twitter"
                    );
                
                const parent = this.__shareWin(
                    `https://api.twitter.com/oauth/authorize?oauth_token=${oauth_token}`
                );

                return this.__pinWindow();
            }
        }
    });


    ipc.on("akara::twit-share", share.twitShare.bind(share));
})();
