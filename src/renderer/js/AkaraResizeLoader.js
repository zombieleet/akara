; ( () => {

    "use strict";

    const dragger    = document.querySelector(".akara-loaded-dragger");
    const docElement = document.documentElement;
    const akaraLoad  = document.querySelector(".akara-load");
    
    
    let mouseHeldDown = false;

    const docElementMovement = evt => {
        const width = evt.clientX;
        akaraLoad.setAttribute("style", `width: ${width}px`);
    };

    dragger.addEventListener("mousedown", evt => {
        mouseHeldDown = true;
        docElement.addEventListener("mousemove", docElementMovement);
    });

    dragger.addEventListener("mouseup", evt => {
        mouseHeldDown = false;
        docElement.removeEventListener("mousemove", docElementMovement);
    });

    docElement.addEventListener("mouseup", evt => {
        if ( mouseHeldDown ) {
            docElement.removeEventListener("mousemove", docElementMovement);
        }
    });

})();
