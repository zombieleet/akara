/* AKM is a highly customizable media player built with electron
   Copyright (C) 2016  Victory Osikwemhe (zombieleet)

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/


; ( () => {

    "use strict";

    const {
        ipcRenderer: ipc,
        remote: {
            BrowserWindow,
            getCurrentWindow,
            require: _require
        }
    }  = require("electron");

    const {
        getSubtitle,
        isOnline,
        OS,
        computeByte,
        sendNotification
    } = require("../js/Util.js");


    const fs    = require("fs");
    const url   = require("url");
    const path  = require("path");

    const movie      = document.querySelector(".subtitle-movie-checkbox");
    const series     = document.querySelector(".subtitle-series-checkbox");
    const search     = document.querySelector(".subtitle-search-net");
    const season     = document.querySelector("#season");
    const episode    = document.querySelector("#episode");
    const searchBox  = document.querySelector(".subtitle-form-input");
    const loaded     = document.querySelector(".subtitle-info");
    const close      = document.querySelector(".subtitle-close");
    const section    = document.querySelector("section");


    const ipcMessageHandlers = Object.defineProperties({}, {

        downloadStarted: {

            value( { td , evt , item , url }) {

                let downloadSubtitlePSpinner = td.querySelector(".subtitle-downloading");

                if ( downloadSubtitlePSpinner )
                    return;
                else if ( ! downloadSubtitlePSpinner ) {
                    downloadSubtitlePSpinner = document.createElement("div");
                    downloadSubtitlePSpinner.setAttribute("class", "subtitle-downloading");
                }

                const downloadSubtitleSpinner = document.createElement("i");

                td.classList.add("subtitle_no_click");

                downloadSubtitlePSpinner.setAttribute("class", "subtitle-downloading");
                downloadSubtitleSpinner.setAttribute("class", "fa fa-2x fa-spinner fa-spin");

                downloadSubtitlePSpinner.appendChild(downloadSubtitleSpinner);
                td.appendChild(downloadSubtitlePSpinner);
            }
        },

        downloadCompleted: {
            value({ td , evt , fpath }) {
                td.querySelector(".subtitle-downloading").remove();
                td.classList.remove("subtitle_no_click");
                ipc.sendTo(1,"subtitle::load-sub", "net", fpath);
                sendNotification({ title: "Subtitle" , message: "Done Downloading Subtitle"});
            }
        }
    });


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
            season$,
            episode$
        } = value;

        let result;

        if ( series.hasAttribute("data-checked") ) {
            result = await getSubtitle({query,season$,episode$});
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

        // add click event to the last cell in this row

        td.addEventListener("click", () => {

            if ( td.classList.contains("subtitle_no_click") ) return;

            ipc.once("download::started", (evt,item,url) => ipcMessageHandlers.downloadStarted({td,evt,item,url}));
            ipc.once("download::complete", ( evt , fpath ) => ipcMessageHandlers.downloadCompleted({td,fpath}));

            ipc.on("download::state", ( evt , state ) => {});
            ipc.on("download::totalbyte", ( evt , tbyte ) => {});
            ipc.on("download::gottenByte", ( evt , recievedBytes ) => {});
            ipc.on("download::computePercent", (evt,rBytes,tBytes) => {});

            const { webContents } = getCurrentWindow();
            ipc.send("download::init", __url , webContents.id );
        });

        subtitle.setAttribute("data-subtitle-url",`sub${__url.replace(/.*\//, "")}`);
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
        case "downloads":
        case "langcode":
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


    const checkValues = () => {

        if ( searchBox.value.length === 0 )
            return "TEXT_LENGTH_GREAT";

        if ( series.hasAttribute("data-checked") ) {
            if ( isNaN(season.value) || season.value.length === 0 ) {
                return "SEASON_INVALID";
            }
            if ( isNaN(episode.value) || episode.value.length === 0 )  {
                return "EPISODE_INVALID";
            }

            const query    = searchBox.value,
                  season$  = season.value,
                  episode$ = episode.value;
            console.log(season$, episode$);
            return { query, season$, episode$ };
        }

        if ( searchBox.value.length > 0 && ! series.hasAttribute("data-checked") && ! movie.hasAttribute("data-checked") ) {
            return "SERIES_MOVIE_NO_CHECKED";
        }

        if ( movie.hasAttribute("data-checked") ) {
            const query = searchBox.value;
            return { query };
        }

        return undefined;
    };


    close.addEventListener("click", () => getCurrentWindow().close());

    movie.parentNode.addEventListener("click", () => {

        let sOption = document.querySelector(".series-option");

        if ( movie.hasAttribute("data-checked") )
            return;

        series.removeAttribute("data-checked");
        series.classList.remove("fa-check-circle");
        series.classList.add("fa-circle");

        sOption.setAttribute("style", "display: none;");

        movie.classList.add("fa-check-circle");
        movie.classList.remove("fa-circle");
        movie.setAttribute("data-checked", "checked");
    });

    series.parentNode.addEventListener("click", () => {

        let sOption = document.querySelector(".series-option");

        if ( series.hasAttribute("data-checked") )
            return;

        sOption.removeAttribute("hidden");
        sOption.setAttribute("style", "display: inline;");

        series.setAttribute("data-checked", "checked");
        series.classList.add("fa-check-circle");
        series.classList.remove("fa-circle");

        movie.removeAttribute("data-checked");
        movie.classList.remove("fa-check-circle");
        movie.classList.add("fa-circle");
        return;
    });


    /**
     *
     *
     * calls checkValues to handle what the user is searching for
     *
     **/

    search.addEventListener("click", async (e) => {

        e.preventDefault();

        const value = checkValues();

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
                console.log(value);
                handleSearch(value);
            }

        }

    });

    ipc.on("akara::media:file", async (evt,videoPath) => {
        if ( ! videoPath )
            return ;
        videoPath = url.parse(videoPath);
        videoPath.pathname = decodeURIComponent(videoPath.pathname);
        searchBox.disabled = false;
        searchBox.value = path.parse(videoPath.pathname).name;
        loaded.innerHTML = "Loading...";
        styleResult(await getSubtitle({ hash: await OS.hash(videoPath.pathname).moviehash}));
    });

    ipc.sendTo(1, "akara::send:media:file", getCurrentWindow().webContents.id);

})();
