( () => {

    "use strict";

    const {
        remote: {
            dialog
        }
    }  = require("electron");
    
    const playlistWidget = document.querySelector(".playlist-widget");

    const handlePlayListOptions = Object.defineProperties({}, {
        
        __removeList: {
            
            value() {
                
                let list = document.querySelectorAll("li[data-full-path]");

                if ( ! list ) return false;

                Array.from(list, el => {
                    el.remove();
                });

                document.querySelector("video").src = "";
                document.querySelector(".akara-title").textContent = "Akara Media Player";

                return true;
            },
            enmerable: false,
            writable: false,
            configurable: false
        },
        removeplaylist: {
            
            value() {
                
                dialog.showMessageBox({
                    type: "info",
                    message: `Delete ${document.querySelector(".playlist-name").textContent} from list of playlist`,
                    buttons: [ "Cancel", "Yes", "No"]
                }, btn => {
                    if ( btn === 0 ) {
                        return false;
                    } else if ( btn == 1 ) {
                        
                        /**
                         *
                         * remove playlist from list of playlist
                         * and from loaded sectoin
                         *
                         *
                         **/

                        this.__removeList();
                        
                    } else {
                        
                        /**
                         *
                         * At this point btn is 2
                         * remove all elements in akara-loaded section
                         * 
                         **/
                        this.__removeList();

                    }
                    
                    return true ;
                });
            }
        }
    });

    playlistWidget.addEventListener("mouseover", evt => {

        const target = evt.target;

        /**
         *
         * avoid the parent of the widgets to trigger anything
         *
         **/

        if ( target.nodeName.toLowerCase() === "div" ) return false;
        
        const toolTip = target.getAttribute("data-title");

        const xAxis = evt.clientX - target.parentNode.getBoundingClientRect().left;
        const yAxis = evt.clientY - target.parentNode.getBoundingClientRect().top;

        const toolTipEl = document.createElement("span");

        toolTipEl.textContent = toolTip;
        
        toolTipEl.setAttribute("class", "tool-tip");
        toolTipEl.setAttribute("style",`position: absolute; top: ${yAxis + 70}px; left: ${xAxis}px;`);

        target.parentNode.appendChild(toolTipEl);
        
        return true;
    });

    playlistWidget.addEventListener("mouseout", evt => {
        
        const target = evt.target.nodeName.toLowerCase() === "div"
            ? evt.target
            : evt.target.parentNode;
        let el;
        
        if ( ( el = target.querySelector(".tool-tip") ) )
            el.remove();
        
        return ;
    });


    playlistWidget.addEventListener("click", evt => {

        const target = evt.target.nodeName.toLowerCase() === "div" ? undefined : evt.target;

        if ( ! target ) return false;

        const title = target.getAttribute("data-title");

        handlePlayListOptions[title.replace(/\s+/, "")]();
    });
})();
