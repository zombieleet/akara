; ( () => {

    const {
        remote: {
            getCurrentWindow,
            dialog,
            require: _require
        }
    } = require("electron");

    const fs = require("fs");
    
    const { requireSettingsPath } = _require("./constants.js");
    
    const close     = document.querySelector(".volume-close");
    const cancel    = document.querySelector(".volume-cancel");
    const save      = document.querySelector(".volume-save");
    const exceedMax = document.querySelector("[data-save=volume_warn_exceed_max]");
    


    async function loadVolumeSettings() {

        const volumeFile = await requireSettingsPath("volume.json");
        const volumeSettings = require(volumeFile);

        //const volumeSettingsOptions = document.querySelectorAll(".volume-list-item");

        Object.keys(volumeSettings)
            .forEach( option => {

                const settingOption = document.querySelector(`[data-save=${option}]`);

                if ( ! settingOption )
                    return ;

                const key = settingOption.querySelector(".volume-setting-option");
                const value = volumeSettings[option];

                if ( HTMLInputElement[Symbol.hasInstance](key) ) {
                    key.valueAsNumber = value;
                    return ;
                }

                if ( key.nodeName.toLowerCase() === "i" ) {

                    if ( value === true ) {
                        key.classList.remove("fa-toggle-off");
                        key.classList.remove("toggle-off");
                        key.classList.add("fa-toggle-on");
                        key.classList.add("toggle-on");
                    }
                }

            });

    }



    close.addEventListener("click", () => getCurrentWindow().close());

    cancel.addEventListener("click", loadVolumeSettings);

    save.addEventListener("click", async () => {
        
        const volumeFile = await requireSettingsPath("volume.json");
        const volumeSettings = require(volumeFile);

        const volumeOptions = document.querySelectorAll(".volume-setting-option");

        Array.from(volumeOptions, el => {
            
            const pNode = el.parentNode;
            const dataSave = pNode.getAttribute("data-save");

            volumeSettings[dataSave] =  HTMLInputElement[Symbol.hasInstance](el)
                ? el.valueAsNumber
                : (
                    el.classList.contains("toggle-on")
                        ? true
                        : false
                );
        });

        fs.writeFileSync(volumeFile, JSON.stringify(volumeSettings));
        
    });

    exceedMax.addEventListener("click", evt => {

        const target = evt.target;

        if ( target.nodeName.toLowerCase() !== "i" )
            return ;


        if ( target.classList.contains("toggle-off") ) {
            target.classList.remove("fa-toggle-off");
            target.classList.remove("toggle-off");
            target.classList.add("fa-toggle-on");
            target.classList.add("toggle-on");
            return ;
        }


        target.classList.add("fa-toggle-off");
        target.classList.add("toggle-off");
        target.classList.remove("fa-toggle-on");
        target.classList.remove("toggle-on");


    });


    window.addEventListener("DOMContentLoaded", loadVolumeSettings);

})();
