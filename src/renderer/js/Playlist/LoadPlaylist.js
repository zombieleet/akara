; ( () => {

    "use strict";

    const {
        ipcRenderer: ipc,
        remote: {
            dialog,
            getCurrentWindow,
            require: _require
        }
    } = require("electron");

    const {
        playlistLoad,
        renderPlayList
    } = require("./PlaylistSettings.js");

    const loadBtn = document.querySelector(".load-btn");
    const close = document.querySelector("[data-winop=close]");

    close.addEventListener("click", evt => getCurrentWindow().close());

    loadBtn.addEventListener("click", evt => {

        const selection = document.querySelectorAll("[data-load]");

        if ( selection.length === 0 ) {
            return dialog.showErrorBox(
                "Nothing Selected",
                "Select a playlist by just clicking on it\n Or Hold down Ctrl Key for multiple selections"
            );
        }

        Array.from(selection, el => {
            const playlistName = el.getAttribute("data-capture");
            const filteredPlaylistName = playlistLoad(playlistName);
            ipc.sendTo(1,"akara::loadplaylist", filteredPlaylistName , playlistName);

        });
        return true ;
    });

    window.addEventListener("DOMContentLoaded", () => {
        renderPlayList("loadplaylist");
    });

})();
