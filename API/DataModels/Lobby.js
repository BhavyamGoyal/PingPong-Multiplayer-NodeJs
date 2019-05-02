var Room = require("./Room");
var ShortID=require("shortid");
module.exports = class Lobby {
    constructor(lName, lID) {
        this.lobbyName = lName;
        this.lobbyID = lID;
        this.roomsInLobbyDictionary = {};
        this.playersInLobbyDictionary = {};
        console.log("lobby created with name " + this.lobbyName)
    }

    GetTheRoom() {
        var room = null;

        Object.values(this.roomsInLobbyDictionary).forEach(function (curRoom) {
            if (curRoom.IsRoomFree()) {
                room = curRoom;
                console.log("ROOOOM found");
                return room;
            }
        });

        if (room == null) {
            var id=ShortID.generate();
            console.log("ROOOOM not found");
            room = new Room("Room" +id, id,this);
            this.AddRoomsInLobby(room);
        }
        return room;
    }

    AddRoomsInLobby(room) {
            this.roomsInLobbyDictionary[room.roomID] = room;
            console.log("room added to lobby: " + room.roomName);
            return true;
    }
    RemoveRoomFromLobby(room) {
        return delete this.roomsInLobbyDictionary[room.roomID];
    }
    AddPlayerInLobby(player) {
        this.playersInLobbyDictionary[player.playerID] = player;
        //console.log("+++++++++++++++++++player added to lobby: " + player.playerName);
        return true;
    }
    RemovePlayerFromLobby(player) {
        return delete this.playersInLobbyDictionary[player.playerID];
    }
    PrintroomsInLobby() {
        console.log("number of rooms in lobby " + this.roomsInLobbyDictionaryDictionary.length);
        Object.values(this.roomsInLobbyDictionary).forEach(function (currentValue, index, arr) {
            console.log("Room Name: " + currentValue.playerName);
        });
    }
}