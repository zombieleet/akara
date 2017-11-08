const {
    app,
    nativeImage,
    dialog,
    ipcMain: ipc
} = require("electron");

const {
    join
} = require("path");

const {
    createNewWindow
} = require("./newwindow.js");

const {
    shortcut
} = require("./configuration.js");


const share = {
    label: "Share",
    submenu: [
        {
            label: "Facebook",
            accelerator: shortcut.facebook,
            click(mItem, { webContents }, event ) {
                webContents.send("akara::fb-share");
            }
        },
        {
            label: "Twitter",
            accelerator: shortcut.twitter,
            click(mItem, { webContents }, event) {
                webContents.send("akara::twit-share");
            }
        },
        {
            label: "Youtube",
            accelerator: shortcut.youtube,
            click(mItem, { webContents }, event ) {
                webContents.send("akara::ytube-share");
            }
        }
    ]
};

const videoListMenu = [
    {
        label: "Remove From Playlist",
        accelerator: shortcut.remove_from_playlist,
        click(menuItem,{ webContents },event) {
            webContents.send("remove-target-hit");
        }
    },
    {
        label: "Add To Playlist",
        accelerator: shortcut.add_to_playlist,
        click(menuItem, { webContents }, event) {
            webContents.send("add-toplaylist-hit");
        }
    },
    {
        type: "separator"
    },
    {
        label: "Play",
        accelerator: shortcut.play,
        click(menuItem,{ webContents },event) {
            webContents.send("play-hit-target");
        }
    },
    {
        label: "Pause",
        accelerator: "shortcut.pause",
        click(menuItem,{ webContents },event) {
            webContents.send("pause-hit-target");
        }
    },
    {
        type: "separator"
    },
    {
        label: "Repeat",
        accelerator: shortcut.repeat,
        click(menuItem,{ webContents },event) {
            webContents.send("repeat-hit-target");
        }
    },
    {
        label: "No Repeat",
        accelerator: shortcut.no_repeat,
        click(menuItem,{ webContents },event) {
            webContents.send("no-repeat-hit-target");
        }
    },
    {
        label: "Repeat All",
        accelerator: "CtrlOrCommand+Alt+r",
        click(menuItem, { webContents }, event) {
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
                accelerator: shortcut.file,
                click(menuItem, { webContents } , event) {
                    webContents.send("video-open-file");
                }
            },
            {
                label: "Folder",
                accelerator: shortcut.folder,
                click(menuItem, { webContents }, event ) {
                    webContents.send("video-open-folder");
                }
            },
            {
                label: "Stream",
                accelerator: "Alt+s",
                click(menItem, { webContents }, event) {
                    webContents.send("video-open-stream");
                }
            }
        ]
    },
    {
        label: "Play",
        accelerator: "shortcut.play",
        click(menuItem, { webContents }, event ) {
            webContents.send("video-play");
        }
    },
    {
        label: "Pause",
        accelerator: "shortcut.pause",
        click(menuItem, { webContents }, event) {
            webContents.send("video-pause");
        }
    },
    {
        label: "Stop",
        accelerator: shortcut.stop,
        click(menuItem, { webContents }, event) {
            webContents.send("video-stop");
        }
    },
    {
        label: "Next",
        accelerator: shortcut.next,
        click(menuItem, { webContents } ,event) {
            webContents.send("video-next");
        }
    },
    {
        label: "Previous",
        accelerator: shortcut.previous,
        click(menuItem, { webContents } ,event ) {
            webContents.send("video-previous");
        }
    },
    {
        type: "separator"
    },
    {
        label: "Repeat",
        accelerator: shortcut.repeat,
        click(menuItem, { webContents }, event) {
            webContents.send("video-repeat");
        }
    },
    {
        label: "No Repeat",
        accelerator: shortcut.no_repeat,
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
                accelerator: shortcut.normal,
                click(menuItem, { webContents }, event) {
                    webContents.send("normal-speed");
                }
            },
            {
                label: "Fast",
                accelerator: "CommandOrCtrl+f",
                click(menuItem, { webContents }, event) {
                    webContents.send("fast-speed");
                }
            },
            {
                label: "Very Fast",
                accelerator: "CommandOrCtrl+Shift+f",
                click(menuItem, { webContents }, event) {
                    webContents.send("very-fast-speed");
                }
            },
            {
                label: "Slow",
                accelerator: "CommandOrCtrl+s",
                click(menuItem, { webContents }, event) {
                    webContents.send("slow-speed");
                }
            },
            {
                label: "Very Slow",
                accelerator: "CommandOrCtrl+Shift+s",
                click(menuItem, { webContents }, event) {
                    webContents.send("very-slow-speed");
                }
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
                accelerator: "CommandOrCtrl+p",
                click() { }
            },
            {
                label: "Video Section",
                accelerator: "CommandOrCtrl+v",
                click() { }
            },
            {
                label: "Select Area",
                accelerator: "CommandOrCtrl+Alt+s",
                click() { }
            }
        ]
    },
    {
        type: "separator"
    },
    {
        label: "Media Info",
        accelerator: "CommandOrCtrl+Shift+m",
        click(menuItem, { webContents } , event ) {
            webContents.send("media-info");
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
                        accelerator: "Alt+t",
                        click(menuItem, { webContents }, event) {
                            webContents.send("subtitle::load-sub", "computer");
                        }
                    },
                    {
                        label: "From Net",
                        __priv: true,
                        accelerator: "Alt+n",
                        click(menuItem, { webContents } , event ) {
                            webContents.send("subtitle::load-sub", "net");
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
        accelerator: "f",
        click(menuItem, { webContents }, event) {
            webContents.send("enter-video-fullscreen");
        }
    },
    {
        label: "Leave FullScreen",
        accelerator: "f",
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
        accelerator: "Ctrl+o",
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
        accelerator: "Shift+s",
        click(menuItem, { webContents }, event ) {
            webContents.send("video-search");
        }
    },
    {
        type: "separator"
    },
    {
        label: "Playlists",
        submenu: []
    },
    {
        label: "Load Playlist",
        submenu: []
    },
    {
        label: "Import Playlist",
        click(menuItem, { webContents }, event) {
            webContents.send("akara::playlist:import");
        }
    }
];


module.exports = {
    videoListMenu,
    videoContextMenu
};
