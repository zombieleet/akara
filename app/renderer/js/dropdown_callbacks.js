const { remote: { dialog } } = require("electron");
const { basename } = require("path");
const { createEl, validateMime } = require("../js/util.js");

const addMediaCb = paths => {

    let mediaPathParent = document.querySelector(".akara-loaded");
    let video = document.querySelector("video");

    if ( ! paths ) {
        mediaPathParent = undefined;
        return ;
    }

    paths.forEach( async (path) => {

        let ppath = await validateMime(path);
        
        if ( ! ppath )
            return dialog.showErrorBox("Invalid Media type",
                `Cannot Play ${basename(path)}`);
        path = ppath;

        let _path = basename(path);
        
        const createdElement = createEl({path,_path});
        
        return mediaPathParent.appendChild(createdElement);
    });
};

module.exports = {
    addMediaCb
};
