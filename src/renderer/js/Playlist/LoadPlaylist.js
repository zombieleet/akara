/* AKM is a highly customizable media player built with electron
   Copyright (C) 2016  Victory Osikwemhe (zombieleet)

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.
   
   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
   
   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
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
    } = require("../../js/Util.js");

    const loadBtn = document.querySelector(".load-btn");
    const close   = document.querySelector("[data-winop=close]");

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
