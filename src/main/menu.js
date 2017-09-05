const { app, nativeImage, dialog, ipcMain: ipc } = require("electron");
const { join } = require("path");
const { createNewWindow } = require("./newwindow.js");

const share = {
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
};

const videoListMenu = [
    {
        label: "Remove From Playlist",
        click(menuItem,{ webContents },event) {

            webContents.send("remove-target-hit");

        },
        accelearation: "CtrlOrCommand+r"
    },
    {
        label: "Add To Playlist",
        click(menuItem, { webContents }, event) {
            webContents.send("add-toplaylist-hit");
        },
        accelearator: "CtrlOrCommand+p"
    },
    {
        type: "separator"
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
        type: "separator"
    },
    share
];


//const VideoContextMenu = Array.from(videoListMenu);

const videoContextMenu = [
    {
        label: "Add",
        icon:nativeImage.createFromPath("./solid/add-circle-1.svg"),
        submenu: [
            {
                label: "File",
                click(menuItem, { webContents } , event) {
                    webContents.send("video-open-file");
                },
                accelearator: "Alt+Shift+f"
            },
            {
                label: "Folder",
                click(menuItem, { webContents }, event ) {
                    webContents.send("video-open-folder");
                },
                accelearator: "Alt+f"
            },
            {
                label: "Stream",
                click(menItem, { webContents }, event) {
                    webContents.send("video-open-stream");
                }
            }
        ]
    },
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
        },
        accelerator: "n"
    },
    {
        label: "Previous",
        click(menuItem, { webContents } ,event ) {
            webContents.send("video-previous");
        },
        accelerator: "p"
    },
    {
        type: "separator"
    },
    {
        label: "Repeat",
        click(menuItem, { webContents }, event) {
            webContents.send("video-repeat");
        }
    },
    {
        label: "No Repeat",
        click(menuItem, { webContents }, event ) {
            webContents.send("video-no-repeat");
        },
        visible: false
    },
    {
        type: "separator"
    },
    {
        label: "Speed",
        submenu: [
            {
                label: "Normal",
                click(menuItem, { webContents }, event) {
                    webContents.send("normal-speed");
                },
                accelearation: "CommandOrCtrl+n"
            },
            {
                label: "Fast",
                click(menuItem, { webContents }, event) {
                    webContents.send("fast-speed");
                },
                accelearation: "CommandOrCtrl+f"
            },
            {
                label: "Very Fast",
                click(menuItem, { webContents }, event) {
                    webContents.send("very-fast-speed");
                },
                accelearation: "CommandOrCtrl+Shift+V"
            },
            {
                label: "Slow",
                click(menuItem, { webContents }, event) {
                    webContents.send("slow-speed");
                },
                accelearator: "Alt+s"
            },
            {
                label: "Very Slow",
                click(menuItem, { webContents }, event) {
                    webContents.send("very-slow-speed");
                },
                accelearator: "Alt+Shift+V"
            }
        ]
    },
    {
        type: "separator"
    },
    {
        label: "Take Screenshot",
        submenu: [
            {
                label: "Entire Screen",
                click() { }
            },
            {
                label: "Video Section",
                click() { }
            },
            {
                label: "Select Area",
                click() { }
            }
        ]
    },
    {
        type: "separator"
    },
    {
        label: "Media Info",
        click(menuItem, BrowserWindow , event ) {
            const __obj = {
                title: "mediainfo",
                parent: BrowserWindow,
                height: 773,
                width: 608
            };
            const html = `${__obj.title}.html`;
            createNewWindow(__obj,html);
        }
    },
    {
        type: "separator"
    },
    {
        label: "Subtitle",
        submenu: [
            {
                label: "Load Subtitle",
                submenu: [
                    {
                        label: "From Computer",
                        click(menuItem, { webContents }, event) {
                            const val = dialog.showOpenDialog({
                                title: "Select Subtitle",
                                property: [ "openFile" ],
                                filters: [
                                    {
                                        name: "Subtitle File",
                                        extensions: [
                                            "srt",
                                            "webvvt"
                                        ]
                                    }
                                ]
                            });
                            webContents.send("subtitle::load-sub", val);
                        }
                    },
                    {
                        label: "From Net",
                        __priv: true,
                        click(menuItem, BrowserWindow , event ) {

                            const { webContents } = BrowserWindow;

                            const __obj = {
                                title: "subtitle",
                                parent: BrowserWindow
                            };

                            const html = `${__obj.title}.html`;

                            createNewWindow(__obj,html);

                        }
                    }
                ]
            },
            {
                label: "Choose Subtitle",
                submenu: []
            }
        ]
    },
    {
        type: "separator"
    },
    {
        label: "Enter FullScreen",
        // this kind of fullscreen is not dope
        //role: "togglefullscreen"
        click(menuItem, { webContents }, event) {
            webContents.send("enter-video-fullscreen");
        }
    },
    {
        label: "Leave FullScreen",
        click(menuItem, { webContents }, event ) {
            webContents.send("leave-video-fullscreen");
        },
        visible: false
    },
    {
        type: "separator"
    },
    {
        label: "Open File Location",
        click(menuItem,{ webContents } ,event) {
            webContents.send("video-open-external");
        }
    },
    {
        type: "separator"
    },
    share,
    {
        type: "separator"
    },
    {
        label: "Search",
        click(menuItem, { webContents }, event ) {
            webContents.send("video-search");
        }
    }
];


module.exports = {
    videoListMenu,
    videoContextMenu
};
