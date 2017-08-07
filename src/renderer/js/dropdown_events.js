; ( ({remote: { dialog, app , require: _require }}) => {
          
    const dropDownAkaraItem = document.querySelector(".akara-dropdown-item"),
          HandleDroped = require("../js/handle_dropdown_commands.js"),
          
          { addMediaCb } = require("../js/dropdown_callbacks.js"),

          { iterateDir } = _require("./utils.js"); // get utils from the main process folder
    
    
    dropDownAkaraItem.addEventListener("click", event => {
        
        let target = event.target;
        // incase a child of li is clicked
        target = target.nodeName.toLowerCase() === "li" ? target : target.parentNode;

        // incase the first check was sucessfull and the parentNode of target is not li;
        const targetDataDrop = target.hasAttribute("data-drop") ? target.getAttribute("data-drop") : undefined;
        
        
        if ( ! targetDataDrop ) return undefined; 
        
        try {
            return HandleDroped()[targetDataDrop]();
        } catch(ex) {
            console.log(ex);
            return dialog.showErrorBox("Not Implemented", `${targetDataDrop} has not been implemented yet`);
        }
        
    });
    
})(require("electron"));
