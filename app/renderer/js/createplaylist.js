( () => {

    "use strict";

    const {
        ipcRenderer: ipc,
        remote: {
            dialog,
            BrowserWindow,
            require: _require
        }
    } = require("electron");

    const {
        basename
    }  = require("path");

    const {
        playlistSave
    } = require("../js/util.js");

    const {
        iterateDir
    } = _require("./utils.js");

    const {
        makeDynamic
    } = require("../js/util.js");
    const {
        playlist
    } = _require("./configuration.js");


    const { file: playlistLocation } = playlist;

    const list = require(playlistLocation);

    const form = document.forms[0];
    const input = form.querySelector("input");
    const cancel = form.querySelector(".create-playlist-cancel");
    const addPlaylist = document.querySelector(".add-playlist");
    const addToExisting = document.querySelector(".add-to-existing-playlist");

    const close = document.querySelector(".create-playlist-close");


    /**
     *
     *
     *
     *
     **/

    function removeAndRearrange(evt) {

        let i = 0;

        let target = evt.target;

        if ( target.nodeName.toLowerCase() === "i" ) {

            const parent = target.parentNode;

            const ppNode = parent.parentNode;

            parent.remove();

            /**
             *
             * every item is already removed
             * just stop here
             *
             **/

            if ( ppNode.children.length === 0 )
                return noListMessage();


            /**
             *
             * rearrange list element
             *   if an item is removed
             *
             **/

            Array.from(ppNode.querySelectorAll("li"), el => {
                i = makeDynamic(el,i);
            });
        }

        return true;
    }





    /**
     *
     *
     * styleList , creates and renders the playlist-items
     *
     *
     **/


    function styleList(files) {

        const ul = document.createElement("ul");

        let i = 0;

        for ( let f of files ) {
            const li = document.createElement("li");
            const p = document.createElement("p");
            const iFont = document.createElement("i");

            /**
             *
             * one list element different color
             *   the succeeding list element different color
             *
             **/
            i = makeDynamic(li,i);

            li.setAttribute("class", "create-playlist-item");

            p.textContent = basename(f);

            li.setAttribute("data-playlist-item", f);

            iFont.setAttribute("class", "fa fa-close pull-right");

            li.appendChild(p);
            li.appendChild(iFont);

            ul.appendChild(li);
        }

        ul.addEventListener("click", evt => removeAndRearrange(evt,"playlist-item"));

        return ul;
    }





    /**
     *
     *
     * when Click Here is clicked
     * open a native file dialog
     *
     **/

    function openFileDialog(p) {

        dialog.showOpenDialog({
            title: "Add Media Folder",
            properties: [ "openDirectory" , "multiSelection" ]
        }, path => {

            if ( ! path ) return false;

            let files;

            for ( let dirs of path ) {

                files = iterateDir()(dirs);
                // pass the files array to the styling function
            }
            p.remove();

            addPlaylist.setAttribute("data-playlist", "playlist");
            return addPlaylist.appendChild(styleList(files));
        });
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

        p.appendChild(a);
        p.appendChild(textNodeP);

        addPlaylist.setAttribute("data-playlist", "no-playlist");

        p.setAttribute(
            "style",
            `
                  width: 70%;
                `
        );

        addPlaylist.appendChild(p);

        a.addEventListener("click", () => openFileDialog(p));
        return true;
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
        console.log(playlistItems, typeof(playlistItems));
        if ( ! playlistItems || JSON.parse(playlistItems).length === 0 ) {

            noListMessage();

            return localStorage.removeItem("akara::newplaylist");
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

            if ( _case === "ul" ) return ;

            input.value = _case === "li" ? target.querySelector("p").textContent : target.textContent;


        });

        return addToExisting.appendChild(ul);
    }

    close.addEventListener("click", () => ipc.send("close-createplaylist-window"));

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

        playlistSave(key,arrayOfFile);

        return true;
    });

    cancel.addEventListener("click", evt => ipc.sendSync("close-createplaylist-window"));

    loadList();

})();
