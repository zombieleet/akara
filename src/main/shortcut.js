
module.exports.media = [
    { fullscreen: { key: "f", modifier: []} },
    { next:  { key: "n", modifier: []} },
    { previous: { key: "p", modifier: []} },
    { random: { key: "r", modifier: []} },
    { repeat: { key: "r", modifier: [ "shiftKey" ] } },
    { "next frame slow": { key: "ArrowRight", modifier: [ "shiftKey" ] }},
    { "previous frame slow": { key: "ArrowLeft", modifier: [ "shiftKey" ] }},
    { "next frame fast": { key: "ArrowRight", modifier: [ "ctrlKey" ] }},
    { "previous frame fast": { key: "ArrowLeft", modifier: [ "ctrlKey" ] }},
    { "play searched media": { key: "Enter", modifier: [] } },
    { "play and pause": { key: "Space", modifier: []} },
    { "volume up": { key: "ArrowUp", modifier: [ "ctrlKey" ] } },
    { "volume down": { key: "ArrowDown", modifier: [ "ctrlKey" ] } },
    { "normal playback rate": { key: "n", modifier: [ "altKey" ] }},
    { "fast playback rate": { key: "f", modifier: [ "altKey" , "ctrlKey" ] } },
    { "very fast playback rate": { key: "f", modifier: [ "shiftKey" ] } },
    { "slow playback rate": { key: "s", modifier: [ "altKey", "ctrlKey" ] } },
    { "very slow playback rate": { key: "s", modifier: [ "shiftKey" ] } },
    { "open media file": { key: "o", modifier: ["altKey"] } },
    { "open media folder": { key: "o", modifier: ["altKey","shiftKey"] } },
    { "show search box": { key: "s", modifier: [ "altKey" ] } },
    { "open media file location": { key: "o", modifier: [ "ctrlKey" ] } },
    { "media info" : { key: "m", modifier: [ "ctrlKey", "shiftKey"] } },
    { "screenshot": { key: "s", modifier: [] } },
];

module.exports.share = [
    { "twitter share": { key: "t", modifier: [ "ctrlKey" ] } },
    { "facebook share": { key: "b", modifier: [ "ctrlKey" ] } },
    { "youtube share": { key: "y", modifier: [ "ctrlKey" ] } }
];

module.exports.window = [
    { "fullscreen window": { key: "w", modifier: [] } },
    { "kiosk window": { key: "k" , modifier: []} },
    { "settings window": { key: "g", modifier: [] } },
    { "screenshot window": { key: "e", modifier: [] } },
    { "podcast window": { key: "c", modifier: [] } }
];

module.exports.subtitle = [
    { "subtitle computer": { key: "t" , modifier: [ "altKey" ] } },
    { "subtitle internet": { key: "x", modifier: [ "altKey" ] } }
];

module.exports.settings = [
    { "playbackrate settings": { key: "p", modifier: [ "altKey"] } },
    { "filter settings": { key: "f" , modifier: [ "ctrlKey" ] } },
    { "fullscreen settings": { key: "f" , modifier: [ "altKey", "shiftKey" ] } },
    { "play option settings": { key: "p", modifier: [ "shiftKey" ] } },
    { "volume settings": { key: "v", modifier: [ "ctrlKey" ] } },
    { "poster settings": { key: "p", modifier: [ "ctrlKey", "shiftKey" ] } },
    { "audio type settings": { key: "a", modifier: [ "ctrlKey" ] } },
    { "button settings": { key: "b", modifier: [ "ctrlKey" ] } },
    { "themes": { key: "t", modifier: [ "ctrlKey" ] } },
    { "plugin": { key: "u", modifier: [ "ctrlKey" ] } },
    { "power settings": { key: "p", modifier: [  "altKey", "shiftKey" ] } },
    { "share settings": { key: "s", modifier: [ "ctrlKey" ] } },
    { "shortcutkey settings": { key: "s", modifier: [ "ctrlKey", "shiftKey" ] } },
];
