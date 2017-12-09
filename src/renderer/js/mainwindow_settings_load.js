;( () => {

    const {
        ipcRenderer: ipc,
        remote: {
            app,
            require: _require
        }
    } = require("electron");

    const {
        requireSettingsPath
    } = _require("./constants.js");


    const id3 = require("id3js");
    const brightness = require("brightness");


    const loadFilterSettings = async () => {
        
        const filterSettingsPath = await requireSettingsPath("filter.json");
        const filterSettings = require(filterSettingsPath);
        
        Object.keys(filterSettings).forEach( filterType => {
            let { progressBarWidth, measurement } = filterSettings[filterType];
            ipc.sendTo(1, "akara::video:filter", { filterType, progressBarWidth, measurement });
        });
    };
    
    const loadPosterSettings = async () => {
        const posterJson = await requireSettingsPath("poster.json");
        const posterSettings = require(posterJson);
        const video = document.querySelector("video");
        video.poster = posterSettings.poster;
    };


    const createBatteryBolt = () => {
        let bolt = document.createElement("i");
        bolt.classList.add("akara-bolt");
        bolt.classList.add("fa");
        bolt.classList.add("fa-bolt");
        return bolt;
    };

    const changeBatteryFont = (battery,batIcon) => {

        let level = battery.level * 100;

        if ( level <= 20 ) {
            batIcon.classList.add("fa-battery-empty");
        } else if ( level <= 30 ) {
            batIcon.classList.add("fa-battery-quarter");
        } else if ( level <= 50 ) {
            batIcon.classList.add("fa-battery-half");
        } else if ( level <= 80 ) {
            batIcon.classList.add("fa-battery-three-quarters");
        } else if ( level <= 100 ) {
            batIcon.classList.add("fa-battery-full");
        }

    };

    const loadBatterySettings = async () => {

        const batteryJson = await requireSettingsPath("power.json");
        const batterySettings = require(batteryJson);

        const battery = await navigator.getBattery();

        if ( batterySettings.show_battery_icon === "on" ) {

            let akaraWinState = document.querySelector(".akara-window-state");

            let batIcon = document.createElement("i"),
                bolt;

            batIcon.classList.add("akara-battery");
            batIcon.classList.add("fa");

            changeBatteryFont(battery,batIcon);

            if ( battery.charging )
                bolt = createBatteryBolt();

            akaraWinState.insertBefore(batIcon,akaraWinState.firstElementChild);

            if ( bolt )
                batIcon.insertAdjacentElement("beforebegin",bolt);
        }


        if ( ! battery.charging ) {
            if ( batterySettings.dim_screen_discharging === "on" ) {
                await brightness.set(0.4);
            }
        }


        battery.addEventListener("chargingchange", () => {

            let bolt = document.querySelector(".akara-bolt");

            if ( ! bolt )
                return ;
            
            if ( battery.charging ) {
                bolt.style.display = "inline";
            } else {
                bolt.style.display = "none";
            }

        });

        battery.addEventListener("levelchange", () => {

            let batIcon = document.querySelector(".akara-battery");

            if ( batIcon ) {
                batIcon.classList.remove("fa-battery-empty");
                batIcon.classList.remove("fa-battery-quarter");
                batIcon.classList.remove("fa-battery-half");
                batIcon.classList.remove("fa-battery-three-quarters");
                batIcon.classList.remove("fa-battery-full");
                changeBatteryFont(battery,batIcon);
            }

            let batLow = battery.close_player_battery_low === "on"
                ? true
                : false;
            
            if ( batLow && ( battery.level * 100  === 20 ) ) {
                app.quit();
            }
        });


    };

    window.addEventListener("DOMContentLoaded", async () => {
        await loadPosterSettings();
        await loadBatterySettings();
        await loadFilterSettings();
    });

})();
