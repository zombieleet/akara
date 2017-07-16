const { ipcRenderer: ipc } = require("electron");
const url = require("url");
const { video, controls: { play } } = require("../js/video_control.js");

const createEl = ({path: abs_path, _path: rel_path}) => {

    const child = document.createElement("li");
    const childchild = document.createElement("span");

    // nonsence
    //abs_path = URL.createObjectURL( new File([ dirname(abs_path) ] , basename(abs_path)) );
    
    child.setAttribute("data-full-path", encodeURI(abs_path));


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

const setCurrentPlaying = target => {
    
    target.setAttribute("data-dbclicked", "true");
    target.setAttribute("data-now-playing", "true");

    target.classList.add("fa");
    target.classList.add("fa-play-circle");

    return ;
};

const RESETTARGET = target => target.nodeName.toLowerCase() === "li" ? target : target.parentNode;

const removeTarget = (target,videoEl) => {

    target = RESETTARGET(target);

    
    if ( videoEl.src.replace(/^file:\/\//,"") === target.getAttribute("data-full-path") ) {
        
        let _target = target.nextElementSibling || target.parentNode.firstElementChild;

        if ( _target.parentNode.childElementCount === 1 ) {  
            videoEl.src = "";
        } else {
            
            videoEl.src = _target.getAttribute("data-full-path");

            setCurrentPlaying(_target);
        }
        
    }
    
    target.remove();
    target = undefined;
};


module.exports = {
    createEl,
    removeTarget,

    removeType,
    setCurrentPlaying
};
