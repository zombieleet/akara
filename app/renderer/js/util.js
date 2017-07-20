const { remote:
        { require: _require },
ipcRenderer: ipc } = require("electron");
const { CONVERTED_MEDIA } = _require("./constants.js");
const { Magic, MAGIC_MIME_TYPE: _GET_MIME }  = require("mmmagic");
const url = require("url");
const { spawn } = require("child_process");
const { mkdirSync , existsSync } = require("fs");
const { join,
    basename,
    parse } = require("path");
const { video, controls: { play } } = require("../js/video_control.js");


const magic = new Magic(_GET_MIME);

let IsShownUnsupportedFormat;

const createEl = ({path: abs_path, _path: rel_path}) => {

    const child = document.createElement("li");
    const childchild = document.createElement("span");

    // nonsence
    //abs_path = URL.createObjectURL( new File([ dirname(abs_path) ] , basename(abs_path)) );

    child.setAttribute("data-full-path", url.format({
        protocol: "file",
        slashes: "/",
        pathname: abs_path
    }));


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

const removeClass = (target, ...types) => {

    Array.from(target.parentNode.children, el => {
        for ( let i of types ) {
            if ( el.classList.contains(i) ) el.classList.remove(i);
        }
    });

};

const setCurrentPlaying = target => {

    target.setAttribute("data-dbclicked", "true");
    target.setAttribute("data-now-playing", "true");


    target.setAttribute("data-clicked", "true");

    target.classList.add("fa");
    target.classList.add("fa-play-circle");

    document.querySelector(".akara-title").textContent = target.querySelector("span").textContent;

    return ;
};

const RESETTARGET = target => target.nodeName.toLowerCase() === "li" ? target : target.parentNode;

const removeTarget = (target,video) => {

    target = RESETTARGET(target);

    if ( decodeURI(video.src) === target.getAttribute("data-full-path") ) {

        let _target = target.nextElementSibling || target.parentNode.firstElementChild;

        if ( _target.parentNode.childElementCount === 1 ) {
            video.src = "";
            video.removeAttribute("src");

            const play = document.querySelector("[data-fire=play]");
            const pause = document.querySelector("[data-fire=pause]");
            pause.classList.add("akara-display");
            play.classList.remove("akara-display");

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

const setupPlaying = target => {

    removeClass(target,"fa","fa-play-circle");

    removeType(target.parentNode,"data-dbclicked","data-now-playing","data-clicked");

    setCurrentPlaying(target);

    video.src = target.getAttribute("data-full-path");

    return play();

};

const prevNext = moveTo => {

    let target = document.querySelector("[data-now-playing=true]");


    if ( moveTo === "next" && target.nextElementSibling ) {
        return setupPlaying(target.nextElementSibling);
    }

    if ( moveTo === "prev" && target.previousElementSibling )
        return setupPlaying(target.previousElementSibling);
};

const createDir = () => mkdirSync(`${CONVERTED_MEDIA}`);

const sendNotice = message =>  new Notification(message);

const getMime = file => new Promise((resolve,reject) => {
    
    magic.detectFile(file, (err,data) => {
        
        if ( err) return reject(err);

        return resolve(data);
    });
    
});

const validateMime = async (path) => {

    const _getMime = await getMime(path);
    
    if ( ! /^audio|^video/.test(_getMime) )
        
        return undefined;

    
    const canPlay = video.canPlayType(_getMime);
    
    if ( /^maybe$|^probably$/.test(canPlay) )

        return path;
       

    sendNotice("Unsupported Mime/Codec detected, this file will be converted in the background");
    
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
    
    if ( ! existsSync(CONVERTED_MEDIA) )
        createDir();

    // if _fpath exists instead just resolve don't convert
    if ( existsSync(_fpath) ) {
        return resolve(_fpath);
    }

    const ffmpeg = spawn("ffmpeg", ["-i", _path , "-acodec", "libmp3lame", "-vcodec", "mpeg4", "-f", "mp4", _fpath]);


    ffmpeg.stderr.on("data", data => {});
    
    ffmpeg.on("close", code => {
        console.log(code);
        console.log("awdfasdfasdfasdf");
        if ( code >= 1 )
            
            reject(new Error("Unable to Convert Video"));

        resolve(_fpath);
        
    });
    
});

module.exports = {
    createEl,
    removeTarget,
    removeClass,
    removeType,
    setCurrentPlaying,
    disableMenuItem,
    setupPlaying,
    prevNext,
    validateMime
};
