const { basename } = require("path");

const addMediaCb = paths => {
    const mediaPathParent = document.querySelector(".akara-loaded");
    if ( ! paths ) return ;
    
    paths.forEach( path => {
        
        const _path = basename(path);
        const createdElement = createEl({path,_path});

        mediaPathParent.appendChild(createdElement);
        
    });
};


const createEl = ({path: abs_path, _path: rel_path}) => {
    
    const child = document.createElement("li");
    
    child.setAttribute("data-full-path", abs_path);

    child.textContent = rel_path;
    
    return child;
};


module.exports = { addMediaCb };
