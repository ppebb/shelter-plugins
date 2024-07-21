// shelter.flux.stores.GuildMemberStore.getMembers(shelter.flux.stores.SelectedGuildStore.getGuildId())
// shelter.flux.stores.UserStore.getUser("342472993567408148") mobile and desktop fields
// shelter.flux.stores.ChannelMemberStore.getRows("1102079053915238423", "1173487640528568361")
const {
    flux: {
        dispatcher,
        stores: {
            SelectedGuildStore
        }
    },
    observeDom
} = shelter;

let indicatorsByUser = [];

function channelSelect(payload) {

}

function updateInDm(updates) {

}

function updateInGuild(updates) {

}

function presenceUpdates(payload) {
    let guildId = SelectedGuildStore.getGuildId();
    let inGuild = guildId != undefined;
    let updatesToProcess = [];

    for (update of payload.updates) {
        if (update.guildId != guildId) // If DMs are open, guildId is null, and the update's guildId is undefined
            continue;

        updatesToProcess.push(update);
    }

}

export function onLoad() { // optional
    dispatcher.subscribe("CHANNEL_SELECT", channelSelect);
    dispatcher.subscribe("PRESENCE_UPDATES", presenceUpdates);
}

export function onUnload() { // required
    dispatcher.unsubscribe("CHANNEL_SELECT", channelSelect);
    dispatcher.unsubscribe("PRESENCE_UPDATES", presenceUpdates);
}
