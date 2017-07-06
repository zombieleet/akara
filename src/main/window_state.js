
const { ipcMain: ipc, BrowserWindow } = require("electron");


const handleWinState = win => {

    win.on("maximize", () => {
        win.webContents.send("window-is-max");
    });

    win.on("unmaximize", () => {
        win.webContents.send("window-is-not-max");
    });
    
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
