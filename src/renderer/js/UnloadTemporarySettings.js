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

    const { ipcRenderer: ipc } = require("electron");


    ipc.on("akara::quiting", () => {
        localStorage.removeItem("media-resizer");
        localStorage.removeItem("DONT_SHOW_VOLUME_WARNING");
        localStorage.removeItem("LOOP_CURRENT_VIDEO");
        localStorage.removeItem("PODCAST::DISABLE_MENU");
    });

})();
