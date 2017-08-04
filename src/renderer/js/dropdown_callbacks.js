const { basename } = require("path");
const {
    createEl,
    validateMime,
    playOnDrop
} = require("../js/util.js");

const addMediaCb = paths => {

    let mediaPathParent = document.querySelector(".akara-loaded");

    if ( ! paths ) {
        mediaPathParent = undefined;
        return ;
    }

    paths.forEach( path => {
        
        let _path = basename(path);
        
        const createdElement = createEl({path,_path});
        
        mediaPathParent.appendChild(createdElement);
        
        return playOnDrop();
    });
};

module.exports = {
    addMediaCb
};
