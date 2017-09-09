( () => {

    "use strict";
    
    const {
        handlePlaySearchResult,
        handleArrowKeys
    } = require("../js/util.js");

    const mainWindowKey = new (require("../js/keyevents.js"));


    const findings = document.querySelector(".findings");



    /**
     *
     * remove search box, on ESC
     *
     **/

    mainWindowKey.register("ESC", () => {
        const searchParent = document.querySelector(".search-parent");
        if ( searchParent )
            searchParent.remove();
    });




    /**
     * move up to the next search
     *
     **/
    mainWindowKey.register("ARROW_UP", () => {

        let el = handleArrowKeys();

        let prev;

        if ( (prev = el.previousElementSibling) ) {
            prev.setAttribute("data-navigate", "true");
            prev.scrollIntoViewIfNeeded();
            el.removeAttribute("data-navigate");
        }

    });
    



    /**
     * move down to the next search
     *
     **/
    mainWindowKey.register("ARROW_DOWN", () => {

        let el = handleArrowKeys();

        let next;

        if ( ( next = el.nextElementSibling ) ) {
            next.setAttribute("data-navigate", "true");
            next.scrollIntoViewIfNeeded();
            el.removeAttribute("data-navigate");
        }
    });


    /**
     *
     * start playing video on enter
     *
     *
     **/
    mainWindowKey.register("RET", handlePlaySearchResult);
    
})();
