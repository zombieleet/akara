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
        getSubtitle,
        styleResult,
        intervalId,
        errorCheck,
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
    const section = document.querySelector("section");



    
    /**
     *
     *
     * handleSearch calls the getSubtitle function 
     *   to retrieve the subtitle file and
     *   also calls the styleResult to render the result
     *
     **/


    
    const handleSearch = async (value,_id) => {

        const {
            query,
            season,
            episode
        } = value;

        let result;

        if ( series.checked ) {
            // that means series was checked
            result = await getSubtitle({query,season,episode});
        } else {
            // movies was checked
            result = await getSubtitle({query});
        }

        if ( ! noNetwork({result,_id}) )
            return styleResult(result);

    };



    
    /**
     *
     * if there is an error in retrieving the subtitle file
     *   we assume there was a network error
     *
     **/
    
    const noNetwork  = ({result,_id}) => {
        if ( errorCheck(result,loaded) ) {
            clearInterval(_id);
            return true;
        }
        loaded.setAttribute("hidden", "true");
        return false;
    };



    
    /**
     *
     *
     * validates the return value of the users inputs
     * which is assigned to an object
     *
     **/
    
    const validateSubtitle = value => {

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



    /**
     *
     *
     * calls checkValues to handle what the user is searching for
     *
     **/


    
    button.addEventListener("click", async (e) => {

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


    
    /**
     *
     * when download icon is clicked
     * the url of the subtitle is saved in the 
     *   localStorage with key "url"
     *  a new window is then created
     *
     **/


    
    section.addEventListener("click", event => {
        const target = event.target;

        if ( ! target.hasAttribute("data-url") ) return false;

        const url = target.getAttribute("data-url");

        const __obj = {
            title: "download",
            width: 365,
            height: 315
        };

        const html = `${__obj.title}.html`;

        createNewWindow(__obj,html);

        localStorage.setItem("url", url);
    });

})();
