( () => {

    "use strict";

    const {
        ipcRenderer: ipc,
        remote: {
            BrowserWindow,
            getCurrentWindow,
            require: _require
        }
    }  = require("electron");

    const fs = require("fs");
    const url = require("url");
    const path = require("path");
    
    const {
        getSubtitle,
        isOnline,
        OS,
        downloadWindow,
        downloadFile
    } = require("../js/util.js");

    const akara_emit =  require("../js/emitter.js");

    const movie = document.querySelector("#movies");
    const series = document.querySelector("#series");
    const button = document.querySelector("button");
    const season = document.querySelector("#season");
    const episode = document.querySelector("#episode");
    const input = document.querySelector(".subtitle-form-input");
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
            result = await getSubtitle({query,season,episode});
        } else {
            result = await getSubtitle({query});
        }
        return styleResult(result);
    };

    const styleResult = value => {

        if ( Error[Symbol.hasInstance](value) ) {
            loaded.innerHTML = "Cannot connect to subtitle server";
            return true;
        }

        if ( Object.keys(value).length === 0 ) {
            loaded.innerHTML = "Cannot find required subtitle";
            return true;
        }

        loaded.hidden = true;

        const subtitleListParent = document.querySelector(".subtitle-loaded");
        const subtitleParent = document.createElement("table");

        let idx = 1;
        
        subtitleParent.appendChild(createTableHeaders(value));

        for ( let [ key, values ] of Object.entries(value)) {
            //const { lang, encoding, url, langcode } = values;
            createSubtitleEl(subtitleParent,idx++,values);
        }
        return subtitleListParent.appendChild(subtitleParent);
    };

    const createSubtitleEl = (parent,idx,value) => {

        const subtitle = document.createElement("tr");

        subtitle.setAttribute("class","subtitle-item");

        if ( (idx & 1) === 0 ) {
            subtitle.classList.add("subtitle-color-item");
        }

        let i = 0;

        const keys = Object.keys(value);

        let __url ;
        // create subtitle numbering
        let td = document.createElement("td");
        td.setAttribute("class", "subtitle-number");
        td.innerHTML = idx;

        subtitle.appendChild(td);

        while (  i < keys.length ) {

            const _value = value[keys[i]];

            if ( ! skipUnwanted(keys[i]) ) {
                i++;
                continue ;
            }

            td = document.createElement("td");
            if ( keys[i] === "url" ) {

                __url = _value;

                i++;
                continue;
            }

            td.setAttribute("class", "table-data");
            td.innerHTML = _value;
            subtitle.appendChild(td);
            i++;
        }

        td.addEventListener("click", () => {

            let win = downloadWindow();

            downloadFile(__url,win);

            akara_emit.once("download::complete", fpath => {
                console.log("sent");
                ipc.sendTo(1,"subtitle::load-sub", "net", fpath);
            });
        });

        return parent.appendChild(subtitle);
    };

    const setUpTableHeadersContent = content => {
        const th = document.createElement("th");
        th.setAttribute("class", "table-headers");
        th.innerHTML = content;
        return th;
    };

    const createTableHeaders = values => {

        const tr = document.createElement("tr");
        const thead = document.createElement("thead");
        const [ , [ , _value ] ] = Object.entries(values);

        tr.appendChild(setUpTableHeadersContent("s/n"));

        for ( let keys of Object.keys(_value) ) {

            if ( keys === "url" )
                continue;

            if ( ! skipUnwanted(keys) )
                continue ;

            tr.appendChild(setUpTableHeadersContent(keys));
        }

        thead.appendChild(tr);

        return thead;
    };


    const skipUnwanted = key => {

        let i = 0;

        switch (key) {

        case "score":
            i = 1;
            break;
        case "downloads":
            i = 1;
            break;
        case "langcode":
            i = 1;
            break;
        case "id":
            i = 1;
            break;
        default:
            i = 0;

        }

        if ( i === 1 )
            return false;

        return true;
    };


    const checkValues = ({input,movie,series,season,episode}) => {

        if ( input.value.length === 0 )
            return "TEXT_LENGTH_GREAT";

        if ( series.checked ) {
            if ( isNaN(season.value) || season.value.length === 0 ) {
                return "SEASON_INVALID";
            }
            if ( isNaN(episode.value) || episode.value.length === 0 )  {
                return "EPISODE_INVALID";
            }
            const query = input.value;
            season = season.value;
            episode = episode.value;
            return { query, season, episode };
        }

        if ( input.value.length > 0 && ! series.checked && ! movie.checked ) {
            return "SERIES_MOVIE_NO_CHECKED";
        }

        if ( movie.checked ) {
            const query = input.value;
            return { query };
        }

        return undefined;
    };



    close.addEventListener("click", () => getCurrentWindow().close());

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

            if ( typeof(value) === "object" ) {

                let table = document.querySelector("table");

                if ( table ) {
                    table.remove();
                    loaded.hidden = false;
                }
                loaded.innerHTML = "Loading...";
                const {query,season,episode} = value;
                handleSearch(value);
            }

        }

    });

    ipc.on("akara::media:file", async (evt,videoPath) => {
        videoPath = url.parse(videoPath);
        input.disabled = false;
        input.value = path.parse(videoPath.pathname).name;
        loaded.innerHTML = "Loading...";
        styleResult(await getSubtitle({ hash: await OS.hash(videoPath.pathname).moviehash}));
    });
    
    ipc.sendTo(1, "akara::send:media:file", getCurrentWindow().webContents.id);

})();
