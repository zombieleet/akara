; ( () => {

    "use strict";

    const {
        ipcRenderer: ipc,
        remote: {
            dialog,
            getCurrentWindow,
            Menu,
            MenuItem,
            nativeImage
        }
    } = require("electron");

    const url = require("url");

    const {
        handleWindowButtons,
        getMetaData,
        processMediaTags,
        downloadAlbumArt
    } = require("../js/util.js");

    const mediaMin = document.querySelector("[data-winop=minimize]");
    const mediaMax = document.querySelector("[data-winop=maximize]");
    const mediaClose = document.querySelector("[data-winop=close]");
    const mediaInfo = document.querySelector(".media-info");

    const spinner = () => {

        const media = document.querySelector(".media");

        const spinparent = document.createElement("div");
        const spin = document.createElement("i");
        const spintext = document.createElement("p");


        spinparent.appendChild(spin);
        spinparent.appendChild(spintext);

        spinparent.setAttribute("class", "media-spinner");
        spin.setAttribute("class", "fa fa-spinner fa-pulse fa-5x");
        spintext.textContent = "Processing video to get metatdata";


        media.appendChild(spinparent);

        return spinparent;
    };

    const processMetadata = metadata => {

        for ( let metas of Object.keys(metadata) ) {

            let typeOfMetas = typeof(metadata[metas]);

            if ( typeOfMetas === "object" ) {
                processObjectMetadata(metas,metadata[metas]);
            } else if ( typeOfMetas !== "undefined" ) {
                processNonObjectMetadata(metas,metadata[metas]);
            }

        }
    };

    const createMetaContainers = () => {
        const infoContainer = document.createElement("div");
        infoContainer.setAttribute("class", "media-info-submeta");
        return infoContainer;
    };

    const processNonObjectMetadata = (key,value) => {

        const infoContainer = createMetaContainers();
        const infoType = document.createElement("p");
        const infoInput = document.createElement("input");

        infoType.textContent = key;
        infoInput.type = "text";
        infoInput.value = value;

        infoType.setAttribute("class", "media-info-type");
        infoInput.setAttribute("class", "media-info-input");

        infoContainer.appendChild(infoType);
        infoContainer.appendChild(infoInput);

        mediaInfo.appendChild(infoContainer);

    };


    const processObjectMetadata = (key,value) => {

        const infoContainer = createMetaContainers();
        const infoContainterName = document.createElement("p");

        if ( key === "duration" ) {
            infoContainer.appendChild(processMiniObject(key,value));
            mediaInfo.appendChild(infoContainer);
            return ;
        }

        const maxContainer = document.createElement("div");
        const maxToggler = document.createElement("i");
        const maxKey = document.createElement("span");

        const maxContainerContent = document.createElement("ul");

        maxContainerContent.setAttribute("class", "media-info-max");
        maxToggler.setAttribute("class", "fa fa-toggle-down toggler");

        maxKey.textContent = key;


        maxContainer.appendChild(maxKey);
        maxContainer.appendChild(maxToggler);

        maxToggler.addEventListener("click", evt => toggleOption(evt,maxContainerContent));

        for ( let _val of Object.keys(value) ) {

            const item = document.createElement("li");
            const itemKey = document.createElement("span");
            const itemValue = document.createElement("span");

            if ( typeof(value[_val]) === "object" ) {
                maxContainerContent.appendChild(processMiniObject(_val, value[_val]));
                continue;
            }

            itemKey.textContent = `${_val}:`;
            itemValue.textContent = value[_val];

            item.appendChild(itemKey);
            item.appendChild(itemValue);

            maxContainerContent.appendChild(item);
        }


        infoContainer.appendChild(maxContainer);
        infoContainer.appendChild(maxContainerContent);
        mediaInfo.appendChild(infoContainer);
    };


    const toggleOption = (evt,toggleContent) => {

        const target = evt.target;

        if ( target.classList.contains("fa-toggle-down") ) {
            target.classList.remove("fa-toggle-down");
            target.classList.add("fa-toggle-left");
            toggleContent.style.display = "none";
            return ;
        }

        target.classList.remove("fa-toggle-left");
        target.classList.add("fa-toggle-down");
        toggleContent.style.display = null;

        return ;
    };

    const processMiniObject = (key,value) => {

        const miniContainer = document.createElement("div");
        const miniContainerTitle = document.createElement("span");
        const miniContainerToggler = document.createElement("i");

        const miniContainerContent = document.createElement("ul");

        miniContainerContent.setAttribute("class", "media-info-mini");

        miniContainerTitle.textContent = key;

        miniContainerToggler.setAttribute("class", "fa fa-toggle-down toggler");

        miniContainerToggler.addEventListener("click", evt => toggleOption(evt, miniContainerContent));

        miniContainer.appendChild(miniContainerTitle);
        miniContainer.appendChild(miniContainerToggler);

        for ( let _val of Object.keys(value) ) {

            const miniContainerContentItem = document.createElement("li");
            const itemKey = document.createElement("span");
            const itemValue = document.createElement("span");

            itemKey.textContent = `${_val}:`;
            itemValue.textContent = value[_val];

            miniContainerContentItem.appendChild(itemKey);
            miniContainerContentItem.appendChild(itemValue);

            miniContainerContent.appendChild(miniContainerContentItem);

        }

        miniContainer.appendChild(miniContainerContent);

        return miniContainer;

    };

    const albumArtEventHandler = () => {

        const imageMenu = new Menu();

        imageMenu.clear();

        imageMenu.append(new MenuItem({
            label: "Download Art",
            accelerator: "Ctrl + D",
            click: () => {
                const img = document.querySelector(".media-info-album_art");
                downloadAlbumArt(img.src);
            }
        }));

        imageMenu.popup({ async: true });
    };


    ipc.sendTo(1, "akara::video::currentplaying",
               getCurrentWindow().webContents.id,
               localStorage.getItem("akara::mediainfo:playlist_section")
               ? true
               : false
              );

    ipc.once("akara::video::currentplaying:src", async ( evt, data ) => {

        let result;

        let spin = spinner();

        try {

            result = await getMetaData(decodeURIComponent(url.parse(data).path));
            //result = await getMetaData(decodeURIComponent(url.parse(localStorage.getItem("mediatest")).path));
        } catch(ex) {
            result = ex;
        }

        spin.remove();

        if ( Error[Symbol.hasInstance](result) ) {
            console.log(result);
            return ;
        }

        processMediaTags({
            url: decodeURIComponent(url.parse(data).path),
            //url: decodeURIComponent(url.parse(localStorage.getItem("mediatest")).path),
            onSuccess({ tags }) {

                if ( ! tags.picture )
                    return ;

                const typedArrayBuf = new Uint8Array(tags.picture.data);

                let base64String = "";

                for ( let _typedArray of typedArrayBuf ) {
                    base64String += String.fromCodePoint(_typedArray);
                }

                const fs = require("fs");

                fs.writeFileSync("/root/ttt.jpg", base64String);
                fs.writeFileSync("/root/inspect.txt", window.btoa(base64String));

                const albumArtContainer = document.createElement("div");
                const albumArt = new Image();

                albumArtContainer.setAttribute("class", "media-info-album_art_container");
                albumArt.setAttribute("class", "media-info-album_art");

                albumArt.src = `data:${tags.picture.format};base64,${window.btoa(base64String)}`;
                albumArt.draggable = false;


                albumArt.addEventListener("contextmenu", albumArtEventHandler);
                albumArt.addEventListener("click", albumArtEventHandler);


                albumArtContainer.appendChild(albumArt);

                mediaInfo.insertBefore(albumArtContainer,mediaInfo.children[0]);

                return ;

            },
            onError(error) {
                return ;
            }
        });


        processMetadata(result);

        return ;
    });


    handleWindowButtons({ close: mediaClose, min: mediaMin, max: mediaMax });

})();
