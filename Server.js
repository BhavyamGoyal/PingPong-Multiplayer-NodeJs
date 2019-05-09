var io = require('socket.io')({ transports: ['websocket'], });
var Player = require("./API/DataModels/Player");
var Lobby = require("./API/DataModels/Lobby");
var SocketSettings = require("./API/ServerSettings/SocketServerSettings");
var ServerEvents = require("./API/ServerEvents/ServerEvents");
var PlayersList = require("./API/DataModels/PlayersList");
console.log("Socket Server Started at port: " + SocketSettings.socketPort);
var playersList = new PlayersList();
var lobby = new Lobby("Lobby1", 1);
io.attach(SocketSettings.socketPort);
io.on('connection', function (socket) {
   console.log('A user connected');
   socket.emit(ServerEvents.ON_CONNECTED);
   var player=null;
   
   socket.on(ServerEvents.REGISTER_USER, function (data) {
      console.log('User Rregistering'+JSON.stringify(data));
      player=new Player(data.playerName,socket);
      var playerData={
         playerName:data.playerName,
         playerID:player.playerID
      }
      socket.emit(ServerEvents.ON_USER_REGISTER,playerData);
   });

   socket.on(ServerEvents.JOIN_ROOM, function () {
      console.log("player joining room");
      var room=lobby.GetTheRoom();
      player.JoinRoom(room);
      //player.JoinGame();
   });

   socket.on(ServerEvents.LEAVE_ROOM, function (data) {
   });

   socket.on(ServerEvents.SEND_INPUT, function (data) {
      console.log("Input Recieved"+JSON.stringify(data));
      player.MovePad(data);
   });

   socket.on("disconnect", function () {
      console.log("user Disonnected");
   });
});