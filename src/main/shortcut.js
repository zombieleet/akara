
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
    { "open media file": { key: "f", modifier: ["altKey"] } },
    { "open media folder": { key: "f", modifier: ["altKey","shiftKey"] } },
    { "show search box": { key: "s", modifier: ["ctrlKey"] } },
    { "open media file location": { key: "o", modifier: [ "ctrlKey" ] } },
    { "media info" : { key: "m", modifier: [ "ctrlKey", "shiftKey"] } },
];

module.exports.subtitle = [
    { "subtitle computer": { key: "t" , modifier: [ "altKey" ] } },
    { "subtitle internet": { key: "x", modifier: [ "altKey" ] } }
];

module.exports.settings = [
    { "quick search": { key: "f", modifier: [ "ctrlKey" ] } },
    { "playbackrate settings": { key: "p", modifier: [ "ctrlKey"] } },
    { "filter settings": { key: "f" , modifier: [ "ctrlKey" ] } },
    { "fullscreen settings": { key: "f" , modifier: [ "shiftKey" ]} },
    { "play option settings": { key: "p", modifier: [ "shiftKey" ] } },
    { "volume settings": { key: "v", modifier: [ "ctrlKey" ] } },
    { "poster settings": { key: "p", modifier: [ "ctrlKey", "shiftKey" ] } },
    { "audio type settings": { key: "a", modifier: [ "ctrlKey" ] } },
    { "button settings": { key: "b", modifier: [ "ctrlKey" ] } },
    { "themes": { key: "t", modifier: [ "ctrlKey" ] } },
    { "plugin install": { key: "p", modifier: [ "ctrlKey" ] } },
    { "plugin uninstal": { key: "p", modifier: [ "ctrlKey", "shiftKey" ] } },
    { "power settings": { key: "p", modifier: [  "altKey", "shiftKey" ] } },
    { "share settings": { keys: "s", modifier: [ "ctrlKey" ] } },
    { "shortcutkey settings": { key: "s", modifier: [ "ctrlKey", "shiftKey" ] } },
];
