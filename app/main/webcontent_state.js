const fs = require("fs");
const { basename, join } = require("path");
const { dialog , app } = require("electron");

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
                
                return dirIt(dirs.pop());
                
            return files;

        } catch(ex) {
            return false;
        }        
    };

};


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
