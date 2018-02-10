
const {
    dialog,
    app,
    Menu
} = require("electron");
const {
    checkType,
    iterateDir
} = require("./utils.js");


const handleWebContents = ({webContents}) => {

    webContents.openDevTools({
        mode: "bottom"
    });

    webContents.on("will-navigate", (event,path) => {

        event.preventDefault();

        if ( ! path )
            return dialog.showErrorBox("Invalid File Type", `Error while reading from ${path}`);
        webContents.send("media-droped-files", path);
    });
};


module.exports = handleWebContents;
