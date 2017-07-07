( (o) => {
    
    "use strict";
    
    let mediaDropedEl = o.querySelector(".akara-drop-media");
    let dropedMediaEl = mediaDropedEl.querySelector(".akara-media-element");

    
    let addDropedEl = o.querySelector(".akara-drop-add");
    let dropedAddEl = addDropedEl.querySelector(".akara-add-media");
    
    let dropdownP = o.querySelector(".akara-dropdown");
    
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
   
    
    mediaDropedEl.addEventListener("mouseover", event => {
        dropedMediaEl.removeAttribute("hidden");
    });

    mediaDropedEl.addEventListener("mouseout", event => {
        dropedMediaEl.setAttribute("hidden", true);
    });

    addDropedEl.addEventListener("mouseover", event => {
        dropedAddEl.removeAttribute("hidden");
    });

    addDropedEl.addEventListener("mouseout", event => {
        dropedAddEl.setAttribute("hidden", true);
    });
})(document.querySelector(".akara-menu-toggle"));
