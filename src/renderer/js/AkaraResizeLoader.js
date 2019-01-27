; ( () => {

    "use strict";

    const akaraVideoContainer = document.querySelector(".akara-media-cover");

    const video      = akaraVideoContainer.querySelector("video");
    const dragger    = document.querySelector(".akara-loaded-dragger");
    const docElement = document.documentElement;
    const akaraLoad  = document.querySelector(".akara-load");

    let mouseHeldDown = false;
    let globalWidth   = parseFloat(getComputedStyle(akaraLoad).width);

    const docElementMovement = evt => {

        const playlistItemSectionWidth = ((evt.clientX  / akaraLoad.parentNode.clientWidth ) * 100);
        //const videoContainerLeft       = ((((parseFloat(getComputedStyle(akaraVideoContainer).left) / 1000) + (evt.clientX  / 50)) / 1000) * 100);
        const videoContainerWidth      = ((((parseFloat(getComputedStyle(akaraVideoContainer).width) / 1000) + ( evt.clientX / 33 ) ) / 1000));

        const inverse = Math.floor(Math.pow(videoContainerWidth,-1));

        if ( ! ( inverse >= 100 ) ) {
            akaraVideoContainer.style.width = `${inverse}%`;
        } else if ( inverse >= 100 )
            akaraVideoContainer.style.width = "100%";

        //akaraVideoContainer.style.left = `${videoContainerLeft}%`;
        akaraLoad.style.width = `${playlistItemSectionWidth}%`;
    };

    dragger.addEventListener("mousedown", evt => {
        mouseHeldDown = true;
        docElement.style.cursor = "ew-resize";
        docElement.addEventListener("mousemove", docElementMovement);
    });

    dragger.addEventListener("mouseup", evt => {
        mouseHeldDown = false;
        docElement.removeEventListener("mousemove", docElementMovement);
    });

    docElement.addEventListener("mouseup", evt => {
        docElement.style.cursor = "initial";
        if ( mouseHeldDown ) {
            docElement.removeEventListener("mousemove", docElementMovement);
        }
    });

})();
