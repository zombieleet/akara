"use strict";

const fs = require("fs");

const {
    basename, join
} = require("path");

const {
    dialog,
    ipcMain: ipc,
    BrowserWindow
} = require("electron");

const {
    CONVERTED_MEDIA,
    DOWNLOADED_SUBTITLE,
    MEASUREMENT,
    SIZE
} = require("./constants.js");

const checkType = path => {

    if ( fs.statSync(path).isFile() ) {
        return [ path ];
    } else if ( fs.statSync(path).isDirectory() ) {
        return iterateDir()(path);
    } else {
        return false;
    }
};

const iterateDir = () => {

    const files = [],
        dirs = [];

    return function dirIt(directory) {

        try {

            let dirContent = fs.readdirSync(directory);

            dirContent.forEach( path => {

                const fullPath = join(directory,path);

                if ( fs.statSync(fullPath).isFile() )
                    files.push(fullPath);
                else
                    dirs.push(fullPath);
            });

            if ( dirs.length !== 0 )

                dirIt(dirs.pop());

            return files;

        } catch(ex) {
            console.log(ex);
            return false;
        }
    };

};

const removeConvMedia = () => {
    if ( ! fs.existsSync(CONVERTED_MEDIA ) ) return ;

    fs.readdir(CONVERTED_MEDIA, (err,fpath) => {
        if ( err ) return dialog.showErrorBox(
            "Error","Error while reading coverted media folder"
        );
        fpath.forEach( path => {
            const fullPath = join(CONVERTED_MEDIA,path);
            fs.unlink(fullPath,(err,fpath) => {
                if ( err ) return dialog.showErrorBox(
                    `Unable to delete ${path}`,`Cannot delete converted media ${path}`
                );
            });
        });
    });
};

const resumeDownloading = (item,webContents) => {
    console.log("resume");
    if ( item.canResume() ) {
        item.resume();
        webContents.send("download::state", "resumed");
    } else {
        webContents.send("download::state", "noResume");
    }
};
const downloadURL = (url,window) => {

    if ( ! fs.existsSync(DOWNLOADED_SUBTITLE) ) fs.mkdirSync(DOWNLOADED_SUBTITLE);

    window.webContents.downloadURL(url);

    window.webContents.session.on("will-download", (event,item,webContents) => {

        const fPath = join(DOWNLOADED_SUBTITLE,item.getFilename());
        
        item.setSavePath(fPath);
        
        webContents.send("download::filename", item.getFilename());

        item.on("updated", (event,state) => {

            webContents.send("download::state", state);

            if ( state === "interrupted" ) resumeDownloading(item,webContents);

            webContents.send("download::gottenByte", item.getReceivedBytes());
            webContents.send("download::computePercent", item.getReceivedBytes(), item.getTotalBytes());
        });


        item.once("done", (event,state) => {
            
            webContents.send("download::state", state);
            
            // send the path were the file
            //   was downloaded to the renderer process
            //   1 was hardcoded because we
            //   only needed the main window

            let win = BrowserWindow.fromId(1);
            
            console.log(win.webContents,win.getTitle());
            win.webContents.send("subtitle::load-sub",fPath);
        });

        ipc.on("download::cancel", () => {
            console.log("canceled");
            webContents.send("download::state", "canceled");
            item.cancel();
        });

        ipc.on("download::pause", () => {
            console.log("paused");
            item.pause();
            webContents.send("download::state", "paused");
        });

        ipc.on("download::resume", () => resumeDownloading(item,webContents));
        ipc.on("download::restart", () => {
            webContents.send("download::state", "restarting");
            downloadURL(url,window);
        });
        webContents.send("download::totalbyte", item.getTotalBytes());
    });
};

const computeByte = bytes => {
    console.log(bytes);
    if ( bytes === 0 ) return `${bytes} byte`;

    const idx = Math.floor( Math.log(bytes) / Math.log(SIZE) );

    return `${( bytes / Math.pow(SIZE,idx)).toPrecision(3)} ${MEASUREMENT[idx]}`;
};
module.exports = {
    checkType,
    iterateDir,
    removeConvMedia,
    downloadURL,
    computeByte
};
