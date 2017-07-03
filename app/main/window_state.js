
const { ipcMain: ipc, BrowserWindow } = require("electron");

console.log("done");

const handleWinState = win => {
    
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
