/*
  AKM is a highly customizable media player built with electron
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

"use strict";


const {
    desktopCapturer,
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

const {
    Magic,
    MAGIC_MIME_TYPE: _GET_MIME
} = require("mmmagic");

const {
    video,
    applyButtonConfig,
    getButtonConfig,
    controls: {
        play
    }
} = require("../js/VideoControl.js");

const { createNewWindow } = _require("./newwindow.js");

const akara_emit = require("../js/Emitter.js");
const fs         = require("fs");
const path       = require("path");
const google     = require("googleapis");
const googleAuth = new(require("google-auth-library"));



const base64Img = require("base64-img");
const os        = require("os");
const env       = require("dotenv").load();
const Twitter   = require("twitter");
const bBird     = require("bluebird");
const _OS       = require("opensubtitles-api");
const url       = require("url");
const magic     = new Magic(_GET_MIME);
const datadir   = app.getPath("userData");
const OS        = new _OS("TemporaryUserAgent");

module.exports.OS = OS;

const createPlaylistItem = (abs_path) => {

    let lengthOfSib = document.querySelector(".akara-loaded").childElementCount;

    const playlistItem = document.createElement("li");
    const playlistItemContent = document.createElement("span");

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

        target.after(target, window.__draggingElement);

        const videoId = video.getAttribute("data-id");

        if ( _tmpId === videoId ) {
            video.setAttribute("data-id", window.__draggingElement.id);
        } else if ( window.__draggingElement.id === videoId ) {
            video.setAttribute("data-id", target.id);
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

    playlistItem.classList.add("playlist");
    playlistItemContent.textContent = path.basename(abs_path);
    playlistItem.appendChild(playlistItemContent);
    return playlistItem;
};

module.exports.createPlaylistItem = createPlaylistItem;


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
const removeCurrentPlayingStyles = parentNode => {

    Array.from(parentNode.children, el => {

        if ( el.hasAttribute("data-image_icon") ) {
            el.style.backgroundImage = null;
            el.removeAttribute("data-image_icon");
        } else {
            el.classList.remove(getButtonConfig("playlist-buttons", "play"));
            el.classList.remove("fa");
        }

        el.removeAttribute("data-dbclicked");
        el.removeAttribute("data-now-playing");
        el.removeAttribute("data-clicked");

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

    applyButtonConfig(target, "playlist-buttons", "play");
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
    video.setAttribute("src", decodeURIComponent(target.getAttribute("data-full-path")));

    const trackElement = document.querySelector("track");

    if ( trackElement )
        trackElement.remove();

    getCurrentWindow().webContents.send("video-no-repeat");

    return;
};

module.exports.setCurrentPlaying = setCurrentPlaying;


/**
 *
 * removes a media file
 * from the playlist section
 *
 **/

const removeMediaElementList = (target,video) => {

    target = target.nodeName.toLowerCase() === "li"
        ? target
        : target.parentNode;

    if ( decodeURI(video.src) === target.getAttribute("data-full-path") ) {

        let _target = target.nextElementSibling || target.parentNode.firstElementChild;

        if ( _target.parentNode.childElementCount === 1 ) {

            const play = document.querySelector("[data-fire=play]");
            const pause = document.querySelector("[data-fire=pause]");

            video.src = "";

            pause.classList.add("akara-display");
            play.classList.remove("akara-display");

            document.querySelector(".window-title").textContent = "Akara Media Player";

        } else {
            video.src = decodeURIComponent(_target.getAttribute("data-full-path"));
            setCurrentPlaying(_target);
            video.play();
        }
    }

    const currentLooping = localStorage.getItem("LOOP_CURRENT_VIDEO");

    if ( currentLooping && currentLooping === target.getAttribute("id") ) {
        getCurrentWindow().webContents.send("video-no-repeat");
    }

    target.remove();

    return ;
};

module.exports.removeMediaElementList = removeMediaElementList;

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

    if ( memItem.label === "Repeat" )
        repeatVisibility(memItem, target, false);

    if ( memItem.label === "No Repeat" )
        repeatVisibility(memItem, target, true);
};

const repeatVisibility = (memItem,target,value) => {

    const isVideoIdLoop = localStorage.getItem("LOOP_CURRENT_VIDEO");

    if ( isVideoIdLoop && isVideoIdLoop === target.getAttribute("id") ) {
        memItem.visible = value;
    }
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

    localStorage.removeItem("MEDIA_FRAGMENT_LAST");
    localStorage.removeItem("MEDIA_FRAGMENT_FIRST");

    Array.from(document.querySelectorAll(".akara-media-fragment"), el => el.remove());

    removeCurrentPlayingStyles(loaded);
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

const computeByte = (bytes) => {

    if ( bytes === 0 )
        return { measurement: bytes , unit: "byte" };

    const idx = Math.floor(
        Math.log(bytes) / Math.log(SIZE)
    );

    return {
        measurement: ( bytes / Math.pow(SIZE,idx)).toPrecision(3),
        unit: MEASUREMENT[idx]
    };
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

    const cProc = require("child_process");
    const { FFMPEG_LOCATION } = _require("./constants.js");

    let result;


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
        return reject(new Error("Cannot find ffmpeg Executable for this platform"));


    //const ffmpeg = cProc.spawn(ffmpegExecutable, ["-i", _path , "-acodec", "libmp3lame", "-vcodec", "mpeg4", "-f", "mp4", _fpath]);
    const ffmpeg = cProc.spawn(ffmpegExecutable, ["-i", _path, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-profile:v", "baseline", "-preset", "fast", "-crf", "18", "-f", "mp4", _fpath]);

    //const ffmpeg = cProc.spawn(ffmpegExecutable, ["-i", _path , "-c:v", "libx264", "-preset", "slow", "-s", "1024x576" , "-an" , "-b:v" , "370k", _fpath]);

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

const sendNotification = (options) => {

    const notifier = require("node-notifier");

    options.sound = true;
    options.icon = options.icon ? options.icon : "/root/Picture/pics.jpg" ;

    try {
        notifier.notify(options);
    } catch(ex) {
        console.log(ex.message, ex.code);
        if ( ex.code === "E2BIG" ) {
            options.icon = "/root/Pictures/pics.jpg";
            notifier.notify(options);
        }
    }
};

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

    if ( menuInst.label === "Share" && localStorage.getItem("share::deactivate") === "yes" ) {
        menuInst.enabled = false;
        return;
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
        console.log(option, "down here");
        value = await OS.search(option);
    } catch(ex) {
        value = ex;
    }
    console.log(value);
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

module.exports.readSubtitleFile = fPath => new Promise((resolve,reject) => {
    const srt2vtt = require("srt2vtt");
    const _path = path.join(CONVERTED_MEDIA,path.basename(fPath).replace(".srt", ".vtt"));
    const data = fs.readFileSync(fPath);
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
            podlink,
            isDone: podcasturl[podcasturl.length - 1] === podlink ? true : false
        };
        fs.writeFileSync(podcast, JSON.stringify(pod));
        callback(null,pod[title]);
    });


    for ( let pod__ of podcasturl ) {

        let result;

        try {

            callback(null,null, {
                message: `Getting Podcast from podcast rss feed ${pod__}`
            });

            result = await podson.getPodcast(pod__);

        } catch(ex) {
            result = ex;
        }

        if ( Error[Symbol.hasInstance](result) ) {
            callback({
                podcastLink: pod__,
                message: `An error occured while adding this podcast ${pod__}`,
                moreMessage: result.message,
                isDone: podcasturl[podcasturl.length - 1] === pod__ ? true : false
            });
            continue;
        }

        if ( Object.keys(pod).indexOf(result.title) === -1 ) {

            callback(null,null, {
                message: `Processing ${pod__}`,
                isDone: podcasturl[podcasturl.length - 1] === pod__ ? true : false
            });

            result.podlink = pod__;

            console.log(result, result.image);

            if ( ! result.image || result.image.length === 0 ) {
                result.image = base64Img.base64Sync(path.join(app.getAppPath(), "app", "renderer", "img", "posters", "default_poster.jpg"));
                akara_emit.emit("akara::podcast:image", result);
                continue;
            }
            //http://feeds.feedburner.com/boagworldpodcast/

            base64Img.requestBase64(result.image, (err,res,body) => {

                if ( err ) {
                    result.image = base64Img.base64Sync(path.join(app.getAppPath(), "app", "renderer", "img", "posters", "default_poster.jpg"));
                    akara_emit.emit("akara::podcast:image", result);
                    return;
                }

                result.image = body;
                akara_emit.emit("akara::podcast:image", result);
            });
        }
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

const resumeDownloading = module.exports.resumeDownloading = (item,webContents) => {
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

    let window = createNewWindow(__obj,html);

    return window;
};

const setDownloadPath = downloadFile => {

    let downloadFileName = path.join(app.getPath("downloads"), downloadFile);

    if ( fs.existsSync(downloadFileName) ) {

        const btn = dialog.showMessageBox({
            type: "info",
            message: `${downloadFileName} path already exists, click cancel to choose a different file name or ok to overwrite exisisting file`,
            buttons: [ "Ok", "Cancel" ]
        });

        if ( btn === 1 )
            downloadFileName = dialog.showSaveDialog({
                defaultPath: app.getPath("downloads"),
                title: "Specify a loation to save subtitle file"
            });
    }

    return downloadFileName;

};

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

module.exports.youtubeClient = () => {
    const { installed: { client_secret, client_id, redirect_uris: [ redirectUrl ] } } = require(path.join(app.getAppPath(), "youtube.json"));
    return bBird.promisifyAll(
        new googleAuth.OAuth2(client_id,client_secret,redirectUrl)
    );
};

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

const changeShortCutSetting = (keysettings,shKeys) => {

    const keyLocation = Object.keys(keysettings.stack).find( key => keysettings.stack[key].name === shKeys.shortcutType);
    const keyCred = keysettings.stack[keyLocation];
    const handler = keyCred.handler;

    keysettings.unregister({ key: keyCred.key, modifier: keyCred.modifier});

    keysettings.register({
        name: shKeys.shortcutType,
        key: shKeys.key,
        modifier: shKeys.modifier,
        handler
    });

};

module.exports.changeShortCutSetting = changeShortCutSetting;

module.exports.handleWindowButtons = ( { close, min, max } ) => {

    const windowShortCutKey = require("../js/ShortCutKeys/WindowShortCutKey.js");

    ipc.on("akara::window:shortcut", (evt,shKeys) => changeShortCutSetting(windowShortCutKey,shKeys) );

    applyButtonConfig(max,"window-buttons", "maximize");
    applyButtonConfig(min, "window-buttons", "minimize");
    applyButtonConfig(close, "window-buttons", "close");

    // restore
    const ismax = () => {
        max.removeAttribute("class");
        applyButtonConfig(max,"window-buttons", "restore");
    };

    // maximize
    const isnotmax = () => {
        max.removeAttribute("class");
        console.log("max");
        applyButtonConfig(max,"window-buttons", "maximize");
    };

    close.addEventListener("click", () => {
        ipc.removeListener("akara::newwindow:ismax", ismax);
        ipc.removeListener("akara::newwindow:isnotmax", isnotmax);
        getCurrentWindow().close();
    });

    min.addEventListener("click", () => {
        ipc.send("akara::newwindow:min");
    });

    max.addEventListener("click", () => {
        ipc.send("akara::newwindow:max");
    });

    ipc.on("akara::newwindow:ismax", ismax);

    ipc.on("akara::newwindow:isnotmax", isnotmax);
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
    }, async location => {

        if ( ! location ) {
            dialog.showErrorBox("cannot get location","specify location again");
            return ;
        }

        // const date = new Date();
        // const filename = `akaraplayer-${date.toLocaleDateString()}_${date.toLocaleTimeString()}`;

        base64Img.img( (await blobToDataUri(art)) , path.dirname(location) , path.basename(location) , ( err, filePath ) => {

            if ( err )
                return dialog.showErrorBox("Cannot Download Art", "An Error was encountered when download album art");

            return sendNotification({
                title: "Art Downloaded",
                message: `Album is located at ${filePath}`,
                icon: filePath
            });

        });


        return ;

    });
};


module.exports.applyButtonConfig = applyButtonConfig;


const UIBUTTON = (type,buttonName) => {

    let uibuttonPath = requireSettingsPath("uibuttons.json");
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

module.exports.loadUISettingButton = (section, buttonsToLoad, getBy) => {

    let uibutton = UIBUTTON(section, buttonsToLoad);

    Object.keys(uibutton).forEach( button => {

        const uibutt = document.querySelector(`[${getBy}=${button}]`);
        const font = uibutton[button];

        if ( ! font ||  ! uibutt )
            return ;

        localStorage.setItem(section, JSON.stringify(uibutton));

        if ( /data:image\//.test(font) ) {

            uibutt.style.backgroundImage = `url(${font})`;
            uibutt.setAttribute("data-image_icon", "image");

        } else {
            uibutt.classList.add("fa");
            uibutt.classList.add(`${font}`);
        }

    });
};

module.exports.getKeyIndex = (shortcut,shortcutType) => {
    const shortcutpath = requireSettingsPath("shortcut.json");
    const shortcutsettings = require(shortcutpath);
    const shortcut__ = shortcutsettings[shortcut];
    const idx = shortcut__.findIndex( sh_setting => sh_setting[shortcutType] );
    //return shortcut__.find( sh_setting => sh_setting[shortcutType] )[shortcutType];
    return shortcut__[idx][shortcutType];
};


const savePath = () => {
    const chooseSavePathWindow = {
        title: "savepath",
        parent: getCurrentWindow(),
        minimizeable: true,
        maximizable: true,
        resizable: true,
        width: 600,
        height: 300
    };
    const html = `${chooseSavePathWindow.title}.html`;
    createNewWindow(chooseSavePathWindow, html);
};

const screenshot = (options,checkType) => {

    const screenshotTimeout = document.querySelector(".screenshot-delay-ms");

    getCurrentWindow().minimize();
    //{ types, thumbnailSize }
    desktopCapturer.getSources(options, (error, sources) => {

        if ( error ) {
            dialog.showErrorBox("cannot take screenshot", error);
            return;
        }

        sources.forEach( source => {

            if ( ! checkType(source) )
                return ;

            if ( ! screenshotTimeout.disabled ) {
                setTimeout( savePath, screenshotTimeout.valueAsNumber * 1000);
                return ;
            }

        });

    });
};


module.exports.handleScreenShot = Object.defineProperties( {} , {
    entireScreen: {
        value() {
            screenshot({ types: ["screen"]}, source => {

                if ( source.name !== "Entire screen" )
                    return false;

                ipc.once("akara::screenshot:get_file", evt => {
                    const childWindowId = getCurrentWindow().getChildWindows()[0].webContents.id;
                    ipc.sendTo(childWindowId,"akara::screenshot:send_file", source.thumbnail.toPng());
                });
                return true;
            });
        }
    },
    activeWindow: {
        value() {

            // const screenSize = screen.getPrimaryDisplay().workAreaSize;
            // const maxDimension = Math.max(screenSize.width, screenSize.height);

            // const thumbnailSize = {
            //     width: maxDimension * window.devicePixelRatio,
            //     height: maxDimension * window.devicePixelRatio
            // };

            screenshot({ types: ["window"], thumbnailSize: { width: 100, height: 300 } } , source => {

                if ( source.name !== "Akara" )
                    return false;

                ipc.once("akara::screenshot:get_file", evt => {

                    let screenshotWindow ;

                    for ( screenshotWindow of BrowserWindow.getAllWindows() ) {
                        if ( screenshotWindow.isFocused() === true )
                            break;
                    }

                    const childWindowId = getCurrentWindow().getChildWindows()[0].webContents.id;

                    screenshotWindow.capturePage( nImage => {
                        ipc.sendTo(childWindowId,"akara::screenshot:send_file", nImage.toPng());
                    });

                });

                return true;
            });
        }
    },
    selectRegion: {
        value() {
        }
    }
});


module.exports.dataUriToBlobUri = async datauri => window.URL.createObjectURL( await (await fetch(datauri)).blob() );

const blobToDataUri = blob => {
    const fReader = new FileReader();
    return new Promise( ( resolve , reject) => {
        fReader.addEventListener("load", evt => {
            return resolve(evt.target.result);
        });
        fReader.addEventListener("error", evt => {
            return reject(fReader.error);
        });
    });
};

module.exports.blobToDataUri = blobToDataUri;
