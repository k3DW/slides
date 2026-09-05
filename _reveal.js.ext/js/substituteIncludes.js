const URL_ATTRIBUTES = {
    IMG: ["src", "srcset"],
    SOURCE: ["src", "srcset"],
    A: ["href"],
    LINK: ["href"],
    SCRIPT: ["src"],
    VIDEO: ["src", "poster"],
    AUDIO: ["src"],
    IFRAME: ["src"],
    EMBED: ["src"],
    OBJECT: ["data"],
    TRACK: ["src"],
    INCLUDE: ["src"], // so nested <include> tags get fixed too
};

function isRelativeUrl(value) {
    return !/^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(value.trim());
}

function resolveUrl(value, baseUrl) {
    return new URL(value.trim(), baseUrl).href;
}

function resolveSrcset(value, baseUrl) {
    return value
        .split(",")
        .map((part) => {
            const trimmed = part.trim();
            const spaceIndex = trimmed.search(/\s/);
            const url = spaceIndex == -1 ? trimmed : trimmed.slice(0, spaceIndex);
            const descriptor = spaceIndex == -1 ? "" : trimmed.slice(spaceIndex);
            return (isRelativeUrl(url) ? resolveUrl(url, baseUrl) : url) + descriptor;
        })
        .join(", ");
}

function resolveCssUrls(cssText, baseUrl) {
    return cssText.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (match, quote, url) =>
        isRelativeUrl(url) ? `url(${quote}${resolveUrl(url, baseUrl)}${quote})` : match
    );
}

function rewriteRelativeUrls(root, baseUrl) {
    for (const [tagName, attrs] of Object.entries(URL_ATTRIBUTES)) {
        for (const el of root.getElementsByTagName(tagName)) {
            for (const attr of attrs) {
                const value = el.getAttribute(attr);
                if (!value) continue;
                if (attr == "srcset") {
                    el.setAttribute(attr, resolveSrcset(value, baseUrl));
                } else if (isRelativeUrl(value)) {
                    el.setAttribute(attr, resolveUrl(value, baseUrl));
                }
            }
        }
    }
    for (const el of root.querySelectorAll("[style]")) {
        el.setAttribute("style", resolveCssUrls(el.getAttribute("style"), baseUrl));
    }
    for (const styleEl of root.getElementsByTagName("style")) {
        styleEl.textContent = resolveCssUrls(styleEl.textContent, baseUrl);
    }
}

export async function substituteIncludes() {
    while (true) {
        const includes = [...document.getElementsByTagName("include")];
        if (includes.length == 0) {
            break;
        }
        for (const include of includes) {
            const filePath = include.getAttribute("src");
            const resolvedUrl = new URL(filePath, document.baseURI);

            const file = await fetch(resolvedUrl);
            const content = await file.text();

            const temp = document.createElement("div");
            temp.innerHTML = content;
            rewriteRelativeUrls(temp, resolvedUrl.href);

            include.insertAdjacentHTML("afterend", temp.innerHTML);
            include.remove();
        }
    }
}
