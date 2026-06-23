function tryReparent(): boolean {
    const userArea = document.querySelector("[aria-label='User status and settings']");
    const sidebar = document.querySelector(".sidebarList__5e434");
    const guilds = document.querySelector("[aria-label='Servers sidebar']") as HTMLElement;

    if (!userArea) {
        console.error("Unable to query user area with [aria-label='User status and settings']");
        return false;
    }

    if (!sidebar) {
        console.error("Unable to query sidebar with .sidebarList__5e434");
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
