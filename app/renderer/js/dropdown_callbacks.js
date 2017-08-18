
"use strict";

const { basename } = require("path");
const {
    createEl,
    validateMime,
    playOnDrop,
    matchCode
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

const searchAndAppend = (input,findings) => {

    input.addEventListener("keyup", evt => {

        const playlist = document.querySelectorAll("[data-full-path] > span");

        Array.from(playlist, el => {
            
            if ( matchCode(input.value).test(el.textContent) ) {
                console.log("wow");
                const li = document.createElement("li");
                li.setAttribute("class","items-found");
                li.textContent = el.textContent;
                findings.appendChild(li);
                console.log(findings);
            } else {
                Array.from(document.querySelectorAll(".items-found"), elIn => {
                    Array.from(playlist, matchEln => {
                        if ( elIn.textContent === matchEln.textContent ) {
                            elIn.remove();
                        }
                    });
                });
            }

        });
    });
};

module.exports = {
    addMediaCb,
    searchAndAppend
};
