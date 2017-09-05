( () => {
    
    "use strict";

    const {
        ipcRenderer: ipc,
        remote: {
            require: _require
        }
    } = require("electron");

    const {
        playlist: {
            file: playlistLocation
        }
    } = _require("./configuration.js");

    const {
        playlistSave
    } = require("../js/util.js");
    
    const list = require(playlistLocation);

    const section = document.querySelector(".addplaylist");
    const button = document.querySelector("button");
    const close = document.querySelector(".addplaylist-close");
    const div = document.querySelector(".addplaylist-newlist");

    const input = div.querySelector("input");
    const closeInput = div.querySelector(".addplaylist-close-input");

    const newList = document.querySelector("a");
    
    function loadSavedPlaylist() {
        
        const savedList = Object.keys(list);
        
        const select = document.createElement("select");
        
        for ( let __list of savedList ) {
            const option = document.createElement("option");
            const p = document.createElement("p");
            
            option.setAttribute("value", __list);

            let content = __list.match(/./);
            
            option.textContent = content["input"].
                replace(
                    content[0],content[0].toUpperCase()
                );
            
            select.appendChild(option);
        }
        
        select.multiple = true;
        section.insertBefore(select, button);
    }


    button.addEventListener("click", evt => {
        
        const options = document.querySelectorAll("select option");
        const value = localStorage.getItem("akara::addplaylist");
        
        if ( ! div.hidden && ! /^\s+$|^\s$/.test(input.value) ) {
            playlistSave(input.value,[value]);
        }
        
        Array.from(options, el => {
            if ( el.selected ) {
                const key = el.getAttribute("value");
                playlistSave(key,[ value ]);
            }
        });

        localStorage.removeItem("akara::addplaylist");
    });


    newList.addEventListener("click", evt => div.hidden = false);
    
    close.addEventListener("click", evt => ipc.sendSync("close-addplaylist-window"));

    closeInput.addEventListener("click", evt => div.hidden = true);
    loadSavedPlaylist();
    
})();
