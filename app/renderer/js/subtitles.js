( () => {
    "use strict";
    const {
        ipcRenderer: ipc,
        remote: {
            BrowserWindow,
            require: _require
        }
    }  = require("electron");

    const {
        createNewWindow
    } = _require("./newwindow.js");
    
    const {
        join
    } = require("path");
    
    const {
        existsSync,
        mkdirSync
    } = require("fs");
    
    const {
        checkValues,
        GetSubTitle,
        StyleResult,
        intervalId,
        ErrorCheck,
        isOnline,
        downloadURL
    } = require("../js/util.js");

    const akara_emit =  require("../js/emitter.js");
    
    const movie = document.querySelector("#movies");
    const series = document.querySelector("#series");
    const button = document.querySelector("button");
    const season = document.querySelector("#season");
    const episode = document.querySelector("#episode");
    const input = document.querySelector(".subtitle-input");
    const loaded = document.querySelector(".subtitle-info");
    const close = document.querySelector(".subtitle-close");
    
    const handleSearch = async (value,_id) => {

        const { query, season, episode } = value;
        
        let result;
        
        if ( series.checked ) {
            // that means series was checked
            result = await GetSubTitle({query,season,episode});
        } else {
            // movies was checked
            result = await GetSubTitle({query});
        }
        
        if ( ! noNetwork({result,_id}) ) return StyleResult();

    };

    const noNetwork  = ({result,_id}) => {
        if ( ErrorCheck(result,loaded) ) {
            clearInterval(_id);
            return true;
        }
        loaded.setAttribute("hidden", "true");
        return false;
    };
    const validateSubtitle = (value) => {

        if ( typeof(value) === "object" ) {

            loaded.innerHTML = "Loading...";

            const {query,season,episode} = value;

            const _id = intervalId(loaded);

            return handleSearch(value,_id);
        }
    };
    
    close.addEventListener("click", () => {
        ipc.send("close-subtitle-window");
    });
    
    movie.addEventListener("change", () => {
        console.log(movie.checked);
    });
    series.addEventListener("change", () => {
        let sOption = document.querySelector(".series-option");
        if ( series.checked ) {
            sOption.removeAttribute("hidden");
            return sOption.setAttribute("style", "display: inline;");
        }
        sOption.removeAttribute("style");
        return sOption.setAttribute("hidden", "true");
    });

    button.addEventListener("click", e => {

        e.preventDefault();

        const value = checkValues({input,movie,series,season,episode});

        switch ( value ) {
        case "TEXT_LENGTH_GREAT":
            loaded.innerHTML = "Search field is empty";
            break;
        case "SEASON_INVALID":
            loaded.innerHTML = "Season value is invalid";
            break;
        case "EPISODE_INVALID":
            loaded.innerHTML = "Episode value is invalid";
            break;
        case "SERIES_MOVIE_NOT_CHECKED":
            loaded.innerHTML = "Search type is not checked";
            break;
        default:
            validateSubtitle(value);
        }

    });
})();
