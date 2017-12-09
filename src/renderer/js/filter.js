; ( () => {
    "use strict";

    const {
        ipcRenderer: ipc,
        remote: {
            getCurrentWindow,
            require: _require
        }
    } = require("electron");

    const { requireSettingsPath } = _require("./constants.js");
    const fs = require("fs");
    
    const akara_emit = require("../js/emitter.js");
    

    const progress = document.querySelector("progress");


    const saveFilters = async (filterConfig) => {
        const filterSettingsPath = await requireSettingsPath("filter.json");
        const filterSettings = require(filterSettingsPath);

        Object.assign(filterSettings, filterConfig);
        
        fs.writeFileSync(filterSettingsPath, JSON.stringify(filterSettings));
    };

    const handleFilters = async (evt,dir,cb) => {
        
        const target = evt.target;
        const pNode = target.parentNode;

        const progressParent = pNode.querySelector(".progress-parent");
        const progressBar = pNode.querySelector(".progress-bar");

        const progressBarInPercent = ( progressBar.clientWidth / progressParent.clientWidth ) * 100;

        if ( cb(progressBarInPercent) )
            return ;
        
        const filterType = pNode.getAttribute("data-filter-type");
        const measurement = pNode.getAttribute("data-measurement");
        let progressBarWidth = isNaN(parseInt(progressBar.style.width))
            ? 0
            : parseInt(progressBar.style.width);
        
        progressBar.style.width = ( dir === "incr"  ? progressBarWidth + 1 : progressBarWidth  - 1 ) + "%";
        
        if ( filterType === "brightness")
            progressBarWidth /= 10;
        
        ipc.sendTo(1, "akara::video:filter", { filterType, progressBarWidth, measurement });
        
        saveFilters({ [filterType]: { progressBarWidth, measurement } });
        
        return ;
    };

    const resetFilters = async (evt) => {
        
        const filterSettingsPath = await requireSettingsPath("filter.json");
        const filterSettings = require(filterSettingsPath);
        
        let target = evt.target;
        let pNode = target.parentNode;
        let progressBar = pNode.querySelector(".progress-bar");

        
        let filterType = pNode.getAttribute("data-filter-type");
        
        if ( Object.keys(filterSettings).indexOf(filterType) >= 0 ) {
            
            /**TODO: 
               do not DELETE but RESET to default html5 values of video filters
            **/
            delete filterSettings[filterType];
            
            progressBar.style.width = null;
            
            ipc.sendTo(1,"akara::video:filter:reset", filterType);
            
            saveFilters(filterSettings);
        }
    };

    const resetAllFilters = async (evt) => {

        const filterSettingsPath = await requireSettingsPath("filter.json");
        const filterSettings = require(filterSettingsPath);
        
        Object.keys(filterSettings).forEach( filter => {
            
            let filterType = document.querySelector(`[data-filter-type=${filter}]`);
            filterType.querySelector(".progress-bar").style.width = null;

            /**TODO: 
               do not DELETE but RESET to default html5 values of video filters
            **/
            delete filterSettings[filterType];
            saveFilters(filterSettings);
        });
        
        ipc.sendTo(1,"akara::video:filter:reset:all");
        
    };
    
    document.body.addEventListener("mousedown", evt => {
        let target = evt.target;

        if ( target.classList.contains("pgress-ctrl-incr") )
            return handleFilters(evt,"incr",pBar => pBar === 100 );
        else if ( target.classList.contains("pgress-ctrl-decr") )
            return handleFilters(evt,"decr",pBar => pBar ===  0);
        else if ( target.classList.contains("reset") )
            return resetFilters(evt);
        else if ( target.classList.contains("filter-close") )
            return getCurrentWindow().close();
        else if ( target.classList.contains("filter-reset") )
            return resetAllFilters(evt);
        
        return false;
    });

    document.querySelector(".filter-close")
        .addEventListener("click", () => getCurrentWindow().close());

        
    window.addEventListener("DOMContentLoaded", async () => {
        
        const filterSettingsPath = await requireSettingsPath("filter.json");
        const filterSettings = require(filterSettingsPath);

        Object.keys(filterSettings).forEach( filter => {
            const filterType = document.querySelector(`[data-filter-type=${filter}]`);
            const progressBar = filterType.querySelector(".progress-bar");
            progressBar.style.width = filterSettings[filter].progressBarWidth + "%";
        });
    });
    
})();
