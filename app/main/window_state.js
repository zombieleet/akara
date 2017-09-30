
const {
    ipcMain: ipc,
    BrowserWindow,
    app
} = require("electron");
const {
    existsSync,
    rmdir,
    readdir
} = require("fs");
const {
    removeConvMedia
} = require("./utils.js");
const handleWinState = win => {

    win.on("maximize", () => {
        win.webContents.send("window-is-max");
    });

    win.on("unmaximize", () => {
        win.webContents.send("window-is-not-max");
    });

    win.on("close", () => {
        win = undefined;
        removeConvMedia();
        app.quit();
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
        if ( ! win.isMinimized() )
            win.minimize();
    });

    ipc.on("window-close", () => {
        win.close();
        win = null;
    });
};


module.exports = handleWinState;
