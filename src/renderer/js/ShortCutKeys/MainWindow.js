; ( async () => {

    "use strict";

    // ask how to call this in an object literal expression
    //    { a: 'b', c: this.a }

    const {
        remote: {
            require: _require
        }
    } = require("electron");

    const {
        setupPlaying,
        makeFullScreen
    } = require("../js/util.js");

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
    } = require("../js/handle_dropdown_commands.js")();

    const {
        setFullScreen,
        showFileLocation,
        subHandler
    } = require("../js/videohandlers.js");

    const akara_emit = require("../js/emitter.js");
    const mainWindowKey = new (require("../js/keyevents.js"));

    const video = document.querySelector("video");
    const searchResults = document.querySelector(".findings");

    const { requireSettingsPath } = _require("./constants.js");
    const shortcutpath = await requireSettingsPath("shortcut.json");
    const shortcutsettings = require(shortcutpath);

    console.log(shortcutsettings);

    const getKeyIndex = (shortcut,shortcutType) => {
        const shortcut__ = shortcutsettings[shortcut];
        const idx = shortcut__.findIndex( sh_setting => sh_setting[shortcutType] );
        //return shortcut__.find( sh_setting => sh_setting[shortcutType] )[shortcutType];
        return shortcut__[idx][shortcutType];
    };


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

    mainWindowKey.register({
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

    mainWindowKey.register({
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
    mainWindowKey.register({
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
    mainWindowKey.register({
        name: "open media file",
        key: getKeyIndex("others", "open media file").key,
        modifier: getKeyIndex("others", "open media file").modifier,
        handler: addMediaFile
    });


    /**
     *
     * shortcut key to handle
     *   opening of folder
     *
     **/
    mainWindowKey.register({
        name: "open media folder",
        key: getKeyIndex("others", "open media folder").key,
        modifier: getKeyIndex("others", "open media folder").modifier,
        handler: addMediaFolder
    });


    /**
     *
     * start playing searched video on enter
     *
     **/
    mainWindowKey.register({
        name: "play searched video",
        key: "Enter",
        handler: handlePlaySearchResult
    });


    /**
     *
     * handle video play and pause
     *
     **/

    mainWindowKey.register({
        name: "play or pause video",
        key: getKeyIndex("audio", "play and pause").key,
        modifier: getKeyIndex("audio", "play and pause").modifier,
        handler() {

            if ( video.paused )
                return _play();

            return _pause();
        }
    });

    mainWindowKey.register({
        name: "play next media",
        key: getKeyIndex("video", "next").key,
        modifier: getKeyIndex("video", "next").modifier,
        handler: _next
    });

    mainWindowKey.register({
        name: "play previous media",
        key: getKeyIndex("video", "previous").key,
        modifier: getKeyIndex("video", "previous").modifier,
        handler: _previous
    });

    mainWindowKey.register({
        name: "set fullscreen",
        key: getKeyIndex("video", "fullscreen").key,
        modifier: getKeyIndex("video", "fullscreen").modifier,
        handler: setFullScreen
    });

    mainWindowKey.register({
        name: "show search box",
        key: getKeyIndex("others", "show search box").key,
        modifier: getKeyIndex("others", "show search box").modifier,
        handler: search
    });

    mainWindowKey.register({
        name: "increase volume",
        key: "ArrowUp",
        modifier: [ "ctrlKey" ],
        handler: () => incrDecrVolume("next")
    });


    mainWindowKey.register({
        name: "decrease volume",
        key: "ArrowDown",
        modifier: [ "ctrlKey" ],
        handler: () => incrDecrVolume("prev")
    });

    mainWindowKey.register({
        name: "open media file location",
        key: getKeyIndex("others", "open media file location").key,
        modifier: getKeyIndex("others", "open media file location").modifier,
        handler: showFileLocation
    });

    mainWindowKey.register({
        name: "show media info",
        key: getKeyIndex("others", "media info").key,
        modifier: getKeyIndex("others", "media info").modifier,
        handler: showMediaInfoWindow
    });

    mainWindowKey.register({
        name: "normal media play back rate",
        key: getKeyIndex("audio", "normal playback rate").key,
        modifier: getKeyIndex("audio", "normal playback rate").modifier,
        handler: () => _setPlaybackRate(1)
    });

    mainWindowKey.register({
        name: "fast media playback rate",
        key: getKeyIndex("audio", "fast playback rate").key,
        modifier: getKeyIndex("audio", "slow playback rate").modifier,
        handler: () => _setPlaybackRate(12)
    });

    mainWindowKey.register({
        name: "very fast media playback rate",
        key: getKeyIndex("audio", "very fast playback rate").key,
        modifier: getKeyIndex("audio", "very fast playback rate").modifier,
        handler: () => _setPlaybackRate(25)
    });

    mainWindowKey.register({
        name: "slow media playback rate",
        key: getKeyIndex("audio", "slow playback rate").key,
        modifier: getKeyIndex("audio", "slow playback rate").modifier,
        handler: () => _setPlaybackRate(0.7)
    });

    mainWindowKey.register({
        name: "very slow media playback rate",
        key: getKeyIndex("audio", "very slow playback rate").key,
        modifier: getKeyIndex("audio", "very slow playback rate").modifier,
        handler: () => _setPlaybackRate(0.2)
    });

    mainWindowKey.register({
        name: "next frame slow",
        key: getKeyIndex("video", "next frame slow").key,
        modifier: getKeyIndex("video", "next frame slow").modifier,
        handler() {

            if ( ! video.hasAttribute("data-id") )

                return false;

            video.currentTime += 5;

            return true;
        }
    });


    mainWindowKey.register({
        name: "previous frame slow",
        key: getKeyIndex("video", "previous frame slow").key,
        modifier: getKeyIndex("video", "previous frame slow").modifier,
        handler() {

            if ( ! video.hasAttribute("data-id") )

                return false;

            video.currentTime -= 5;

            return true;
        }
    });

    mainWindowKey.register({
        name: "next frame fast",
        key: getKeyIndex("video", "next frame fast").key,
        modifier: getKeyIndex("video", "next frame fast").modifier,
        handler() {

            if ( ! video.hasAttribute("data-id") )

                return false;

            video.currentTime += 80;

            return true;
        }
    });

    mainWindowKey.register({
        name: "previous frame fast",
        key: getKeyIndex("video", "previous frame fast").key,
        modifier: getKeyIndex("video", "previous frame fast").modifier,
        handler() {

            if ( ! video.hasAttribute("data-id") )

                return false;

            video.currentTime -= 80;

            return true;
        }
    });

    mainWindowKey.register({
        name: "get subtitle from computer",
        key: getKeyIndex("subtitle", "subtitle computer").key,
        modifier:  getKeyIndex("subtitle", "subtitle computer").modifier,
        handler: () => subHandler( undefined, "computer" )
    });

    mainWindowKey.register({
        name: "get subtitle from internet",
        key: getKeyIndex("subtitle", "subtitle internet").key,
        modifier: getKeyIndex("subtitle", "subtitle internet").modifier,
        handler: () => subHandler( undefined, "net")
    });


    akara_emit.on("video::subtitle:shortcut", track => {
        console.log(track);
        mainWindowKey.register({
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
        mainWindowKey.remove({
            key: id,
            modifier: [ "ctrlKey"]
        });
    });

})();
