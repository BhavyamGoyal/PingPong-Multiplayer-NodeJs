var ServerEvents = require("../ServerEvents/ServerEvents");

module.exports = class Room {
    constructor(rName, rID,lobby) {
        this.roomName = rName;
        this.roomID = rID;
        this.roomSize = 2;
        this.lobby = lobby;
        this.playersInRoomDictionary = {};
        console.log("room created with name " + this.roomName);
    }

    IsRoomFree(){
        return Object.keys(this.playersInRoomDictionary).length<this.roomSizefes;
    }
    AddPlayerInRoom(player) {
        if (Object.keys(this.playersInRoomDictionary).length < this.roomSize) {
            //player.socket.to(this.roomName).emit(ServerEvents.ON_JOIN_ROOM, playerData);
            this.playersInRoomDictionary[player.playerID] = player;
            player.socket.join(this.roomName);
            console.log("player added to room: " + player.playerName);
           // player.LeaveLobby(this.lobby);
            return true;
        }
        return false;
    }
  
    GetPreviousPlayers(){
        return Object.keys(this.playersInRoomDictionary);
    }
    GetPlayersInRoom(){
        return Object.keys(this.playersInRoomDictionary).length;
    }
    RemovePlayerFromRoom(player,playerData) {
        player.socket.emit(ServerEvents.ON_LEAVE_ROOM, playerData);
        player.socket.to(this.roomName).emit(ServerEvents.ON_LEAVE_ROOM, playerData);
        player.JoinLobby(this.lobby);
        delete this.playersInRoomDictionary[player.playerID];
    }
    IsEmpty() {
        return playersInRoomDictionary == 0;
    }

    PrintPlayersInRoom() {
        console.log("number of players in room " + Object.keys(this.playersInRoomDictionary).length);
        Object.values(this.playersInRoomDictionary).forEach(function (currentValue, index, arr) {
            console.log("Player Name: " + currentValue.playerName);
        });
    }
}