export function setBackground(image) {
    document.querySelectorAll("section").forEach(section => {
        if (section.hasAttribute("data-background-image"))
            return;
        else if (section.hasAttribute("data-background-color"))
            return;
        else if (section.hasAttribute("signpost")) { // #custom/attribute `signpost`
            section.classList.add("center");
            section.setAttribute("data-background-color", "#FFFFFF");
        }
        else
            section.setAttribute("data-background-image", image);
    });
}

export function setSlideSize(height, width) {
    const selectors = [
        "section[full]", // #custom/attribute `full`
        "section.list-fade-in-then-semi-out", // #custom/class `list-fade-in-then-semi-out`
        "section[my-columns]" // #custom/attribute `my-columns`
    ].join(", ");
    document.querySelectorAll(selectors).forEach(section => {
        section.setAttribute("style", `height:${height}px; width:${width}px;`);
    });
}

export function setListFade() {
    // #custom/class `list-fade-in-then-semi-out`
    const selectors = [
        ".reveal section.list-fade-in-then-semi-out li",
        ".reveal section.list-fade-in-then-semi-out p",
        ".reveal section .list-fade-in-then-semi-out li",
        ".reveal section .list-fade-in-then-semi-out p",
    ].join(", ");
    document.querySelectorAll(selectors).forEach(item => {
        item.classList.add("fragment", "fade-in-then-semi-out");
    });
}

export function setHoriCenter() {
    document.querySelectorAll('[my-hori-center]').forEach(item => {
        // #custom/attribute `my-hori-center`
        item.removeAttribute('my-hori-center');

        let newDiv = document.createElement('DIV');
        newDiv.setAttribute("style", "display:flex; flex-flow:row;");
        item.replaceWith(newDiv);

        let leftDiv = document.createElement('DIV');
        leftDiv.setAttribute("style", "flex: 1 1 auto;");
        
        let rightDiv = document.createElement('DIV');
        rightDiv.setAttribute("style", "flex: 1 1 auto;");

        newDiv.appendChild(leftDiv);
        newDiv.appendChild(item);
        newDiv.appendChild(rightDiv);
    });
}

export function setColumns() {
    document.querySelectorAll("section[my-columns]").forEach(slide => {				
        let mainDiv = document.createElement('DIV');
        mainDiv.setAttribute("style", "display: flex; flex-flow: column; height: 100%;");
        
        if (slide.children[0].tagName == 'H2') {
            let h2 = slide.children[0];
            slide.removeChild(h2);
            mainDiv.appendChild(h2);
            h2.setAttribute("style", "flex: 0 1 auto;");
        } else {
            let beginDiv = document.createElement('DIV');
            beginDiv.setAttribute("style", `flex: 0 1 0;`);
            mainDiv.appendChild(beginDiv);
        }
        
        let widths = [];
        let attr = slide.getAttribute("my-columns");
        if (attr) {
            widths = attr.split(" ");
            console.assert(widths.length == slide.childElementCount);
        } else {
            for (let i = 0; i != slide.childElementCount; i++) {
                widths.push("auto");
            }
        }

        slide.appendChild(mainDiv);

        let middleDiv = document.createElement('DIV');
        middleDiv.setAttribute("style", "flex: 1 1 auto; display:flex; flex-flow: row;");
        mainDiv.appendChild(middleDiv);
        let endDiv = document.createElement('DIV');
        endDiv.setAttribute("style", `flex: 0 1 0;`);
        mainDiv.appendChild(endDiv);

        let leftDiv = document.createElement('DIV');
        if (slide.getAttribute("my-columns-align") == 'left') {
            leftDiv.setAttribute("style", `flex: 0 1 auto;`);
        } else {
            leftDiv.setAttribute("style", `flex: 1 1 auto;`);
        }
        middleDiv.appendChild(leftDiv);
        while (slide.children.length > 1) {
            let column = slide.children[0];
            slide.removeChild(column);

            if (column.tagName == 'PRE' && column.classList.length == 0) {
                column.classList.add("cpp");
            }
            
            let innerDiv = document.createElement('DIV');
            if (slide.getAttribute("my-columns-align") == 'left') {
                innerDiv.setAttribute("style", `flex: 1 1 ${widths[0]}; display:flex; align-items: top; text-align: left;`);
            } else {
                innerDiv.setAttribute("style", `flex: 1 1 ${widths[0]}; display:flex; align-items: center; text-align: center;`);
            }
            widths.shift();
            innerDiv.appendChild(column);
            middleDiv.appendChild(innerDiv);
        }
        let rightDiv = document.createElement('DIV');
        rightDiv.setAttribute("style", `flex: 1 1 auto;`);
        middleDiv.appendChild(rightDiv);
    });
}

export function setFooters(leftSideText, rightSideText, useSubFooter) {
    let subFooter = "Footer"; // Mutated in the loop below

    document.querySelectorAll("section").forEach(slide => {
        // The order of these 2 `if` statements is important
        if (slide.hasAttribute('change-footer')) {
            subFooter = slide.getAttribute('change-footer');
        }
        if (slide.hasAttribute('no-footer') || slide.hasAttribute('signpost')) {
            return;
        }

        const moveVert = 20;

        let leftFooterDiv = document.createElement('DIV');
        leftFooterDiv.setAttribute("style", `font-size:40%; color:#999; position:absolute; bottom:-${moveVert}px; left:-45px;`);
        slide.appendChild(leftFooterDiv);
        
        let rightFooterDiv = document.createElement('DIV');
        rightFooterDiv.setAttribute("style", `font-size:40%; color:#999; position:absolute; bottom:-${moveVert}px; right:30px;`);
        slide.appendChild(rightFooterDiv);
        
        if (useSubFooter) {
            leftFooterDiv.innerText = `${leftSideText} - ${subFooter}`;
        }
        else {
            leftFooterDiv.innerText = `${leftSideText}`;
        }
        rightFooterDiv.innerText = rightSideText;
    });
}
