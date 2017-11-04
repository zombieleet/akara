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
        maximizable: false,
        minimizable: false,
        resizable: false,
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

    ipc.once(`close-${obj.title}-window`, () => {
        newWindow.close();
    });

    return newWindow;
};

module.exports = {
    createNewWindow
};
