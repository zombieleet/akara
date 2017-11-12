;( () => {
    
    const {
        remote: {
            require: _require
        }
    } = require("electron");

    const {
        requireSettingsPath
    } = _require("./constants.js");
    
    const loadPosterSettings = async () => {
        
        const posterJson = await requireSettingsPath("poster.json");
        const posterSettings = require(posterJson);
        const video = document.querySelector("video");
        
        video.poster = posterSettings.poster;
        
    };
   
    window.addEventListener("DOMContentLoaded", () => {
        
        loadPosterSettings();
    });
    
})();
