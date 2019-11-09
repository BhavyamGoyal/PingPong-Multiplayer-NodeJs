var Planck = require("planck-js");
var GameLoop=require("gameupdate-loop");
var Vec2 = Planck.Vec2;
var ballBodyDef = {
    type: 'dynamic',
    position: Vec2(0, 0)
};
var ballFixDef = {
    restitution: 1,
    userData: 'ball'
};
module.exports = class GameLogic {
    constructor(room) {
        //console.log(room);
        this.dataToSend=[];
        this.loop;
        this.room = room;
        this.pads = {};
        this.frame=5;
        this.previousPadPositions = {};
        this.worldLoop = null;
        this.world = new Planck.World(Vec2(0, 0));
        this.MULTIPLIER = 3;
        this.ground = this.world.createBody();
        this.ground.createFixture(Planck.Edge(Vec2(-4.55 * this.MULTIPLIER, -4.55 * this.MULTIPLIER), Vec2(4.55 * this.MULTIPLIER, -4.55 * this.MULTIPLIER)), { userData: 'downEdge' });
        this.ground.createFixture(Planck.Edge(Vec2(-4.55 * this.MULTIPLIER, -4.55 * this.MULTIPLIER), Vec2(-4.55 * this.MULTIPLIER, 4.55 * this.MULTIPLIER)), { userData: 'leftEdge' });
        this.ground.createFixture(Planck.Edge(Vec2(4.55 * this.MULTIPLIER, -4.55 * this.MULTIPLIER), Vec2(4.55 * this.MULTIPLIER, 4.55 * this.MULTIPLIER)), { userData: 'rightEdge' });
        this.ground.createFixture(Planck.Edge(Vec2(-4.55 * this.MULTIPLIER, 4.55 * this.MULTIPLIER), Vec2(4.55 * this.MULTIPLIER, 4.55 * this.MULTIPLIER)), { userData: 'upEdge' });
        this.pad1 = this.world.createBody({
            type: 'dynamic',
            position: Vec2(-3.8 * this.MULTIPLIER, 0)
        });
        this.pad2 = this.world.createBody({
            type: 'dynamic',
            position: Vec2(3.8 * this.MULTIPLIER, 0)
        });
        this.ball = this.world.createBody(ballBodyDef);
        console.log(this.ball);
        this.ballspeed = Vec2(5 * this.MULTIPLIER, 2.5 * this.MULTIPLIER);
        var gameWorld = this;
        this.world.on('begin-contact', function (contact) {
            gameWorld.OnCollision(contact);
        });
        //this.OnCollision(contact)
    }
    SetUpWorld() {
        this.pad1.createFixture(Planck.Box(0.3 * this.MULTIPLIER, 0.8 * this.MULTIPLIER), { userData: 'pad1', density: 10000 });
        this.pad2.createFixture(Planck.Box(0.3 * this.MULTIPLIER, 0.8 * this.MULTIPLIER), { userData: 'pad2', density: 10000 });
        this.ball.createFixture(Planck.Circle(0.3 * this.MULTIPLIER), ballFixDef);
    }

    AssignPad(playerID) {
        if (Object.keys(this.pads).length < 1) {
            this.pads[playerID] = this.pad1;
        } else {
            this.pads[playerID] = this.pad2;
        }
        this.previousPadPositions[playerID] = 0;
    }
    MovePad(playerID, inputData) {
        //console.log("player id "+playerID+" inputData "+JSON.stringify(inputData));
        if (Object.keys(this.pads).length == 1) {
            this.pads[playerID].setLinearVelocity(Vec2(0, 15 * inputData.direction));
        }
    }
    StartGame() {
        this.ball.setLinearVelocity(this.ballspeed);
        var world = this;
        this.worldLoop = new GameLoop(60,function (delta, frameCount) {
            console.log(frameCount);
            world.world.step(delta);
            world.UpdatePlayers(world.GetBallPosition(), world.GetPadPositions());
            world.frame++;
        });
        this.worldLoop.StartGameLoop();
    }
    UpdatePlayers(ballPos, padsPos) {
       

        var updateData = {
            frame:this.frame.toString(),
            ball: ballPos,
            pads: padsPos
        }
        this.dataToSend.push(updateData);
        if(this.dataToSend.length>5){
            this.dataToSend.splice(0,1);
        }
        this.room.UpdatePlayers({updateData:this.dataToSend});
    }

    GetPadPositions() {
        var keys = Object.keys(this.pads);
        var padPos = {};
        var playerposChanged=false;
        for(var j=0;j<keys.length;j++){
            if(this.previousPadPositions[keys[j]] != this.pads[keys[j]].getWorldPoint(Vec2(0, 0)).y){
                playerposChanged=true;
                break;
            }
        }
        if (playerposChanged) {
            for (var i = 0; i < keys.length; i++) {
                var pos = {};
                this.previousPadPositions[keys[i]]=this.pads[keys[i]].getWorldPoint(Vec2(0, 0)).y;
                var vec2Pos = this.pads[keys[i]].getWorldPoint(Vec2(0, 0));
                pos['xPos'] = vec2Pos.x / this.MULTIPLIER;
                pos['yPos'] = vec2Pos.y / this.MULTIPLIER;
                padPos[keys[i]] = pos;
            }
        }
        //console.log(padPos);
        return padPos;
    }
    GetBallPosition() {
        var pos = this.ball.getWorldPoint(Vec2(0, 0));
        pos.x = pos.x / this.MULTIPLIER;
        pos.y = pos.y / this.MULTIPLIER;
        var sendPos = {
            xPos: pos.x,
            yPos: pos.y,
        }
        //console.log(JSON.stringify(sendPos));
        return sendPos;
    }
    OnCollision(contact) {
        var fixtureATag = contact.m_fixtureA.m_userData;
        var fixtureBTag = contact.m_fixtureB.m_userData;
        
        if ((fixtureATag == "pad1" || fixtureBTag == "pad1" || fixtureATag == "pad2" || fixtureBTag == "pad2" || fixtureATag == "rightEdge" || fixtureBTag == "rightEdge" || fixtureATag == "leftEdge" || fixtureBTag == "leftEdge") && (fixtureATag == "ball" || fixtureBTag == "ball")) {
            this.ballspeed.x = -this.ballspeed.x;
            this.ball.setLinearVelocity(this.ballspeed);
        } else if ((fixtureATag == "upEdge" || fixtureBTag == "upEdge" || fixtureATag == "downEdge" || fixtureBTag == "downEdge") && (fixtureATag == "ball" || fixtureBTag == "ball")) {
            this.ballspeed.y = -this.ballspeed.y;
            this.ball.setLinearVelocity(this.ballspeed);
        }
        if ((fixtureATag == "ball" || fixtureBTag == "ball") && (fixtureATag == "leftEdge" || fixtureBTag == "leftEdge")) {
            //console.log("collision with left wall p1 lost ");
            //world.destroyBody(ball);
        } else if ((fixtureATag == "ball" || fixtureBTag == "ball") && (fixtureATag == "rightEdge" || fixtureBTag == "rightEdge")) {
            //console.log("collision with left wall p2 lost ");
            //world.destroyBody(ball);
        }
    }
}

// var testclass = new GameLogic();
// testclass.SetUpWorld();
// testclass.StartGame();
// let frameCount = 0;
// var id = function () {
//     GameLoop.setGameLoop(function (delta) {
//         //console.log('Hi there! (frame=%s, delta=%s)', frameCount++, delta);
//         testclass.GetBallPosition();
//     }, 1000);
//}
// // stop the loop 2 seconds later
// setTimeout(id, 2000);
