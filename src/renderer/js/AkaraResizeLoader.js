; ( () => {

    "use strict";

    const akaraVideoContainer = document.querySelector(".akara-media-cover");

    const video      = akaraVideoContainer.querySelector("video");
    const dragger    = document.querySelector(".akara-loaded-dragger");
    const docElement = document.documentElement;
    const akaraLoad  = document.querySelector(".akara-load");

    console.log("hello world", dragger);
    
    let mouseHeldDown = false;
    let globalWidth   = parseFloat(getComputedStyle(akaraLoad).width);

    const docElementMovement = evt => {
        const playlistItemSectionWidth = ( ( evt.clientX  / akaraLoad.parentNode.clientWidth ) * 100 );
        const videoContainerWidth      = ( ((( (parseFloat(getComputedStyle(akaraVideoContainer).left) / 1000) + (evt.clientX  / 100)) / 1000) * 100) * 40 );

        console.log(playlistItemSectionWidth, globalWidth, videoContainerWidth);
        
        //console.log(akaraVideoContainer.style.marginLeft, "me" , playlistItemSectionWidth , video.clientWidth);
        akaraVideoContainer.style.left = `${videoContainerWidth}%`;
        akaraLoad.style.width = `${playlistItemSectionWidth}%`;
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
