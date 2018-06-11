
"use strict";

// ask how to call this in an object literal expression
//    { a: 'b', c: this.a }

const {
    ipcRenderer: ipc,
    remote: {
        require: _require
    }
} = require("electron");

const {
    setupPlaying,
    makeFullScreen,
    handleScreenShot: { entireScreen },
    getKeyIndex
} = require("../../js/util.js");

// TODO: move makeFullScreen to handle_dropdown_command
const {
    addMediaFile,
    addMediaFolder,
    search,
    _play,
    _pause,
    _next,
    _previous,
    _stop,
    _setPlaybackRate,
    togglePlist,
    incrDecrVolume,
    showMediaInfoWindow
} = require("../../js/handle_dropdown_commands.js")();

const {
    setFullScreen,
    showFileLocation,
    subHandler
} = require("../../js/videohandlers.js");

const akara_emit = require("../../js/emitter.js");
const mediaShortCutKey = new (require("../../js/keyevents.js"));

const video = document.querySelector("video");
const searchResults = document.querySelector(".findings");


const isSearchSuccesful = () => {

    const searchResults = document.querySelector(".findings");

    if ( ! searchResults || ! searchResults.hasChildNodes() )
        return false;

    let el = searchResults.querySelector("[data-navigate=true]");

    return [ searchResults, el ];
};


const handlePlaySearchResult = () => {

    const val = isSearchSuccesful();

    if ( ! val )
        return false;

    const [ , el ] = val;

    if ( el ) {
        setupPlaying(el);
        document.querySelector(".search-parent").remove();
    }
    return true;
};


/**
 *
 *
 *
 * handleArrowkeys, this function makes sure that
 *   arrowup and arrowdown key are not trigerred
 *   in some cases to avoid errors
 *
 *
 **/

const handleArrowKeys = () => {

    const val = isSearchSuccesful();

    if ( ! val )
        return false;

    let [ searchResults, el ] = val;

    if ( ! el ) {
        searchResults.children[0].setAttribute("data-navigate", "true");
        el = searchResults.children[0];
    }
    return el;
};

/**
 *
 * remove search box, on ESC
 *
 **/

mediaShortCutKey.register({
    name: "remove search box",
    key: "Escape",
    handler() {
        const searchParent = document.querySelector(".search-parent");
        if ( searchParent )
            searchParent.remove();
    }
});




/**
 * move up to the next search
 *
 **/

mediaShortCutKey.register({
    name: "move up to the next search",
    key: "ArrowUp",
    handler() {

        let el = handleArrowKeys();
        let prev;

        if ( (prev = el.previousElementSibling) ) {
            prev.setAttribute("data-navigate", "true");
            prev.scrollIntoViewIfNeeded();
            el.removeAttribute("data-navigate");
        }
    }
});


/**
 * move down to the next search
 *
 **/
mediaShortCutKey.register({
    name: "move down to the next search",
    key: "ArrowDown",
    handler() {

        let el = handleArrowKeys();
        let next;

        if ( ( next = el.nextElementSibling ) ) {
            next.setAttribute("data-navigate", "true");
            next.scrollIntoViewIfNeeded();
            el.removeAttribute("data-navigate");
        }
    }
});


/**
 *
 * shortcut key to handle
 *   opening of media file
 *
 **/
mediaShortCutKey.register({
    name: "open media file",
    key: getKeyIndex("media", "open media file").key,
    modifier: getKeyIndex("media", "open media file").modifier,
    handler: addMediaFile
});


/**
 *
 * shortcut key to handle
 *   opening of folder
 *
 **/
mediaShortCutKey.register({
    name: "open media folder",
    key: getKeyIndex("media", "open media folder").key,
    modifier: getKeyIndex("media", "open media folder").modifier,
    handler: addMediaFolder
});


/**
 *
 * start playing searched video on enter
 *
 **/
mediaShortCutKey.register({
    name: "play searched video",
    key: "Enter",
    handler: handlePlaySearchResult
});


/**
 *
 * handle video play and pause
 *
 **/

mediaShortCutKey.register({
    name: "play and pause",
    key: getKeyIndex("media", "play and pause").key,
    modifier: getKeyIndex("media", "play and pause").modifier,
    handler() {

        if ( video.paused )
            return _play();

        return _pause();
    }
});

mediaShortCutKey.register({
    name: "next",
    key: getKeyIndex("media", "next").key,
    modifier: getKeyIndex("media", "next").modifier,
    handler: _next
});

mediaShortCutKey.register({
    name: "previous",
    key: getKeyIndex("media", "previous").key,
    modifier: getKeyIndex("media", "previous").modifier,
    handler: _previous
});

mediaShortCutKey.register({
    name: "fullscreen",
    key: getKeyIndex("media", "fullscreen").key,
    modifier: getKeyIndex("media", "fullscreen").modifier,
    handler: setFullScreen
});

mediaShortCutKey.register({
    name: "show search box",
    key: getKeyIndex("media", "show search box").key,
    modifier: getKeyIndex("media", "show search box").modifier,
    handler: search
});

mediaShortCutKey.register({
    name: "increase volume",
    key: "ArrowUp",
    modifier: [ "ctrlKey" ],
    handler: () => incrDecrVolume("next")
});


mediaShortCutKey.register({
    name: "decrease volume",
    key: "ArrowDown",
    modifier: [ "ctrlKey" ],
    handler: () => incrDecrVolume("prev")
});

mediaShortCutKey.register({
    name: "open media file location",
    key: getKeyIndex("media", "open media file location").key,
    modifier: getKeyIndex("media", "open media file location").modifier,
    handler: showFileLocation
});

mediaShortCutKey.register({
    name: "show media info",
    key: getKeyIndex("media", "media info").key,
    modifier: getKeyIndex("media", "media info").modifier,
    handler: showMediaInfoWindow
});

mediaShortCutKey.register({
    name: "normal playback rate",
    key: getKeyIndex("media", "normal playback rate").key,
    modifier: getKeyIndex("media", "normal playback rate").modifier,
    handler: () => _setPlaybackRate(1)
});

mediaShortCutKey.register({
    name: "fast media playback rate",
    key: getKeyIndex("media", "fast playback rate").key,
    modifier: getKeyIndex("media", "slow playback rate").modifier,
    handler: () => _setPlaybackRate(12)
});

mediaShortCutKey.register({
    name: "very fast media playback rate",
    key: getKeyIndex("media", "very fast playback rate").key,
    modifier: getKeyIndex("media", "very fast playback rate").modifier,
    handler: () => _setPlaybackRate(25)
});

mediaShortCutKey.register({
    name: "slow playback rate",
    key: getKeyIndex("media", "slow playback rate").key,
    modifier: getKeyIndex("media", "slow playback rate").modifier,
    handler: () => _setPlaybackRate(0.7)
});

mediaShortCutKey.register({
    name: "very slow playback rate",
    key: getKeyIndex("media", "very slow playback rate").key,
    modifier: getKeyIndex("media", "very slow playback rate").modifier,
    handler: () => _setPlaybackRate(0.2)
});

mediaShortCutKey.register({
    name: "next frame slow",
    key: getKeyIndex("media", "next frame slow").key,
    modifier: getKeyIndex("media", "next frame slow").modifier,
    handler() {

        if ( ! video.hasAttribute("data-id") )

            return false;

        video.currentTime += 5;

        return true;
    }
});


mediaShortCutKey.register({
    name: "previous frame slow",
    key: getKeyIndex("media", "previous frame slow").key,
    modifier: getKeyIndex("media", "previous frame slow").modifier,
    handler() {

        if ( ! video.hasAttribute("data-id") )

            return false;

        video.currentTime -= 5;

        return true;
    }
});

mediaShortCutKey.register({
    name: "next frame fast",
    key: getKeyIndex("media", "next frame fast").key,
    modifier: getKeyIndex("media", "next frame fast").modifier,
    handler() {

        if ( ! video.hasAttribute("data-id") )

            return false;

        video.currentTime += 80;

        return true;
    }
});

mediaShortCutKey.register({
    name: "previous frame fast",
    key: getKeyIndex("media", "previous frame fast").key,
    modifier: getKeyIndex("media", "previous frame fast").modifier,
    handler() {

        if ( ! video.hasAttribute("data-id") )

            return false;

        video.currentTime -= 80;

        return true;
    }
});

mediaShortCutKey.register({
    name: "subtitle computer",
    key: getKeyIndex("subtitle", "subtitle computer").key,
    modifier:  getKeyIndex("subtitle", "subtitle computer").modifier,
    handler: () => subHandler( undefined, "computer" )
});

mediaShortCutKey.register({
    name: "subtitle internet",
    key: getKeyIndex("subtitle", "subtitle internet").key,
    modifier: getKeyIndex("subtitle", "subtitle internet").modifier,
    handler: () => subHandler( undefined, "net")
});

mediaShortCutKey.register({
    name: "twitter share",
    key: getKeyIndex("share", "twitter share").key,
    modifier: getKeyIndex("share", "twitter share").modifier,
    handler() {
        ipc.send("akara::twit-share");
    }
});

mediaShortCutKey.register({
    name: "facebook share",
    key: getKeyIndex("share","facebook share").key,
    modifier: getKeyIndex("share","facebook share").modifier,
    handler() {
        ipc.send("akara::fb-share");
    }
});

mediaShortCutKey.register({
    name: "youtube share",
    key: getKeyIndex("share","youtube share").key,
    modifier: getKeyIndex("share","youtube share").modifier,
    handler() {
        ipc.send("akara::ytube-share");
    }
});

mediaShortCutKey.register({
    name: "screenshot",
    key: getKeyIndex("media","screenshot").key,
    modifier: getKeyIndex("media","screenshot").modifier,
    handler: entireScreen
});

akara_emit.on("video::subtitle:shortcut", track => {

    mediaShortCutKey.register({
        name: `subtitle track ${track.id}`,
        key: track.id,
        modifier: [ "ctrlKey" ],
        handler() {

            const textTracks = video.textTracks;

            const {
                length: _trackLength
            } = textTracks;

            for ( let i = 0; i < _trackLength; i++ ) {

                if ( textTracks[i].id != track.id ) {

                    textTracks[i].mode = "hidden";

                    akara_emit.emit("video::state:track", textTracks[i].id, "disable");

                    continue ;
                }

                textTracks[i].mode = "showing";

                akara_emit.emit("video::state:track", textTracks[i].id, "enable");
            }
        }
    });
});

akara_emit.on("video::subtitle:remove", id => {
    mediaShortCutKey.remove({
        key: id,
        modifier: [ "ctrlKey"]
    });
});


module.exports = mediaShortCutKey;
