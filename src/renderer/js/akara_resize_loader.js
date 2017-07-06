/*; ((o,oP,mCover,x) => {
    
    let startX, startWidth, startWidth2;
    
    o.addEventListener("mousedown", initDrag ,false);

    const pxToPercent = (target,context) => {
        return ( target / context ) * 100;
    };
    
    function initDrag (event) {
        
        startX = event.clientX;
        
        startWidth = parseInt(document.defaultView.getComputedStyle(oP).width, 10);
        startWidth2 = parseInt(document.defaultView.getComputedStyle(mCover).width, 10);

        document.documentElement.addEventListener("mousemove", doDrag, false);
        document.documentElement.addEventListener("mouseup", stopDrag, false);
    };

    function doDrag(event) {
        
        let opWidth = pxToPercent(startWidth
                                  + event.clientX
                                  - startX,
                                  oP.parentNode.clientWidth);
        
        let mCoverWidth = pxToPercent(startWidth2
                                      + event.clientX
                                      - startX,
                                      mCover.parentNode.clientWidth);
        
        oP.setAttribute("style", `width: ${opWidth}%`);
        mCover.setAttribute("style", `width: ${mCoverWidth}%`);
        
    };

    function stopDrag (event) {
        document.documentElement.removeEventListener("mousemove", doDrag, false);
        document.documentElement.removeEventListener("mouseup", stopDrag, false);
     };
     
    
})(
    document.querySelector(".akara-loaded-dragger"),
    document.querySelector(".akara-load"),
    document.querySelector(".akara-media-cover")
    
);

*/
