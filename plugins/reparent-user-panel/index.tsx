function tryReparent(): boolean {
    const userArea = document.querySelector("[aria-label='User area']");
    const sidebar = document.querySelector(".sidebarList_c48ade");
    const guilds = document.querySelector("[aria-label='Servers sidebar']") as HTMLElement;

    if (!userArea) {
        console.error("Unable to query user area with [aria-label='User area']");
        return false;
    }

    if (!sidebar) {
        console.error("Unable to query sidebar with .sidebarList_c48ade");
        return false;
    }

    if (!guilds) {
        console.error("Unable to query guilds with [aria-label='Servers sidebar']");
        return false;
    }

    userArea.remove();
    sidebar.appendChild(userArea);
    guilds.style.marginBottom = "0px";
    guilds.style.paddingBottom = "8px";

    return true;
}

function runTimeout() {
    if (tryReparent())
        return;

    setTimeout(() => {
        runTimeout();
    }, 500);
}

export function onLoad() {
    runTimeout();
}
