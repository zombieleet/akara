; ( () => {

    "use strict";

    const {
        ipcRenderer: ipc,
        remote: {
            dialog
        }
    } = require("electron");

    const { basename } = require("path");
    const {
        getMetaData
    } = require("../js/util.js");

    const close = document.querySelector(".media-close");

    const styleDeeper = ({ul,li,key,val},{_key,_val}) => {

        key.innerHTML = _key;
        val.innerHTML = _val;

        li.appendChild(key);
        li.appendChild(val);

        ul.appendChild(li);

    };

    const retrieveDeepValues = value => {

        let currentValue ;

        const ul = document.createElement("ul");

        ul.setAttribute("class", "akara-media-deep");

        for ( let [_key,_val] of Object.entries(value) ) {

            const li = document.createElement("li");

            const key = document.createElement("span");
            const val = document.createElement("span");


            if ( typeof(_val) === "object" ) {
                console.log(_val,_key);
                switch(_key) {
                case "aspect":
                    _key = "aspect ratio";
                    _val = `x: ${_val.x} , y: ${_val.y}`;
                    styleDeeper({ul,li,key,val},{_key,_val});
                    break;
                case "resolution":
                    _val = `width: ${_val.w}, height: ${_val.h}`;
                    styleDeeper({ul,li,key,val},{_key,_val});
                    break;
                case "channels":
                    _val = `${_val.raw}`;
                    styleDeeper({ul,li,key,val},{_key,_val});
                    break;
                }
                
            } else {
                styleDeeper({ul,li,key,val},{_key,_val});
            }
        }

        return ul;

    };

    const retrieveValue = obj => {

        const ul = document.createElement("ul");

        for ( let [key,value] of Object.entries(obj) ) {

            const li = document.createElement("li");
            const _key = document.createElement("span");

            let _value = document.createElement("span");

            switch(key) {
            case "filename":
                _value.innerHTML = basename(value);
                break;
            case "audio":
                _key.setAttribute("class", "media-has-deep");
                _value = retrieveDeepValues(value);
                break;
            case "duration":
                _value.innerHTML = value.raw;
                break;
            case "video":
                _key.setAttribute("class", "media-has-deep");
                _value = retrieveDeepValues(value);
                break;
            default:
                _value.innerHTML = value;
            }

            _key.innerHTML = key;

            li.appendChild(_key);

            li.appendChild(_value);

            ul.appendChild(li);
        }

        return ul;

    };

    const styleMetaData = async () => {

        const values = await getMetaData();

        if ( Error[Symbol.hasInstance](values) ) {
            return dialog.
                showErrorBox("Cannot Read Metadata","The Information of this media file cannot be gotten");
        }

        const div = document.createElement("div");

        div.appendChild(retrieveValue(values));

        document.querySelector(".akara-info").appendChild(div);
    };

    close.addEventListener("click", () => ipc.send("close-mediainfo-window"));

    styleMetaData();

})();
