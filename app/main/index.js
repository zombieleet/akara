"use strict";

const { app,  BrowserWindow, globalShortcut } = require("electron");
const trayMenu = require("./tray.js");
const handleWinState = require("./window_state.js");
const handleWebContents = require("./webcontent_state.js");
/*const handleGlobalShortcut = require("./global_shortcut.js");*/
const { join } = require("path");

const appPath = app.getAppPath();

require("electron-reload")(appPath, {
    electron: join(appPath, "node_modules", ".bin", "electron")
});

const createWindow = () => {

    let mainWindow;

    app.setName("Akara Media Player");

    app.setVersion(require(`${appPath}/package.json`).version);

    app.on("ready", () => {

        let tray = trayMenu();
        // the backgroundColor property
        // is modified in the stylesheet
        mainWindow = new BrowserWindow({
            backgroundColor: "#4B4B4B",
            frame: false,
            show: false,
            centre: true,
            webPreferences: {
                nodeIntegrationInWorker: true
            }
        });

        mainWindow.loadURL(`file://${appPath}/app/renderer/html/index.html`);

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
        /*handleGlobalShortcut(mainWindow);*/
    });
};
createWindow();
