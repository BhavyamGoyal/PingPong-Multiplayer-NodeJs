var ServerEvents = require("../ServerEvents/ServerEvents");

module.exports = class PlayersList {
    constructor(pName, pID = null) {
        this.players = {};
    }
    PlayerConnectedLobby(player) {
        this.players[player.playerID] = player
        return true;
    }
    PlayerDisconnected(pID) {
        delete this.players[pID];
    }
}