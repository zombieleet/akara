"use strict";

( ({ ipcRenderer: ipc, remote: { Menu, MenuItem, getCurrentWindow, require: _require } },ul) => {

    const {
        addMediaCb
    } = require("../js/dropdown_callbacks.js");

    const {
        removeTarget,
        removeType,
        setCurrentPlaying,
        removeClass,
        disableMenuItem,
        setupPlaying,
        prevNext,
        updatePlaylistName
    } = require("../js/util.js");

    const {
        createNewWindow: addPlaylistWindow
    } = _require("./newwindow.js");

    const {
        videoListMenu
    } = _require("./menu.js");

    const {
        controls,
        video
    } = require("../js/video_control.js");

    const akara_emit = require("../js/emitter.js");


    const {
        play,
        pause,
        stop,
        getCurrentTime,
        duration
    } = controls;

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

            console.log(target);

            updatePlaylistName(target);

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

    ipc.on("add-toplaylist-hit", () => {

        const obj = {
            width: 626,
            height: 400,
            title: "addplaylist",
            parent: getCurrentWindow()
        };

        localStorage.setItem("akara::addplaylist", currentTarget.getAttribute("data-full-path"));

        addPlaylistWindow(obj,"addplaylist.html");

    });
    akara_emit.on("video::go-to-next", () => prevNext("next"));
    akara_emit.on("video::go-to-previous", () => prevNext("prev"));


})(
    require("electron"),
    document.querySelector(".akara-loaded")
);
