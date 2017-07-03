
const { ipcMain: ipc, BrowserWindow } = require("electron");

console.log("done");

const handleWinState = win => {
    
    ipc.on("window-maximize", event => {
        
        if ( win.isMaximized() ) return win.unmaximize();
        
        return win.maximize();
        
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
