; ( () => {

    "use strict";


    const {
        handleWindowButtons
    } = require("../../js/util.js");

    const uiButtonMin = document.querySelector(".window-min");
    const uiButtonMax = document.querySelector(".window-max");
    const uiButtonClose = document.querySelector(".window-close");



    handleWindowButtons({ close: uiButtonClose, min: uiButtonMin, max: uiButtonMax });

})();
