const {
    remote: {
        dialog,
        app ,
        require: _require
    }
} = require("electron");

const {
    video,
    controls
} = require("../js/video_control.js");

const {
    addMediaCb,
    searchAndAppend
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

const { iterateDir } = _require("./utils.js"); // get utils from the main process folder

const { prevNext  } = require("../js/util.js");

const addMediaFile = () => {

    dialog.showOpenDialog({
        title: "Choose media file",
        defaultPath: app.getPath("videos"),
        filters: [
            {name: "Media" , extensions: ["mp4",
                "flac",
                "ogv",
                "ogm",
                "ogg",
                "webm",
                "wav",
                "m4v",
                "m4a",
                "mp3",
                "amr",
                "avi",
                "3gp",
                "swf",
                "wma",
                "mkv"]},
        ],
        properties: ["openFile", "multiSelections"]
    },addMediaCb);
};


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

        if ( ! folderPaths ) return ;

        let files = [];

        folderPaths.forEach( path => iterateDir()(path).forEach( filePath => files.push(filePath) ));

        addMediaCb(files);

    });
    
};

const __videoAttribute = video => video.hasAttribute("src");

const __spitError = () =>  dialog.showErrorBox("Invalid Media File", "No Media file was found");

const _play = () => {
    
    if ( __videoAttribute(video) ) return play();
    
    return __spitError();
};

const _pause = () => {
    
    if ( __videoAttribute(video) ) return pause();

    return __spitError();
};

const _mute = () => {
    
    if ( __videoAttribute(video) ) return mute();
    
    return __spitError();    
    
};

const _unmute = () => {
    
    if ( __videoAttribute(video) ) return unmute();

    return __spitError();
};

const _stop = function () {

    if ( __videoAttribute(video) ) return controls.stop();
    return __spitError();
};

const _next = () => {
    
    if ( __videoAttribute(video) ) return controls.next();
    return __spitError();
};

const _previous = () => {
    
    if ( __videoAttribute(video) ) return controls.previous();
    return __spitError();
};
const _setPlaybackRate = (rate) => {
    if ( __videoAttribute(video) ) return controls.setPlaybackRate(rate);
    return __spitError();
};

const _enterfullscreen = () => {
    if ( __videoAttribute(video) ) return controls.enterfullscreen();
    return __spitError();
};
const _leavefullscreen = () => {
    if ( __videoAttribute(video) ) return controls.leavefullscreen();
    return __spitError();
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
    _leavefullscreen
});

module.exports = HandleDroped;
