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
        deletePlaylist,
        renderPlayList
    } = require("../../js/Playlist/PlaylistUtil.js");

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
