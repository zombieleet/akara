"use strict";

const { request } = require("http");

const akara_emit = require("../js/emitter.js");

const ffmpeg = require("ffmpeg");

const {
    remote: {
        require: _require,
        BrowserWindow,
        dialog
    },
    ipcRenderer: ipc
} = require("electron");

const {
    playlist: {
        file: playlistLocation
    }
} = _require("./configuration.js");

const srt2vtt = require("srt2vtt");

const {
    CONVERTED_MEDIA,
    URL_ONLINE,
    DOWNLOADED_SUBTITLE,
    SIZE,
    MEASUREMENT
} = _require("./constants.js");

const {
    Magic,
    MAGIC_MIME_TYPE: _GET_MIME
} = require("mmmagic");

const env = require("dotenv").load();
const Twitter = require("twitter");
const bBird = require("bluebird");

const _OS = require("opensubtitles-api");
const url = require("url");
const { spawn } = require("child_process");

const {
    mkdirSync ,
    existsSync,
    readFileSync,
    writeFileSync
} = require("fs");

const {
    join,
    basename,
    parse
} = require("path");

const { video, controls: { play } } = require("../js/video_control.js");

const OS = new _OS("OSTestUserAgentTemp");

const { guessLanguage } = require("guesslanguage");

const magic = new Magic(_GET_MIME);

// get the main window only
const win = BrowserWindow.fromId(1);

const createEl = ({path: abs_path, _path: rel_path}) => {

    let lengthOfSib = document.querySelector(".akara-loaded").childElementCount;

    const child = document.createElement("li");
    const childchild = document.createElement("span");

    // nonsence
    //abs_path = URL.createObjectURL( new File([ dirname(abs_path) ] , basename(abs_path)) );

    abs_path = abs_path.replace(/^file:\/\//,"");

    child.setAttribute("data-full-path", url.format({
        protocol: "file",
        slashes: "/",
        pathname: abs_path
    }));

    child.setAttribute("id", `_${lengthOfSib++}`);

    child.classList.add("playlist");
    childchild.textContent = rel_path;
    child.appendChild(childchild);

    return child;
};

const removeType = (pNode,...types) => {
    Array.from(pNode.children, el => {
        types.forEach( type => el.hasAttribute(type)
            ? el.removeAttribute(type)
            : "");
    });
};




/**
 *
 *
 * if another video is playing
 * remove all setup from previous video
 * from playlist section
 *
 *
 *
 **/
const removeClass = (parentNode, ...types) => {
    Array.from(parentNode.children, el => {
        for ( let i of types ) {
            if ( el.classList.contains(i) ) el.classList.remove(i);
        }
    });
};





/**
 *
 * set the required attributes to indicate
 * a current playing video in the playlist
 *
 *
 *
 **/


const setCurrentPlaying = target => {


    /**
     *
     * incase target came from search
     * or any other place
     *
     **/

    if ( target.childElementCount === 0 ) {

        const loaded = document.querySelector(".akara-loaded");

        target = loaded.querySelector(`#${target.getAttribute("id")}`);

    }

    target.setAttribute("data-dbclicked", "true");
    target.setAttribute("data-now-playing", "true");
    target.setAttribute("data-clicked", "true");
    target.classList.add("fa");
    target.classList.add("fa-play-circle");

    updatePlaylistName(target);

    document.querySelector(".akara-title").textContent =  target.querySelector("span").textContent;

    video.setAttribute("data-id", target.getAttribute("id"));

    video.setAttribute("src", target.getAttribute("data-full-path"));

    return ;
};

const RESETTARGET = target => target.nodeName.toLowerCase() === "li" ? target : target.parentNode;

const removeTarget = (target,video) => {

    target = RESETTARGET(target);

    if ( decodeURI(video.src) === target.getAttribute("data-full-path") ) {

        let _target = target.nextElementSibling || target.parentNode.firstElementChild;

        if ( _target.parentNode.childElementCount === 1 ) {

            video.src = "";

            const play = document.querySelector("[data-fire=play]");

            const pause = document.querySelector("[data-fire=pause]");

            pause.classList.add("akara-display");

            play.classList.remove("akara-display");

            document.querySelector(".akara-title").textContent = "Akara Media Player";

        } else {
            video.src = _target.getAttribute("data-full-path");
            setCurrentPlaying(_target);
            video.play();
        }
    }
    target.remove();
    target = undefined;
    return ;
};

const __disable = (item,menuObject) => {
    if (  item === menuObject.label ) {
        menuObject.enabled = false;
    }
};

const disableMenuItem = (memItem,target,video) => {

    // if the label is play and the video is not paused
    // disable the label
    if ( memItem.label === "Play" && target.hasAttribute("data-now-playing") && ! video.paused)
        memItem.enabled = false;

    // if the label is pause and the video is paused
    // disable the label
    if ( memItem.label === "Pause" && target.hasAttribute("data-now-playing") && video.paused )
        memItem.enabled = false;

    // label is pause
    // but the target is not currently been played , disabled the label
    if ( memItem.label === "Pause" && ! target.hasAttribute("data-now-playing") )
        memItem.enabled = false;

    if ( memItem.label === "Repeat" && target.hasAttribute("data-repeat") )
        memItem.visible = false;

    if ( memItem.label === "No Repeat" && ! target.hasAttribute("data-repeat") )
        memItem.visible = false;


    if ( memItem.label === "Repeat All" && target.parentNode.hasAttribute("data-repeat") )
        memItem.visible = false;

    if ( memItem.label === "No Repeat All" && ! target.parentNode.hasAttribute("data-repeat") )
        memItem.visible = false;
};





/**
 *
 *
 * when a playlist video is clicked
 * do the neccessary setup and play video
 *
 **/
const setupPlaying = target => {

    const loaded = document.querySelector(".akara-loaded");

    removeClass(loaded,"fa","fa-play-circle");

    removeType(loaded,"data-dbclicked","data-now-playing","data-clicked");

    setCurrentPlaying(target);

    return play();
};





/**
 *
 *
 * prevNext, jump to next or previous video
 * during video navigation
 *
 **/
const prevNext = moveTo => {

    let target = document.querySelector("[data-now-playing=true]");

    if ( moveTo === "next" && target.nextElementSibling ) {
        return setupPlaying(target.nextElementSibling);
    }
    if ( moveTo === "prev" && target.previousElementSibling )
        return setupPlaying(target.previousElementSibling);
};

const createDir = () => mkdirSync(`${CONVERTED_MEDIA}`);

const getMime = file => new Promise((resolve,reject) => {
    magic.detectFile(file, (err,data) => {
        if ( err) return reject(err);
        return resolve(data);
    });
});

const validateMime = async (path) => {

    const _getMime = await getMime(path);

    if ( ! /^audio|^video/.test(_getMime) ) return undefined;

    const canPlay = video.canPlayType(_getMime);

    if ( /^maybe$|^probably$/.test(canPlay) ) return path;

    sendNotification("Invalid Mime", {
        body: "Unsupported Mime/Codec detected, this file will be converted in the background"
    });

    let _fpath;

    try {
        _fpath = await Convert(path);
    } catch(ex) {
        _fpath = ex;
    }

    if ( Error[Symbol.hasInstance](_fpath) )
        path = undefined;
    else
        path = _fpath;
    return path;
};

const Convert = _path => new Promise((resolve,reject) => {
    let result;

    // _fpath will contain the converted path
    const _fpath = join(CONVERTED_MEDIA,parse(_path).name + ".mp4");

    // if _fpath exists instead just resolve don't convert
    if ( existsSync(_fpath) ) {
        return resolve(_fpath);
    }

    const ffmpeg = spawn("ffmpeg", ["-i", _path , "-acodec", "libmp3lame", "-vcodec", "mpeg4", "-f", "mp4", _fpath]);

    ffmpeg.stderr.on("data", data => {});

    ffmpeg.on("close", code => {
        if ( code >= 1 )
            reject(new Error("Unable to Convert Video"));
        resolve(_fpath);
    });
});

const playOnDrop = () => {
    const firstVideoList = document.querySelector(".playlist");
    if ( ! video.getAttribute("src") ) {
        return setupPlaying(firstVideoList);
    }
};

const sendNotification = (title,message) => new Notification(title,message);

const disableVideoMenuItem = menuInst => {

    const toggleSubOnOff = document.querySelector("[data-sub-on]");

    const ccStatus = toggleSubOnOff.getAttribute("data-sub-on");

    if  ( ! video.hasAttribute("src") && menuInst.label !== "Add" ) {
        menuInst.enabled = false;
        return ;
    }

    if ( menuInst.label === "Play" && ! video.paused ) {
        menuInst.enabled = false;
        return ;
    }

    if ( menuInst.label === "Pause" && video.paused ) {
        menuInst.enabled = false;
        return ;
    }

    if ( menuInst.label === "Repeat" && video.hasAttribute("loop") ) {
        menuInst.visible = false;
        return ;
    }

    if ( menuInst.label === "No Repeat" && video.hasAttribute("loop") ) {
        menuInst.visible = true;
        return ;
    }

    if ( menuInst.label === "Subtitle" && ! navigator.onLine) {
        // optimize this code later
        disableNoConnection(menuInst, "Load Subtitle", "From Net").enabled = false;
        return ;
    }

    if ( menuInst.label === "Subtitle" && ccStatus === "false" ) {
        ccState(menuInst).enabled = false;
        return ;
    }

    if ( menuInst.label === "Subtitle" && ccStatus === "true" ) {
        ccState(menuInst).enabled = true;
        return ;
    }

    if ( menuInst.label === "Enter FullScreen" && win.isFullScreen() ) {
        menuInst.visible = false;
        return ;
    }

    if ( menuInst.label === "Leave FullScreen" && win.isFullScreen() ) {
        menuInst.visible = true;
        return ;
    }
};

const ccState = menuInst => {

    for ( let _mItem of menuInst.submenu.items ) {

        if ( _mItem.label === "Choose Subtitle" )

            return _mItem;

    }

};

const disableNoConnection = ( menu, match, submatch) => {

    let menuInst;

    for ( let _items of menu.items || menu.submenu.items ) {

        if ( _items.label === match && ! _items.__priv ) {
            // match is not neccessary here,
            //  since it's recurse function
            return disableNoConnection(_items,match,submatch);
        }
        if ( _items.label === submatch && _items.__priv ) {
            menuInst = _items;
            break;
        }
    }
    return menuInst;
};

const langDetect = (file) => {
    return new Promise((resolve,reject) => {
        guessLanguage.name(readFileSync(file).toString(), info => {
            resolve(info);
        });
    });
};

const checkValues = ({input,movie,series,season,episode}) => {
    if ( input.value.length === 0 ) {
        return "TEXT_LENGTH_GREAT";
    }
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
    if ( input.value.length > 0 &&
         ! series.checked && ! movie.checked ) {
        return "SERIES_MOVIE_NO_CHECKED";
    }
    if ( movie.checked ) {
        const query = input.value;
        return { query };
    }
};

const getSubtitle = async (option) => {

    let value = await JSON.parse(readFileSync("./testtest.json","utf-8"));

    return value;

    /*let value;
    try {
        value = await OS.search(option);
    } catch(ex) {
        value = ex;
    }
    return value;*/
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
    default:
        i = 0;

    }

    if ( i === 1 ) return false;

    return true;
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

    // create download td
    td = document.createElement("td");
    td.setAttribute("class", "table-data download");
    td.setAttribute("data-url", __url);

    // create download icon
    const download = document.createElement("i");
    download.setAttribute("class", "fa fa-download");
    td.appendChild(download);

    subtitle.appendChild(td);
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

        if ( keys === "url" ) continue;

        if ( ! skipUnwanted(keys) ) continue ;

        tr.appendChild(setUpTableHeadersContent(keys));
    }

    tr.appendChild(setUpTableHeadersContent("download"));

    thead.appendChild(tr);

    return thead;
};

const styleResult = value => {

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

let INTERVAL_COUNT = 0;

const intervalId = (loaded) => {

    const intId = setInterval( () => {
        console.log(INTERVAL_COUNT);
        if ( loaded.getAttribute("hidden") ) return clearInterval(intId);

        if ( INTERVAL_COUNT === 30 ) {

            loaded.innerHTML = "Connection is taking too long";

            INTERVAL_COUNT++;

        } else if ( INTERVAL_COUNT === 60 ) {

            loaded.innerHTML = "Giving Up. Check Your Internet Speed";

            clearInterval(intId);

            INTERVAL_COUNT = 0;

        } else {

            INTERVAL_COUNT++;

        }

    },5000);

    return intId;
};

const errorCheck = (err,loaded) => {
    INTERVAL_COUNT = 0;
    if ( Error[Symbol.hasInstance](err) ) {
        loaded.innerHTML = "Cannot connect to subtitle server";
        return true;
    }
    return false;
};

const isOnline = () => new Promise((resolve,reject) => {

    const options = {
        protocol: "http:",
        host: URL_ONLINE,
        method: "GET"
    };

    const req = request(options, resp => {

        let _data = Buffer.from("");

        resp.on("data", data => {
            _data = Buffer.concat([_data,data]);
        });

        resp.on("end", data => {
            if ( _data.length > 0 ) {
                resolve("hi");
            }
        });

        resp.on("error", err => {
            reject("no");
        });

    });

    req.end();
});

const readSubtitleFile = path => new Promise((resolve,reject) => {
    const _path = join(CONVERTED_MEDIA,basename(path).replace(".srt", ".vtt"));
    const data = readFileSync(path);
    srt2vtt(data, (err,vttData) => {
        if ( err ) return reject(err);
        writeFileSync(_path, vttData);
        return resolve(_path);
    });
});

const getMetaData = async () => {

    const url = decodeURIComponent(localStorage.getItem("currplaying")).replace("file://","");

    const metadata = new ffmpeg(url);

    let result;

    try {
        ({ metadata: result }= await metadata);
        localStorage.removeItem("currplaying");
    } catch(ex) {
        console.log(ex);
        result = ex;
    }
    return result;
};

const makeDynamic = (el,i) => {
    if ( i === 1 ) {
        el.setAttribute("data-dynamic-style", "true");
        i = 0;
    } else {
        el.removeAttribute("data-dynamic-style");
        i = 1;
    }
    return i;
};





/**
 *
 *
 * saves a playlist 
 * key is the name to saveplaylist with
 * files, an array of files
 * notify, is either true or false
 *    to notify if saved or not
 *
 **/


const playlistSave = (key, files, notify) => {

    const list = require(playlistLocation);

    let savedList = list[key] || [];

    for ( let __list of files ) {
        savedList.push(__list);
    }

    savedList = savedList.sort().filter(
        (value,index,array) => value !== array[++index]
    );

    Object.assign(list, {
        [key]: savedList
    });

    writeFileSync(playlistLocation, JSON.stringify(list));

    if ( ! notify )
        return ;

    sendNotification("Playlist Saved", {
        body: "Playlist is saved"
    });

    return ;

};





/**
 *
 *
 * loads a playlist saved with listName
 * it returns the items in listName
 *
 **/

const playlistLoad = listName => {

    if ( typeof(listName) !== "string" )

        throw TypeError(`expected string as listName but got ${typeof(listName)}`);

    const list = require(playlistLocation);


    if ( !( listName in list) )
        return dialog.showErrorBox(
            "unable to load playlist",
            `${listName} could not be loaded`
        );

    let playlistList = list[listName];

    const validPlaylist = playlistList.filter( list => {

        if ( existsSync(decodeURIComponent(list.replace(/^file:\/\//,""))) )
            return list;
        else
            return dialog.showErrorBox("Playlist location not found",`path to ${list} was not found`);
    });

    return validPlaylist;
};





/**
 *
 *
 * deletes playlist and write to
 * the config file
 *
 **/

const deletePlaylist = listName => {

    if ( typeof(listName) !== "string" )
        throw TypeError(`expected string as listName but got ${typeof(listName)}`);

    let list = require(playlistLocation);

    if ( !( listName in list) )
        return false;

    delete list[listName];

    if ( Object.keys(list).length === 0 )
        list = {};

    writeFileSync(playlistLocation, JSON.stringify(list));

    return true;
};

const selectMultipe = listLoadParent => {

    listLoadParent.addEventListener("click", evt => {

        let target = evt.target;

        const _case = target.nodeName.toLowerCase();

        if ( _case === "ul"  ) return false;

        target = _case === "li" ? target : target.parentNode;



        /**
         *
         * clicked li already has data-load just remove it
         *  as a sign of unclick
         *
         **/

        if ( target.hasAttribute("data-load") ) {
            return target.removeAttribute("data-load");
        }


        /**
         *
         *
         * if ctrlKey is not held down
         * with a left click
         * remove all li element marked with data-load=multiple
         *
         **/

        if ( ! evt.ctrlKey ) {
            removeSelections();
            return target.setAttribute("data-load", "single");
        }


        /**
         *
         * setup multiple selection
         * turn single selection to multiple selection
         *
         **/

        const single = document.querySelector("[data-load=single]");

        target.setAttribute("data-load", "multiple");

        if ( single )
            single.setAttribute("data-load", "multiple");

        return true;

    });
};

const removeSelections = () => {

    Array.from(
        document.querySelectorAll("[data-load]"),
        el => {

            if ( el.getAttribute("data-load") === "multiple" ) {
                el.removeAttribute("data-load");
                return ;
            }

            /**
         *
         * avoid double data-load=single
         *
         **/

            if ( el.getAttribute("data-load") === "single" ) {
                el.removeAttribute("data-load");
                return ;
            }

        });
};





/**
 *
 *
 * renders all playlist name and total
 *   list item to the dom
 *
 **/

const renderPlayList = type => {

    const loadplaylist = document.querySelector(`.${type}`);

    const list = require(playlistLocation);

    if ( ! loadplaylist )
        return false;

    if ( Object.keys(list).length === 0 ) {

        const p = document.createElement("p");

        p.textContent = "No Playlist have been created";

        p.setAttribute("class", "no-loadplaylist");

        document.querySelector("button").hidden = true;
        
        loadplaylist.appendChild(p);

        return false;
    }

    const ul = document.createElement("ul");

    let  noP = loadplaylist.querySelector(".no-loadplaylist");

    if ( noP )

        noP.remove();

    noP = undefined;

    let i = 0;

    for ( let __list of Object.keys(list) ) {

        const li = document.createElement("li");
        const p = document.createElement("p");

        const numlist = document.createElement("span");

        p.textContent = __list;

        numlist.textContent = `${list[__list].length} files`;

        i = makeDynamic(li,i);

        li.setAttribute("class", "loadplaylist-item");

        li.setAttribute("data-capture", __list);


        li.appendChild(p);
        li.appendChild(numlist);
        ul.appendChild(li);
    }

    loadplaylist.appendChild(ul);

    return selectMultipe(ul);
};

const updatePlaylistName = target => {
    const playlistEl = document.querySelector(".playlist-name");
    playlistEl.innerHTML = target.getAttribute("data-belongsto-playlist");
    return true;
};

const triggerNotArrow = () => {

    const findings = document.querySelector(".findings");

    if ( ! findings || ! findings.hasChildNodes() ) return false;

    let el = findings.querySelector("[data-navigate=true]");

    return [ findings, el ];
};


const handlePlaySearchResult = () => {

    const val = triggerNotArrow();

    if ( ! val )
        return false;

    const [ , el ] = val;

    if ( el ) {
        setupPlaying(el);
        document.querySelector(".search-parent").remove();
    }
    return true;
};


/**
 *
 *
 *
 * handleArrowkeys, this function makes sure that
 *   arrowup and arrowdown key are not trigerred
 *   in some cases to avoid errors
 *
 *
 **/

const handleArrowKeys = () => {

    const val = triggerNotArrow();

    if ( ! val )  return false;

    let [ findings, el ] = val;

    if ( ! el ) {
        findings.children[0].setAttribute("data-navigate", "true");
        el = findings.children[0];
    }
    return el;
};

                
const tClient = bBird.promisifyAll(
    new Twitter({
        consumer_key: process.env.AKARA_CONSUMER_KEY,
        consumer_secret: process.env.AKARA_CONSUMER_SECRET,
        access_token_key: process.env.AKARA_ACCESS_TOKEN_KEY,
        access_token_secret: process.env.AKARA_ACCESS_TOKEN_SECRET
    })
);

module.exports = {
    createEl,
    removeTarget,
    removeClass,
    removeType,
    setCurrentPlaying,
    disableMenuItem,
    setupPlaying,
    prevNext,
    validateMime,
    playOnDrop,
    disableVideoMenuItem,
    disableNoConnection,
    langDetect,
    getMime,
    checkValues,
    getSubtitle,
    styleResult,
    intervalId,
    errorCheck,
    isOnline,
    readSubtitleFile,
    sendNotification,
    getMetaData,
    makeDynamic,
    playlistSave,
    updatePlaylistName,
    triggerNotArrow,
    handlePlaySearchResult,
    handleArrowKeys,
    playlistLoad,
    renderPlayList,
    deletePlaylist,
    tClient
};
