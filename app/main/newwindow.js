const {
    BrowserWindow,
    ipcMain: ipc
} = require("electron");

const {
    APP_PATH,
    BACKGROUND_COLOR
} = require("./constants.js");

const createNewWindow = (obj,html) => {

    Object.assign(obj, {
        frame: false,
        show: false,
        maximizable: false,
        center: true,
        backgroundColor: BACKGROUND_COLOR
    });

    let newWindow = new BrowserWindow(obj);

    newWindow.loadURL(`file://${APP_PATH}/app/renderer/html/${html}`);

    newWindow.on("closed", () => {
        newWindow = undefined;
    });
    newWindow.on("ready-to-show", () => {
        newWindow.show();
    });

    //parent.setIgnoreMouseEvents(true);
    const { webContents } = newWindow;

    webContents.openDevTools();

    ipc.on(`close-${obj.title}-window`, () => {
        newWindow.close();
    });

    return newWindow;
};

module.exports = {
    createNewWindow
};
