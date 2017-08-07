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
            click(menuItem, { webContents }, event ) {
                webContents.send("video-play");
            }
        },
        {
            label: "Pause",
            click(menuItem, { webContents }, event) {
                webContents.send("video-pause");
            }
        },
        {
            label: "Stop",
            click(menuItem, { webContents }, event) {
                webContents.send("video-stop");
            }
        },
        {
            label: "Next",
            click(menuItem, { webContents } ,event) {
                webContents.send("video-next");
            }
        },
        {
            label: "Previous",
            click(menuItem, { webContents } ,event ) {
                webContents.send("video-previous");
            }
        },
        {
            label: "Close",
            click(menuItem, window, event ) {
                window.close();
            }
        }
    ]));

    return tray;
};

module.exports = trayMenu;
