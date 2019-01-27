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
