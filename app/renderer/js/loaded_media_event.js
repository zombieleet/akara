( ({ ipcRenderer: ipc, remote: { Menu, MenuItem, getCurrentWindow, require: _require} },ul) => {

    const { addMediaCb } = require("../js/dropdown_callbacks.js");

    const { removeTarget,
        removeType,
        setCurrentPlaying,
        removeClass,
        disableMenuItem,
        setupPlaying,
        prevNext } = require("../js/util.js");

    const { videoListMenu } = _require("./menu.js");

    const {
        videoEmit,
        controls,
        video
    } = require("../js/video_control.js");

    const { play, pause, stop, getCurrentTime, duration } = controls;
    

    let currentTarget;

    const menu = new Menu();

    
    window.addEventListener("DOMContentLoaded", event =>  {
        
        const coverOnError = document.querySelector(".cover-on-error-src");

        if ( video.getAttribute("src") )
            
            coverOnError.setAttribute("style", "display: none;");
        
    });
    

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

        if ( ! target.hasAttribute("data-dbclicked") ) return setupPlaying(target);

    });


    ul.addEventListener("contextmenu", event => {

        let target = event.target;

        if ( target.nodeName.toLowerCase() === "ul" ) return ;

        // incase a span element which is the child of the li element is clicked
        target = target.nodeName.toLowerCase() === "li" ? target : target.parentNode;

        menu.clear();

        let menuInst;

        videoListMenu.forEach( contextMenu => {

            menuInst = new MenuItem(contextMenu);

            if ( /^Play$|^Pause$|Repeat/.test(menuInst.label) )

                disableMenuItem(menuInst,target,video);

            menu.append(menuInst);
        });


        menu.popup(getCurrentWindow(), { async: true });


        currentTarget = target;
    });


    videoEmit.on("ended", () => {

        const justEnded = document.querySelector("[data-now-playing=true]");

        if ( justEnded.nextElementSibling && ! justEnded.hasAttribute("data-repeat") ) {

            removeClass(justEnded,"fa","fa-play-circle");

            removeType(justEnded.parentNode,"data-dbclicked","data-now-playing","data-clicked");

            setCurrentPlaying(justEnded.nextElementSibling);

            video.src = justEnded.nextElementSibling.getAttribute("data-full-path");

            justEnded.nextElementSibling.setAttribute("data-clicked","true");

            justEnded.nextElementSibling.classList.add("fa");
            justEnded.nextElementSibling.classList.add("fa-play-circle");

            return play();
        }

        if ( justEnded.hasAttribute("data-repeat") ) return play();

        if ( ! justEnded.nextElementSibling && justEnded.parentNode.hasAttribute("data-repeat") ) {

            const firstChild = justEnded.parentNode.firstElementChild;

            removeType(justEnded.parentNode,"data-dbclicked","data-now-playing","data-clicked");

            video.src = firstChild.getAttribute("data-full-path");

            removeClass(justEnded,"fa","fa-play-circle");

            setCurrentPlaying(firstChild);

            return play();

        }

        // force the control element to change it's icon
        // if this is is not called, the control icon that handles
        // pause and play will not change

        return pause();
    });



    ipc.on("media-droped-files", (event, mediaPaths) => {
        addMediaCb(mediaPaths);
    });


    ipc.on("remove-target-hit", () => removeTarget(currentTarget,video));

    ipc.on("play-hit-target", () => {

        if ( ! currentTarget.hasAttribute("data-now-playing") )
            setupPlaying(currentTarget);

        if ( currentTarget.hasAttribute("data-now-playing") && video.paused )
            play();

    });

    ipc.on("pause-hit-target", (event) => {
        if ( currentTarget.hasAttribute("data-now-playing") )
            pause();
    });


    ipc.on("repeat-hit-target", () => {
        currentTarget.setAttribute("data-repeat", "true");
    });

    ipc.on("no-repeat-hit-target", () => {
        currentTarget.removeAttribute("data-repeat");
    });

    ipc.on("repeat-all", () => {
        currentTarget.parentNode.setAttribute("data-repeat", "true");
    });

    ipc.on("no-repeat-all", () => {
        currentTarget.parentNode.removeAttribute("data-repeat");
    });
    
    videoEmit.on("go-to-next", () => prevNext("next"));
    videoEmit.on("go-to-previous", () => prevNext("prev"));


})(
    require("electron"),
    document.querySelector(".akara-loaded")
);

