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



    const uiButtonMin = document.querySelector(".window-min");
    const uiButtonMax = document.querySelector(".window-max");
    const uiButtonClose = document.querySelector(".window-close");

    const uiButtonsParent = document.querySelector(".ui_button-parent");


    const saveFont = evt => {
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
                file.forEach( f => {
                    console.log(f);
                });
            });
        });
        
        evt.target.style.display = "none";
        
    };
    
    
    uiButtonsParent.addEventListener("mousemove", async (evt) => {
        
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

        const uibuttons = await requireSettingsPath("uibuttons.json");
        const uibuttonsSettings = require(uibuttons);

        const fntparent = document.createElement("ul");
        
        fntparent.classList.add("fnt_parent");
        
        FONTS[fonttype].forEach( fnt => {

            const fntchild = document.createElement("li");
                       
            if ( fnt === uibuttonsSettings[category][fonttype] ) {
                fntchild.setAttribute("data-fnt_active", "true");
            }
            
            fntchild.setAttribute("class", `fa ${fnt}`);
            fntchild.setAttribute("data-fnt_type", fnt);
            fntchild.addEventListener("click", saveFont);
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
        
        
        if ( fntparent )
            fntparent.remove();
    });
    

    handleWindowButtons({ close: uiButtonClose, min: uiButtonMin, max: uiButtonMax });

})();
