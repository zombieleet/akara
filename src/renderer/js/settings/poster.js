; ( () => {

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

    const { promisify } = require("bluebird");
    const path = require("path");
    const fs  = require("fs");

    const save = document.querySelector(".poster-submit");
    const checkBox = document.querySelector(".poster-albumart-checkbox");
    const close = document.querySelector(".poster-close");
    const install = document.querySelector(".poster-install");


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

        const pathToSystemPosters = path.resolve(path.join(__dirname, "../../../img/posters"));
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

        if ( Error[Symbol.hasInstance](value) )
            return dialog.showErrorBox("Error Loading Posters","Cannot load Posters");

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

})();
