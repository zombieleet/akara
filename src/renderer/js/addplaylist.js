; ( () => {

    "use strict";

    const {
        remote: {
            require: _require,
            dialog,
            getCurrentWindow
        }
    } = require("electron");

    const {
        playlist: {
            file: playlistLocation
        }
    } = _require("./configuration.js");

    const {
        playlistSave,
        renderPlayList
    } = require("../js/util.js");

    const list = require(playlistLocation);

    const addplaylist = document.querySelector(".addplaylist");
    const addbtn = document.querySelector(".add-btn");
    const close = document.querySelector(".addplaylist-close");


    const requestAddingNewList = () => {

        const rendered = renderPlayList("addplaylist");

        if ( ! rendered && ! Error[Symbol.hasInstance](rendered) ) {

            const addNew = document.createElement("a");
            addNew.setAttribute("class", "addplaylist-newlist");

            addNew.textContent = "new list";

            addNew.addEventListener("click", () => {
                const inputNew = document.createElement("input");
                const btnNew = document.createElement("button");

                inputNew.setAttribute("class", "addplaylist-inputnew");
                btnNew.setAttribute("class", "addplaylist-btnnew");

                btnNew.textContent = "add";

                btnNew.addEventListener("click", () => {

                    if ( /^\s{0,}$/.test(inputNew.value) ) {
                        dialog.showErrorBox("invalid input","type in the new playlist name in input box");
                        return ;
                    }

                    playlistSave(inputNew.value, [ localStorage.getItem("akara::addplaylist") ], true);

                    addNew.remove();
                    inputNew.remove();
                    btnNew.remove();

                    requestAddingNewList();

                });

                addplaylist.appendChild(inputNew);
                addplaylist.appendChild(btnNew);

                addNew.style.display = "none";
            });

            addplaylist.appendChild(addNew);
        }
    };

    addbtn.addEventListener("click", () => {

        const selection = document.querySelectorAll("[data-load]");

        if ( selection.length === 0 )
            return ;

        Array.from(selection, el => {
            const listName = el.getAttribute("data-capture");
            playlistSave(listName, [ localStorage.getItem("akara::addplaylist")  ], true);
        });

        addplaylist.querySelector(".append-list").remove();
        renderPlayList("addplaylist");
    });


    close.addEventListener("click", () => {
        getCurrentWindow().close();
    });

    window.addEventListener("DOMContentLoaded", requestAddingNewList);

})();
