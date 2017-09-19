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


/**
 *
 * toggle to show playlist or hide playlist
 *
 **/


const togglePlist = () => {
    const akaraLoad = document.querySelector(".akara-load");
    const akaraMediaCover = document.querySelector(".akara-media-cover");

    if ( akaraLoad.clientWidth === 0 ) {
        akaraLoad.removeAttribute("style");
        akaraMediaCover.removeAttribute("style");
        return ;
    }
    akaraLoad.setAttribute("style", "width: 0%");
    akaraMediaCover.setAttribute("style", "width: 100%");
    return ;
};


const __videoAttribute = video => video.hasAttribute("src");

const __spitError = () =>
    dialog.showErrorBox("Cannot Carry Out Operation", "This Operation Could Not be carried out");

const _play = () => {

    if ( __videoAttribute(video) )

        return play();

    return __spitError();
};

const _pause = () => {

    if ( __videoAttribute(video) )

        return pause();

    return __spitError();
};

const _mute = () => {

    if ( __videoAttribute(video) )

        return mute();

    return __spitError();
};

const _unmute = () => {

    if ( __videoAttribute(video) )

        return unmute();

    return __spitError();
};

const _stop = function () {

    if ( __videoAttribute(video) )

        return controls.stop();

    return __spitError();
};

const _next = () => {

    if ( __videoAttribute(video) )

        return controls.next();

    return __spitError();
};

const _previous = () => {

    if ( __videoAttribute(video) )

        return controls.previous();

    return __spitError();
};
const _setPlaybackRate = (rate) => {

    if ( __videoAttribute(video) )

        return controls.setPlaybackRate(rate);

    return __spitError();
};

const _enterfullscreen = () => {

    if ( __videoAttribute(video) )
        return controls.enterfullscreen();

    return __spitError();
};
const _leavefullscreen = () => {

    if ( __videoAttribute(video) )

        return controls.leavefullscreen();

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
    _leavefullscreen,
    togglePlist
});

module.exports = HandleDroped;
