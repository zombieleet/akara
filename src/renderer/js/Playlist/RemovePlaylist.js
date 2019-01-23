; ( () => {

    "use strict";

    const {
        deletePlaylist,
        renderPlayList
    } = require("../../js/Util.js");

    const {
        remote: {
            getCurrentWindow,
            dialog
        }
    } = require("electron");

    const akara_emit = require("../../js/Emitter.js");
    const close     = document.querySelector("[data-winop=close]");
    const removeBtn = document.querySelector(".remove-btn");

    close.addEventListener("click", evt => getCurrentWindow().close());

    removeBtn.addEventListener("click", evt => {

        const selection = document.querySelectorAll("[data-load]");

        if ( selection.length === 0 )
            return ;

        let len = selection.length;

        Array.from(selection, el => {

            const listName = el.getAttribute("data-capture");
            const isDelete = deletePlaylist(listName);

            if ( isDelete ) {
                el.remove();
                --len;
                return ;
            }
            dialog.showErrorBox(
                    "cannot find playlist",
                `${listName} could not be located for deletion`
            );
            return ;
        });

        if ( ! len ) {
            renderPlayList("removeplaylist");
            return ;
        }

    });

    window.addEventListener("DOMContentLoaded", () => {
        renderPlayList("removeplaylist");
    });

})();
