/* AKM is a highly customizable media player built with electron
   Copyright (C) 2016  Victory Osikwemhe (zombieleet)

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.
   
   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
   
   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
; ( () => {

    "use strict";

    const {
        ipcRenderer: ipc,
        remote: {
            dialog,
            app,
            getCurrentWindow,
            require: _require
        }
    } = require("electron");

    const {
        requireSettingsPath
    } = _require("./constants.js");

    const {
        posters: user_poster_location
    } = _require("./configuration.js");

    //const { promisify } = require("bluebird");
    const { promisify } = require("util");
    const path          = require("path");
    const fs            = require("fs");

    const save     = document.querySelector(".poster-submit");
    const checkBox = document.querySelector(".poster-albumart-checkbox");
    const close    = document.querySelector(".poster-close");
    const install  = document.querySelector(".poster-install");
    const reset    = document.querySelector(".poster-reset");
    const remove   = document.querySelector(".poster-remove");
    
    const posterPath = path.join(
        app.getAppPath(),
        "app",
        "renderer",
        "img",
        "posters"
    );

    const createPosterContainer = posterPath => {

        const li = document.createElement("li");
        const img = new Image(100,100);

        li.setAttribute("class", "poster-list-item");
        li.setAttribute("data-poster-path", posterPath);

        img.addEventListener("load", () => {
            li.appendChild(img);
        });

        img.src = posterPath;
        img.draggable = false;


        li.addEventListener("click", () => {
            Array.from(document.querySelectorAll(".poster-list-item"), el => {
                if ( el.hasAttribute("data-current-value") )
                    el.removeAttribute("data-current-value");
            });

            li.setAttribute("data-current-value", "true");
            ipc.sendTo(1, "akara::video:poster:change", posterPath);
        });

        return li;
    };

    const appendPostersToDom = value => {

        const posterList = document.querySelector(".poster-list");

        value.forEach( async (_poster) => {

            const { poster } = require(await requireSettingsPath("poster.json"));

            const li = createPosterContainer(_poster);

            if ( poster === _poster )
                li.setAttribute("data-current-value", "true");

            posterList.appendChild(li);
        });
    };

    const loadPosters = async () => {

        const pathToSystemPosters = posterPath;

        const pathToUserPosters = user_poster_location;

        let value ;

        try {

            value = await promisify(fs.readdir)(pathToSystemPosters);

            value = value.map(
                _val => path.join(pathToSystemPosters, _val)
            );

            for ( let _posters of await promisify(fs.readdir)(pathToUserPosters) )
                value.unshift(path.join(pathToUserPosters,_posters));

        } catch(ex) {
            value = ex;
        }

        if ( Error[Symbol.hasInstance](value) ) {
            console.log(value);
            return dialog.showErrorBox("Error Loading Posters","Cannot load Posters");
        }

        return value;
    };

    const saveSettings = async (key,value) => {

        const posterJson = await requireSettingsPath("poster.json");
        const posterSettings = require(posterJson);

        Object.assign(posterSettings, {
            [key]: value
        });

        fs.writeFileSync(posterJson, JSON.stringify(posterSettings));
    };


    const loadSettingsPreference = async () => {
        const posterJson = await requireSettingsPath("poster.json");
        const posterSettings = require(posterJson);
        appendPostersToDom(await loadPosters());

        checkBox.checked = posterSettings.album_art ? true : false;
    };

    window.addEventListener("DOMContentLoaded",loadSettingsPreference);

    save.addEventListener("click", async (evt) => {

        Array.from(document.querySelectorAll(".poster-list-item"), el => {
            if ( ! el.hasAttribute("data-current-value") )
                return ;
            const url = el.getAttribute("data-poster-path");
            saveSettings("poster", url);
        });

        if ( checkBox.checked )
            return saveSettings("album_art", true);

        return saveSettings("album_art", false);
    });


    close.addEventListener("click", () => getCurrentWindow().close());

    install.addEventListener("click", () => {

        dialog.showOpenDialog({
            defaultPath: app.getPath("pictures"),
            properties: [ "openFile", "multiSelection" ],
            filters: [
                { name: "jpeg/jpg" , extensions: [ "jpg", "jpeg"  ] },
                { name: "png", extensions: [ "png" ] },
                { name: "gif", extensions: [ "gif" ] },
                { name: "scalar vector graphic", extensions: [ "svg" ] },
                { name: "bmp" , extensions: [ "bmp" ] }
            ]
        }, paths => {

            if ( ! paths )
                return ;

            const posterList = document.querySelector(".poster-list");

            paths.forEach( imagePath => {

                const imgRelPath = path.basename(imagePath);

                const liDom = document.querySelector(".poster-list-item");
                const li = createPosterContainer(imagePath);

                const copyImgTo = fs.createWriteStream(path.join(user_poster_location, imgRelPath));
                const copyImgFrom = fs.createReadStream(imagePath);

                copyImgFrom.on("end", () => {
                    posterList.insertBefore(li,liDom);
                });

                copyImgFrom.pipe(copyImgTo,{ end: false });
            });
        });
    });

    reset.addEventListener("click", async () => {
        const posterJson = await requireSettingsPath("poster.json");
        const posterSettings = require(posterJson);

        const posterListItem = Array.from(document.querySelectorAll(".poster-list-item")); //el => {
        
        let posterPath ;
        
        for ( let el of posterListItem ) {

            if ( el.hasAttribute("data-current-value") )
                el.removeAttribute("data-current-value");

            if ( (posterPath = el.getAttribute("data-poster-path")) ) {
                if (  path.basename(posterPath) === "default_poster.jpg" ) {
                    el.setAttribute("data-current-value", true);
                    break;
                }
            }
        }
        
        checkBox.checked = false;
        saveSettings("poster", posterPath);
        saveSettings("album_art", false);
        ipc.sendTo(1, "akara::video:poster:change", posterPath);
    });

    remove.addEventListener("click", () => {
        
        const posterListItem = Array.from(document.querySelectorAll(".poster-list-item"));
        const pathToUserPosters = user_poster_location;
        
        let found ;
        let _el;
        
        for ( let el of posterListItem ) {
            if ( el.hasAttribute("data-current-value") ) {
                
                let dataFrom = el.getAttribute("data-poster-path");
                
                if ( path.dirname(dataFrom) !==  posterPath ) {
                    _el = el;
                    found = 1;
                    break;
                } else {
                    found = 0;
                }
            }
        }

        if ( found === 0 ) {
            dialog.showErrorBox(
                "Remove Poster",
                "This Poster is a system poster, it can't be removed"
            );
            return ;
        }
        
        if ( found === 1 ) {
            
            const posterToRemove = _el.getAttribute("data-poster-path");
            
            fs.readdir(pathToUserPosters, (err,info) => {
                
                if ( err )
                    return err;
                
                let location ;
                
                if ( (location = info.indexOf(path.basename(posterToRemove))) >= 0 ) {
                    
                    fs.unlink(path.join(pathToUserPosters,info[location]), err => {
                        if ( err ) {
                            console.log(err);
                            return dialog.showErrorBox("Cannot Remove Poster", "Unable to remove poster");
                        }
                        
                        return _el.remove();
                    });
                    
                }

                return true;
            });
            
        }

        return ;
    });
    
})();
