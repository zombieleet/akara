const { UIBUTTON } = require("../../js/util")

module.exports.loadUISettingButton = (section, buttonsToLoad, getBy) => {

  let uibutton = UIBUTTON(section, buttonsToLoad);

  Object.keys(uibutton).forEach( button => {
    
    const uibutt = document.querySelector(`[${getBy}=${button}]`);
    const font = uibutton[button];

    if ( !font || !uibutt ) return ;

    localStorage.setItem(section, JSON.stringify(uibutton));

        if ( /data:image\//.test(font) ) {

            uibutt.style.backgroundImage = `url(${font})`;
            uibutt.setAttribute("data-image_icon", "image");

        } else {
            uibutt.classList.add("fa");
            uibutt.classList.add(`${font}`);
        }

  })
}