; ( ({remote: { Menu, MenuItem, getCurrentWindow}}) => {

    const akaraMenuToggle = document.querySelector(".akara-menu-toggle");

    let menu = new Menu();

    let menuItems = [
        {
            label: "Open"
        },
        {
            label: "Load Playlist"
        },
        {
            label: "Save"
        },
        {
            type: "separator"
        },
        {
            label: "Screenshot"
        },
        {
            type: "separator"
        },
        {
            label: "Play"
        },
        {
            label: "Pause"
        },
        {
            label: "Mute"
        },
        {
            label: "Stop"
        }
    ];

    
    menuItems.forEach( items => {
        menu.append(new MenuItem(items));
    });

    
    /*akaraMenuToggle.addEventListener("click", event => {
        menu.popup(getCurrentWindow());
    });*/
    
    
})(require("electron"));


