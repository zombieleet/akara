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
            return dialog.showErrorBox("Not Implemented", `${targetDataDrop} has not been implemented yet`);
        }
        
    });
    
    function HandleDroped() {

        const addMediaFile = () => {
            
            dialog.showOpenDialog({
                title: "Choose media file",
                defaultPath: app.getPath("videos"),
                filters: [
                    {name: "Videos" , extensions: ["mp4","mkv","avi","ogg"]},
                    {name: "Audios", extensions: ["mp3"]}
                ],
                properties: ["openFile", "multiSelections"]
            },addMediaCb);
        };

        const addMediaFolder = () => {

            dialog.showOpenDialog({
                title: "Choose Folder Containging Media Files",
                defaultPath: app.getPath("videos"),
                properties: [ "openDirectory", "multiSelections" ]
            }, folderPaths => {

                if ( ! folderPaths ) return ;

                let files = [];

                folderPaths.forEach( path => iterateDir()(path).forEach( filePath => files.push(filePath) ));
                
                addMediaCb(files);

            });
            
        };
        
        return { addMediaFile, addMediaFolder };
    }
    
    
})(require("electron"));
