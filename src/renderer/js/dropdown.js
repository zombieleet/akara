; ( (o) => {
    
    "use strict";
    
    let mediaElDropP = o.querySelector(".akara-drop-media");
    let dropedEl = mediaElDropP.querySelector(".akara-media-element");
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
   
    
    mediaElDropP.addEventListener("mouseover", event => {
        dropedEl.removeAttribute("hidden");
    });

    mediaElDropP.addEventListener("mouseout", event => {
        dropedEl.setAttribute("hidden", true);
    });

    
    
})(document.querySelector(".akara-menu-toggle"));
