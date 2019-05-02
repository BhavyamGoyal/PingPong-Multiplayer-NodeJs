var shortID = require("shortid");
var ServerEvents = require("../ServerEvents/ServerEvents");
module.exports = class Player {
    constructor(pName, socket) {
        this.playerName = pName;
        this.socket = socket;
        //this.cardThrowCallback = null;
        //this.OnCardPickedCallback = null;
        this.currentGame = null
        this.room = null;
        this.playerID = shortID.generate();
    }
    JoinRoom(room){
        this.room=room;
        room.AddPlayerInRoom(this);
    }
    JoinGame(){
        var playerData={
            playerID:this.playerID,
            playerSpawn:this.room.GetPlayersInRoom()-1
        }
        this.socket.emit(ServerEvents.ON_JOIN_GAME, playerData);
        this.socket.to(this.room.roomName).emit(ServerEvents.ON_JOIN_GAME,playerData);
        var players=this.room.GetPreviousPlayers();
        for(var i=0;i<players.length;i++){
            playerData={
                playerID:players[i],
                playerSpawn:i
            }
            this.socket.emit(ServerEvents.ON_JOIN_GAME,playerData);
        }
    }
}