
"use strict";

const { basename } = require("path");
const {
    createEl,
    validateMime,
    playOnDrop
} = require("../js/util.js");


/**
 *
 * addMediacb function will be called
 * whenever a media file is added
 * it basically appends the media to the playlist section
 *
 **/

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
