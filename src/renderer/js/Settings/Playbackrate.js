/* AKM is a highly customizable media player built with electron
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
; ( () => {
    
    "use strict";
    
    const {
        remote: {
            getCurrentWindow,
            dialog,
            require: _require
        }
    } = require("electron");
    
    const { requireSettingsPath } = _require("./constants.js");
    
    const close            = document.querySelector(".playback-close");
    const playbackVerySlow = document.querySelector("[data-fire='playback-veryslow'] input");
    const playbackSlow     = document.querySelector("[data-fire='playback-slow'] input");
    const playbackVeryFast = document.querySelector("[data-fire='playback-veryfast'] input");
    const playbackFast     = document.querySelector("[data-fire='playback-fast'] input");
    
    const fs     = require("fs");
    const submit = document.querySelector(".playback-submit");
    const reset  = document.querySelector(".playback-reset");


    const saveValues = async (playbackSettings) => {
        
        const playbackFile = await requireSettingsPath("playbackrate.json");
        
        playbackVerySlow.value = playbackSettings.veryslow;
        playbackSlow.value = playbackSettings.slow;
        playbackVeryFast.value = playbackSettings.veryfast;
        playbackFast.value = playbackSettings.fast;
        
        fs.writeFileSync(playbackFile, JSON.stringify(playbackSettings));
    };
    
    window.addEventListener("DOMContentLoaded", async () => {
        const playbackSettings = require(await requireSettingsPath("playbackrate.json"));
        saveValues(playbackSettings);
    });

    
    submit.addEventListener("click", async (evt) => {
        
        const verySlowValue = parseFloat(playbackVerySlow.value);
        const slowValue = parseFloat(playbackSlow.value);
        const veryFastValue = parseFloat(playbackVeryFast.value);
        const fastValue = parseFloat(playbackFast.value);

        const playbackFile = await requireSettingsPath("playbackrate.json");
        const playbackSettings = require(playbackFile);
        
        if ( verySlowValue > slowValue )
            return dialog.showErrorBox("Bad Input", "very slow is greater that slow");

        if ( verySlowValue > veryFastValue )
            return dialog.showErrorBox("Bad Input", "very slow is greater that very fast");

        if ( verySlowValue > fastValue )
            return dialog.showErrorBox("Bad Input", "very slow is greater than fast");

        if ( slowValue > veryFastValue )
            return dialog.showErrorBox("Bad Input", "slow is greather than fast");

        if ( slowValue > fastValue )
            return dialog.showErrorBox("Bad Input", "slow is greater than very fast");
        
        if ( fastValue > veryFastValue )
            return dialog.showErrorBox("Bad Input", "fast is greater that very fast");


        return saveValues({slow: slowValue, fast: fastValue, veryfast: veryFastValue, veryslow: verySlowValue});
        
    });
    reset.addEventListener("click", () => saveValues({ veryslow: 0.3, slow: 0.8, veryfast: 10, fast: 5}));
    close.addEventListener("click", () => getCurrentWindow().close());
})();
