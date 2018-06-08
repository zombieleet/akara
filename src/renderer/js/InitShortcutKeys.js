; ( () => {
    

    const {
        ipcRenderer: ipc
    } = require("electron");

    console.log("pandroa's box");
    
    const settingsShortCutKey = require("../js/ShortCutKeys/SettingsShortCutKey.js");
    const mediaShortCutKey = require("../js/ShortCutKeys/MediaShortCutKey.js");
    const windowShortCutKey = require("../js/ShortCutKeys/WindowShortCutKey.js");

    const {
        changeShortCutSetting
    } = require("../js/util.js");
    
    ipc.on("akara::shortcutkey", ( evt, location, shKeys ) => {
        console.log("entered ", location);
        let __key_handler_object ;

        switch(location) {
        case "media":
            __key_handler_object = mediaShortCutKey;
            break;
        case "settings":
            __key_handler_object = settingsShortCutKey;
            break;
        case "window":
            ipc.sendToAll("akara::window:shortcut", windowShortCutKey, shKeys);
            __key_handler_object = windowShortCutKey;
            break;
        default:
            ;
        }

        if ( ! __key_handler_object )
            return;
        
        changeShortCutSetting(__key_handler_object);

    });
})();
