((o,oP,mCover) => {



    o.addEventListener("mousedown", initDrag ,false);
    
    let startX, startWidth, startWidth2;
    
    function initDrag (event) {

        startX = event.clientX;
        console.log(startX);
        startWidth = parseInt(document.defaultView.getComputedStyle(oP).width, 10);
        startWidth2 = parseInt(document.defaultView.getComputedStyle(mCover).width, 10);

        document.documentElement.addEventListener("mousemove", doDrag, false);
        document.documentElement.addEventListener("mouseup", stopDrag, false);
        
    }

    function doDrag(event) {
        oP.setAttribute("style", `width: ${pxToPercent(startWidth + event.clientX - startX ,oP.parentNode.clientWidth)}%`);
        mCover.setAttribute("style", `width: ${pxToPercent(startWidth2 + event.clientX - startX,mCover.parentNode.clientWidth)}%`);
    }

    function stopDrag(event) {
        document.documentElement.removeEventListener("mousemove", doDrag, false);
        document.documentElement.removeEventListener("mouseup", stopDrag, false);
    }

    function pxToPercent(target,context) {
        return ( target / context ) * 100;
    }
    
})(
    document.querySelector(".akara-loaded-dragger"),
    document.querySelector(".akara-load"),
    document.querySelector(".akara-media-cover")
);

