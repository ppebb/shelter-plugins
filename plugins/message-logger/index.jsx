const {
    flux: {
        intercept,
        dispatcher,
        stores: {
            SelectedChannelStore
        }
    }
} = shelter;

let messagesByChannel = {};

function messageDelete(dispatch) {
    if (dispatch.type != "MESSAGE_DELETE" || dispatch.channelId != SelectedChannelStore.getChannelId())
        return true;

    let messageElem = document.querySelector("[id^=message-content-" + dispatch.id + "]");
    if (messageElem.style.color == "red") // For some reason this dispatch runs twice. Prevent it from running again.
        return false;
    messageElem.style.color = "red";

    // Hardcoded css classes, but I'm not sure how I'd get them dynamically
    messageElem.appendChild(
        <span className="timestamp_cdbd93">
            <time dateTime={new Date().toISOString()}>
                <span className="edited_b20dd9">
                    &nbsp;(deleted)
                </span>
            </time>
        </span>
    )

    messageElem.addEventListener("mouseenter", () => { console.log("guh"); });
    if (messagesByChannel[dispatch.channelId] == undefined)
        messagesByChannel[dispatch.channelId] = [];

    messagesByChannel[dispatch.channelId].push({ id: parseInt(dispatch.id), element: document.querySelector("[id^='chat-messages-'][id$='" + dispatch.id + "']") });
    console.log(messagesByChannel);

    return false;
}

function getMessagesBetweenIds(messageContainer, topId, bottomId) {
    let ret = [];

    for (child of messageContainer.children) {
        let messageId = parseInt(child.id.split("-")[2]);
        if (messageId >= topId && messageId <= bottomId)
            ret.push(child);
    }

    return ret;
}

function updateVisibleMessages(payload) {
    let deletedMessages = messagesByChannel[SelectedChannelStore.getChannelId()];

    if (deletedMessages == undefined)
        return;

    let bottomMessageId = parseInt(payload.bottomVisibleMessage);
    let topMessageId = parseInt(payload.topVisibleMessage);

    let messageContainer = document.querySelector("[class^=scrollerInner]"); // Hoping this won't magically break
    let messagesToCheck;
    if (payload.bottomVisibleMessage != null && payload.topVisibleMessage != null)
        messagesToCheck = getMessagesBetweenIds(messageContainer, topMessageId, bottomMessageId);
    else
        messagesToCheck = messageContainer.children;

    for (message of deletedMessages) {
        if (payload.bottomVisibleMessage != null && payload.topVisibleMessage != null)
            if (message.id < topMessageId || message.id > bottomMessageId)
                continue;

        if (messageContainer.contains(message.element))
            continue;

        let nextAboveId = null;
        for (let i = 0; i < messagesToCheck.length - 1; i++) {
            let aboveMessage = messagesToCheck[i];
            let aboveMessageId = nextAboveId ?? parseInt(aboveMessage.id.split("-")[3]);
            let belowMessage = messagesToCheck[i + 1];
            let belowMessageId = parseInt(belowMessage.id.split("-")[3]);

            console.log("checking " + aboveMessageId + " < " + message.id + " < " + belowMessageId);
            if (aboveMessageId < message.id && message.id < belowMessageId) {
                messageContainer.insertBefore(message.element, belowMessage);
                break;
            }

            nextAboveId = belowMessageId;
        }
    }
}

let unint;
export function onLoad() { // optional
    dispatcher.subscribe("UPDATE_VISIBLE_MESSAGES", updateVisibleMessages);
    unint = intercept(messageDelete);
}

export function onUnload() { // required
    unint();
    dispatcher.unsubscribe("UPDATE_VISIBLE_MESSAGES", updateVisibleMessages);
}
