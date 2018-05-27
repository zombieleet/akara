; ( () => {
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
        requireSettingsPath
    } = _require("./constants.js");

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

        const parent = this.__shareWin(oauthURL, "youtube");
        return this.__pinWindow().setParentWindow(parent);
    };


    share.shouldShare = function() {

        const shareFile = requireSettingsPath("share.json");
        const shareSettings = require(shareFile);


        if ( shareSettings.request_permission_before_sending_videos === "no" )
            return false;


        const btn = dialog.showMessageBox({
            title: "Request for sharing permission",
            type: "info",
            message: "Akara Player wants to share a video",
            buttons: ["Send", "Dont Send", "Cancel"]
        });

        switch(btn) {
        case 0:
            return "SHARE_VIDEO";
        case 1:
            return "DONT_SHARE_VIDEO";
        case 2:
        default:
            return "CANCEL";
        }

    };


    share.youtubeShare = async function() {

        const shouldShare = await this.shouldShare();

        if ( shouldShare === "SHARE_VIDEO") {
            this.getNewToken();
            return ;
        }

        if ( shouldShare === "DONT_SHARE_VIDEO" || shouldShare === "CANCEL" )
            return ;

        fs.readFile(cache, (err,token) => {

            if ( err )
                return this.getNewToken();
            console.log(token.toString());
            youtubeClient.credentials = JSON.parse(token);

            return uploadYoutubeVideo(youtubeClient);

        });

    };


    ipc.on("akara::twit-share", share.twitShare.bind(share));
    ipc.on("akara::ytube-share", share.youtubeShare.bind(share));
})();
