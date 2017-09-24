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
        makeDynamic,
        playlistLoad
    } = require("../js/util.js");

    const {
        playlist: {
            file: playlistLocation
        }
    } = _require("./configuration.js");

    const {
        existsSync
    } = require("fs");

    const loadplaylist = document.querySelector(".loadplaylist");
    const button = document.querySelector("button");
    const close = document.querySelector(".loadplaylist-close");


    // first window is always main window

    function renderPlayList() {

        const list = require(playlistLocation);

        if ( list.length === 0 ) {
            const p = document.createElement("p");
            p.textContent = "No Playlist have been created";

            p.setAttribute("class", "no-loadplaylist");

            loadplaylist.appendChild(p);

            return false;
        }


        const ul = document.createElement("ul");

        let  noP = loadplaylist.querySelector(".no-loadplaylist");

        if ( noP ) noP.remove();

        noP = undefined;

        let i = 0;

        for ( let __list of Object.keys(list) ) {

            const li = document.createElement("li");
            const p = document.createElement("p");

            const numlist = document.createElement("span");

            p.textContent = __list;

            numlist.textContent = `${list[__list].length} files`;

            i = makeDynamic(li,i);

            li.setAttribute("class", "loadplaylist-item");
            li.setAttribute("data-capture", __list);


            li.appendChild(p);
            li.appendChild(numlist);
            ul.appendChild(li);
        }

        loadplaylist.appendChild(ul);
        return ul;
    }


    const listLoadParent = renderPlayList();


    function removeSelections() {

        Array.from(document.querySelectorAll("[data-load]"),el => {

            if ( el.getAttribute("data-load") === "multiple" ) {
                el.removeAttribute("data-load");
                return ;
            }

            /**
             *
             * avoid double data-load=single
             *
             **/

            if ( el.getAttribute("data-load") === "single" ) {
                el.removeAttribute("data-load");
                return ;
            }

        });
    }

    listLoadParent.addEventListener("click", evt => {

        let target = evt.target;

        const _case = target.nodeName.toLowerCase();

        if ( _case === "ul"  ) return false;

        target = _case === "li" ? target : target.parentNode;



        /**
         *
         * clicked li already has data-load just remove it
         *  as a sign of unclick
         *
         **/

        if ( target.hasAttribute("data-load") ) {
            return target.removeAttribute("data-load");
        }


        /**
         *
         *
         * if ctrlKey is not held down
         * with a left click
         * remove all li element marked with data-load=multiple
         *
         **/

        if ( ! evt.ctrlKey ) {
            removeSelections();
            return target.setAttribute("data-load", "single");
        }


        /**
         *
         * setup multiple selection
         * turn single selection to multiple selection
         *
         **/

        const single = document.querySelector("[data-load=single]");

        target.setAttribute("data-load", "multiple");

        if ( single )
            single.setAttribute("data-load", "multiple");

        return true;

    });

    close.addEventListener("click", evt => ipc.sendSync("close-loadplaylist-window"));

    button.addEventListener("click", evt => {

        const selection = document.querySelectorAll("[data-load]");

        if ( selection.length === 0 ) {
            return dialog.showErrorBox(
                "Nothing Selected",
                "Select a playlist by just clicking on it\n Or Hold down Ctrl Key for multiple selections"
            );
        }

        Array.from(selection, el => {
            const playlistName = el.getAttribute("data-capture");
            return playlistLoad(playlistName);
        });

    });
})();
