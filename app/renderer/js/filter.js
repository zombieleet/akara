( () => {
    "use strict";
    
    window.addEventListener("DOMContentLoaded", () => {

        let allFilters = localStorage.getItem("filters");

        if ( ! allFilters )
            return ;

        allFilters = JSON.parse(allFilters);

        Object.keys(allFilters).forEach( filter => {
            const filterType = document.querySelector(`[data-filter-type=${filter}]`);
            const progressBar = filterType.querySelector(".progress-bar");
            progressBar.style.width = allFilters[filter].progressBarWidth + "%";
        });
    });

    const {
        ipcRenderer: ipc,
        remote: {
            getCurrentWindow
        }
    } = require("electron");

    const akara_emit = require("../js/emitter.js");

    const progress = document.querySelector("progress");

    const handleFilters = (evt,dir,cb) => {

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

        let prevFilters = localStorage.getItem("filters");

        if ( ! prevFilters ) {
            localStorage.setItem("filters", JSON.stringify( { [filterType]: { progressBarWidth } } ));
            return ;
        }

        prevFilters = Object.assign(JSON.parse(prevFilters), {
            [filterType]: { progressBarWidth }
        });
        
        localStorage.setItem("filters", JSON.stringify(prevFilters));
        return ;
    };

    const resetFilters = (evt) => {
        let target = evt.target;
        let pNode = target.parentNode;
        let progressBar = pNode.querySelector(".progress-bar");

        let allFilters = localStorage.getItem("filters");

        if ( ! allFilters )
            return ;

        allFilters = JSON.parse(allFilters);
        
        let filterType = pNode.getAttribute("data-filter-type");
        
        if ( Object.keys(allFilters).indexOf(filterType) >= 0 ) {
            delete allFilters[filterType];
            localStorage.setItem("filters", JSON.stringify(allFilters));
            progressBar.style.width = null;
            ipc.sendTo(1,"akara::video:filter:reset", filterType);
        }
    };

    const resetAllFilters = evt => {

        let allFilters = localStorage.getItem("filters");

        if ( ! allFilters )
            return ;

        Object.keys(JSON.parse(allFilters)).forEach( filter => {
            let filterType = document.querySelector(`[data-filter-type=${filter}]`);
            filterType.querySelector(".progress-bar").style.width = null;
        });
        
        ipc.sendTo(1,"akara::video:filter:reset:all");
        localStorage.removeItem("filters");
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

})();
