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

    const menuToggle      = document.querySelector(".akara-menu-toggle");
    const dropdownP       = menuToggle.querySelector(".akara-dropdown");
    const dropdownPItem   = dropdownP.querySelector(".akara-dropdown-item");
    const documentElement = document.documentElement;

    const removeShowMenu = evt => {
        
        let { target } = evt;
        
        if ( dropdownP.hidden ) {
            dropdownP.hidden = false;
            dropdownP.setAttribute("data-anim-height", "anim-height");
            return ;
        }

        dropdownP.hidden = true;
        dropdownP.removeAttribute("style");

        return ;
    };

    menuToggle.addEventListener("click", removeShowMenu);

    documentElement.addEventListener("click", evt => {
        
        if ( evt.target.classList.contains("akara-menu-toggle" ) )
            return ;
        
        if ( ! dropdownP.hidden ) {
            dropdownP.hidden = true;
            dropdownP.removeAttribute("style");
        }
        
    });

    function initSubMenuListeners() {

        Array.from(dropdownPItem.children, el => {

            if ( ! el.getAttribute("data-drop") ) {

                el.addEventListener("mouseover", event => {
                    el.querySelector("ul").hidden = false;
                });

                el.addEventListener("mouseout", event => {
                    el.querySelector("ul").hidden = true;
                });
            }
        });
    }

    initSubMenuListeners();

})();
