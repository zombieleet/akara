; ( () => {

    "use strict";

    const {
        setupPlaying,
        makeFullScreen
    } = require("../js/util.js");

    // TODO: move makeFullScreen to handle_dropdown_command
    const {
        addMediaFile,
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

    const akara_emit = require("../js/emitter.js");
    const {
        dbClickEvent,
        showFileLocation,
        subHandler
    } = require("../js/videohandlers.js");

    const mainWindowKey = new (require("../js/keyevents.js"));

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

    mainWindowKey.register({
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
     * shortcut key to handles
     *   opening of media file
     *
     **/
    mainWindowKey.register({
        key: "f",
        modifier: ["altKey"],
        handler: addMediaFile
    });


    /**
     *
     * start playing searched video on enter
     *
     **/
    mainWindowKey.register({
        key: "Enter",
        handler: handlePlaySearchResult
    });


    /**
     *
     * handle video play and pause
     *
     **/

    mainWindowKey.register({

        key: "Space",

        handler() {

            if ( video.paused )
                return _play();

            return _pause();
        }
    });

    mainWindowKey.register({
        key: "n",
        handler: _next
    });

    mainWindowKey.register({
        key: "p",
        handler: _previous
    });

    mainWindowKey.register({
        key: "f",
        handler: dbClickEvent
    });

    mainWindowKey.register({
        key: "s",
        modifier: [ "ctrlKey" ],
        handler: search
    });

    mainWindowKey.register({
        key: "ArrowUp",
        modifier: [ "ctrlKey" ],
        handler: () => incrDecrVolume("next")
    });


    mainWindowKey.register({
        key: "ArrowDown",
        modifier: [ "ctrlKey" ],
        handler: () => incrDecrVolume("prev")
    });

    mainWindowKey.register({
        key: "o",
        modifier: [ "ctrlKey" ],
        handler: showFileLocation
    });

    mainWindowKey.register({
        key: "m",
        modifier: [ "ctrlKey", "shiftKey" ],
        handler: showMediaInfoWindow
    });

    mainWindowKey.register({
        key: "n",
        modifier: [ "altKey" ],
        handler: () => _setPlaybackRate(1)
    });

    mainWindowKey.register({
        key: "f",
        modifier: [ "altKey", "ctrlKey"] ,
        handler: () => _setPlaybackRate(12)
    });

    mainWindowKey.register({
        key: "f",
        modifier: [ "shiftKey" ],
        handler: () => _setPlaybackRate(25)
    });

    mainWindowKey.register({
        key: "s",
        modifier: [ "altKey", "ctrlKey" ],
        handler: () => _setPlaybackRate(0.7)
    });

    mainWindowKey.register({
        key: "s",
        modifier: [ "shiftKey" ],
        handler: () => _setPlaybackRate(0.2)
    });

    mainWindowKey.register({
        key: "ArrowRight",
        modifier: [ "shiftKey" ],
        handler() {

            if ( ! video.hasAttribute("data-id") )

                return false;

            video.currentTime += 5;

            return true;
        }
    });


    mainWindowKey.register({
        key: "ArrowLeft",
        modifier: [ "shiftKey" ],
        handler() {

            if ( ! video.hasAttribute("data-id") )

                return false;

            video.currentTime -= 5;

            return true;
        }
    });

    mainWindowKey.register({
        key: "ArrowRight",
        modifier: [ "ctrlKey" ],
        handler() {

            if ( ! video.hasAttribute("data-id") )

                return false;

            video.currentTime += 80;

            return true;
        }
    });

    mainWindowKey.register({
        key: "ArrowLeft",
        modifier: [ "ctrlKey" ],
        handler() {

            if ( ! video.hasAttribute("data-id") )

                return false;

            video.currentTime -= 80;

            return true;
        }
    });

    mainWindowKey.register({
        key: "t",
        modifier: [ "altKey" ],
        handler: () => subHandler( undefined, "computer" )
    });

    mainWindowKey.register({
        key: "x",
        modifier: [ "altKey" ],
        handler: () => subHandler( undefined, "net")
    });


    akara_emit.on("video::subtitle:shortcut", track => {
        console.log(track);
        mainWindowKey.register({
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
