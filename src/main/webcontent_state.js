
const { dialog , app } = require("electron");

const { checkType, iterateDir } = require("./utils.js");


const handleWebContents = ({webContents}) => {

    webContents.openDevTools({
        mode: "detach"
    });

    webContents.on("will-navigate", (event,path) => {

        event.preventDefault();

        let mediaPaths =  checkType(path.replace("file://",""));
        
        if ( ! mediaPaths )
            
            return dialog.showErrorBox("Invalid File Type", `Error while reading from ${path}`);        
        
        webContents.send("media-droped-files", mediaPaths);
    });
};


module.exports = handleWebContents;
