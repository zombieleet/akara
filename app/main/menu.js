const { app, nativeImage, dialog } = require("electron");
const { join } = require("path");

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
        click() { },
        accelearator: "CommandOrCtrl+M"
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
                            webContents.send("load-sub-computer", val);
                        }
                    },
                    {
                        label: "From Net",
                        __priv: true,
                        click(menuItem, { webContents }, event ) {
                            webContents.send("load-sub-internet");
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
        label: "Open File Location",
        click(menuItem,{ webContents } ,event) {
            webContents.send("video-open-external");
        }
    },
    {
        type: "separator"
    },
    share
];


module.exports = {
    videoListMenu,
    videoContextMenu
};
