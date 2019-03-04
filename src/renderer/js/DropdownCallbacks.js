/* AKM is a highly customizable media player built with electron
   Copyright (C) 2016  Victory Osikwemhe (zombieleet)

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

"use strict";

const {
    setupPlaying,
    createPlaylistItem,
    playOnDrop,
    importMpegGurl,
    exportMpegGurl,
    importXspf,
    exportXspf
} = require("../js/Util.js");

const {
    ipcRenderer: ipc,
    remote: {
        dialog
    }
} = require("electron");



const { basename , extname }   = require("path");
const { existsSync }           = require("fs");

const mime = require("mime");



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

        if ( /mpegurl/.test(mimeType) ) {
            loadMpegGurlFormat(path);
            return;
        }

        if ( /xspf/.test(mimeType) ) {
            loadXspfFormat(path);
            return;
        }

        const decodedPath = decodeURIComponent(path);
        const _path = basename(decodedPath);
        const createdElement = createPlaylistItem({path,_path});

        createdElement.setAttribute("data-belongsto-playlist", forPlaylist ? forPlaylist.split(" ").join("|") : "general" );

        mediaPathParent.appendChild(createdElement);

        if ( forPlaylist === "podder" ) {
            createdElement.setAttribute("podcast-metadata", localStorage.getItem("podcast-metadata"));
            createdElement.querySelector("span").textContent = JSON.parse(localStorage.getItem("podcast-metadata")).episode.title;
            localStorage.removeItem("podcast-metadata");
        }
    });

    playOnDrop();

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

    if ( /m3u|m3u8/.test(extname(fpath)) )
        return exportMpegGurl(fpath);

    if ( extname(fpath) === ".xspf" )
        return exportXspf(fpath);

    return false;
};

const loadplaylistCb = lists => {

    if ( ! lists )
        return false;

    let result ;

    try {

        lists.forEach( async (list) => {

            if ( extname(list) === ".xspf" )
                return loadXspfFormat(list);

            if ( /m3|m3u8/.test(extname(list)) )
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
