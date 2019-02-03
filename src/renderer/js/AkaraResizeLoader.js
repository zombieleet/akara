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

    const akaraMediaContainer = document.querySelector(".akara-media-cover");

    const video      = akaraMediaContainer.querySelector("video");
    const dragger    = document.querySelector(".akara-loaded-dragger");
    const docElement = document.documentElement;
    const akaraLoad  = document.querySelector(".akara-load");

    let mouseHeldDown = false;
    let globalWidth   = parseFloat(getComputedStyle(akaraLoad).width);

    const docElementMovement = evt => {

        const playlistItemSectionWidth = ((evt.clientX  / akaraLoad.parentNode.clientWidth ) * 100);
        const mediaContainerWidth      = ((((parseFloat(getComputedStyle(akaraMediaContainer).width) / 1000) + ( evt.clientX / 32.5 ) ) / 1000));

        const inverse = Math.floor(Math.pow(mediaContainerWidth,-1));

        if ( ! ( inverse >= 100 ) ) {
            akaraMediaContainer.style.width = `${inverse}%`;
        } else if ( inverse >= 100 )
            akaraMediaContainer.style.width = "100%";

        akaraLoad.style.width = `${playlistItemSectionWidth}%`;

        localStorage.setItem("media-resizer", JSON.stringify({
            mediaContainer: `${inverse}%`,
            playlistsContainer: `${playlistItemSectionWidth}%`
        }));
    };

    dragger.addEventListener("mousedown", evt => {
        mouseHeldDown = true;
        docElement.style.cursor = "ew-resize";
        docElement.addEventListener("mousemove", docElementMovement);
    });

    dragger.addEventListener("mouseup", evt => {
        mouseHeldDown = false;
        docElement.removeEventListener("mousemove", docElementMovement);
    });

    docElement.addEventListener("mouseup", evt => {
        docElement.style.cursor = "initial";
        if ( mouseHeldDown ) {
            docElement.removeEventListener("mousemove", docElementMovement);
        }
    });

})();
