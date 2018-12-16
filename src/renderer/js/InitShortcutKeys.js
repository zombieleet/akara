; ( () => {

    "use strict";
    
    const {
        ipcRenderer: ipc,
        remote: {
            BrowserWindow
        }
    } = require("electron");

    console.log("pandroa's box");

    const settingsShortCutKey = require("../js/ShortCutKeys/SettingsShortCutKey.js");
    const mediaShortCutKey    = require("../js/ShortCutKeys/MediaShortCutKey.js");
    const windowShortCutKey   = require("../js/ShortCutKeys/WindowShortCutKey.js");

    const { changeShortCutSetting } = require("../js/Util.js");

    const getWindow = winTitle => BrowserWindow.getAllWindows().find( win => win.getTitle() === winTitle );

    ipc.on("akara::shortcutkey", ( evt, location, shKeys ) => {
        console.log("entered ", location);
        let __key_handler_object ;

        switch(location) {
        case "media":
            __key_handler_object = mediaShortCutKey;
            break;
        case "settings":
            __key_handler_object = settingsShortCutKey;
            ipc.sendTo(getWindow("Settings").webContents.id ,"akara::settings:shortcut", shKeys );
            break;
        case "window":
            ipc.sendToAll("akara::window:shortcut", shKeys);
            __key_handler_object = windowShortCutKey;
            break;
        default:
            ;
        }

        if ( ! __key_handler_object )
            return;

        changeShortCutSetting(__key_handler_object,shKeys);

    });
})();
