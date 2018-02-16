"use strict";
const akara_emit = require("../js/emitter.js");
const fs = require("fs");
const path = require("path");
const google = require("googleapis");
const googleAuth = new(require("google-auth-library"));

const {
    ipcRenderer: ipc,
    remote: {
        require: _require,
        BrowserWindow,
        getCurrentWindow,
        dialog,
        app
    }
} = require("electron");

const {
    CONVERTED_MEDIA,
    URL_ONLINE,
    SIZE,
    MEASUREMENT,
    FFMPEG_LOCATION,
    requireSettingsPath
} = _require("./constants.js");

const  {
    playlist: {
        file: playlistLocation
    }
} = _require("./configuration.js");

const {
    Magic,
    MAGIC_MIME_TYPE: _GET_MIME
} = require("mmmagic");

const os = require("os");
const env = require("dotenv").load();
const Twitter = require("twitter");
const bBird = require("bluebird");
const _OS = require("opensubtitles-api");

const url = require("url");
const childProcess = require("child_process");

const {
    video,
    applyButtonConfig,
    controls: {
        play
    }
} = require("../js/video_control.js");

const OS = new _OS("OSTestUserAgentTemp");

const {
    createNewWindow
} = _require("./newwindow.js");

const magic = new Magic(_GET_MIME);

const {
    installed: {
        client_secret,
        client_id,
        redirect_uris: [ redirectUrl ]
    }
} = require(path.join(app.getAppPath(), "youtube.json"));

const datadir = app.getPath("userData");

const createPlaylistItem = ({path: abs_path, _path: rel_path}) => {

    let lengthOfSib = document.querySelector(".akara-loaded").childElementCount;

    const playlistItem = document.createElement("li");
    const playlistItemContent = document.createElement("span");

    // nonsence
    //abs_path = URL.createObjectURL( new File([ dirname(abs_path) ] , basename(abs_path)) );

    const { protocol } = url.parse(abs_path);

    abs_path = abs_path.replace(new RegExp(`^${protocol}//`),"");

    playlistItem.setAttribute("data-full-path", url.format({
        protocol: protocol ? protocol.replace(":","") : "file",
        slashes: "/",
        pathname: abs_path
    }));

    playlistItem.setAttribute("id", `_${lengthOfSib++}`);

    playlistItem.draggable = true;


    playlistItem.addEventListener("dragstart", (evt) => {
        window.__draggingElement = evt.target;
    });


    playlistItem.addEventListener("drag", evt => {
        console.log(" offsetY ", evt.offsetY);
    });

    playlistItem.addEventListener("dragenter", evt => {

        let target = evt.target;

        if ( HTMLSpanElement[Symbol.hasInstance](target) ) {
            target = target.parentNode;
        }

        target.setAttribute("data-drag", "dragenter");

        const playlistItemParent = target.parentNode;
        const _tmpId = window.__draggingElement.id;

        window.__draggingElement.id = target.id;
        target.id = _tmpId;

        playlistItemParent.insertBefore(target, window.__draggingElement);

        const videoId = video.getAttribute("data-id");

        if ( _tmpId === videoId ) {
            video.setAttribute("data-id", window.__draggingElement.id);
            return ;
        }

        if ( window.__draggingElement.id === videoId ) {
            video.setAttribute("data-id", target.id);
            return;
        }

        return ;

    });

    playlistItem.addEventListener("dragleave", evt => {
        let target = evt.target;

        if ( HTMLSpanElement[Symbol.hasInstance](target) ) {
            target = target.parentNode;
        }

        target.removeAttribute("data-drag", "dragenter");
    });

    playlistItem.addEventListener("dragover", evt => {

        let target = evt.target;

        if ( HTMLSpanElement[Symbol.hasInstance](target) ) {
            target = target.parentNode;
        }

        let playlistItemParent = playlistItem.parentNode;

        //console.log(__draggingElement);


        // if ( ! __draggingElement )
        //     return ;




        //playlistItemParent.insertBefore(__draggingElement,target);

    });


    playlistItem.classList.add("playlist");

    playlistItemContent.textContent = rel_path;

    playlistItem.appendChild(playlistItemContent);

    return playlistItem;
};

module.exports.createPlaylistItem = createPlaylistItem;

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


    const mediaTitle = document.querySelector(".window-title");

    processMediaTags({

        url: decodeURIComponent(url.parse(target.getAttribute("data-full-path")).path),

        onSuccess({ tags }) {

            if ( ! tags.title ) {
                mediaTitle.textContent = target.querySelector("span").textContent;
                return ;
            }

            mediaTitle.textContent = tags.title;
        },
        onError() {
            mediaTitle.textContent = target.querySelector("span").textContent;
        }

    });


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


const computeByte = bytes => {

    if ( bytes === 0 )
        return `${bytes} byte`;

    const idx = Math.floor(
        Math.log(bytes) / Math.log(SIZE)
    );

    return `${( bytes / Math.pow(SIZE,idx)).toPrecision(3)} ${MEASUREMENT[idx]}`;
};

module.exports.computeByte = computeByte;

module.exports.validateMime = async (path) => {

    const _getMime = await getMime(path);

    if ( ! /^audio|^video/.test(_getMime) )
        return `${path} is not a media stream`;

    const canPlay = video.canPlayType(_getMime);

    if ( /^maybe$|^probably$/.test(canPlay) )
        return path;

    let _fpath;

    try {
        _fpath = await convert(path);
    } catch(ex) {
        _fpath = ex;
    }

    if ( Error[Symbol.hasInstance](_fpath) )
        path = _fpath.message;
    else
        path = _fpath;
    return path;
};

const convert = _path => new Promise( async (resolve,reject) => {

    let result;

    const { FFMPEG_LOCATION } = _require("./constants.js");


    // _fpath will contain the converted path
    const _fpath = path.join(CONVERTED_MEDIA,path.parse(_path).name + ".mp4");

    // if _fpath exists instead just resolve don't convert
    if ( fs.existsSync(_fpath) )
        return resolve({ convpath: `${_fpath}` });

    let ffmpegExecutable ;

    if ( os.platform() !== "windows" )
        ffmpegExecutable = `ffmpeg-${os.platform()}-${os.arch().replace("x","")}`;
    else
        ffmpegExecutable = `ffmpeg-${os.platform()}-${os.arch().replace("x","")}.exe`;

    ffmpegExecutable = path.join(FFMPEG_LOCATION,ffmpegExecutable);

    if ( ! fs.existsSync(ffmpegExecutable) )
        reject(new Error("Cannot find ffmpeg Executable for this platform"));


    //const ffmpeg = childProcess.spawn(ffmpegExecutable, ["-i", _path , "-acodec", "libmp3lame", "-vcodec", "mpeg4", "-f", "mp4", _fpath]);
    const ffmpeg = childProcess.spawn(ffmpegExecutable, ["-i", _path, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-profile:v", "baseline", "-preset", "fast", "-crf", "18", "-f", "mp4", _fpath]);

    //const ffmpeg = childProcess.spawn(ffmpegExecutable, ["-i", _path , "-c:v", "libx264", "-preset", "slow", "-s", "1024x576" , "-an" , "-b:v" , "370k", _fpath]);

    const allWindows = BrowserWindow.getAllWindows().filter( window => window.getTitle() === "ffmpeg" ? window : undefined);

    let ffmpegWindow , ffmpegWin;

    if ( allWindows.length ) {
        ffmpegWin = allWindows[0];
    } else {
        ffmpegWindow = {
            title: "ffmpepg",
            minimizable: false,
            resizeable: false,
            maximizable: false,
            width: 560,
            height: 800
        };
        ffmpegWin = createNewWindow(ffmpegWindow, "ffmpeg.html");
    }

    const fileSize = fs.statSync(_path).size;

    ffmpeg.stderr.on("data", data => {
        const convertedSize = fs.statSync(_fpath).size;
        ipc.sendTo(ffmpegWin.webContents.id, "akara::ffmpeg:convert", data, `converting ${computeByte(convertedSize)}/${computeByte(fileSize)}`);
        ipc.sendTo(1, "akara::ffmpeg:converting");
    });

    ffmpeg.on("close", code => {
        ipc.sendTo(1, "akara::ffmpeg:converting:done");
        if ( code >= 1 )
            reject(new Error("Unable to Convert Video"));

        ipc.sendTo(ffmpegWin.webContents.id, "akara::ffmpeg:convert", undefined, "completed");
        resolve({ convpath: _fpath });
    });

    ipc.once("akara::ffmpeg:convert:kill", () => {

        ffmpeg.kill();

        if ( ffmpeg.killed ) {

            ipc.sendTo(ffmpegWin.webContents.id, "akara::ffmpeg:convert", "this process was terminated successfully");

            if ( fs.existsSync(_fpath) ) {
                fs.unlink(_fpath, err => {
                    if ( err ) {
                        reject(new Error(
                            "partially converted file to could not be deleted"
                                + " delete it from this location " + _fpath + " to free up space"
                                + " on your computer"
                        ));
                        return ;
                    }
                });
                return ;
            }
            return ;
        }

        ipc.sendTo(ffmpegWin.webContents.id, "akara::ffmpeg:convert", "cannot kill this process");
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

    const win = BrowserWindow.fromId(1);

    const toggleSubOnOff = document.querySelector("[data-sub-on]");
    const ccStatus = toggleSubOnOff.getAttribute("data-sub-on");

    if  ( ! document.querySelector(".cover-on-error-src").hasAttribute("style") ) {
        switch(menuInst.label) {
        case "Add": break;
        case "Load Playlist": break;
        case "Import Playlist": break;
        default:
            menuInst.enabled = false;
        }
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


    requireSettingsPath("share.json")
        .then( path => {
            let settingsPath = require(path);
            if ( menuInst.label === "Share" && settingsPath.deactivate_sharing_option === "yes" )
                menuInst.enabled = false;
        });
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
    const { guessLanguage } = require("guesslanguage");
    return new Promise((resolve,reject) => {
        guessLanguage.name(fs.readFileSync(file).toString(), info => {
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

    const { request } = require("http");

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
    const srt2vtt = require("srt2vtt");
    const _path = path.join(CONVERTED_MEDIA,path.basename(path).replace(".srt", ".vtt"));
    const data = fs.readFileSync(path);
    srt2vtt(data, (err,vttData) => {
        if ( err ) return reject(err);
        fs.writeFileSync(_path, vttData);
        return resolve(_path);
    });
});

module.exports.getMetaData = (sourceFile) => {

    const ffmpeg = require("ffmpeg");

    return new Promise((resolve,reject) => {
        ffmpeg(sourceFile, (err,media) => {
            if ( err )
                return reject(err);
            return resolve(media.metadata);
        });
    });
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

    fs.writeFileSync(playlistLocation, JSON.stringify(list));

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

        if ( fs.existsSync(decodeURIComponent(list.replace(/^file:\/\//,""))) )
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

    fs.writeFileSync(playlistLocation, JSON.stringify(list));

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

    if ( ! loadplaylist ) {
        return new Error(`wrong argument`,`specified argument as class ${type} cannot be located in the dom`);
    }

    const list = require(playlistLocation);

    if ( Object.keys(list).length === 0 ) {
        const p = document.createElement("p");
        p.textContent = "No Playlist have been created";
        p.setAttribute("class", "no-loadplaylist");
        document.querySelector("button").hidden = true;
        loadplaylist.appendChild(p);
        return false;
    }

    let ul = document.querySelector(".append-list");
    if ( ul )
        return false;

    ul = document.createElement("ul");
    ul.setAttribute("class", "append-list");

    let  noP = loadplaylist.querySelector(".no-loadplaylist");
    if ( noP )
        noP.remove();

    noP = undefined;

    for ( let __list of Object.keys(list) ) {
        const li = document.createElement("li");
        const p = document.createElement("p");
        const numlist = document.createElement("span");
        p.textContent = __list;
        numlist.textContent = `${list[__list].length} files`;
        li.setAttribute("class", "loadplaylist-item");
        li.setAttribute("data-capture", __list);
        li.appendChild(p);
        li.appendChild(numlist);
        ul.appendChild(li);
    }

    loadplaylist.appendChild(ul);
    selectMultipe(ul);
    return true;
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


const savepodcast = async (podcasturl,callback) => {

    const { podcast } = _require("./configuration.js");
    const pod = require(podcast);
    const podson = require("podson");
    const base64Img = require("base64-img");

    let conhttp_s = require("http");

    if ( Array.isArray(podcasturl) )
        ;
    else if ( typeof(podcasturl) === "string" )
        podcasturl = [ podcasturl ];
    else
        return callback("first argument is not a string or an array",null);

    let errs = [];
    let succ = [];

    akara_emit.on("akara::podcast:image", ({ description , title, language, owner, categories, image, podlink }) => {
        pod[title] = {
            title,
            description,
            language,
            owner,
            categories,
            image,
            podlink
        };
        fs.writeFileSync(podcast, JSON.stringify(pod));
        callback(null,pod[title]);
    });


    for ( let pod__ of podcasturl ) {

        let result;

        try {
            result = await podson.getPodcast(pod__);
            console.log(result, "try --- catch ");
        } catch(ex) {
            errs.push(pod__);
            continue;
        }

        if ( Object.keys(pod).indexOf(result.title) === -1 ) {

            result.podlink = pod__;

            if ( ! result.image || result.image.length === 0 ) {
                akara_emit.emit("akara::podcast:image", result);
                continue;
            }

            callback(null,null,{ name: result.name, link: pod__ });

            base64Img.requestBase64(result.image, (err,res,body) => {
                result.image = body;
                akara_emit.emit("akara::podcast:image", result);
            });
        }
    }


    for ( let errpod of errs ) {
        const err = new(class PODCAST_ERROR extends Error {
            constructor(code,podcastLink,message,fileName,lineNumber) {
                super(message,fileName,lineNumber);
                this.code = code;
                this.podcastLink = podcastLink;
            }
        })("PODCAST_NO_LOAD", errpod, "cannot load podcast");

        setTimeout(() => {
            callback(err,null);
        },500);
    }

};

module.exports.savepodcast = savepodcast;

module.exports.loadpodcast = () => {
    const { podcast } = _require("./configuration.js");
    const pod = require(podcast);
    return Object.keys(pod).length > 0 ? pod : {};
};

module.exports.removepodcast = podtoremove => {

    const { podcast } = _require("./configuration.js");
    let pod = require(podcast);

    if ( ! Object.keys(pod).includes(podtoremove) )
        return false;


    for ( let _pods of Object.keys(pod) ) {
        if ( _pods === podtoremove )
            delete pod[podtoremove];
    }


    fs.writeFileSync(podcast, JSON.stringify(pod));

    return true;
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


module.exports.createNewWindow = () => {
    let __obj = {
        title: "download",
        width: 365,
        height: 315
    };

    let html = `${__obj.title}.html`;

    let window = createNewWindow(__obj,html);

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

    const m3u8 = require("m3u8");
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
    const xmlbuilder = require("xmlbuilder");
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
    const xml2js = require("xml2js");
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
    const m3ureader = require("m3u8-reader");
    return new Promise((resolve,reject) => {
        fs.readFile(file, "utf8", (err,data) => {
            if ( err )
                reject(err);
            resolve(m3ureader(data));
        });
    });
};

module.exports.youtubeClient = bBird.promisifyAll(
    new googleAuth.OAuth2(client_id,client_secret,redirectUrl)
);

module.exports.cache = path.join(datadir, "youtube_cache.json");

const uploadVideo = info => {

    const {
        auth,
        title: { value: title },
        description: { value: description },
        privacyStatus,
        tags
    } = info;


    const youtube = google.youtube("v3");
    const uploadData = decodeURIComponent(url.parse(video.getAttribute("src")).pathname);

    const fileSize = fs.statSync(uploadData).size;

    let id;

    const tube = youtube.videos.insert({
        auth: info.auth,
        resource: {
            snippet: {
                title,
                description,
                tags
            },
            status: {
                privacyStatus
            }
        },
        part: "snippet,status",
        media: {
            body: fs.createReadStream(uploadData)
        }
    }, ( err , data ) => {

        if ( err ) {
            dialog.showErrorBox("Error while sending message", err);
            return akara_emit.emit("akara::processStatus", `error while sending video`, true);
        }

        console.log(data);

        if ( ! data.status )
            return akara_emit.emit("akara::processStatus", `uploaded sucessfully`, true);

        if ( data.status.uploadStatus === "uploaded" )
            return akara_emit.emit("akara::processStatus", `uploaded sucessfully`, true);

        return akara_emit.emit("akara::processStatus", `uploaded was not sucesfull`, true);

    });


    id = setInterval(() => {
        const { _bytesDispatched: sentBytes } = tube.req.connection;
        akara_emit.emit("akara::processStatus", `uploading ${computeByte(sentBytes)}/${computeByte(fileSize)}`);
    },250);

};


module.exports.uploadYoutubeVideo = auth => {

    const youtubeupload = document.querySelector(".youtubeupload");
    const youtubeAdd = document.querySelector(".youtubeupload-submit");
    const youtubeCancel = document.querySelector(".youtubeupload-cancel");
    const coverView = document.querySelector(".youtubeupload-cover");

    const youtubeStatus = Array.from(youtubeupload.querySelectorAll("input[type=radio]"));

    const title = document.querySelector("input[type=text]");
    const description = document.querySelector(".youtubeupload-description");

    let tags = document.querySelector(".youtubeupload-tags");

    youtubeupload.hidden = coverView.hidden = false;

    let privacyStatus = youtubeStatus[0].getAttribute("data-privacy") || youtubeStatus[1].getAttribute("data-privacy");

    const btns = {
        _removeEvents() {
            youtubeAdd.removeEventListener("click", this.bindAdd);
            youtubeCancel.removeEventListener("click", this.bindCancel);
            youtubeupload.hidden = coverView.hidden = true;
            this._removeStatus();
        },
        _removeStatus() {
            youtubeStatus.forEach( status => {
                status.removeEventListener("change", this.bindStatus);
            });
        },
        status(evt) {

            let target = evt.target;
            let _private = document.querySelector(".youtubeupload-private");
            let _public = document.querySelector(".youtubeupload-public");

            privacyStatus = target.getAttribute("data-privacy");
            _private.checked = _public.checked = false;
            target.checked = true;

            return ;
        },
        add(evt) {
            if ( title.value.length === 0 ||
                 description.value.length === 0 || ! privacyStatus ) {
                return ;
            }

            let _tags = tags.value.length > 0 ? tags.value.split(/\s{1,}/) : [];

            uploadVideo({ auth, title, description, privacyStatus, tags: _tags});
            this._removeEvents();
            return ;
        },
        cancel(evt) {
            this._removeEvents();
        }
    };


    btns.bindAdd = btns.add.bind(btns);
    btns.bindCancel = btns.cancel.bind(btns);
    btns.bindStatus = btns.status.bind(btns);

    youtubeAdd.addEventListener("click", btns.bindAdd);
    youtubeCancel.addEventListener("click", btns.bindCancel);

    youtubeStatus.forEach( status  => {
        status.addEventListener("change", btns.status);
    });

};

module.exports.handleWindowButtons = ( { close, min, max } ) => {

    applyButtonConfig(max,"window-buttons", "maximize");
    applyButtonConfig(min, "window-buttons", "minimize");
    applyButtonConfig(close, "window-buttons", "close");

    const ismax = () => {
        // restore
        max.removeAttribute("class");
        applyButtonConfig(max,"window-buttons", "maxmize");
        // max.classList.remove("fa-window-maximize");
        // max.classList.add("fa-window-restore");
    };

    const isnotmin = () => {
        // maximize
        max.removeAttribute("class");
        applyButtonConfig(max,"window-buttons", "maximize");
        // max.classList.remove("fa-window-restore");
        // max.classList.add("fa-window-maximize");
    };

    close.addEventListener("click", () => {
        ipc.removeListener("akara::newwindow:ismax", ismax);
        ipc.removeListener("akara::newwindow:isnotmin", isnotmin);
        getCurrentWindow().close();
    });

    min.addEventListener("click", () => {
        ipc.send("akara::newwindow:min");
    });

    max.addEventListener("click", () => {
        ipc.send("akara::newwindow:max");
    });

    ipc.on("akara::newwindow:ismax", ismax);

    ipc.on("akara::newwindow:isnotmin", isnotmin);
};


const processMediaTags = (options) => {

    const jsmediatags = require("jsmediatags");

    const { onSuccess, onError, url } = options;

    console.log(options);

    const mediaTagReader = new jsmediatags.Reader(url);

    mediaTagReader.setTagsToRead().read({
        onSuccess,
        onError
    });

};

module.exports.processMediaTags = processMediaTags;


module.exports.downloadAlbumArt = art => {

    dialog.showSaveDialog({

        defaultPath: app.getPath("downloads"),
        title: "where to save albumart?"

    }, location => {

        if ( ! location ) {
            dialog.showErrorBox("cannot get location","specify location again");
            return ;
        }

        const date = new Date();

        //const date_time = `${date.toLocaleDateString()}_${date.toLocaleTimeString()}`;

        art = art.replace(/.*?,/,"");
        art = art.replace(/\s/g,"");

        fs.writeFile(
            location,
            window.atob(art),
            (err,buf) => {
                if ( err ) {
                    console.log(err);
                    dialog.showErrorBox("album not download", "Unable to download album art");
                    return ;
                }
                sendNotification("Download Complete",{
                    body: "Album Art have been saved to " + location
                });
                return ;
            });

        return ;

    });
};


module.exports.applyButtonConfig = applyButtonConfig;

module.exports.UIBUTTON = async (type,buttonName) => {

    let uibuttonPath = await requireSettingsPath("uibuttons.json");
    let uibutton = require(uibuttonPath);

    if ( Array.isArray(buttonName) )
        ;
    else
        buttonName = [ buttonName ];

    let buttonsObj = { };

    for ( let button of buttonName ) {
        Object.assign(buttonsObj, {
            [button]: uibutton[type][button]
        });
    }

    return buttonsObj;
};
