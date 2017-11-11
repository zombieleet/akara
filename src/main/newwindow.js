"use strict";
const {
    BrowserWindow,
    ipcMain: ipc
} = require("electron");

const {
    APP_PATH,
    BACKGROUND_COLOR
} = require("./constants.js");

const url = require("url");

const createNewWindow = (obj,html) => {

    Object.assign(obj, {
        frame: obj.frame ? true : false,
        show: false,
        maximizable: obj.maximizable,
        minimizable: obj.minimizable,
        resizable: obj.resizable,
        center: true,
        backgroundColor: BACKGROUND_COLOR
    });

    let newWindow = new BrowserWindow(obj);
    
    let urLocation;
    
    if ( url.parse(html).protocol )
        urLocation = html;
    else
        urLocation = `file://${APP_PATH}/app/renderer/html/${html}`;
    
    newWindow.loadURL(urLocation);

    newWindow.once("closed", () => {
        newWindow = undefined;
    });
    newWindow.on("ready-to-show", () => {
        newWindow.show();
    });

    //parent.setIgnoreMouseEvents(true);
    const { webContents } = newWindow;

    webContents.openDevTools();

    ipc.on("akara::newwindow:max", event => {
        if ( newWindow.isMaximized() ) {
            newWindow.unmaximize();
            event.sender.send("akara::newwindow:isnotmin");
        } else {
            newWindow.maximize();
            event.sender.send("akara::newwindow:ismax");
        }
    });

    ipc.on("akara::newwindow:min", () => {
        newWindow.minimize();
    });

    newWindow.on("maximize", () => {
        newWindow.webContents.send("akara::newwindow:ismax");
    });

    newWindow.on("unmaximize", () => {
        newWindow.webContents.send("akara::newwindow:isnotmin");
    });

    return newWindow;
};

module.exports = {
    createNewWindow
};
