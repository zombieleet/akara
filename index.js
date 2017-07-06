"use strict";

const { app,  BrowserWindow } = require("electron");

const trayMenu = require("./app/main/tray.js");

const handleWinState = require("./app/main/window_state.js");

const handleWebContents = require("./app/main/webcontent_state.js");

const { join } = require("path");

require("electron-reload")(__dirname, {
    electron: join(__dirname, "node_modules", ".bin", "electron")
});

const createWindow = () => {
    
    let mainWindow;

    app.setName("Akara Media Player");
    
    app.setVersion(require("./package.json").version);
    
    app.on("ready", () => {
        
        let tray = trayMenu();
        // the backgroundColor property
        //  is modified in the stylesheet
        mainWindow = new BrowserWindow({
            backgroundColor: "#4B4B4B",
            frame: false,
            show: false,
            centre: true
        });

        mainWindow.loadURL(`file://${__dirname}/app/renderer/html/index.html`);

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
};

createWindow();
