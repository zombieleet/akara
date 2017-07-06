; ( ({remote: { dialog, app }}) => {
          
    const dropDownAkaraItem = document.querySelector(".akara-dropdown-item"),
          
          { addMediaCb } = require("../js/dropdown_callbacks.js");
    
    
    dropDownAkaraItem.addEventListener("click", event => {
        
        const target = event.target;
        const targetDataDrop = target.hasAttribute("data-drop") ? target.getAttribute("data-drop") : undefined;
        
        if ( ! targetDataDrop ) return undefined; 
        
        try {
            return HandleDroped()[targetDataDrop]();
        } catch(ex) {
            return dialog.showErrorBox("Not Implemented", `${targetDataDrop} has not been implemented yet`);
        }
        
    });
    
    function HandleDroped() {

        const addMedia = () => {
            
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
        
        
        return { addMedia };
    }
    
    
})(require("electron"));
