; ( () => {
    
    "use strict";

    const {
        deletePlaylist,
        renderPlayList
    } = require("../js/util.js");

    const {
        remote: {
            getCurrentWindow,
            dialog
        }
    } = require("electron");

    const close = document.querySelector(".removeplaylist-close");

    const button = document.querySelector("button");

    close.addEventListener("click", evt => getCurrentWindow().close());

    button.addEventListener("click", evt => {

        const selection = document.querySelectorAll("[data-load]");

        if ( ! selection )
            return false;

        Array.from(selection, el => {

            const listName = el.getAttribute("data-capture");

            if ( ! deletePlaylist(listName) )
                return dialog.showErrorBox(
                    "cannot find playlist",
                    `${listName} could not be located for deletion`
                );

            getCurrentWindow().close();
            
            return true ;
        });
    });

    renderPlayList("removeplaylist");
})();
