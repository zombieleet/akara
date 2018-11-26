
const {
    BrowserWindow,
    ipcMain: ipc
} = require("electron");

const {
    APP_PATH,
    BACKGROUND_COLOR
} = require("./constants.js");

const url = require("url");

const createNewWindow = (obj,html) => {

    Object.assign(obj, {
        frame: obj.frame ? true : false,
        show: false,
        maximizable: obj.maximizable ? true : false,
        minimizable: obj.minimizable ? true : false,
        resizable: obj.resizable ? true : false,
        center: true,
        backgroundColor: BACKGROUND_COLOR
    });

    let newWindow = new BrowserWindow(obj);

    let urLocation;

    if ( url.parse(html).protocol )
        urLocation = html;
    else
        urLocation = `file://${APP_PATH}/app/renderer/html/${html}`;

    newWindow.loadURL(urLocation);

    newWindow.once("closed", () => {
        newWindow.webContents.send("akara::remove:disable_menu");
        newWindow = null;
    });

    newWindow.once("ready-to-show", () => {
        newWindow.show();
    });

    //parent.setIgnoreMouseEvents(true);
    const { webContents } = newWindow;

    //webContents.openDevTools();

    ipc.on("akara::newwindow:max", event => {
        newWindow = BrowserWindow.fromWebContents(event.sender);
        if ( newWindow.isMaximized() ) {
            newWindow.unmaximize();
            event.sender.send("akara::newwindow:isnotmax");
        } else {
            newWindow.maximize();
            event.sender.send("akara::newwindow:ismax");
        }
    });

    ipc.on("akara::newwindow:min", event => {
        newWindow.minimize();
    });

    newWindow.on("maximize", event => {
        newWindow.webContents.send("akara::newwindow:ismax");
    });

    newWindow.on("unmaximize", event => {
        newWindow.webContents.send("akara::newwindow:isnotmax");
    });

    webContents.on("will-navigate", (evt,fpath) => {

        evt.preventDefault();

        let content = webContents.getTitle().replace(/\s+/,"");

        if ( content !== "CreatePlaylist" )
            return ;

        webContents.send("akara::playlist:droplist", fpath);

        return;
    });

    return newWindow;
};

module.exports = {
    createNewWindow
};
