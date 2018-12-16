; ( () => {

    "use strict";

    const {
        remote: {
            dialog,
            getCurrentWindow,
            require: _require
        }
    } = require("electron");


    const {
        requireSettingsPath
    } = _require("./constants.js");


    const fs = require("fs");

    const shareSave   = document.querySelector(".share-save");
    const shareCancel = document.querySelector(".share-cancel");
    const close       = document.querySelector(".share-close");

    const togglersOption = document.querySelectorAll(".share-list-item > i");
    const expiryDate     = document.querySelector(".share-list-item > input");


    const loadShareSettings = async () => {

        const shareSavePath = await requireSettingsPath("share.json");
        const shareSettings = require(shareSavePath);

        Object.keys(shareSettings)
            .forEach( key => {

                const shareListItem = document.querySelector(`[data-save=${key}]`);
                
                const _toggle = shareListItem.querySelector("i") || shareListItem.querySelector("input");

                if ( shareSettings[key] === "no" ) {

                    _toggle.classList.remove("fa-toggle-on");
                    _toggle.classList.remove("toggle-on");

                    _toggle.classList.add("fa-toggle-off");
                    _toggle.classList.add("toggle-off");

                } else if ( shareSettings[key] === "yes" ) {
                    _toggle.classList.remove("fa-toggle-off");
                    _toggle.classList.remove("toggle-off");

                    _toggle.classList.add("fa-toggle-on");
                    _toggle.classList.add("toggle-on");
                } else {
                    _toggle.valueAsNumber = shareSettings[key];
                }
                
            });
    };

    shareSave.addEventListener("click", async () => {
        
        const shareSavePath = await requireSettingsPath("share.json");
        const shareSettings = require(shareSavePath);

        const shareItem = document.querySelectorAll(".share-list-item > i");

        Array.from(shareItem, _toggle => {
            
            const parent = _toggle.parentNode;
            const dataSaveType = parent.getAttribute("data-save");
            
            if ( _toggle.classList.contains("toggle-off") )
                shareSettings[dataSaveType] = "no";
            else
                shareSettings[dataSaveType] = "yes";

            if ( dataSaveType === "deactivate_sharing_option" ) {
                localStorage.setItem("share::deactivate", shareSettings[dataSaveType]);
            }
        });



        if ( expiryDate.value.length !== 0 ) {
            
            const currentDateTimeStamp = Date.now();
            const specifiedDateTimeStamp = new Date(expiryDate.value).valueOf();

            if ( specifiedDateTimeStamp < currentDateTimeStamp )
                return dialog.showErrorBox(
                    "invalid date",
                    `specified date should be older than or equal to todays date`
                );
            
            shareSettings[expiryDate.parentNode.getAttribute("data-save")] = specifiedDateTimeStamp;
        }
        
        fs.writeFileSync(shareSavePath, JSON.stringify(shareSettings));
        return true;
    });


    Array.from(togglersOption).forEach( _toggle => {

        _toggle.addEventListener("click", () => {


            if ( _toggle.classList.contains("toggle-off") ) {

                _toggle.classList.remove("toggle-off");
                _toggle.classList.remove("fa-toggle-off");

                _toggle.classList.add("toggle-on");
                _toggle.classList.add("fa-toggle-on");

            } else {

                _toggle.classList.remove("toggle-on");
                _toggle.classList.remove("fa-toggle-on");

                _toggle.classList.add("toggle-off");
                _toggle.classList.add("fa-toggle-off");

            }
        });
    });

    close.addEventListener("click", () => getCurrentWindow().close());
    shareCancel.addEventListener("click", loadShareSettings );
    window.addEventListener("DOMContentLoaded", loadShareSettings);

})();
