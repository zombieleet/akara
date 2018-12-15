;( () => {

    "use strict";

    const menuToggle = document.querySelector(".akara-menu-toggle");
    const dropdownP = menuToggle.querySelector(".akara-dropdown");
    const dropdownPItem = dropdownP.querySelector(".akara-dropdown-item");
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
