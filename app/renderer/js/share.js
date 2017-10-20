( () => {
    "use strict";

    const {
        ipcRenderer: ipc,
        remote: {
            app,
            BrowserWindow,
            dialog,
            require: _require
        }
    } = require("electron");

    const {
        createNewWindow: shareWindow
    } = _require("./newwindow.js");

    const {
        tClient,
        youtubeClient,
        cache,
        uploadYoutubeVideo
    } = require("../js/util.js");

    const fs = require("fs");
    const path = require("path");
    const share = Object.create({});

    share.YOUTUBE_SCOPE = [ "https://www.googleapis.com/auth/youtube.upload" ];

    share.__pinWindow = () => {
        const obj = {
            title: "InputPin",
            
            /*minimizable: false,
            maximizable: false,
            resizable: false,*/
            
            width: 400,
            height: 300

        };
        return shareWindow(obj, "inputpin.html");
    };


    share.__shareWin = (file,__akaraType) => {
        const obj = {
            title: "share",
            frame: true,
            width: 671,
            height: 385,
            id: "shareWindow",
            __akaraType
        };
        let win = shareWindow(obj,file);
        win.setMenu(null);
        return win;
    };


    
    /** Twitter implementation starts from here **/
    
    share.twitShare = async function() {

        let accessTokens;

        try {
            accessTokens = await tClient.post("oauth/request_token", { oauth_callback: "oob" });
        } catch(ex) {
            return dialog.showErrorBox("Error in connection",ex + " ");
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
            `https://api.twitter.com/oauth/authorize?oauth_token=${oauth_token}`,
            "twitter"
        );
        
        return this.__pinWindow().setParentWindow(parent);
    };
    
    /** Twitter implementation stops here**/


    

    
    /** youtube implementation starts from here**/
    
    share.getNewToken = async function() {
        
        let oauthURL;
        
        try {
            oauthURL = await youtubeClient.generateAuthUrl({
                access_type: "offline",
                scope: this.YOUTUBE_SCOPE
            });
        } catch(ex) {
            return console.error(ex);
        }
        console.log(this, oauthURL);
        const parent = this.__shareWin(oauthURL, "youtube");
        return this.__pinWindow().setParentWindow(parent);
    };

    share.youtubeShare = function() {

        fs.readFile(cache, (err,token) => {
            if ( err )
                return this.getNewToken();
            youtubeClient.credentials = JSON.parse(token);
            return uploadYoutubeVideo(youtubeClient);
        });
    };


    ipc.on("akara::twit-share", share.twitShare.bind(share));
    ipc.on("akara::ytube-share", share.youtubeShare.bind(share));
})();
