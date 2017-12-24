
const path = require("path");

const {
    remote: {
        ipcRenderer,
        dialog,
        app ,
        BrowserWindow,
        require: _require
    }
} = require("electron");

const akara_emit = require("../js/emitter.js");

const {
    createNewWindow
} = _require("./newwindow.js");

const {
    video,
    controls
} = require("../js/video_control.js");

const {
    addMediaCb,
    searchAndAppend,
    saveplaylistCb,
    loadplaylistCb
} = require("../js/dropdown_callbacks.js");

const {
    play,
    pause,
    mute,
    unmute,
    next,
    previous,
    setPlaybackRate,
    enterfullscreen,
    leavefullscreen
} = controls;

const {
    iterateDir
} = _require("./utils.js"); // get utils from the main process folder

const {
    prevNext,
    exportMpegGurl,
    exportXspf,
    importXspf,
    importMpegGurl
} = require("../js/util.js");

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


const togglePlist = () => {
    const akaraLoad = document.querySelector(".akara-load");
    const akaraMediaCover = document.querySelector(".akara-media-cover");

    if ( akaraLoad.hasAttribute("style") ) {
        akaraLoad.removeAttribute("style");
        akaraMediaCover.removeAttribute("style");
        return ;
    }
    akaraLoad.setAttribute("style", `display: none;`);
    akaraMediaCover.setAttribute("style", `width: 100%`);
    return ;
};


const noMediaPlaying = () =>
      document.querySelector(
          ".cover-on-error-src"
      ).hasAttribute("style");

const __spitError = () =>
          dialog.showErrorBox("Cannot Carry Out Operation", "This Operation Could Not be carried out");

const _play = () => {

    if ( noMediaPlaying())

        return play();

    return false;
};

const _pause = () => {

    if ( noMediaPlaying())
        return pause();

    return false;
};

const _mute = () => {

    if ( noMediaPlaying())

        return mute();

    return false;
};

const _unmute = () => {

    if ( noMediaPlaying())

        return unmute();

    return false;
};

const _stop = function () {

    if ( noMediaPlaying())

        return controls.stop();

    return false;
};

const _next = () => {

    if ( noMediaPlaying())

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

    if ( ! noMediaPlaying())

        return false;
    
    let volumeElements = document.querySelectorAll("[data-volume-set=true]");

    let currentVolume = volumeElements[volumeElements.length - 1];
    
    
    if ( direction === "next" &&
         currentVolume.nextElementSibling ) {

        let _currentVolume = currentVolume.nextElementSibling;

             
        _currentVolume.setAttribute("data-volume-set", "true");

        video.volume = _currentVolume.getAttribute("data-volume-controler");
        
    } else if ( direction === "prev" && currentVolume.previousElementSibling ) {
        
        currentVolume
            .removeAttribute("data-volume-set");
        
        video.volume = currentVolume
            .previousElementSibling.getAttribute("data-volume-controler");
        
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
    
    const __obj = {
        title: "mediainfo",
        parent: BrowserWindow.fromId(1),
        height: 773,
        width: 608
    };
    
    const html = `${__obj.title}.html`;
    
    createNewWindow(__obj,html);

    return true;
};



/**
 *
 *
 *
 **/

const podWinOption = {
    width: 800,
    height: 530,
    title: "podcast",
    maximizable: true,
    minimizable: true,
    resizable: true
};

const podcast = () => createNewWindow(podWinOption, "podcast.html");

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

const settings = () => createNewWindow({
    title: "Settings"
}, "settings/settings.html");

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
    settings
});

module.exports = HandleDroped;
