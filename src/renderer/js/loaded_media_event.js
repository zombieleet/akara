; ( ({ ipcRenderer: ipc, remote: { Menu, MenuItem, getCurrentWindow, require: _require} },ul) => {

    const { addMediaCb } = require("../js/dropdown_callbacks.js");

    const { removeTarget,removeType,setCurrentPlaying } = require("../js/util.js");

    const { videoListMenu } = _require("./menu.js");

    const video = document.querySelector("video");

    const menu = new Menu();

    ul.addEventListener("click", event => {

        let target = event.target;

        if ( target.nodeName.toLowerCase() === "ul" ) return ;

        target = target.nodeName.toLowerCase() === "li" ? target : target.parentNode;

        if ( ! target.hasAttribute("data-clicked") ) {

            removeType(target.parentNode,"data-clicked");

            target.setAttribute("data-clicked","true");
        }
    });

    ul.addEventListener("dblclick", event => {

        let target = event.target;

        if ( target.nodeName.toLowerCase() === "ul" ) return ;

        target = target.nodeName.toLowerCase() === "li" ? target : target.parentNode;

        if ( ! target.hasAttribute("data-dbclicked") ) {

            Array.from(target.parentNode.children, el => {
                if ( el.classList.contains("fa") ) {
                    el.classList.remove("fa");
                    el.classList.remove("fa-play-circle");
                }
            });

            removeType(target.parentNode,"data-dbclicked","data-now-playing");

            setCurrentPlaying(target);

            video.src = target.getAttribute("data-full-path");

            video.addEventListener("loadstart", event => console.log("loading") );

        }

    });


    ul.addEventListener("contextmenu", event => {

        let target = event.target;

        if ( target.nodeName.toLowerCase() === "ul" ) return ;

        menu.clear();

        videoListMenu.forEach( contextMenu => {
            menu.append(new MenuItem(contextMenu));
        });

        menu.popup(getCurrentWindow());

        ipc.once("remove-target-hit", () => {
            removeTarget(target,video);
        });

    });


    ipc.on("media-droped-files", (event, mediaPaths) => {
        addMediaCb(mediaPaths);
    });


})(
    require("electron"),
    document.querySelector(".akara-loaded")
);
