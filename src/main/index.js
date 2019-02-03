"use strict";

const electron = require("electron");

const {
    ipcMain: ipc,
    app,
    BrowserWindow,
    globalShortcut
} = electron;

const trayMenu = require("./tray.js");
const handleWinState = require("./window_state.js");
const handleWebContents = require("./webcontent_state.js");

const {
    APP_PATH,
    BACKGROUND_COLOR,
    CONVERTED_MEDIA
} = require("./constants.js");

const {
    removeConvMedia,
    downloadFile
} = require("./utils.js");

const { join } = require("path");

require("electron-reload")(APP_PATH, {
    electron: join(APP_PATH, "node_modules", ".bin", "electron")
});

const createWindow = () => {

    let mainWindow;

    app.setName("Akara Media Player");
    app.setVersion(require(`${APP_PATH}/package.json`).version);
    app.disableHardwareAcceleration();

    app.on("ready", () => {

        let tray = trayMenu();

        const screenSize = electron.screen.getPrimaryDisplay().size;

        // the backgroundColor property
        // is modified in the stylesheet

        mainWindow = new BrowserWindow({
            backgroundColor: BACKGROUND_COLOR,
            frame: false,
            show: false,
            centre: true,
            useContentSize: true,
            // ...screenSize
            width: screenSize.width,
            height: screenSize.height
        });

        mainWindow.loadURL(`file://${APP_PATH}/app/renderer/html/index.html`);

        mainWindow.on("ready-to-show", () => {
            mainWindow.show();
        });

        mainWindow.on("closed", () => {
            mainWindow = undefined;
            tray.destroy();
            app.quit();
        });

        handleWebContents(mainWindow);
        handleWinState(mainWindow);
    });

    app.on("quit", () => {
        console.log("app will quit");
        mainWindow.webContents.send("akara::quiting");
        removeConvMedia();
    });

    ipc.on("download::init", (event,__url,contentId) => {
        console.log("called event");
        downloadFile(__url,contentId);
    });
};
createWindow();
