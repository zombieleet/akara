const { nativeImage, ipcMain: ipc } = require("electron");
const { join } = require("path");

const videoListMenu = [
    {
        label: "Remove",
        click(menuItem,{ webContents },event) {

            webContents.send("remove-target-hit");

        },
        accelearation: "CtrlOrCommand+r"
    },
    { type: "separator" },
    {
        label: "Add To Playlist",
        click() {
        },
        accelearation: "CtrlOrCommand+p"
    },
    {
        label: "Play",
        click(menuItem,{ webContents },event) {
            webContents.send("play-hit-target");
        },
        accelearation: "Alt+p"
    },
    {
        label: "Pause",
        click(menuItem,{ webContents },event) {
            webContents.send("pause-hit-target");
        },
        accelearation: "Alt+o"
    },
    {
        type: "separator"
    },
    {
        label: "Repeat",
        click(menuItem,{ webContents },event) {
            webContents.send("repeat-hit-target");
        }
    },
    {
        label: "No Repeat",
        click(menuItem,{ webContents },event) {
            webContents.send("no-repeat-hit-target");
        }
    },
    {
        label: "Repeat All",
        click(menuIte, { webContents }, event) {
        }
    },
    {
        type: "separator"
    },
    {
        label: "Shuffle",
        click(menuItem, { webContents }, event) {
        }
    },
    {
        type: "sepeartor"
    },
    {
        label: "Share",
        submenu: [
            {
                label: "Facebook",
                click() { },
                accelearation: "CtrlOrCommand+1"
            },
            {
                label: "Twitter",
                click() { },
                accelearation: "CtrlOrCommand+2"
            },
            {
                label: "Youtube",
                click() { },
                accelearation: "CtrlOrCommand+3"
            }
        ]
    }
];


module.exports = {
    videoListMenu
};
