; ( () => {

    "use strict";

    const {
        ipcRenderer: ipc,
        remote: {
            app,
            dialog,
            getCurrentWindow,
            require: _require
        }
    } = require("electron");

    const fs      = require("fs");
    const crypto  = require("crypto");

    const { handleWindowButtons } = require("../../js/Util.js");
    const { requireSettingsPath } = _require("./constants.js");

    const shortcutMin   = document.querySelector("[data-winop=minimize]");
    const shortcutMax   = document.querySelector("[data-winop=maximize]");
    const shortcutClose = document.querySelector("[data-winop=close]");
    const showSettings  = document.querySelector(".shortcut_show_settings");
    const shortcutList  = document.querySelector(".shortcutkey_list");


    let _CURRENT_SETTING_SECTION_IN_VIEW;

    const saveShortcut = ({ key, modifier, shortcut, shortcutType }) => {

        const shortcutpath = requireSettingsPath("shortcut.json");
        const shortcutsettings = require(shortcutpath);
        const shortcutKeySettings = shortcutsettings[shortcut];

        const shortcutObj = shortcutKeySettings.find( setting => setting[shortcutType] );

        Object.assign( shortcutObj , {
            [shortcutType]: {
                key,
                modifier
            }
        });

        fs.writeFileSync(shortcutpath, JSON.stringify(shortcutsettings));
    };

    const computeAgainstOtherSections = ( { key , modifier , from } ) => {

        const shortcutpath = requireSettingsPath("shortcut.json");
        const shortcutsettings = require(shortcutpath);

        let isMatch = 0;

        for ( let shsettings of Object.keys(shortcutsettings) ) {

            if ( shsettings === from )
                continue;


            for ( let shset of shortcutsettings[shsettings] ) {

                const [ objectPropName ] = Object.getOwnPropertyNames(shset);
                const modiHash = crypto.createHash("md5").update(Buffer.from(modifier.toString())).digest("hex");
                const shsetHash = crypto.createHash("md5").update(Buffer.from(shset[objectPropName].modifier.toString())).digest("hex");

                if ( (shset[objectPropName].key === key) && (modiHash === shsetHash) ) {
                    isMatch = 1;
                    break;
                }
            }
        }

        return isMatch;

    };

    const computeAgainstDom = (key,modifier,parentNode) => {

        const nodeIterator = document.createNodeIterator(
            parentNode, NodeFilter.SHOW_ELEMENT,
            node => {
                return node.hasAttribute("data-modify-shortcut") || ! HTMLLIElement[Symbol.hasInstance](node)
                    ? NodeFilter.FILTER_SKIP
                    : NodeFilter.FILTER_ACCEPT;
            }
            , false
        );

        const regexp = /\s+\+\s+/;

        let currnode, isMatch = 0;

        while ( ( currnode = nodeIterator.nextNode() ) ) {

            const modi = modifier.split(regexp);
            const lastChildContent = currnode.lastElementChild.textContent.split(regexp);


            // .pop removes a leading "" at the end of the array
            //   after been split, the cause of the "" at the end of the array
            //   is not known

            modi.pop();
            modi.push(key);

            const modiHash = crypto.createHash("md5").update(Buffer.from(modi.toString())).digest("hex");
            const lastChildContentHash = crypto.createHash("md5").update(Buffer.from(lastChildContent.toString())).digest("hex");

            if ( modiHash === lastChildContentHash ) {
                isMatch = 1;
                break;
            }
        }

        if ( ! isMatch  ) {
            isMatch = computeAgainstOtherSections({key,modifier, from: _CURRENT_SETTING_SECTION_IN_VIEW});
        }

        return isMatch;
    };

    const processShortcut = (key,modifier,keyValue) => {

        const pNode = keyValue.parentNode;

        modifier = modifier.length > 0 ? `${modifier.join("  +  ")}  +  ` : "";

        if ( ! pNode ) {
            keyValue.textContent = `${modifier}${key}`;
            return true;
        }

        if ( key === "" ) {
            pNode.setAttribute("data-modify-invalid", "invalid");
            //keyValue.textContent = modifier;
            keyValue.textContent = "bad key combination";
            return null;
        }


        if ( computeAgainstDom(key,modifier,pNode.parentNode) ) {
            pNode.setAttribute("data-modify-invalid", "invalid");
            keyValue.textContent = "shortcut already exists";
            return null;
        }

        pNode.removeAttribute("data-modify-invalid");
        keyValue.textContent = `${modifier}${key}`;

        return { saveShortcut };

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
        ul.setAttribute("data-shortcut", type);

        showSettings.appendChild(ul);

        for ( const shortcuttype of shortcutKeySettings ) {

            Object.keys(shortcuttype).forEach( kName => {

                const li = document.createElement("li");
                const keyName = document.createElement("span");
                const keyValue = document.createElement("span");

                const shortcutKey = shortcuttype[kName];

                processShortcut(shortcutKey.key, shortcutKey.modifier, keyValue, type);

                keyName.textContent = kName;

                li.setAttribute("class", "shortcut_key_item");

                keyName.setAttribute("class", "shortcut_key_name");

                keyValue.setAttribute("class", "shortcut_key_value");
                keyValue.setAttribute("data-shortcut-type", kName);

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

        _CURRENT_SETTING_SECTION_IN_VIEW = target.getAttribute("data-show-set");

        try {
            appendSettingsToDom(_CURRENT_SETTING_SECTION_IN_VIEW);
        } catch(ex) {
            console.log(ex);
            dialog.showErrorBox("Not Implemented", `no implementation for ${_CURRENT_SETTING_SECTION_IN_VIEW}`);
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
        //evt.preventDefault();
        const modifyActive = showSettings.querySelector("[data-modify-shortcut=modify]");

        if ( ! modifyActive )
            return ;

        const shortcutTypeEl = modifyActive.parentNode;
        const keyValue = modifyActive.querySelector(".shortcut_key_value");

        let modifierKeys = [ "altKey", "ctrlKey", "metaKey", "shiftKey" ]
            .filter( mod => evt[mod] === true );

        let key_code = evt.code === "Space"
            ? evt.code
            : ( () => {
                if ( ! /Control|Alt|Shift/.test(evt.key) ) {

                    const regex = /(ArrowRight|ArrowLeft|ArrowUp|ArrowDown|Tab|Home|PageUp|PageDown|End|Enter|Insert|Escape|BrowserHome|BrightnessDown|BrightnessUp)/;

                    /**
                     * the above regex and the Function key regex
                     * is not affected by Shift key ( turns lowercase to uppercase or vice versa )
                     * return the key as it is
                     **/

                    if ( regex.test(evt.key) || /^F([0-9]{1,2})$/.test(evt.key) )
                        return evt.key;

                    /**
                     * backspace or delete key should unset a shortcutkey
                     * if backspace or delete key is used with a modifierkey
                     * shortcut key is not unset
                     **/
                    if ( /Backspace|Delete/.test(evt.key) ) {
                        if ( modifierKeys.length > 0 )
                            return evt.key;
                        return "DISABLED";
                    }

                    /**
                     * turn the key to a lower case in other prevent ignoring keys
                     * when Shift key is triggered ( turns lowercase to uppercase or vice versa )
                     * is used on them
                    **/
                    return evt.key.toLowerCase();
                }
                return "";
            })();

        const isValid = processShortcut(key_code, modifierKeys, keyValue);

        if ( ! isValid )
            return ;

        const shortcut = shortcutTypeEl.getAttribute("data-shortcut");
        const shortcutType = keyValue.getAttribute("data-shortcut-type");

        const shKeys = {
            key: key_code,
            modifier: modifierKeys,
            shortcut,
            shortcutType
        };

        isValid.saveShortcut(shKeys);
        ipc.sendTo(1, "akara::shortcutkey", _CURRENT_SETTING_SECTION_IN_VIEW , shKeys);

    });

    window.addEventListener("DOMContentLoaded", () => {
        _CURRENT_SETTING_SECTION_IN_VIEW = "media";
        appendSettingsToDom("media");
    });


    handleWindowButtons( { close: shortcutClose, min: shortcutMin, max: shortcutMax } );

})();
