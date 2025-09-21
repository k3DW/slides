import * as init from "./js/initializeSlides.js"
import { loadScripts } from "./js/loadScripts.js";
import { addMouseClickNavigation } from "./js/mouseClick.js";
import { substituteIncludes } from "./js/substituteIncludes.js";
import { substituteLists } from "./js/substituteLists.js"

export async function preInitSlides(object) {
    await substituteIncludes();
    substituteLists();
    await loadScripts(object.scripts);

    init.setBackground(object.backgroundImage);
    init.setSlideSize(object.height, object.width);
    init.setColumns();
    init.setHoriCenter();

    addMouseClickNavigation();
}

export function postInitSlides(object) {
    init.setListFade();
    init.setFooters(object.leftSideFooter, object.rightSideFooter, object.useSubFooter);
}
