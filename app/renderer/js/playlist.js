( () => {

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
        createNewWindow: playListWindow
    } = _require("./newwindow.js");

    const {
        addMediaCb
    } = require("../js/dropdown_callbacks.js");

    const playlistWidget = document.querySelector(".playlist-widget");

    const handlePlayListOptions = Object.defineProperties({}, {

        __removeList: {

            value() {

                let list = document.querySelectorAll("li[data-full-path]");

                if ( ! list ) return false;

                Array.from(list, el => {
                    el.remove();
                });

                document.querySelector("video").src = "";
                document.querySelector(".akara-title").textContent = "Akara Media Player";

                return true;
            },
            enmerable: false,
            writable: false,
            configurable: false
        },
        __isChecked: {
            value() {
                const isChecked = document.querySelector(".akara-loaded li .fa-check-square-o");

                if ( ! isChecked ) {
                    dialog.showMessageBox({
                        type: "info",
                        title: "No Selection has been made",
                        message: "Toggle selection mood to make multiple selection",
                        buttons: [ "Ok" ]
                    });
                    return true;
                }
                return false;
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

                if ( target.classList.contains("fa-square-o") ) {
                    target.classList.remove("fa-square-o");
                    target.classList.add("fa-check-square-o");
                    return ;
                }
                target.classList.remove("fa-check-square-o");
                target.classList.add("fa-square-o");
                return ;
            },
            enumerable: false,
            configurable: false,
            writable: false
        },
        __selectModeEventHandler: {

            value(evt) {

                let target = evt.target;

                target = target.nodeName.toLowerCase() === "ul" ? undefined : target;

                if ( ! target ) return false;

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
                    span.setAttribute("class", "fa fa-square-o");
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
                    message: "Click Yes to remove all videos from current playing and also to delete this playlist from disk",
                    buttons: [ "Cancel", "Yes", "No"]
                }, btn => {
                    if ( btn === 0 ) {
                        return false;
                    } else if ( btn == 1 ) {

                        /**
                         *
                         * remove playlist from list of playlist
                         * and from loaded sectoin
                         *
                         *
                         **/
                        
                        this.__removeList();

                    } else {

                        /**
                         *
                         * At this point btn is 2
                         * remove all elements in akara-loaded section
                         *
                         **/
                        
                        const isChecked = this.__isChecked();
                        
                        if ( ! isChecked ) return false;
                        
                        this.__removeList();
                    }

                    return true ;
                });
            }
        },
        createplaylist: {

            value() {

                const obj = {
                    width: 671,
                    height: 385,
                    title: "createplaylist"
                };

                const playlist = document.querySelectorAll("[data-full-path]");

                let playlistArr = [];

                const btn = dialog.showMessageBox({
                    type: "info",
                    title: "Create Playlist",
                    message: "Click Yes to createplaylist from selected video or No to createplaylist from all video",
                    buttons: [ "Yes", "No", "Cancel" ]
                });

                if ( btn === 0 ) {
                    // Yes
                    Array.from(playlist, el => {
                        playlistArr.push(el.getAttribute("data-full-path"));
                    });
                } else if ( btn === 1 ) {
                    // No
                    // check if anything is checked
                    
                    const isChecked = this.__isChecked();
                    
                    if ( ! isChecked ) return ;
                    
                    Array.from(playlist, el => {
                        const span = el.querySelector(".fa-check-square-o");
                        if ( span ) playlistArr.push(el.getAttribute("data-full-path"));
                    });

                } else {
                    // Cancel
                    return ;
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

                if ( akaraLoaded.children.length === 0 ) return false;

                if ( target.classList.contains("fa-square-o") ) {
                    target.classList.remove("fa-square-o");
                    target.classList.add("fa-check-square-o");
                    return this.__turnOnSelectMode(akaraLoaded);
                }

                target.classList.remove("fa-check-square-o");
                target.classList.add("fa-square-o");
                return this.__turnOffSelectMode(akaraLoaded);
            }
        }

    });

    playlistWidget.addEventListener("mouseover", evt => {

        const target = evt.target;

        /**
         *
         * avoid the parent of the widgets to trigger anything
         *
         **/

        if ( target.nodeName.toLowerCase() === "div" ) return false;

        const toolTip = target.getAttribute("data-title");

        const xAxis = evt.clientX;// - target.parentNode.getBoundingClientRect().left;
        const yAxis = evt.clientY;// - target.parentNode.getBoundingClientRect().top;

        const toolTipEl = document.createElement("span");

        toolTipEl.textContent = toolTip;

        toolTipEl.setAttribute("class", "tool-tip");
        //toolTipEl.setAttribute("style",`position: absolute; top: ${yAxis + 70}px; left: ${xAxis}px;`);
        toolTipEl.setAttribute("style",`position: absolute; top: ${yAxis + 15}px; left: ${xAxis - 50}px;`);

        target.parentNode.appendChild(toolTipEl);

        return true;
    });

    playlistWidget.addEventListener("mouseout", evt => {

        const target = evt.target.nodeName.toLowerCase() === "div"
            ? evt.target
            : evt.target.parentNode;
        let el;

        if ( ( el = target.querySelector(".tool-tip") ) )
            el.remove();

        return ;
    });


    playlistWidget.addEventListener("click", evt => {

        const target = evt.target.nodeName.toLowerCase() === "div" ? undefined : evt.target;

        if ( ! target ) return false;

        const title = target.getAttribute("data-title");

        return handlePlayListOptions[title.replace(/\s+/, "")](target);
    });

    ipc.on("akara::loadplaylist", handlePlayListOptions.__playlistLoad);
})();
