"use strict";

const { Tray, nativeImage, Menu } = require("electron");

const { join } = require("path");

const setTray = () => {
    
    const imagePath = nativeImage.createFromPath(join(__dirname, "app/renderer/img/logo.jpeg"));

    return new Tray(imagePath);
};


const trayMenu = () => {
    
    let tray = setTray();

    tray.setToolTip("akara media player tray options");

    tray.setContextMenu(Menu.buildFromTemplate([
        {
            label: "Play",
            click () {
            }
        },
        {
            label: "Pause",
            click() {
            }
        },
        {
            label: "Stop",
            click() {
            }
        },
        {
            label: "Next",
            click() {
            }
        },
        {
            label: "Previous",
            click() {
            }
        },
        {
            label: "Close",
            click() {
            }
        }
    ]));

    return tray;
};

module.exports = trayMenu;
