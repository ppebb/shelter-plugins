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

function addTargetAsFavorite(target, avatar) {
    module.addFavoriteGIF({
        url: target.href ?? (avatar ? target.src.replace("size=32", "size=128") : target.src),
        src: target.dataset.safeSrc ?? target.poster ?? (avatar ? target.src.replace("size=32", "size=128") : target.src),
        width: target.clientWidth ?? (avatar ? 128 : 160),
        height: target.clientHeight ?? (avatar ? 128 : 160),
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

function findNestedImageTag(elem) {
    for (child of elem.children) {
        if (child.nodeName != "IMG") {
            let possibleImg = findNestedImageTag(child);
            if (possibleImg != null && possibleImg != undefined)
                return possibleImg
        }
        else
            return child
    }

    return null
}

function contextMenuOpen(payload) {
    if (payload.contextMenu.target.nodeName != "A" && payload.contextMenu.target.nodeName != "VIDEO" && payload.contextMenu.target.nodeName != "IMG" && payload.contextMenu.target.nodeName != "DIV")
        return;

    if (payload.contextMenu.target.nodeName == "DIV") {
        let shouldContinue = false;
        for (c of payload.contextMenu.target.classList) {
            if (c.indexOf("cover") != -1 || (c.indexOf("wrapper") != 1 && payload.contextMenu.target.role == "img")) { // prevent button from showing up on random divs
                shouldContinue = true;
                break;
            }
        }

        if (!shouldContinue)
            return;
    }

    let target = payload.contextMenu.target
    let avatar = false;
    if (payload.contextMenu.target.nodeName == "DIV") {
        target = payload.contextMenu.target.parentElement.querySelector("video")

        if (target == null || target == undefined) {
            target = findNestedImageTag(payload.contextMenu.target);
            avatar = true;
        }
    }

    const unObserve = observeDom("[class^=menu]", (elem) => {
        let menuItemGroup = elem.querySelector("[class^=scroller]").querySelectorAll("[role^=group]");
        let menuItems = menuItemGroup[2] ?? menuItemGroup[1] // For some context menus they are shorter and [2] is undefined
        let originalButton = menuItems.children[0];
        let originalButtonlabel = originalButton.children[0];

        let addFavoriteButton = document.createElement("div");
        addFavoriteButton.classList = originalButton.classList;
        addFavoriteButton.role = originalButton.role;
        addFavoriteButton.dataset.menuItem = true;
        addFavoriteButton.id = "message-add-to-favorites";

        let addFavoriteLabel = document.createElement("div");
        addFavoriteLabel.classList = originalButtonlabel.classList;

        let addFavoriteText = document.createTextNode("Add to Favorites");
        addFavoriteLabel.appendChild(addFavoriteText);
        addFavoriteButton.appendChild(addFavoriteText);

        addFavoriteButton.addEventListener("click", () => {
            addTargetAsFavorite(target, avatar);
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
