
module.exports.video = [
    { fullscreen: { key: "f", modifier: []} },
    { next:  { key: "n", modifier: []} },
    { previous: { key: "p", modifier: []} },
    { random: { key: "r", modifier: []} },
    { repeat: { key: "r", modifier: [ "shiftKey" ] } },
    { "next frame slow": { key: "ArrowRight", modifier: [ "shiftKey" ] }},
    { "previous frame slow": { key: "ArrowLeft", modifier: [ "shiftKey" ] }},
    { "next frame fast": { key: "ArrowRight", modifier: [ "ctrlKey" ] }},
    { "previous frame fast": { key: "ArrowLeft", modifier: [ "ctrlKey" ] }}
];

module.exports.audio = [
    { play: { key: "Space", modifier: []} },
    { pause: { key: "Space", modifier: [] } },
    { "volume up": { key: "ArrowUp", modifier: [ "ctrlKey" ] } },
    { "volume down": { key: "ArrowDown", modifier: [ "ctrlKey" ] } }
];

module.exports.subtitle = [
    { "subtitle computer": { key: "t" , modifier: [ "altKey" ] } },
    { "subtitle internet": { key: "x", modifier: [ "altKey" ] } }
];
