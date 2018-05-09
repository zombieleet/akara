; ( () => {

    "use strict";

    const {
        ipcRenderer: ipc,
        remote: {
            dialog,
            BrowserWindow,
            getCurrentWindow,
            require: _require
        }
    } = require("electron");

    const {
        basename
    }  = require("path");

    const fs = require("fs");

    const {
        playlistSave,
        makeDynamic,
        handleWindowButtons
    } = require("../../js/util.js");

    const {
        iterateDir
    } = _require("./utils.js");

    const {
        playlist
    } = _require("./configuration.js");


    const {
        file: playlistLocation
    } = playlist;

    const list = require(playlistLocation);
    const form = document.forms[0];
    const input = form.querySelector("input");
    const cancel = form.querySelector(".create-playlist-cancel");
    const addPlaylist = document.querySelector(".add-playlist");
    const addToExisting = document.querySelector(".add-to-existing-playlist");

    const min = document.querySelector("[data-winop=minimize]");
    const max = document.querySelector("[data-winop=maximize]");
    const close = document.querySelector("[data-winop=close]");

    let DYNAMICLISTADD = 0;
    let DYNAMICLISTADDREARRANGE = DYNAMICLISTADD;

    /**
     *
     *
     * styleList , creates and renders the playlist-items
     *
     * preceeding list element different color
     *   the succeeding list element different color
     *
     **/

    function styleList(files) {

        let ul = document.querySelector(".playlist_parent");

        if ( ! ul ) {
            ul = document.createElement("ul");
            ul.setAttribute("class", "playlist_parent");
        }

        for ( let f of files ) {

            const li = document.createElement("li");
            const p = document.createElement("p");
            const iFont = document.createElement("i");

            DYNAMICLISTADD = makeDynamic(li,DYNAMICLISTADD);

            p.textContent = basename(f);

            li.setAttribute("class", "create-playlist-item");
            li.setAttribute("data-playlist-item", f);
            li.appendChild(p);
            li.appendChild(iFont);
            
            iFont.addEventListener("click", evt => {
                
                if ( (ul.children.length - 1) === 0 ) {
                    ul.remove();
                    noListMessage();
                    return ;
                }
                
                Array.from(ul.querySelectorAll("li"), el => {
                    DYNAMICLISTADDREARRANGE = makeDynamic(el,DYNAMICLISTADDREARRANGE);
                });
                
                li.remove();
            });
            
            iFont.setAttribute("class", "fa fa-close pull-right");
            ul.appendChild(li);
        }
        return ul;
    }


    function appendFilesToDom (filepath, p = document.querySelector("[data-nolist=nolist]") ) {

        if ( ! filepath ) {
            return false;
        }

        filepath = Array.isArray(filepath)
            ? filepath
            : (() => {
                if ( typeof(filepath) === "string" )
                    return [ filepath ];
                return undefined;
            })();

        if ( ! filepath )
            return false;

        let files = [];

        for ( let file_dir of filepath ) {
            file_dir = decodeURIComponent(file_dir.replace("file://", ""));
            if ( fs.statSync(file_dir).isFile() ) {
                files.push(file_dir);
                continue;
            }
            iterateDir()(file_dir).forEach( f => files.push(f));
        }

        if ( p ) {
            p.remove();
            addPlaylist.setAttribute("data-playlist", "playlist");
        }
        addPlaylist.appendChild(styleList(files));
        return true;
    }


    function openFileDialog(p) {
        dialog.showOpenDialog({
            title: "Add Media Folder",
            properties: [ "openDirectory" , "multiSelection" ]
        }, files => appendFilesToDom(files,p));
    }


    /**
     *
     *
     *  show message to user
     *  if something goes wrong
     *  for both the playlist-items and saved-playlist
     *
     *
     **/

    function noListMessage() {

        const p = document.createElement("p");
        const a = document.createElement("a");
        const textNodeP = document.createTextNode(" or Drop a file or folder here");

        a.setAttribute("class", "playlist-add-hyper");
        a.textContent = "Click Here";
        a.addEventListener("click", () => openFileDialog(p));

        p.appendChild(a);
        p.appendChild(textNodeP);
        p.setAttribute("data-nolist", "nolist");
        p.style.width = 70 + "%";

        addPlaylist.setAttribute("data-playlist", "no-playlist");
        addPlaylist.appendChild(p);

        return ;
    }


    /**
     *
     *
     * load playlist from parent window through localstorage
     *   or provide user with choice of creating playlist from
     *   playlist winodw
     *
     **/


    function loadList() {
        loadSavedList();
        const playlistItems = localStorage.getItem("akara::newplaylist");
        if ( ! playlistItems || JSON.parse(playlistItems).length === 0 ) {
            noListMessage();
            return localStorage.removeItem("akara::newplaylist");;
        }
        addPlaylist.setAttribute("data-playlist", "playlist");
        addPlaylist.appendChild(styleList(JSON.parse(playlistItems)));
        return localStorage.removeItem("akara::newplaylist");
    }



    /**
     *
     * Load already saved playlist name
     *  give the user the opportunity
     *  of saving current playlist-items in any
     *  of the already saved playlist
     *
     **/

    function loadSavedList() {

        const savedPlaylist = Object.keys(list);

        if ( savedPlaylist.length === 0 ) {
            const p = document.createElement("p");
            p.textContent = "No Saved Playlist";
            addToExisting.setAttribute("data-saveList", "no-saved");
            return addToExisting.appendChild(p);
        }

        addToExisting.setAttribute("data-saveList", "saveList");

        const ul = document.createElement("ul");
        let i = 0;

        for ( let __list of savedPlaylist ) {
            const li = document.createElement("li");
            const p = document.createElement("p");
            p.textContent = __list;
            i = makeDynamic(li,i);
            li.setAttribute("class", "saved-playlist");
            li.appendChild(p);
            ul.appendChild(li);
        }


        /**
         *
         *
         * Replace inputed value with clicked
         * saved playlist value
         *
         *
         **/


        ul.addEventListener("click", evt => {

            let target = evt.target;
            let _case = target.nodeName.toLowerCase();

            if ( _case === "ul" )
                return ;

            input.value = _case === "li"
                ? target.querySelector("p").textContent
                : target.textContent;


        });

        return addToExisting.appendChild(ul);
    }

    close.addEventListener("click", () => {
        getCurrentWindow().close();
    });

    cancel.addEventListener("click", () =>  {
        getCurrentWindow().close();
    });

    form.addEventListener("submit", evt => {

        evt.preventDefault();

        if ( /^\s+$|^$/.test(input.value) ) {
            return dialog.showErrorBox(
                "Invalid Playlist Name",
                "Playlist Name is invalid");
        }

        const addedList = Array.prototype.slice.call(document.querySelectorAll("[data-playlist-item]"));


        /**
         *
         * show error message if data-playlist-item does not exist
         *
         **/


        if ( addedList.length === 0 ) {
            return dialog.showErrorBox(
                "Cannot Find Playlist",
                "List of Playlist have not been added");
        }


        /**
         *
         *
         * save playlist in config file
         *
         *
         **/

        let key = input.value;

        let arrayOfFile = [];

        addedList.forEach(
            el => arrayOfFile.push(
                el.getAttribute("data-playlist-item")
            )
        );

        playlistSave( key , arrayOfFile , true );

        return true;
    });

    ipc.on("akara::playlist:droplist", (evt,fpath) => {
        appendFilesToDom(fpath);
    });

    handleWindowButtons({close, min, max});
    loadList();

})();
