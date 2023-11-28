const {
    flux: {
        intercept,
        stores: {
            SelectedChannelStore
        }
    }
} = shelter;

function messageDelete(dispatch) {
    if (dispatch.type != "MESSAGE_DELETE" || dispatch.channelId != SelectedChannelStore.getChannelId())
        return true;

    let message = document.querySelector("[id^=message-content-" + dispatch.id + "]");
    if (message.style.color == "red") // For some reason this dispatch runs twice. Prevent it from running again.
        return false;
    message.style.color = "red";

    message.appendChild(
        <span className="timestamp_cdbd93">
            <time dateTime={new Date().toISOString()}>
                <span className="edited_b20dd9">
                    &nbsp;(deleted)
                </span>
            </time>
        </span>
    )

    return false;
}

let unint;
export function onLoad() { // optional
    unint = intercept(messageDelete);
}

export function onUnload() { // required
    unint();
}
