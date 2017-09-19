( () => {

    "use strict";

    const dragger = document.querySelector(".akara-loaded-dragger");
    const docElement = document.documentElement;
    const akaraLoad = document.querySelector(".akara-load");
    const akaraMediaCover = document.querySelector(".akara-media-cover");
    const akaraM = document.querySelector(".akara-media");
    
    
    let mouseHeldDown = false;

    let akaraLoadWidth = akaraLoad.clientWidth;

    let akaraMediaCoverWidth = akaraMediaCover.clientWidth;

    let akaraMWidth = akaraM.clientWidth;

    const docElementMovement = evt => {

        const akaraLoadWidthInner = evt.clientX;

        akaraMediaCoverWidth = akaraMediaCoverWidth === undefined ? 0 : akaraMediaCoverWidth;

        akaraLoad.setAttribute("style", `width:${(akaraLoadWidth/akaraMWidth) * 100}% !important`);

        if ( akaraLoad.clientWidth === 0 )
            return ;

        let widthComputation = akaraLoadWidthInner;
        
        
        if ( akaraLoadWidth > akaraLoadWidthInner ) {
            let value = ((akaraMediaCoverWidth += 10)/akaraMWidth) * 100;
            akaraMediaCover.setAttribute("style", `width:${value}% !important`);
        } else if ( akaraMediaCoverWidth <= 0 ) {
            akaraMediaCover.setAttribute("style", "width:0% !important");
        } else {
            let value = ((akaraMediaCoverWidth -= 1)/akaraMWidth) * 100;
            akaraMediaCover.setAttribute("style", `width:${value}% !important`);
        }

        akaraLoadWidth = akaraLoadWidthInner;
    };

    dragger.addEventListener("mousedown", evt => {
        mouseHeldDown = true;
        docElement.addEventListener("mousemove", docElementMovement);
    });

    dragger.addEventListener("mouseup", evt => {
        mouseHeldDown = false;
        akaraMediaCoverWidth = undefined;
        docElement.removeEventListener("mousemove", docElementMovement);
    });

    docElement.addEventListener("mouseup", evt => {
        if ( mouseHeldDown ) {
            akaraMediaCoverWidth = undefined;
            docElement.removeEventListener("mousemove", docElementMovement);
        }
    });

})();
