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
        click() {
        },
        accelearation: "Alt+p"
    },
    {
        label: "Pause",
        click() {
        },
        accelearation: "Alt+o"
    },
    {
        label: "Stop",
        click() {
        },
        accelearation: "Alt+s"
    },
    {
        label: "Previous",
        click() {
        },
        accelearation: "p"
    },
    {
        label: "Next",
        click() {
        },
        accelearation: "n"
    },
    {
        label: "Repeat",
        click() {
        }
    },
    {
        type: "separator"
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
