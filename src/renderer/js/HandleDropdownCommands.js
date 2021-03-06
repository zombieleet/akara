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
    ipcRenderer: ipc,
    remote: {
        dialog,
        app ,
        BrowserWindow,
        getCurrentWindow,
        require: _require
    }
} = require("electron");

const {
    prevNext,
    exportMpegGurl,
    exportXspf,
    importXspf,
    importMpegGurl
} = require("../js/Util.js");

const {
    addMediaCb,
    searchAndAppend,
    saveplaylistCb,
    loadplaylistCb
} = require("../js/DropdownCallbacks.js");


const path                 = require("path");
const akara_emit           = require("../js/Emitter.js");
const { createNewWindow }  = _require("./newwindow.js");
const { subHandler }       = require("../js/VideoHandlers.js");
const { iterateDir }       = _require("./utils.js");
const { video , controls } = require("../js/VideoControl.js");

const addMediaFile = () => {

    dialog.showOpenDialog({
        title: "Choose media file",
        defaultPath: app.getPath("videos"),
        filters: [
            {name: "Media" , extensions: [
                "mp4","flac","ogv","ogm","ogg",
                "webm","wav","m4v","m4a","mp3",
                "amr","avi","3gp","swf","wma","mkv",
                "vob"
            ]},
            { name: "xml shareable portable format" , extensions: [ "xspf" ] },
            { name: "media playlist format", extensions: [ "m3u8", "m3u" ] }
        ],
        properties: ["openFile", "multiSelections"]
    },addMediaCb);
};


/**
 *
 *
 * show search box when this function
 *  is called
 *
 **/


const search = () => {

    if ( document.querySelector(".search-parent") )
        return false;

    const parent = document.createElement("div");
    parent.setAttribute("class","search-parent");

    const input = document.createElement("input");
    input.setAttribute("class", "search-input");
    input.setAttribute("type","text");
    input.setAttribute("data-prevent-shortcut", "true");

    const findingsParent = document.createElement("div");
    findingsParent.setAttribute("class", "findings-parent");

    const findings = document.createElement("ul");
    findings.setAttribute("class", "findings");

    const akaraMedia = document.querySelector(".akara-media");
    const akaraLoad = akaraMedia.querySelector(".akara-load");

    parent.appendChild(input);
    findingsParent.appendChild(findings);
    parent.appendChild(findingsParent);


    akaraMedia.insertBefore(parent, akaraLoad);
    searchAndAppend(input,findings);

    return parent.focus();
};




/**
 *
 * addMediaFolder handles the selection of folder
 * containging media files
 *
 **/

const addMediaFolder = () => {

    dialog.showOpenDialog({
        title: "Choose Folder Containging Media Files",
        defaultPath: app.getPath("videos"),
        properties: [ "openDirectory", "multiSelections" ]
    }, folderPaths => {

        if ( ! folderPaths )
            return ;

        const files = [];
        folderPaths.forEach( path => iterateDir()(path).forEach( filePath => files.push(filePath) ));
        addMediaCb(files);
    });

};


/**
 *
 * toggle to show playlist or hide playlist
 *
 **/

let togglePlist;

try {

    togglePlist = (() => {

        const akaraLoad               = document.querySelector(".akara-load");
        const akaraMediaCover         = document.querySelector(".akara-media-cover");
        const currentMediaParentWidth = Number.parseFloat(getComputedStyle(akaraMediaCover).width);
        const currentPlaylistWidth    = Number.parseFloat(getComputedStyle(akaraLoad).width);
        console.log(currentMediaParentWidth,currentPlaylistWidth);
        return () => {

            // reset playlist section to its default size, before a toggle was made
            if ( akaraLoad.hasAttribute("data-plist-toggle") ) {

                akaraLoad.removeAttribute("data-plist-toggle");
                akaraLoad.style.display = null;

                let mediaResizerStorage;

                if ( ( mediaResizerStorage = localStorage.getItem("media-resizer" ) ) ) {
                    console.log("wtf");
                    let { mediaContainer, playlistsContainer } = JSON.parse(mediaResizerStorage);
                    akaraLoad.style.width = playlistsContainer;
                    akaraMediaCover.style.width = mediaContainer;
                    return;
                }

                akaraLoad.style.width = `${(currentPlaylistWidth/akaraLoad.parentNode.clientWidth) * 100}%`;
                akaraMediaCover.style.width = `${(currentMediaParentWidth/akaraMediaCover.parentNode.clientWidth) * 100}%`;

                return;
            }

            // toggling playlist will cause the media to cover that entire region
            // playlist location will not be visible
            akaraLoad.style.display = "none";
            akaraMediaCover.style.width = "100%";
            akaraLoad.setAttribute("data-plist-toggle", "true");
            return;
        };
    })();

} catch(ex) {};


const noMediaPlaying = () => document.querySelector(".cover-on-error-src").hasAttribute("style");

const _play = () => {

    if ( noMediaPlaying() )
        return controls.play();

    return false;
};

const _pause = () => {

    if ( noMediaPlaying() )
        return controls.pause();

    return false;
};

const _mute = () => {

    if ( noMediaPlaying() )
        return controls.mute();

    return false;
};

const _unmute = () => {

    if ( noMediaPlaying() )
        return controls.unmute();

    return false;
};

const _stop = function () {

    if ( noMediaPlaying() )
        return controls.stop();

    return false;
};

const _next = () => {

    if ( noMediaPlaying() )
        return controls.next();

    return false;
};

const _previous = () => {

    if ( noMediaPlaying())

        return controls.previous();

    return false;
};
const _setPlaybackRate = (rate) => {

    if ( noMediaPlaying())
        return controls.setPlaybackRate(rate);

    return false;
};

const _enterfullscreen = () => {

    if ( noMediaPlaying())
        return controls.enterfullscreen();

    return false;
};
const _leavefullscreen = () => {

    if ( noMediaPlaying())

        return controls.leavefullscreen();

    return false;
};

const incrDecrVolume = direction => {

    if ( ! noMediaPlaying() )
        return false;

    let volumeElements = document.querySelectorAll("[data-volume-set=true]");
    let currentVolume = volumeElements[volumeElements.length - 1];

    if ( direction === "next" && currentVolume.nextElementSibling ) {

        let _currentVolume = currentVolume.nextElementSibling;
        _currentVolume.setAttribute("data-volume-set", "true");
        video.volume = _currentVolume.getAttribute("data-volume-controler");

    } else if ( direction === "prev" && currentVolume.previousElementSibling ) {

        currentVolume.removeAttribute("data-volume-set");
        video.volume = currentVolume.previousElementSibling.getAttribute("data-volume-controler");

    } else {
        /**
         *
         * to fix errors that cannot be reproduced
         * they occur whenever they want to occure
         *
         *
         **/
        return false;
    }

    akara_emit.emit("video::volume", video.volume);
};

const showMediaInfoWindow = () => {

    if ( ! noMediaPlaying() )
        return false;

    createNewWindow({
        title: "mediainfo",
        height: 773,
        width: 608,
        maximizable: true,
        minimizable: true,
        resizable: true
    },"mediainfo.html");

    return true;
};



const podcast = () => createNewWindow({
    width: 800,
    height: 530,
    title: "podcast",
    maximizable: true,
    minimizable: true,
    resizable: true
}, "podcast.html");

const settings = () => createNewWindow({
    title: "Settings",
    minimizable: true,
    maximizable: true,
    resizable: true
}, "setting.html");

const screenshot = () => createNewWindow({
    title: "screenshot",
    minimizable: false,
    maximizable: false,
    resizable: false,
    width: 700,
    height: 300
}, "screenshot.html");

const saveplaylist = () => {
    dialog.showSaveDialog({
        defaultPath: app.getPath("documents"),
        filters: [
            { name: "xml shareable portable format" , extensions: [ "xspf" ] },
            { name: "media playlist format", extensions: [ "m3u8", "m3u" ] }
        ]
    }, saveplaylistCb);
};

const loadplaylist = () => {
    dialog.showOpenDialog({
        defaultPath: app.getPath("documents"),
        properties: [ "multiSelection", "openFile" ],
        filters: [
            { name: "xml shareable portable format" , extensions: [ "xspf" ] },
            { name: "media playlist format", extensions: [ "m3u8", "m3u" ] }
        ]
    }, loadplaylistCb);
};

const loadsub = () => {
    if ( noMediaPlaying() )
        getCurrentWindow().webContents.send("subtitle::load-sub", "computer");
};
const onlinesub = () => {
    if ( navigator.onLine && noMediaPlaying() )
        getCurrentWindow().webContents.send("subtitle::load-sub", "net");
};


const HandleDroped = () => ({
    addMediaFile,
    addMediaFolder,
    search,
    _play,
    _pause,
    _mute,
    _unmute,
    _stop,
    _next,
    _previous,
    _setPlaybackRate,
    _enterfullscreen,
    _leavefullscreen,
    togglePlist,
    incrDecrVolume,
    showMediaInfoWindow,
    podcast,
    saveplaylist,
    loadplaylist,
    settings,
    loadsub,
    onlinesub,
    screenshot
});

module.exports = HandleDroped;
