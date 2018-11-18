
const fs = require("fs");

const {
    basename,
    join
} = require("path");

const {
    dialog,
    app,
    ipcMain: ipc,
    BrowserWindow
} = require("electron");

const {
    CONVERTED_MEDIA,
    DOWNLOADED_SUBTITLE
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

    if ( ! fs.existsSync(CONVERTED_MEDIA ) )
        return ;

    fs.readdir(CONVERTED_MEDIA, (err,fpath) => {

        if ( err )
            return dialog.showErrorBox(
                "Error","Error while reading coverted media folder"
            );

        fpath.forEach( path => {

            const fullPath = join(CONVERTED_MEDIA,path);

            fs.unlink(fullPath,(err,fpath) => {

                if ( err )
                    return dialog.showErrorBox(
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

const downloadFile = (url, contentId) => {

    const [ window ] = BrowserWindow.getAllWindows().filter( ({webContents}) => webContents.id === contentId );
    const { webContents } = window;
    webContents.downloadURL(url);

    webContents.session.on("will-download", async (event,item,webContents) => {

        item.setSavePath(app.getPath("downloads"));

        ipc.on("download::paused", () => {
            item.pause();
        });

        ipc.on("download::cancel", () => {
            item.cancel();
        });

        ipc.on("download::restart", () => {
            downloadFile(item.getURL(), contentId);
        });

        ipc.on("download::resume", () => {
            resumeDownloading(item,webContents);
        });

        webContents.send("download::started", webContents.id, item.getFilename());

        item.on("updated", (event,state) => {

            webContents.send("download::state", state);

            // if ( state === "interrupted" )
            //     resumeDownloading(item,webContents);

            webContents.send("download::gottenByte", item.getReceivedBytes());
            webContents.send("download::computePercent", item.getReceivedBytes(), item.getTotalBytes());
        });

        item.once("done", (event,state) => {
            webContents.send("download::state", state);
        });

        webContents.send("download::totalbyte", item.getTotalBytes());
    });
};


module.exports = {
    checkType,
    iterateDir,
    removeConvMedia,
    downloadFile
};
