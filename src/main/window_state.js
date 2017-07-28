
const { ipcMain: ipc, BrowserWindow } = require("electron");
const { CONVERTED_MEDIA }  = require("./constants.js");

const { existsSync, rmdirSync } = require("fs");

const handleWinState = win => {

    win.on("maximize", () => {
        win.webContents.send("window-is-max");
    });

    win.on("unmaximize", () => {
        win.webContents.send("window-is-not-max");
    });

    win.on("close", () => {
        win = undefined;
        if ( existsSync(CONVERTED_MEDIA ) )
             rmdirSync(CONVERTED_MEDIA);
    });

    /*win.on("enter-html-full-screen", () => {
        fullscreen({
            remLabel: "Enter FullScreen",
            useLabel: "Leave FullScreen",
            click(menuItem, { webContents }, event ) {
                webContents.send("leave-video-fullscreen");
            }
        });
    });
    
    win.on("leave-html-full-screen", () => {
        fullscreen({
            remLabel: "Leave FullScreen",
            useLabel: "Enter FullScreen",
            click(menuItem, { webContents }, event) {
                webContents.send("");
            }
        });
    });*/
    
    ipc.on("window-maximize", event => {
        
        if ( win.isMaximized() ) {
            win.unmaximize();
            event.sender.send("window-is-not-max");
        } else {
            win.maximize();
            event.sender.send("window-is-max");
        }
        
    });
    
    ipc.on("window-minimize", () => {    
        if ( ! win.isMinimized() ) win.minimize();
    });

    ipc.on("window-close", () => {
        win.close();
        win = null;
    });
};


module.exports = handleWinState;
