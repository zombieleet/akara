"use strict";

const { request } = require("http");
const akara_emit = require("../js/emitter.js");
const ffmpeg = require("ffmpeg");
const srt2vtt = require("srt2vtt");
const m3u8 = require("m3u8");
const m3ureader = require("m3u8-reader");
const xmlbuilder = require("xmlbuilder");
const xml2js = require("xml2js");
const fs = require("fs");

//const { M3U: m3uParser } = require("playlist-parser");


const {
    remote: {
        require: _require,
        BrowserWindow,
        dialog,
        app
    },
    ipcRenderer: ipc
} = require("electron");

const {
    playlist: {
        file: playlistLocation
    },
    podcast
} = _require("./configuration.js");

const {
    CONVERTED_MEDIA,
    URL_ONLINE
} = _require("./constants.js");

const {
    Magic,
    MAGIC_MIME_TYPE: _GET_MIME
} = require("mmmagic");

const { homedir } = require("os");

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
const { FFMPEG_LOCATION } = _require("./constants.js");

const {
    createNewWindow: downloadWindow
} = _require("./newwindow.js");

const magic = new Magic(_GET_MIME);

// get the main window only
const win = BrowserWindow.fromId(1);

const createEl = ({path: abs_path, _path: rel_path}) => {

    let lengthOfSib = document.querySelector(".akara-loaded").childElementCount;

    const child = document.createElement("li");
    const childchild = document.createElement("span");

    // nonsence
    //abs_path = URL.createObjectURL( new File([ dirname(abs_path) ] , basename(abs_path)) );

    const { protocol } = url.parse(abs_path);
    
    abs_path = abs_path.replace(new RegExp(`^${protocol}//`),"");

    child.setAttribute("data-full-path", url.format({
        protocol: protocol ? protocol.replace(":","") : "file",
        slashes: "/",
        pathname: abs_path
    }));

    child.setAttribute("id", `_${lengthOfSib++}`);

    child.classList.add("playlist");
    childchild.textContent = rel_path;
    child.appendChild(childchild);

    return child;
};

module.exports.createEl = createEl;

const removeType = (pNode,...types) => {
    Array.from(pNode.children, el => {
        types.forEach( type => el.hasAttribute(type)
            ? el.removeAttribute(type)
            : "");
    });
};

module.exports.removeType = removeType;


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

module.exports.removeClass = removeClass;



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

module.exports.setCurrentPlaying = setCurrentPlaying;

const removeTarget = (target,video) => {

    target = target.nodeName.toLowerCase() === "li" ? target : target.parentNode;

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

module.exports.removeTarget = removeTarget;

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


module.exports.disableMenuItem = disableMenuItem;


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

module.exports.setupPlaying = setupPlaying;



/**
 *
 *
 * prevNext, jump to next or previous video
 * during video navigation
 *
 **/
module.exports.prevNext = moveTo => {

    let target = document.querySelector("[data-now-playing=true]");

    if ( moveTo === "next" && target.nextElementSibling ) {
        return setupPlaying(target.nextElementSibling);
    }
    if ( moveTo === "prev" && target.previousElementSibling )
        return setupPlaying(target.previousElementSibling);
};


const getMime = file => new Promise((resolve,reject) => {
    magic.detectFile(file, (err,data) => {
        if ( err) return reject(err);
        return resolve(data);
    });
});

module.exports.getMime = getMime;

module.exports.validateMime = async (path) => {

    const _getMime = await getMime(path);

    if ( ! /^audio|^video/.test(_getMime) )
        return undefined;

    const canPlay = video.canPlayType(_getMime);

    if ( /^maybe$|^probably$/.test(canPlay) )
        return path;

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

    const ffmpeg = spawn(FFMPEG_LOCATION, ["-i", _path , "-acodec", "libmp3lame", "-vcodec", "mpeg4", "-f", "mp4", _fpath]);

    ffmpeg.stderr.on("data", data => {});

    ffmpeg.on("close", code => {
        if ( code >= 1 )
            reject(new Error("Unable to Convert Video"));
        resolve(_fpath);
    });
});

module.exports.playOnDrop = () => {
    const firstVideoList = document.querySelector(".playlist");
    if ( video.getAttribute("src") )
        return undefined;
    return setupPlaying(firstVideoList);
};

const sendNotification = (title,message) => new Notification(title,message);
module.exports.sendNotification = sendNotification;

module.exports.disableVideoMenuItem = menuInst => {

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
    return undefined;
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

module.exports.langDetect = (file) => {
    return new Promise((resolve,reject) => {
        guessLanguage.name(readFileSync(file).toString(), info => {
            resolve(info);
        });
    });
};

module.exports.getSubtitle = async (option) => {

    let value;

    try {
        value = await OS.search(option);
    } catch(ex) {
        value = ex;
    }
    return value;
};


module.exports.isOnline = () => new Promise((resolve,reject) => {

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

module.exports.readSubtitleFile = path => new Promise((resolve,reject) => {
    const _path = join(CONVERTED_MEDIA,basename(path).replace(".srt", ".vtt"));
    const data = readFileSync(path);
    srt2vtt(data, (err,vttData) => {
        if ( err ) return reject(err);
        writeFileSync(_path, vttData);
        return resolve(_path);
    });
});

module.exports.getMetaData = async () => {

    const url = decodeURIComponent(
        localStorage.getItem("currplaying")
    ).replace("file://","");

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

module.exports.makeDynamic = makeDynamic;



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


module.exports.playlistSave = (key, files, notify) => {

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

module.exports.playlistLoad = listName => {

    if ( typeof(listName) !== "string" )

        throw TypeError(`expected string as listName but got ${typeof(listName)}`);

    const list = require(playlistLocation);


    if ( ! listName in list )
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

module.exports.deletePlaylist = listName => {

    if ( typeof(listName) !== "string" )
        throw TypeError(`expected string as listName but got ${typeof(listName)}`);

    let list = require(playlistLocation);

    if ( ! listName in list )
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

module.exports.renderPlayList = type => {

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

module.exports.updatePlaylistName = updatePlaylistName;


module.exports.tClient = bBird.promisifyAll(
    new Twitter({
        consumer_key: process.env.AKARA_CONSUMER_KEY,
        consumer_secret: process.env.AKARA_CONSUMER_SECRET,
        access_token_key: process.env.AKARA_ACCESS_TOKEN_KEY,
        access_token_secret: process.env.AKARA_ACCESS_TOKEN_SECRET
    })
);


module.exports.savepodcast = name => {

    const pod = require(podcast);

    if ( Array.isArray(name) )
        ;
    else if ( typeof(name) === "string" )
        name = [ name ];
    else
        return false;

    name.forEach( feed => {
        if ( pod.indexOf(feed) === -1 )
            pod[pod.length] = feed;
    });

    writeFileSync(podcast, JSON.stringify(pod));

    return true;
};

module.exports.loadpodcast = () => {
    const pod = require(podcast);
    return pod.length > 0 ? pod : [];
};



const resumeDownloading = (item,webContents) => {
    console.log("resume");
    if ( item.canResume() ) {
        item.resume();
        webContents.send("download::state", "resumed");
    } else {
        webContents.send("download::state", "noResume");
    }
};


module.exports.downloadWindow = () => {
    let __obj = {
        title: "download",
        width: 365,
        height: 315
    };
    
    let html = `${__obj.title}.html`;
    
    let window = downloadWindow(__obj,html);

    return window;
};

const downloadFile = (url, window ) => {
    
    window.webContents.downloadURL(url);

    window.webContents.session.on("will-download", (event,item,webContents) => {
        
        item.setSavePath(app.getPath("downloads"));

        webContents.send("download::filename", item.getFilename());

        item.on("updated", (event,state) => {

            webContents.send("download::state", state);

            if ( state === "interrupted" )
                resumeDownloading(item,webContents);
            console.log(item);
            webContents.send("download::gottenByte", item.getReceivedBytes());
            webContents.send("download::computePercent", item.getReceivedBytes(), item.getTotalBytes());
        });


        item.once("done", (event,state) => {
            webContents.send("download::state", state);
            akara_emit.emit("download::complete", item.getSavePath());
        });

        ipc.on("download::cancel", () => {
            console.log("canceled");
            webContents.send("download::state", "canceled");
            item.cancel();
        });

        ipc.on("download::pause", () => {
            console.log("paused");
            item.pause();
            webContents.send("download::state", "paused");
        });

        ipc.on("download::resume", () => resumeDownloading(item,webContents));
        ipc.on("download::restart", () => {
            webContents.send("download::state", "restarting");
            downloadFile(url,window);
        });
        webContents.send("download::totalbyte", item.getTotalBytes());
    });
};

module.exports.downloadFile = downloadFile;

module.exports.exportMpegGurl = file => {
    
    const m3u = m3u8.M3U.create();
    
    const playlists = document.querySelectorAll(".playlist");
    
    Array.from(playlists, list => {
        m3u.addPlaylistItem({
            uri: decodeURIComponent(list.getAttribute("data-full-path"))
        });
    });

    let writeStream = fs.createWriteStream(file);
    writeStream.write(m3u.toString());
    return ;
};

module.exports.exportXspf = file => {
    const buildRoot = xmlbuilder.create({
        playlist: {
            "@version": 1,
            "@xmlns": "http://xspf.org/ns/0/",
            tracklist: {}
        }
    });

    const tracklist = buildRoot.ele("tracklist");
    const playlists = document.querySelectorAll(".playlist");

    
    Array.from(playlists, list => {
        let track = tracklist.ele("track");
        track.ele("title").text(list.querySelector("span").textContent);
        track.ele("location").text(
            decodeURIComponent(list.getAttribute("data-full-path"))
        );
    });
    
    let writeStream = fs.createWriteStream(file);
    writeStream.write(buildRoot.end({pretty: true}));
    return ;
};

module.exports.importXspf = file => {
    
    const parser = new xml2js.Parser();
    
    return new Promise((resolve,reject) => {
        
        fs.readFile(file, (err,data) => {
            
            if ( err )
                reject(err);

            parser.parseString(data, (err,result) => {
                if ( err )
                    reject(err);
                
                let { tracklist: [ , track ] } = result.playlist;
                ({ track } = track);
                resolve(track);
            });
            
        });
    });
};

module.exports.importMpegGurl = file => {
    return new Promise((resolve,reject) => {
        fs.readFile(file, "utf8", (err,data) => {
            if ( err )
                reject(err);
            resolve(m3ureader(data));
        });
    });
};
