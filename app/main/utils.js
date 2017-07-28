const fs = require("fs");
const { basename, join } = require("path");
const { videoContextMenu } = require("electron");

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

module.exports = {
    checkType,
    iterateDir
};
