
const { basename } = require("path");
const { createEl } = require("../js/util.js");

const addMediaCb = paths => {

    let mediaPathParent = document.querySelector(".akara-loaded");
    
    if ( ! paths ) {
        mediaPathParent = undefined;
        return ;
    }
    
    paths.forEach( path => {
        
        const _path = basename(path);
        const createdElement = createEl({path,_path});

        mediaPathParent.appendChild(createdElement);
        
    });
};

module.exports = {
    addMediaCb
};
