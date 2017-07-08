; ( (o) => {
    
    "use strict";
    
    let mediaDropedEl = o.querySelector(".akara-drop-media");
    let dropedMediaEl = mediaDropedEl.querySelector(".akara-media-element");

    
    let addDropedEl = o.querySelector(".akara-drop-add");
    let dropedAddEl = addDropedEl.querySelector(".akara-add-media");
    
    let dropdownP = o.querySelector(".akara-dropdown");
    
    let dropdownPItem = dropdownP.querySelector(".akara-dropdown-item");
    
    
    let isShown = false;
    
    function isVisible(el) {
        return el.hasAttribute("hidden");
    }
    
    o.addEventListener("click", event => {
        
        if ( isVisible(dropdownP) ) {
            isShown = true;
            dropdownP.removeAttribute("hidden");
            dropdownP.setAttribute("data-anim-height", "anim-height");
        } else {
            isShown = false;
            dropdownP.setAttribute("hidden", true);
        }
        
    });
    
    function initSubMenuListeners() {
        
        Array.from(dropdownPItem.children, el => {
            
            if ( ! el.getAttribute("data-drop") ) {
                
                el.addEventListener("mouseover", event => {
                    el.querySelector("ul").removeAttribute("hidden");
                });
                
                el.addEventListener("mouseout", event => {
                    el.querySelector("ul").setAttribute("hidden", true);
                });
            }
        });        
    }

    initSubMenuListeners();
    
})(document.querySelector(".akara-menu-toggle"));
