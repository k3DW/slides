export async function substituteIncludes() {
    while (true) {
        const includes = [...document.getElementsByTagName("include")];
        if (includes.length == 0) {
            break;
        }
        for (const include of includes) {
            const filePath = include.getAttribute("src");
            const file = await fetch(filePath);
            const content = await file.text();
            include.insertAdjacentHTML("afterend", content);
            include.remove();
        }
    }
}
