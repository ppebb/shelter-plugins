import { createApi, webpackChunk } from "@cumjar/websmack";
const {
    flux: {
        dispatcher
    },
    observeDom
} = shelter;

const modules = webpackChunk();
const api = modules && createApi([undefined, ...modules]);

const fgModule = api.findByCode("updateAsync\\(\"favoriteGifs\"");

function addTargetAsFavorite(target, avatar) {
    fgModule.uL({
        url: target.href ?? (avatar ? target.src.replace("size=32", "size=128") : target.src),
        src: target.dataset.safeSrc ?? target.poster ?? (avatar ? target.src.replace("size=32", "size=128") : target.src),
        width: target.clientWidth ?? (avatar ? 128 : 160),
        height: target.clientHeight ?? (avatar ? 128 : 160),
        format: 1
    });
}

// TODO: Automatically determine focus class.

// let focusClass = null;
function getFocusClass() {
    return "focused_c1e9c4";
    // if (focusClass != null)
    //     return focusClass;

    // const messageCopyNativeLink = document.getElementById("message-copy-native-link");
    // messageCopyNativeLink.dispatchEvent(new MouseEvent("mouseover", {
    //     view: window,
    //     bubbles: true,
    //     cancelable: true
    // }));

    // messageCopyNativeLink.classList.forEach((c) => {
    //     if (c.indexOf("focus") != -1)
    //         focusClass = c;
    // });

    // // BUG: This only works on the second try?????
    // messageCopyNativeLink.classList.remove(focusClass);

    // return focusClass;
}

function removeAllFocus(elem) {
    elem.classList.forEach((c) => {
        if (c.indexOf("focus") != -1)
            elem.classList.remove(c);
    });

    for (const child of elem.children)
        removeAllFocus(child);
}

function findNestedImageTag(elem) {
    for (const child of elem.children) {
        if (child.nodeName != "IMG") {
            const possibleImg = findNestedImageTag(child);
            if (possibleImg != null && possibleImg != undefined)
                return possibleImg;
        }
        else
            return child;
    }

    return null;
}

function validButton(menuItem) {
    if (menuItem == null || menuItem == undefined)
        return false;

    let isItem = false;
    let isDisabled = false;
    let isLabelContainer = false;
    let isColorBrand = false;
    for (const c of menuItem.classList) {
        if (c.indexOf("item") != -1 && !isItem)
            isItem = true;

        if (c.indexOf("disabled") != -1 && !isDisabled)
            isDisabled = true;

        if (c.indexOf("labelContainer") != -1 && !isLabelContainer)
            isLabelContainer = true;

        if (c.indexOf("colorBrand") != -1 && !isColorBrand)
            isColorBrand = true;
    }

    return isItem && !isDisabled && isLabelContainer && !isColorBrand;
}

function getFirstButton(menuItemGroup) {
    for (const group of menuItemGroup)
        for (const child of group.children)
            if (validButton(child))
                return { group, child };
}

function contextMenuOpen(payload) {
    if (payload.contextMenu.target.nodeName != "A" && payload.contextMenu.target.nodeName != "VIDEO" && payload.contextMenu.target.nodeName != "IMG" && payload.contextMenu.target.nodeName != "DIV")
        return;

    if (payload.contextMenu.target.nodeName == "DIV") {
        let shouldContinue = false;
        for (const c of payload.contextMenu.target.classList) {
            if (c.indexOf("cover") != -1 || (c.indexOf("wrapper") != 1 && (payload.contextMenu.target.role == "img" || payload.contextMenu.target.children[0]?.nodeName == "IMG"))) { // prevent button from showing up on random divs
                shouldContinue = true;
                break;
            }
        }

        if (!shouldContinue)
            return;
    }

    let target = payload.contextMenu.target;
    let avatar = false;
    if (payload.contextMenu.target.nodeName == "DIV") {
        target = payload.contextMenu.target.parentElement.querySelector("video");

        if (target == null || target == undefined) {
            target = findNestedImageTag(payload.contextMenu.target);
            avatar = true;
        }
    }

    const unObserve = observeDom("[class^=menu]", (elem) => {
        const menuItemGroup = elem.querySelector("[class^=scroller]").querySelectorAll("[role^=group]");
        const ret = getFirstButton(menuItemGroup);
        const menuItems = ret.group;
        const originalButton = ret.child;
        const originalButtonlabel = originalButton.children[0];

        const addFavoriteButton = document.createElement("div");
        addFavoriteButton.classList = originalButton.classList;
        addFavoriteButton.role = "menuitem"; // This shouldn't change... I hope
        addFavoriteButton.dataset.menuItem = true;
        addFavoriteButton.id = "message-add-to-favorites";

        const addFavoriteLabel = document.createElement("div");
        addFavoriteLabel.classList = originalButtonlabel.classList;

        const addFavoriteText = document.createTextNode("Add to Favorites");
        addFavoriteLabel.appendChild(addFavoriteText);
        addFavoriteButton.appendChild(addFavoriteText);

        addFavoriteButton.addEventListener("click", () => {
            dispatcher.dispatch({
                type: "CONTEXT_MENU_CLOSE",
                contextMenu: payload.contextMenu
            });
            addTargetAsFavorite(target, avatar);
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

        const menuY = parseFloat(elem.parentElement.style.top);
        elem.parentElement.style.top = (menuY - 32) + "px";

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
