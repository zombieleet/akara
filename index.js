"use strict";

const { app,  BrowserWindow } = require("electron");

const trayMenu = require("./app/main/tray.js");


const handleWinState = require("./app/main/window_state.js");


const { join } = require("path");


require("electron-reload")(__dirname, {
    electron: join(__dirname, "node_modules", ".bin", "electron")
});




const createWindow = () => {
    
    let mainWindow;
    
    app.on("ready", () => {
        
        let tray = trayMenu();
        
        mainWindow = new BrowserWindow({
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

        mainWindow.webContents.openDevTools({
            mode: "detach"
        });

        handleWinState(mainWindow);
    });

};

createWindow();

