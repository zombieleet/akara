const {
    BrowserWindow,
    ipcMain: ipc
} = require("electron");

const {
    APP_PATH,
    BACKGROUND_COLOR
} = require("./constants.js");

const createNewWindow = ({parent,title,html}) => {
    
    let newWindow = new BrowserWindow({
        title: "subtitle",
        backgroundColor: BACKGROUND_COLOR,
        center: true,
        frame: false,
        show: false,
        parent,
        maximizable: false
    });

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

    ipc.on("close-new-window", () => {
        newWindow.close();
    });

    console.log(newWindow.getTitle());
};

module.exports = {
    createNewWindow
};
