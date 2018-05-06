; ( () => {

    "use strict";

    const {
        ipcRenderer: ipc,
        remote: {
            dialog,
            BrowserWindow,
            require: _require
        }
    }  = require("electron");

    const {
        playlistSave,
        setupPlaying
    } = require("../js/util.js");

    const {
        createNewWindow: playListWindow
    } = _require("./newwindow.js");

    const {
        playlist
    } = _require("./configuration.js");


    const { file: playlistLocation } = playlist;

    const list = require(playlistLocation);

    const {
        addMediaCb
    } = require("../js/dropdown_callbacks.js");

    const {
        applyButtonConfig
    } = require("../js/video_control.js");

    const {
        playNextOrPrev
    } = require("../js/videohandlers.js");

    const playlistWidget = document.querySelector(".playlist-widget");

    const handlePlayListOptions = Object.defineProperties({}, {

        __removeList: {

            value(type) {

                let medialist = type === "all"
                        ? document.querySelectorAll("li[data-full-path]")
                        : Array.from(
                            document.querySelectorAll("li[data-full-path] [data__is__checked=true]")
                        ).map( el => el.parentNode);

                if ( ! medialist || medialist.length  === 0 )
                    return ;

                Array.from(medialist, el => {
                    el.remove();
                });


                const checkState = document.querySelector(".playlist-widget [data-playlist-op=check]");
                const allPlaylist = document.querySelectorAll("li[data-full-path]");

                if ( checkState ) {
                    const akaraLoaded = document.querySelector(".akara-loaded");
                    applyButtonConfig(checkState, "playlist-buttons", "uncheck");
                    checkState.setAttribute("data-playlist-op", "uncheck");
                    this.__turnOffSelectMode(akaraLoaded);
                }

                if ( medialist.length === allPlaylist.length || type === "all" ) {
                    document.querySelector("video").src = "";
                    document.querySelector(".akara-title").textContent = "Akara Media Player";
                    return ;
                }

                if ( document.querySelector("[data-now-playing]") ) {
                    playNextOrPrev();
                    return ;
                }

                setupPlaying(document.querySelector("li[data-full-path]"));
                return ;
            },
            enmerable: false,
            writable: false,
            configurable: false
        },
        __isChecked: {
            value() {
                const isChecked = document.querySelector(".akara-loaded li [data__is__checked=true]");

                if ( ! isChecked ) {
                    dialog.showMessageBox({
                        type: "info",
                        title: "No Selection has been made",
                        message: "Toggle selection mood to make multiple selection",
                        buttons: [ "Ok" ]
                    });
                    return false;
                }
                return true;
            },
            enumerable: false,
            configurable: false,
            writable: false
        },
        __playlistLoad: {

            value(evt,playlists,playlistName) {

                addMediaCb(playlists,playlistName);

                // dirty hack to retrieve handle
                // using this.__playlistLoad
                // seems not to work
                // const handler = ipc._events[ipc.eventNames()[ipc.eventNames().indexOf("akara::loadplaylist")]];

                // ipc.removeListener("akara::loadplaylist", handler);

            },
            enumerable: false,
            writable: false,
            configurable: false
        },
        __setCheckState: {
            value(target) {

                if ( target.getAttribute("data__is__checked") === "false" ) {
                    applyButtonConfig(target, "playlist-buttons", "check");
                    target.setAttribute("data__is__checked", "true");
                    return ;
                }
                
                applyButtonConfig(target, "playlist-buttons", "uncheck");
                target.setAttribute("data__is__checked", "false");
                return ;
                
                // if ( target.classList.contains("fa-square-o") ) {
                //     target.classList.remove("fa-square-o");
                //     target.classList.add("fa-check-square-o");
                //     return ;
                // }
                // target.classList.remove("fa-check-square-o");
                // target.classList.add("fa-square-o");
                // return ;
            },
            enumerable: false,
            configurable: false,
            writable: false
        },
        __selectModeEventHandler: {

            value(evt) {

                let target = evt.target;

                target = target.nodeName.toLowerCase() === "ul"
                    ? undefined
                    : target;

                if ( ! target )
                    return false;

                if ( target.nodeName.toLowerCase() === "li" ) {
                    const span = target.querySelector("span");
                    this.__setCheckState(span);
                    return true;
                }
                this.__setCheckState(target);
                return true;
            },
            enumerable: false,
            configurable: false,
            writable: false
        },
        __turnOnSelectMode: {
            value(akaraLoaded) {

                this.__bindedEvent = this.__selectModeEventHandler.bind(this);
                akaraLoaded.addEventListener("click",this.__bindedEvent);
                Array.from(akaraLoaded.children, el => {
                    const span = el.querySelector("span");
                    applyButtonConfig(span, "playlist-buttons", "uncheck");
                    span.setAttribute("data__is__checked", "false");
                });
            },
            enumerable: false,
            writable: false,
            configurable: false
        },
        __turnOffSelectMode: {

            value(akaraLoaded) {

                akaraLoaded.removeEventListener("click",this.__bindedEvent);
                Array.from(akaraLoaded.children, el => {
                    const span = el.querySelector("span");
                    span.removeAttribute("class");
                });
            },
            enumerable: false,
            configurable: false,
            writable: false
        },
        removeplaylist: {

            value() {

                dialog.showMessageBox({
                    type: "info",
                    message: `Remove Playlist from current playlist`,
                    buttons: [ "Remove All", "Remove Selected", "Cancel" ]
                }, btn => {
                    if ( btn === 0 ) {
                        this.__removeList("all");
                        return ;
                    }
                    if ( btn === 1 ) {
                        this.__removeList("selected");
                        return ;
                    }
                    return ;
                });
            }
        },
        createplaylist: {

            value() {

                const obj = {
                    width: 671,
                    height: 385,
                    title: "createplaylist",
                    minimizable: true,
                    resizable: true,
                    maximizable: true
                };

                const playlist = document.querySelectorAll("[data-full-path]");

                let playlistArr = [];

                const btn = dialog.showMessageBox({
                    type: "info",
                    title: "Create Playlist",
                    message: "Create Playlist",
                    buttons: [ "All videos", "Selected Videos", "Cancel" ]
                });

                if ( btn === 2 )
                    return ;

                if ( btn === 0 ) {
                    // Yes
                    Array.from(playlist, el => {
                        playlistArr.push(el.getAttribute("data-full-path"));
                    });
                }

                if ( btn === 1 ) {

                    const isChecked = this.__isChecked();

                    if ( ! isChecked )
                        return ;

                    Array.from(playlist, el => {
                        const span = el.querySelector(".fa-check-square-o");
                        if ( span ) playlistArr.push(el.getAttribute("data-full-path"));
                    });

                }

                localStorage.setItem("akara::newplaylist", JSON.stringify(playlistArr));

                playListWindow(obj, "createplaylist.html");
            }
        },

        loadplaylist: {

            value() {

                const obj = {
                    width: 408,
                    height: 527,
                    parent: BrowserWindow.getFocusedWindow(),
                    title: "loadplaylist"
                };

                playListWindow(obj, "loadplaylist.html");

            }
        },

        selectionmode: {
            value(target) {

                const akaraLoaded = document.querySelector(".akara-loaded");

                // no media file added
                if ( akaraLoaded.children.length === 0 )
                    return false;


                if ( target.getAttribute("data-playlist-op") === "uncheck" ) {
                    target.setAttribute("data-playlist-op", "check");
                    applyButtonConfig(target, "playlist-buttons", "check");
                    return this.__turnOnSelectMode(akaraLoaded);
                }

                target.setAttribute("data-playlist-op", "uncheck");
                applyButtonConfig(target, "playlist-buttons", "uncheck");
                return this.__turnOffSelectMode(akaraLoaded,target);
                
                // if ( target.classList.contains("fa-square-o") ) {
                //     target.classList.remove("fa-square-o");
                //     target.classList.add("fa-check-square-o");
                //     return this.__turnOnSelectMode(akaraLoaded);
                // }

                // target.classList.remove("fa-check-square-o");
                // target.classList.add("fa-square-o");
                
                // return this.__turnOffSelectMode(akaraLoaded);
            }
        },

        deleteplaylist: {
            value(target) {

                const obj = {
                    width: 408,
                    height: 527,
                    parent: BrowserWindow.getFocusedWindow(),
                    title: "removeplaylist"
                };

                playListWindow(obj, "removeplaylist.html");
            }
        }
    });

    playlistWidget.addEventListener("click", evt => {

        const target = evt.target.nodeName.toLowerCase() === "div" ? undefined : evt.target;

        if ( ! target ) return false;

        const title = target.getAttribute("data-title");

        return handlePlayListOptions[title.replace(/\s+/, "")](target);
    });

    ipc.on("akara::loadplaylist", handlePlayListOptions.__playlistLoad);
})();
