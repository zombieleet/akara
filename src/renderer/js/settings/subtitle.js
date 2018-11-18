; ( () => {

    const {
        ipcRenderer: ipc,
        remote: {
            dialog,
            getCurrentWindow,
            require: _require
        }
    } = require("electron");

    const fs = require("fs");

    const WINDOW_ID = getCurrentWindow().webContents.id;

    const cueSettings = document.querySelector(".subtitle-cues-option");
    const close = document.querySelector(".subtitle-close");
    const save = document.querySelector(".subtitle-save");
    const cancel = document.querySelector(".subtitle-cancel");
    const suboption = document.querySelector(".subtitle-options");

    const akara_emit = require("../../js/emitter.js");

    const { requireSettingsPath } = _require("./constants.js");


    const onLoad = () => {
        const cuesPath = requireSettingsPath("cueStyle.json");
        const subtitlePath = requireSettingsPath("subtitle.json");

        const cues = require(cuesPath);
        const subtitle = require(subtitlePath);

        Object.getOwnPropertyNames(subtitle)
            .forEach( props => {
                const el = document.querySelector(`[data-save=${props}]`);
                const elIcon = el.querySelector(".toggle-off") || el.querySelector(".toggle-on");
                const propsValue = subtitle[props];
                if ( propsValue === "no" ) {
                    elIcon.classList.remove("fa-toggle-on");
                    elIcon.classList.remove("toggle-on");
                    elIcon.classList.add("fa-toggle-off");
                    elIcon.classList.add("toggle-off");
                    return ;
                }

                elIcon.classList.remove("fa-toggle-off");
                elIcon.classList.remove("toggle-off");

                elIcon.classList.add("fa-toggle-on");
                elIcon.classList.add("toggle-on");

            });

        Object.getOwnPropertyNames(cues)
            .forEach( props => {

                const el = document.querySelector(`[data-style=${props}]`);
                // remove this conditional statement latter
                // when all cue style setting is complete
                if ( ! el ) return ;
                const cueTest = document.querySelector(".cue-test");
                const propsValue = cues[props];

                if ( ! propsValue.length )
                    return ;

                el.value = propsValue;

                cueTest.style[props] = el.hasAttribute("data-unit") ? (() => {
                    if ( isNaN(Number(el.value)) )
                        return el.value;
                    return `${el.value}px`;
                })(): el.value;

                ipc.sendTo(1, "akara::subtitle:style:change", props, cueTest.style[props]);
            });
    };

    const runWorker = (property,value) => {
        const cueTest = document.querySelector(".cue-test");
        const worker = new Worker( () => {
            postMessage({
                property,
                value
            });
            this.onmessage = evt => console.log(evt);
        });

        worker.postMessage("shit");
        worker.addEventListener("message", ({ data: { property, value } }) => {
            console.log("abracadabra");
            cueTest.style[property] = value;
            //worker.terminate();
        });
    };

    close.addEventListener("click", () => getCurrentWindow().close());

    cueSettings.addEventListener("click", evt => {

        let { target } = evt;

        // don't hide all datalist option
        // if the input box have content
        if ( target.hasAttribute("list") ) {
            target.setAttribute("data-temp-value", target.value);
            target.value = "";
            return ;
        }

        // hide and unhide cue css property
        target = target.classList.contains("cue-toggler") || target.classList.contains("cue-title")
            ? (() => {
                if ( HTMLSpanElement[Symbol.hasInstance](target) )
                    return target.previousElementSibling;
                return target;
            })() : null;

        if ( ! target )
            return ;

        const pNode = target.parentNode;
        const cueStyle = pNode.querySelector("[data-hide]");

        if ( cueStyle.getAttribute("data-hide") === "subtitle_toggle_hidden" ) {
            target.classList.remove("fa-toggle-right");
            target.classList.add("fa-toggle-down");
            cueStyle.setAttribute("data-hide", "subtitle_toggle_visible");
            return ;
        }
        target.classList.add("fa-toggle-right");
        target.classList.remove("fa-toggle-down");
        cueStyle.setAttribute("data-hide", "subtitle_toggle_hidden");
    });

    document.addEventListener("input", evt => {

        const { target } = evt;
        const cssProps = target.getAttribute("data-style");
        const cueTest = document.querySelector(".cue-test");

        let cssValue = evt.target.value;

        if ( target.hasAttribute("data-unit") )
            cssValue = `${cssValue}px`;

        cueTest.style[cssProps] = cssValue;

        ipc.sendTo(1, "akara::subtitle:style:change", cssProps, cssValue);
        //runWorker({ property: cssProps, value: cssValue });
    });

    // don't forget checkboxLabel to prompt if to
    // show message again or not

    suboption.addEventListener("click", evt => {

        const { target } = evt;

        if ( target.nodeName !== "I" )
            return ;

        const dataSave = target.parentNode.getAttribute("data-save");
        const toggleState = target.classList.contains("toggle-off");

        if ( dataSave === "auto_add_subtitle" && toggleState && ! localStorage.getItem("AUTO_ADD_SUBTITLE_MESSAGE_BOX") )  {
            dialog.showMessageBox({
                type: "info",
                message: "The name of the media file, must be the same with the subtitle name. Example movie.mp4, subtitle will be movie.srt or movie.vtt",
                checkboxLabel: "Do not show this message again",
                buttons: [ "Cancel", "Ok" ]
            }, ( btn, checkboxState) => {

                if ( btn === 0 )
                    return ;

                if ( checkboxState ) {
                    localStorage.setItem("AUTO_ADD_SUBTITLE_MESSAGE_BOX", "dont_show");
                    return ;
                }
                if ( localStorage.getItem("AUTO_ADD_SUBTITLE_MESSAGE_BOX") ) {
                    localStorage.removeItem("AUTO_ADD_SUBTITLE_MESSAGE_BOX");
                    return ;
                }
                return ;

            });
        }

        // toggle-off
        if ( toggleState ) {
            target.classList.remove("toggle-off");
            target.classList.remove("fa-toggle-off");
            target.classList.add("toggle-on");
            target.classList.add("fa-toggle-on");
            return ;
        }

        // toggle-on

        target.classList.remove("toggle-on");
        target.classList.remove("fa-toggle-on");

        target.classList.add("toggle-off");
        target.classList.add("fa-toggle-off");

    });

    save.addEventListener("click", () => {

        const cuesPath = requireSettingsPath("cueStyle.json");
        const subtitlePath = requireSettingsPath("subtitle.json");

        const settingsOptions = Array.prototype.slice.call(document.querySelectorAll("[data-save]"));
        const inputs = Array.prototype.slice.call(document.querySelectorAll("input"));


        const cuesStyle = require(cuesPath);
        const subtitleSettings = require(subtitlePath);

        inputs.forEach( input => {
            const dataStyle = input.getAttribute("data-style");
            const value = input.value;
            cuesStyle[dataStyle] = value;
        });

        settingsOptions.forEach( el => {
            const dataSave = el.getAttribute("data-save");
            subtitleSettings[dataSave] = el.querySelector(".toggle-on")
                ? "yes"
                : "no" ;
        });


        fs.writeFileSync(cuesPath, JSON.stringify(cuesStyle));
        fs.writeFileSync(subtitlePath, JSON.stringify(subtitleSettings));

    });

    cancel.addEventListener("click", onLoad);

    window.addEventListener("DOMContentLoaded", onLoad);

})();
