; ((o,oP) => {
    
    o.addEventListener("dragstart", event => {
        
        console.log(event.x, event.y);
        
    });

    oP.addEventListener("dragover", event => {
        console.log(event.x, event.y, "dragover");
    });
    
    
})(
    document.querySelector(".akara-loaded-dragger"),
    document.querySelector(".akara-load")
);
