
"use strict";

const {
    basename
} = require("path");

const {
    existsSync
} = require("fs");

const path = require("path");

const {
    
    createEl,
    playOnDrop,
    importMpegGurl,
    exportMpegGurl,
    
    importXspf,
    exportXspf
    
} = require("../js/util.js");

console.log(createEl);

const {
    remote: {
        dialog
    }
} = require("electron");


/**
 *
 * addMediacb function will be called
 * whenever a media file is added
 * it basically appends the media to the playlist section
 *
 **/

const addMediaCb = (paths,forPlaylist) => {

    let mediaPathParent = document.querySelector(".akara-loaded");

    if ( ! paths ) {
        mediaPathParent = undefined;
        return ;
    }

    paths = typeof(paths) === "string"
        ? [ paths ]
        : paths;
        
    paths.forEach( path => {

        const decodedPath = decodeURIComponent(path);
        
        let _path = basename(decodedPath);

        const createdElement = createEl({path,_path});

        createdElement.setAttribute("data-belongsto-playlist", forPlaylist ? forPlaylist.split(" ").join("|") : "general" );
        
        mediaPathParent.appendChild(createdElement);

        return playOnDrop();
    });
};

const searchAndAppend = (input,findings) => {

    input.addEventListener("keyup", evt => {

        if ( /^38$|^40$/.test(evt.keyCode) ) return false;
        
        const playlist = document.querySelectorAll("[data-full-path] > span");

        const li = document.querySelectorAll(".items-found");

        const regexp = new RegExp(input.value, "ig");

        Array.from(playlist, el => {

            if ( regexp.test(el.textContent) ) {

                const li = document.createElement("li");

                li.setAttribute("class","items-found");

                li.setAttribute("id", el.parentNode.getAttribute("id"));
                li.setAttribute("data-full-path", el.parentNode.getAttribute("data-full-path"));

                li.textContent = el.textContent;

                findings.appendChild(li);

            } else {

                if ( li ) {

                    Array.from(li, el => {

                        if ( ! regexp.test(el.textContent) )
                            el.remove();

                    });

                }
            }

        });


        if ( /^\s+$|^$/.test(input.value) ) {

            if ( li ) {
                Array.from(li, el => el.remove());
            }
        }
    });
};

const saveplaylistCb = fpath => {
    
    if ( ! fpath )
        return false;
    
    if ( /m3u|m3u8/.test(path.extname(fpath)) )
        return exportMpegGurl(fpath);
    
    if ( path.extname(fpath) === ".xspf" )
        return exportXspf(fpath);
    
    return false;
};

const loadplaylistCb = lists => {
    if ( ! lists )
        return false;

    let result ;
    
    try {
        
        lists.forEach( async (list) => {
            
            if ( path.extname(list) === ".xspf" ) {
                let tracks = await importXspf(list);
                for ( let _track of tracks ) {
                    let { location: [ location ] } = _track;
                    addMediaCb(location);
                }
            }
            
            if ( /m3|m3u8/.test(path.extname(list)) ) {
                let tracks = await importMpegGurl(list);
                addMediaCb(tracks);
            }
            
        });
        
    } catch(ex) {
        result = ex;
    }

    if ( Error[Symbol.hasInstance](result) ) {
        return dialog.showErrorBox(
            "Uexpected Error",
            "An Error Occured while parsing the playlist"
        );
    }
    return true;
};


module.exports = {
    addMediaCb,
    searchAndAppend,
    saveplaylistCb,
    loadplaylistCb
};
