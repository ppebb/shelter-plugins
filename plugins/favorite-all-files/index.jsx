import { webpackChunk, createApi } from "@cumjar/websmack";
const {
    flux: {
        dispatcher,
        stores: {
            SelectedChannelStore
        }
    },
    observeDom
} = shelter;

const modules = webpackChunk();
const api = modules && createApi([undefined, ...modules]);

const module = api.findByCode('d\\.FrecencyUserSettingsActionCreators\\.updateAsync\\("favoriteGifs"');

function addTargetAsFavorite(target) {
    let src = target.dataset.safeSrc;
    if (src == undefined)
        src = target.poster;

    let url = target.href;
    if (url == undefined)
        url = target.src;

    module.addFavoriteGIF({
        url: url,
        src: src,
        width: target.clientWidth,
        height: target.clientHeight,
        format: 1
    });
}

function contextMenuOpen(payload) {
    if (payload.contextMenu.target.nodeName != "A" && payload.contextMenu.target.nodeName != "VIDEO")
        return;

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
            addTargetAsFavorite(payload.contextMenu.target);
            // elem.remove(); // just removing the element from the dom can't be a good idea, but I don't know what else to do...
            document.getElementsByTagName("body")[0].click();
        })

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
