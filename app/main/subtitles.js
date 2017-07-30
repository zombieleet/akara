const {
    BrowserWindow,
    ipcMain: ipc
} = require("electron");

const {
    APP_PATH,
    BACKGROUND_COLOR
} = require("./constants.js");

const createSubTitleWindow = (parent) => {
    
    let subtitleWindow = new BrowserWindow({
        backgroundColor: BACKGROUND_COLOR,
        center: true,
        frame: false,
        show: false,
        parent,
        maximizable: false
    });

    subtitleWindow.loadURL(`file://${APP_PATH}/app/renderer/html/subtitle.html`);
    
    subtitleWindow.on("closed", () => {
        subtitleWindow = undefined;
    });
    subtitleWindow.on("ready-to-show", () => {
        subtitleWindow.show();
    });

    //parent.setIgnoreMouseEvents(true);
    //const { webContents } = subtitleWindow;

    ipc.on("close-subtitle-window", () => {
        subtitleWindow.close();
    });
};

module.exports = {
    createSubTitleWindow
};
