
"use strict";

const {
    basename
} = require("path");

const mime = require("mime");

const {
    existsSync
} = require("fs");

const path = require("path");

const {
    setupPlaying,
    createPlaylistItem,
    playOnDrop,
    importMpegGurl,
    exportMpegGurl,
    importXspf,
    exportXspf
} = require("../js/util.js");

console.log(createPlaylistItem);

const {
    remote: {
        dialog
    }
} = require("electron");


const loadMpegGurlFormat = async (path) => {
    let result;
    try {
        result = await importMpegGurl(path);
    } catch(ex) {
        result = ex;
    }

    if ( Error[Symbol.hasInstance](result) )
        return dialog.showErrorBox("Invalid Format", "Cannot process requested playlist");
    
    return addMediaCb(result);
};

const loadXspfFormat = async (path) => {

    let result = [];
    
    try {
        const tracks = await importXspf(path);
        for ( let _track of tracks ) {
            let { location: [ location ] } = _track;
            result.push(location);
        }
    } catch(ex) {
        result = ex;
    }

    if ( Error[Symbol.hasInstance](result) )
        return dialog.showErrorBox("Invalid Format", "Cannnot process requrested playlist");

    return addMediaCb(result);
};


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

    paths.forEach( async (path) => {

        const mimeType = mime.lookup(path);
        
        if ( /mpegurl/.test(mimeType) )
            return loadMpegGurlFormat(path);

        if ( /xspf/.test(mimeType) )
            return loadXspfFormat(path);

        const decodedPath = decodeURIComponent(path);
        const _path = basename(decodedPath);
        const createdElement = createPlaylistItem({path,_path});

        createdElement.setAttribute("data-belongsto-playlist", forPlaylist ? forPlaylist.split(" ").join("|") : "general" );

        mediaPathParent.appendChild(createdElement);

        return playOnDrop();
    });
};

const searchAndAppend = (input,findings) => {

    input.addEventListener("keyup", evt => {

        if ( /^(38|40|39|37|27)$/.test(evt.keyCode) )
            return false;
        else
            evt.stopPropagation();

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

                li.addEventListener("click", evt => {
                    setupPlaying(li);
                });


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

    if ( ! document.querySelector(".playlist") )
        return dialog.showErrorBox("No Playlist", "Cannot export empty playlist");

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

            if ( path.extname(list) === ".xspf" )
                return loadXspfFormat(list);

            if ( /m3|m3u8/.test(path.extname(list)) )
                return loadMpegGurlFormat(list);

            return undefined;
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
