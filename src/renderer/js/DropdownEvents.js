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

;( () => {

    "use strict";
    
    const { remote: { dialog, app , require: _require } } = require("electron");
    
    const dropDownAkaraItem = document.querySelector(".akara-dropdown-item");
    const HandleDroped      = require("../js/HandleDropdownCommands.js");
    
    const { addMediaCb } = require("../js/DropdownCallbacks.js");
    const { iterateDir } = _require("./utils.js"); // get utils from the main process folder


    dropDownAkaraItem.addEventListener("click", event => {

        let target = event.target;
        // incase a child of li is clicked
        target = target.nodeName.toLowerCase() === "li" ? target : target.parentNode;

        // incase the first check was sucessfull and the parentNode of target is not li;
        const targetDataDrop = target.hasAttribute("data-drop") ? target.getAttribute("data-drop") : undefined;

        if ( ! targetDataDrop )
            return undefined;

        try {
            return HandleDroped()[targetDataDrop](event);
        } catch(ex) {
            console.log(ex);
            return dialog.showErrorBox("Not Implemented", `${targetDataDrop} has not been implemented yet`);
        }

    });

})();
