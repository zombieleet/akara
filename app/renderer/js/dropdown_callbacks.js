
const { basename } = require("path");
const { createEl } = require("../js/util.js");
const mime = require("mime");
const { remote: { dialog } } = require("electron");

const addMediaCb = paths => {

    let mediaPathParent = document.querySelector(".akara-loaded");
    
    if ( ! paths ) {
        mediaPathParent = undefined;
        return ;
    }
    
    paths.forEach( path => {

        // when adding from the drop down menu, the following
        //    block of code is invalid
        //    but since the drag and drop feature is
        //    using this function, we have to prevent the adding
        //    of invalid media files
        
        const _path = basename(path);
        
        if ( ! /^video|^audio/.test(mime.lookup(_path)) )
            return dialog.showErrorBox("Invalid file type",`${_path} is not a valid media file`);
        

        const createdElement = createEl({path,_path});

        mediaPathParent.appendChild(createdElement);
        
    });
};

module.exports = {
    addMediaCb
};
