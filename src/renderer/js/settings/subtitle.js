; ( () => {

    const {
        remote: {
            getCurrentWindow
        }
    } = require("electron");

    const cueSettings = document.querySelector(".subtitle-cues-option");
    const close = document.querySelector(".subtitle-close");

    close.addEventListener("click", () => getCurrentWindow().close());

    cueSettings.addEventListener("click", evt => {
        let { target } = evt;
        target = target.classList.contains("cue-toggler") || target.classList.contains("cue-title")
            ? (() => {
                if ( HTMLSpanElement[Symbol.hasInstance](target) )
                    return target.previousElementSibling;
                return target;
            })()
            : null;
        if ( ! target )
            return ;

        const pNode = target.parentNode;
        const cueStyle = pNode.querySelector("[data-hide]");

        if ( cueStyle.getAttribute("data-hide") === "subtitle_toggle_hidden" ) {
            target.classList.remove("fa-toggle-right");
            target.classList.add("fa-toggle-down");
            cueStyle.setAttribute("data-hide", "subtitle_toggle_visible");
            return ;
        }
        target.classList.add("fa-toggle-right");
        target.classList.remove("fa-toggle-down");
        cueStyle.setAttribute("data-hide", "subtitle_toggle_hidden");
    });

    document.addEventListener("change", evt => {
        const { target } = evt;
        const cueTest = document.querySelector(".cue-test");
        const cssProps = target.getAttribute("data-style");
        const cssValue = evt.target.value;
        cueTest.style[cssProps] = cssValue;
    });

})();
