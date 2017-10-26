; ( () => {

    "use strict";

    const docEl = document.documentElement;

    docEl.addEventListener("mouseover", evt => {

        const target = evt.target;

        if ( ! target.hasAttribute("data-title") )
            return false;

        const toolTip = target.getAttribute("data-title");
        const xAxis = evt.clientX;// - target.parentNode.getBoundingClientRect().left;
        const yAxis = evt.clientY;// - target.parentNode.getBoundingClientRect().top;
        const toolTipEl = document.createElement("span");
        const ppNode = target.parentNode.parentNode;
        const { left, top } = ppNode.getBoundingClientRect();
        
        toolTipEl.textContent = toolTip;
        toolTipEl.setAttribute("class", "tool-tip");
        toolTipEl.style.position = "absolute";
        toolTipEl.style.top = `${yAxis - top + target.offsetHeight}px`;
        toolTipEl.style.left = `${xAxis - left - 50}px`;
        toolTipEl.style["z-index"] = 5555;
        target.parentNode.parentNode.appendChild(toolTipEl);
        
        return true;
    });


    docEl.addEventListener("mouseout", evt => {

        let el;

        if ( ( el = docEl.querySelector(".tool-tip") ) )
            el.remove();

        return ;
    });

})();
