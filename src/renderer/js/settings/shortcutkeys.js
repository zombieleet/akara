; ( () => {

    "use strict";

    const {
        remote: {
            app,
            dialog,
            require: _require
        }
    } = require("electron");


    const { handleWindowButtons } = require("../../js/util.js");
    const { requireSettingsPath } = _require("./constants.js");

    const shortcutMin = document.querySelector("[data-winop=minimize]");
    const shortcutMax = document.querySelector("[data-winop=maximize]");
    const shortcutClose = document.querySelector("[data-winop=close]");
    const showSettings = document.querySelector(".shortcut_show_settings");
    const shortcutList = document.querySelector(".shortcutkey_list");


    const processShortcut = (key,modifier,keyValue) => {

        const pNode = keyValue.parentNode;

        modifier = modifier.length > 0 ? `${modifier.join("  +  ")}  +  ` : "  ";

        if ( ! pNode ) {
            keyValue.textContent = `${modifier}  ${key}`;
            return ;
        }

        if ( key === "" ) {
            pNode.setAttribute("data-modify-invalid", "invalid");
            keyValue.textContent = modifier;
            return ;
        }

        pNode.removeAttribute("data-modify-invalid");
        keyValue.textContent = `${modifier}  ${key}`;


    };

    const appendSettingsToDom = async (type) => {

        const shortcutpath = await requireSettingsPath("shortcut.json");
        const shortcutsettings = require(shortcutpath);

        const shortcutKeySettings = shortcutsettings[type];

        const _ul = document.querySelector(".shortcut_key_list");

        const ul = _ul
              ? (() => {
                  _ul.remove();
                  return document.createElement("ul");
              })()
              : document.createElement("ul");

        ul.setAttribute("class", "shortcut_key_list");
        showSettings.appendChild(ul);

        for ( const shortcuttype of shortcutKeySettings ) {

            Object.keys(shortcuttype).forEach( kName => {

                const li = document.createElement("li");
                const keyName = document.createElement("span");
                const keyValue = document.createElement("span");

                const shortcutKey = shortcuttype[kName];

                processShortcut(shortcutKey.key, shortcutKey.modifier, keyValue);

                keyName.textContent = kName;

                li.setAttribute("class", "shortcut_key_item");

                keyName.setAttribute("class", "shortcut_key_name");
                keyValue.setAttribute("class", "shortcut_key_value");

                li.appendChild(keyName);
                li.appendChild(keyValue);

                ul.appendChild(li);
            });
        }

    };

    shortcutList.addEventListener("click", evt => {

        const { target } = evt;

        if ( ! HTMLLIElement[Symbol.hasInstance](target) )
            return ;

        let invalidModify = showSettings.querySelector("[data-modify-invalid=invalid]");

        if ( invalidModify ) {
            dialog.showErrorBox("Invalid Key", `Invalid Shortcut Key for ${invalidModify.querySelector(".shortcut_key_name").textContent}`);
            return ;
        }

        const dataShowSet = target.getAttribute("data-show-set");

        try {
            appendSettingsToDom(dataShowSet);
        } catch(ex) {
            console.log(ex);
            dialog.showErrorBox("Not Implemented", `no implementation for ${dataShowSet}`);
        }
    });

    showSettings.addEventListener("click", evt => {

        const { target } = evt;

        if ( ! HTMLLIElement[Symbol.hasInstance](target) )
            return ;

        let invalidModify = showSettings.querySelector("[data-modify-invalid=invalid]");

        if ( invalidModify ) {
            dialog.showErrorBox("Invalid Key", `Invalid Shortcut Key for ${invalidModify.querySelector(".shortcut_key_name").textContent}`);
            return ;
        }

        if ( target.hasAttribute("data-modify-shortcut") ) {
            target.removeAttribute("data-modify-shortcut");
            return ;
        }

        let curModify = showSettings.querySelector("[data-modify-shortcut=modify]");

        if ( curModify )
            curModify.removeAttribute("data-modify-shortcut");

        target.setAttribute("data-modify-shortcut", "modify");

    });

    window.addEventListener("keydown", evt => {

        const modifyActive = showSettings.querySelector("[data-modify-shortcut=modify]");

        if ( ! modifyActive )
            return ;

        const keyValue = modifyActive.querySelector(".shortcut_key_value");

        let modifierKeys = [ "altKey", "ctrlKey", "metaKey", "shiftKey" ]
            .filter( mod => evt[mod] === true );

        let key_code = evt.code === "Space"
            ? evt.code
            : ( () => {
                if ( ! /Control|Alt|Shift/.test(evt.key) ) {
                    if ( ! /(ArrowRight|ArrowLeft|ArrowUp|ArrowDown)/.test(evt.key) )
                        return evt.key.toLowerCase();
                    return evt.key;
                }
                return "";
            })();

        processShortcut(key_code, modifierKeys, keyValue);

    });

    window.addEventListener("DOMContentLoaded", () => {
        appendSettingsToDom("video");
    });


    handleWindowButtons( { close: shortcutClose, min: shortcutMin, max: shortcutMax } );

})();
