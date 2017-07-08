( ({ ipcRenderer: ipc },ul) => {
    
    const { addMediaCb } = require("../js/dropdown_callbacks.js");
    const video = document.querySelector("video");
    
    const removeType = (pNode,...types) => {

        Array.from(pNode.children, el => {

            types.forEach( type => el.hasAttribute(type)
                ? el.removeAttribute(type)
                : "");

        });
    };

    ul.addEventListener("click", event => {

        let target = event.target;


        if ( target.nodeName.toLowerCase() !== "span" ) return ;

        target = target.parentNode;

        if ( ! target.hasAttribute("data-clicked") ) {

            removeType(target.parentNode,"data-clicked");

            target.setAttribute("data-clicked","true");
        }
    });

    ul.addEventListener("dblclick", event => {

        let target = event.target;

        if ( target.nodeName.toLowerCase() !== "span" ) return ;

        target = target.parentNode;

        if ( ! target.hasAttribute("data-dbclicked") ) {

            Array.from(target.parentNode.children, el => {
                if ( el.classList.contains("fa") ) {
                    el.classList.remove("fa");
                    el.classList.remove("fa-play-circle");
                }
            });

            removeType(target.parentNode,"data-dbclicked","data-now-playing");

            
            
            target.setAttribute("data-dbclicked", "true");
            target.setAttribute("data-now-playing", "true");

            
            target.classList.add("fa");
            target.classList.add("fa-play-circle");

            video.src = target.getAttribute("data-full-path");

            video.addEventListener("loadstart", event => console.log("loading") );

        }

    });


    ipc.on("media-droped-files", (event, mediaPaths) => {
        addMediaCb(mediaPaths);
    });

})(
    require("electron"),
    document.querySelector(".akara-loaded")
);
