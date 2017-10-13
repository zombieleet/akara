
"use strict";

const {
    basename
} = require("path");

const {
    existsSync
} = require("fs");

const {
    createEl,
    playOnDrop
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
    console.log(paths, typeof(paths));
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

module.exports = {
    addMediaCb,
    searchAndAppend
};
