/* AKM is a highly customizable media player built with electron
   Copyright (C) 2016  Victory Osikwemhe (zombieleet)

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.
   
   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
   
   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/


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
