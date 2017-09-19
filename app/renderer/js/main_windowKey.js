( () => {

    "use strict";

    const {
        handlePlaySearchResult,
        handleArrowKeys,
        makeFullScreen
    } = require("../js/util.js");

    // TODO: move makeFullScreen to handle_dropdown_command
    const {
        addMediaFile,
        _play,
        _pause,
        _next,
        _previous,
        _stop,
        _setPlaybackRate,
        togglePlist
    } = require("../js/handle_dropdown_commands.js")();

    const {
        dbClickEvent
    } = require("../js/videohandlers.js");

    const mainWindowKey = new (require("../js/keyevents.js"));

    const video = document.querySelector("video");

    const findings = document.querySelector(".findings");



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

})();
