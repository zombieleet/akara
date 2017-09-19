;( o => {

    "use strict";

    let dropdownP = o.querySelector(".akara-dropdown");

    let dropdownPItem = dropdownP.querySelector(".akara-dropdown-item");

    o.addEventListener("click", event => {

        if ( dropdownP.hidden ) {
            dropdownP.hidden = false;
            dropdownP.setAttribute("data-anim-height", "anim-height");
        } else {
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

})(document.querySelector(".akara-menu-toggle"));
