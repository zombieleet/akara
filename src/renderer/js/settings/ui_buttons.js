; ( () => {

    "use strict";


    const {
        remote: {
            dialog,
            require: _require
        }
    } = require("electron");

    const FONTS = _require("./fonts.js");

    const {
        requireSettingsPath
    } = _require("./constants.js");

    const {
        handleWindowButtons
    } = require("../../js/util.js");

    const base64Img = require("base64-img");
    const fs = require("fs");

    const uiButtonMin = document.querySelector(".window-min");
    const uiButtonMax = document.querySelector(".window-max");
    const uiButtonClose = document.querySelector(".window-close");
    const uiButtonsParent = document.querySelector(".ui_button-parent");

    const saveFont = async (evt) => {

        let target = evt.target;
        let pNode = target.parentNode;

        let isImage = false;

        if ( HTMLImageElement[Symbol.hasInstance](target) ) {
            isImage = true;
            target = pNode;
            pNode = pNode.parentNode;
        }

        if ( target.hasAttribute("data-fnt_image") )
            isImage = true;

        let uibuttons = await requireSettingsPath("uibuttons.json");
        let uibuttonsSettings = require(uibuttons);

        let iconType = pNode.parentNode;
        let category = iconType.parentNode.getAttribute("data-category");

        iconType = iconType.querySelector("[data-icon_type]").getAttribute("data-icon_type");

        uibuttonsSettings[category][iconType] = target.getAttribute("data-fnt_type");

        fs.writeFileSync(uibuttons, JSON.stringify(uibuttonsSettings));

        for ( let el of Array.from(pNode.children) ) {
            if ( el.hasAttribute("data-fnt_active") ) {
                el.removeAttribute("data-fnt_active");
                /**
                   uncomment this break statement
                   when support for removing double datauris is added
                 **/
                //break;
            }
        }

        target.setAttribute("data-fnt_active", "true");
        iconType = pNode.parentNode;

        let icon = iconType.querySelector("[data-icon_type]");

        if ( isImage ) {
            icon.style.backgroundImage = `url(${target.querySelector("img").src})`;
            icon.setAttribute("data-image_icon", "image");
            icon.removeAttribute("class");
            return ;
        }


        icon.setAttribute("class", `${target.className}`);
        icon.removeAttribute("data-image_icon");
        icon.removeAttribute("style");

    };

    const addnewFont = evt => {

        const target = evt.target;
        const pNode = target.parentNode;

        const button = document.createElement("button");
        const input = document.createElement("input");

        input.type = "text";
        input.placeholder = "unicode value";

        button.textContent = "Browse Image";

        [ input, button ].forEach( addMore => {
            const fntchild = document.createElement("li");
            fntchild.setAttribute("data-fnt_add", "add_more_btn");
            fntchild.appendChild(addMore);
            pNode.appendChild(fntchild);
        });

        button.addEventListener("click", () => {
            dialog.showOpenDialog({
                properties: [ "openFile" , "multiSelections" ],
                filters: [ {name: "Image", extensions: ["ico", "jpeg", "jpg", "png", "svg", "bmp"]}]
            }, file => {
                if ( ! file )
                    return ;
                file.forEach( iconfile => {

                    base64Img.base64(iconfile, async (err,data) => {

                        if ( err ) {
                            console.log(err);
                            return ;
                        }

                        let customUIButtonsPath = await requireSettingsPath("custom_uibuttons.json");
                        let customUIButtons = require(customUIButtonsPath);
                        let iconType = pNode.parentNode;
                        let category = iconType.parentNode.getAttribute("data-category");

                        let image = new Image();

                        let fntchild = document.createElement("li");
                        let addMoreChild = document.querySelector("[data-fnt_add=add_more]");

                        fntchild.setAttribute("data-fnt_image", "fnt_image");
                        fntchild.setAttribute("data-fnt_type", data);
                        fntchild.appendChild(image);

                        iconType = iconType.querySelector("[data-icon_type]").getAttribute("data-icon_type");

                        image.src = data;
                        image.width = 20;
                        image.height = 20;

                        addMoreChild.insertAdjacentElement("afterend", fntchild);
                        customUIButtons[category][iconType].push(data);
                        fs.writeFileSync(customUIButtonsPath, JSON.stringify(customUIButtons));

                        return ;
                    });

                });
            });
        });

        evt.target.style.display = "none";

    };


    uiButtonsParent.addEventListener("click", async (evt) => {

        let target = evt.target;
        let pNode ;

        if ( ! (HTMLDivElement[Symbol.hasInstance](target) || target.nodeName.toLowerCase() === "i") )
            return;

        if ( target.nodeName.toLowerCase() === "i" ) {
            pNode = target.parentNode;
        } else if ( HTMLDivElement[Symbol.hasInstance](target) ) {
            pNode = target;
            target = target.children[0];
        }

        if ( pNode.querySelector(".fnt_parent") )
            return ;

        const fonttype = target.getAttribute("data-icon_type");
        const category = pNode.parentNode.getAttribute("data-category");

        if ( ! fonttype || ! category )
            return ;

        let uibuttons = await requireSettingsPath("uibuttons.json");
        let customUIButtons = await requireSettingsPath("custom_uibuttons.json");

        let customUIButtonsSettings = require(customUIButtons);
        let uibuttonsSettings = require(uibuttons);

        const fntparent = document.createElement("ul");

        fntparent.classList.add("fnt_parent");

        FONTS[fonttype].forEach( fnt => {

            const fntchild = document.createElement("li");

            if ( uibuttonsSettings[category][fonttype] === fnt ) {
                fntchild.setAttribute("data-fnt_active", "true");
            }

            fntchild.setAttribute("class", `fa ${fnt}`);
            fntchild.setAttribute("data-fnt_type", fnt);
            fntchild.addEventListener("click", saveFont);
            fntparent.appendChild(fntchild);

        });

        customUIButtonsSettings[category][fonttype].forEach( datauri => {

            let image = new Image();
            let fntchild = document.createElement("li");
            let addMoreChild = document.querySelector("[data-fnt_add=add_more]");

            if ( uibuttonsSettings[category][fonttype] === datauri ) {
                fntchild.setAttribute("data-fnt_active", "true");
            }

            image.src = datauri;
            image.width = 20;
            image.height = 20;

            fntchild.setAttribute("data-fnt_image", "fnt_image");
            fntchild.setAttribute("data-fnt_type", datauri);
            fntchild.addEventListener("click", saveFont);
            fntchild.appendChild(image);
            fntparent.appendChild(fntchild);
        });

        const fntchild = document.createElement("li");

        fntchild.setAttribute("data-fnt_add", "add_more");
        fntchild.textContent = "add more";
        fntchild.addEventListener("click", addnewFont);

        fntparent.style.position = "absolute";
        fntparent.style.left = evt.clientX + "px";
        fntparent.style.top = evt.clientY + "px";

        fntparent.appendChild(fntchild);
        pNode.insertBefore(fntparent, target);

    });


    uiButtonsParent.addEventListener("mouseout", evt => {

        const target = evt.target;
        const fntparent = document.querySelector(".fnt_parent");

        if ( HTMLDivElement[Symbol.hasInstance](target) || target.nodeName.toLowerCase() === "i")
            return;

        if ( target.classList.contains("fnt_parent") || target.parentNode.classList.contains("fnt_parent") )
            return ;

        if ( HTMLInputElement[Symbol.hasInstance](target) || HTMLButtonElement[Symbol.hasInstance](target) )
            return ;

        if ( HTMLImageElement[Symbol.hasInstance](target) )
            return ;


        if ( fntparent )
            fntparent.remove();
    });


    window.addEventListener("DOMContentLoaded", async () => {

        let uibuttons = await requireSettingsPath("uibuttons.json");
        let customUIButtons = await requireSettingsPath("custom_uibuttons.json");

        let customUIButtonsSettings = require(customUIButtons);
        let uibuttonsSettings = require(uibuttons);

        Object.keys(uibuttonsSettings).forEach( category => {

            let category__ = document.querySelector(`[data-category=${category}]`);

            Object.keys(uibuttonsSettings[category]).forEach(iconType => {

                let button_item = document.createElement(`div`);
                let font = document.createElement(`i`);
                let icon = uibuttonsSettings[category][iconType];

                let isUri = false;

                let datauris = customUIButtonsSettings[category][iconType];

                button_item.setAttribute("class", `${category}-item`);
                font.setAttribute("data-icon_type", iconType);
                font.setAttribute("data-tooltip", "true");

                button_item.appendChild(font);
                category__.appendChild(button_item);

                datauris.forEach( uri => {

                    if ( icon !== uri )
                        return ;

                    font.style.backgroundImage = `url(${icon})`;
                    font.setAttribute("data-image_icon", "image");

                    isUri = true;

                });

                if ( ! isUri )
                    font.setAttribute("class", `fa ${icon}`);

            });
        });
    });


    handleWindowButtons({ close: uiButtonClose, min: uiButtonMin, max: uiButtonMax });

})();
