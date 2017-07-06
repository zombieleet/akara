const createEl = ({path: abs_path, _path: rel_path}) => {
    
    const child = document.createElement("li");
    const childchild = document.createElement("span");
    
    child.setAttribute("data-full-path", abs_path);
    
    
    childchild.textContent = rel_path;

    child.appendChild(childchild);
    
    return child;
};

module.exports = {
    createEl
};
