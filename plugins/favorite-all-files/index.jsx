import { webpackChunk, createApi } from "@cumjar/websmack";
const {
    flux: {
        dispatcher
    },
    observeDom
} = shelter;

const modules = webpackChunk();
const api = modules && createApi([undefined, ...modules]);

const module = api.findByCode("d\\.FrecencyUserSettingsActionCreators\\.updateAsync\\(\"favoriteGifs\"");

function addTargetAsFavorite(target) {
    module.addFavoriteGIF({
        url: target.href ?? target.src,
        src: target.dataset.safeSrc ?? target.poster ?? target.src,
        width: target.clientWidth ?? 160,
        height: target.clientHeight ?? 160,
        format: 1
    });
}

let focusClass = null;
function getFocusClass() {
    if (focusClass != null)
        return focusClass;

    let messageCopyNativeLink = document.getElementById("message-copy-native-link");
    messageCopyNativeLink.dispatchEvent(new MouseEvent("mouseenter", {
        view: window,
        bubbles: true,
        cancelable: true
    }));
    messageCopyNativeLink.classList.forEach((c) => {
        if (c.indexOf("focus") != -1)
            focusClass = c;
    });

    messageCopyNativeLink.classList.remove(focusClass);

    return focusClass;
}

function removeAllFocus(elem) {
    elem.classList.forEach((c) => {
        if (c.indexOf("focus") != -1)
            elem.classList.remove(c);
    });

    for (child of elem.children)
        removeAllFocus(child);
}

function contextMenuOpen(payload) {
    if (payload.contextMenu.target.nodeName != "A" && payload.contextMenu.target.nodeName != "VIDEO" && payload.contextMenu.target.nodeName != "IMG" && payload.contextMenu.target.nodeName != "DIV")
        return;

    let divTarget = null
    if (payload.contextMenu.target.nodeName == "DIV") {
        divTarget = payload.contextMenu.target.parentElement.querySelector("video");
    }

    const unObserve = observeDom("[class^=menu]", (elem) => {
        let menuItems = elem.querySelector("[class^=scroller]").querySelectorAll("[role^=group]")[2];
        let copyImageButton = menuItems.children[0];
        let copyImageLabel = copyImageButton.children[0];

        let addFavoriteButton = document.createElement("div");
        addFavoriteButton.classList = copyImageButton.classList;
        addFavoriteButton.role = copyImageButton.role;
        addFavoriteButton.dataset.menuItem = true;
        addFavoriteButton.id = "message-add-to-favorites";

        let addFavoriteLabel = document.createElement("div");
        addFavoriteLabel.classList = copyImageLabel.classList;

        let addFavoriteText = document.createTextNode("Add to Favorites");
        addFavoriteLabel.appendChild(addFavoriteText);
        addFavoriteButton.appendChild(addFavoriteText);

        addFavoriteButton.addEventListener("click", () => {
            addTargetAsFavorite(divTarget ?? payload.contextMenu.target);
            // elem.remove(); // just removing the element from the dom can't be a good idea, but I don't know what else to do...
            document.getElementsByTagName("body")[0].click();
        });

        addFavoriteButton.addEventListener("mouseenter", () => {
            removeAllFocus(elem);
            elem.setAttribute("aria-activedescendant", "message-add-to-favorites");
            addFavoriteButton.classList.add(getFocusClass());
        });

        addFavoriteButton.addEventListener("mouseleave", () => {
            addFavoriteButton.classList.remove(getFocusClass());
        });

        menuItems.appendChild(addFavoriteButton);

        unObserve();
    });

    setTimeout(unObserve, 500);
}

export function onLoad() { // optional
    dispatcher.subscribe("CONTEXT_MENU_OPEN", contextMenuOpen);
}

export function onUnload() { // required
    dispatcher.unsubscribe("CONTEXT_MENU_OPEN", contextMenuOpen);
}
