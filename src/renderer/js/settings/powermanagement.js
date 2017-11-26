; ( () => {

    const {
        remote: {
            getCurrentWindow,
            require: _require
        }
    } = require("electron");


    const fs = require("fs");
    const { requireSettingsPath } = _require("./constants.js");

    const powerOPtionList = document.querySelector(".power-options-list");
    const close = document.querySelector(".power-close");
    const save = document.querySelector(".power-save");
    const cancel = document.querySelector(".power-cancel");


    const loadSavedPower = async () => {

        const settingsFile = await requireSettingsPath("power.json");
        const powerSettings = require(settingsFile);

        for ( let opt of Object.keys(powerSettings) ) {

            const elOpt = document.querySelector(`[data-save=${opt}]`);
            const toggle = elOpt.querySelector("i");

            if ( powerSettings[opt] === "on" ) {

                toggle.classList.remove("fa-toggle-off");
                toggle.classList.remove("toggle-off");

                toggle.classList.add("fa-toggle-on");
                toggle.classList.add("toggle-on");

            } else {

                toggle.classList.remove("fa-toggle-on");
                toggle.classList.remove("toggle-on");

                toggle.classList.add("fa-toggle-off");
                toggle.classList.add("toggle-off");

            }
        }
    };

    save.addEventListener("click", async (evt) => {

        const powerOPtionList = document.querySelectorAll(".power-list-item");
        const settingsFile = await requireSettingsPath("power.json");
        const powerSettings = require(settingsFile);

        Array.from(powerOPtionList, el => {

            const method = el.getAttribute("data-save");
            const toggle = el.querySelector("i");
            
            if ( toggle.classList.contains("toggle-off") )
                powerSettings[method] = "off";
            else
                powerSettings[method] = "on";

        });

        fs.writeFileSync(settingsFile, JSON.stringify(powerSettings));
    });


    powerOPtionList.addEventListener("click", async (evt) => {

        let target = evt.target;

        if ( target.nodeName.toLowerCase() !== "i" )
            return ;

        const method = target.parentNode.getAttribute("data-save");

        target.classList.toggle("fa-toggle-off");
        target.classList.toggle("toggle-off");
        target.classList.toggle("fa-toggle-on");
        target.classList.toggle("toggle-on");
    });



    close.addEventListener("click", () => getCurrentWindow().close());
    cancel.addEventListener("click", loadSavedPower);
    window.addEventListener("DOMContentLoaded", loadSavedPower);

})();
