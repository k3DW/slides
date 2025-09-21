export function substituteLists() {
    let lists = {};

    document.querySelectorAll("section[one-by-one-fragment-list]").forEach(slide => {
        console.assert(slide.childElementCount == 2);
        console.assert(slide.children[0].tagName == "H2");
        console.assert(slide.children[1].tagName == "LI");

        const attr = slide.getAttribute("one-by-one-fragment-list");

        slide.children[0].setAttribute("style", "text-align: center !important;");

        let listName = slide.children[0].innerHTML;
        if (!(listName in lists))
            lists[listName] = [];
        let items = lists[listName];

        let element = slide.children[1];
        slide.removeChild(element);
        items.push(element);

        let ol = document.createElement('OL');
        for (const item of items) {
            let li = item.cloneNode(true);
            if (attr != null) {
                li.setAttribute("style", attr);
            }
            ol.appendChild(li);
        }
        ol.children[ol.childElementCount - 1].setAttribute("class", "fragment");

        slide.appendChild(ol);
    });
}
