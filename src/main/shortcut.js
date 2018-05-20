
module.exports.video = [
    { fullscreen: { key: "f", modifier: []} },
    { next:  { key: "n", modifier: []} },
    { previous: { key: "p", modifier: []} },
    { random: { key: "r", modifier: []} },
    { repeat: { key: "r", modifier: [ "shiftKey" ] } },
    { "next frame slow": { key: "ArrowRight", modifier: [ "shiftKey" ] }},
    { "previous frame slow": { key: "ArrowLeft", modifier: [ "shiftKey" ] }},
    { "next frame fast": { key: "ArrowRight", modifier: [ "ctrlKey" ] }},
    { "previous frame fast": { key: "ArrowLeft", modifier: [ "ctrlKey" ] }},
    { "play searched media": { key: "Enter", modifier: [] } }
];

module.exports.audio = [
    { "play and pause": { key: "Space", modifier: []} },
    { "volume up": { key: "ArrowUp", modifier: [ "ctrlKey" ] } },
    { "volume down": { key: "ArrowDown", modifier: [ "ctrlKey" ] } },
    { "normal playback rate": { key: "n", modifier: [ "altKey" ] }},
    { "fast playback rate": { key: "f", modifier: [ "altKey" , "ctrlKey" ] } },
    { "very fast playback rate": { key: "f", modifier: [ "shiftKey" ] } },
    { "slow playback rate": { key: "s", modifier: [ "altKey", "ctrlKey" ] } },
    { "very slow playback rate": { key: "s", modifier: [ "shiftKey" ] } },
];

module.exports.subtitle = [
    { "subtitle computer": { key: "t" , modifier: [ "altKey" ] } },
    { "subtitle internet": { key: "x", modifier: [ "altKey" ] } }
];

module.exports.others = [
    { "open media file": { key: "f", modifier: ["altKey"] } },
    { "open media folder": { key: "f", modifier: ["altKey","shiftKey"] } },
    { "show search box": { key: "s", modifier: ["ctrlKey"] } },
    { "open media file location": { key: "o", modifier: [ "ctrlKey" ] } },
    { "media info" : { key: "m", modifier: [ "ctrlKey", "shiftKey"] } },
    { "media info" : { key: "m", modifier: [ "ctrlKey", "shiftKey"] } },
];
