( () => {

    "use strict";

    const { setupPlaying } = require("../js/util.js");

    const mainWindowKey = new (require("../js/keyevents.js"));



    const triggerNotArrow = () => {

        const findings = document.querySelector(".findings");

        if ( ! findings || ! findings.hasChildNodes() ) return false;

        let el = findings.querySelector("[data-navigate=true]");
        
        return [ findings, el ];
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

        const val = triggerNotArrow();

        if ( ! val )  return false;
        
        let [ findings, el ] = val;

        if ( ! el ) {
            findings.children[0].setAttribute("data-navigate", "true");
            el = findings.children[0];
        }
        return el;
    };





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
            el.removeAttribute("data-navigate");
        }
    });


    /**
     *
     * start playing video on enter
     *
     *
     **/
    mainWindowKey.register("RET", () => {

        const val = triggerNotArrow();

        if ( ! val )  return false;

        const [ , el ] = val;

        if ( el ) {
            setupPlaying(el);
            document.querySelector(".search-parent").remove();
        }
    });
    
})();
