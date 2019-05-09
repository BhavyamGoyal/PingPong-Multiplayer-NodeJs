var ServerEvents = require("../ServerEvents/ServerEvents");
var GameLogic = require("../GamePhysics/gameLogic");
module.exports = class Room {
    constructor(rName, rID, lobby) {
        this.roomName = rName;
        this.roomID = rID;
        this.roomSize = 2;
        this.lobby = lobby;
        this.playersInRoomDictionary = {};
        this.game = new GameLogic(this);;
        console.log("room created with name " + this.roomName);
    }
    IsRoomFree() {
        console.log("ROOOOM size" + Object.keys(this.playersInRoomDictionary).length);
        return Object.keys(this.playersInRoomDictionary).length < this.roomSize;
    }
    AddPlayerInRoom(player) {
        if (Object.keys(this.playersInRoomDictionary).length < this.roomSize) {
            //player.socket.to(this.roomName).emit(ServerEvents.ON_JOIN_ROOM, playerData);
            this.playersInRoomDictionary[player.playerID] = player;
            player.socket.join(this.roomName);
            this.game.AssignPad(player.playerID);
            console.log("player added to room: " + player.playerName);
            // player.LeaveLobby(this.lobby);
            return true;
        }
        return false;
    }

    UpdateAllPlayerInRoom(event, data) {
        var players = Object.values(this.playersInRoomDictionary);
        for (var i = 0; i < players.length; i++) {
                players[i].socket.emit(event,data);
        }
    }

    UpdatePlayers(UpdateData) {
        this.UpdateAllPlayerInRoom(ServerEvents.ON_SERVER_UPDATE, UpdateData);
    }

    CheckAndStart() {
        if (Object.keys(this.playersInRoomDictionary).length == 2) {
            this.UpdateAllPlayerInRoom(ServerEvents.ON_GAME_STARTED, {});
            this.game.SetUpWorld();
            this.game.StartGame();
            console.log("Game Starting");
            return true;
        }
        return false;
    }
    GetPreviousPlayers() {
        return Object.keys(this.playersInRoomDictionary);
    }
    GetPlayersInRoom() {
        return Object.keys(this.playersInRoomDictionary).length;
    }
    RemovePlayerFromRoom(player, playerData) {
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