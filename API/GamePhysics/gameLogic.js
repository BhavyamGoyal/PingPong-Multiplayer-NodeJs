var Planck = require("planck-js");
const GameLoop = require('node-gameloop');
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
        this.room = room;
        this.pads = {};
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
        console.log("player id "+playerID+" inputData "+JSON.stringify(inputData));
        if (Object.keys(this.pads).length == 2) {
            this.pads[playerID].setLinearVelocity(Vec2(0, 15 * inputData.direction));
        }
    }
    StartGame() {
        this.ball.setLinearVelocity(this.ballspeed);
        var world = this;
        this.worldLoop = GameLoop.setGameLoop(function (delta) {
            world.world.step(1 / 30);
            world.UpdatePlayers(world.GetBallPosition(), world.GetPadPositions());

        }, 1000 / 30);
    }
    UpdatePlayers(ballPos, padsPos) {
        var updateData = {
            ball: ballPos,
            pads: padsPos
        }
        this.room.UpdatePlayers(updateData);
    }

    GetPadPositions() {
        var keys = Object.keys(this.pads);
        var padPos = {};
        if (this.previousPadPositions[keys[0]] != this.pads[keys[0]].getWorldPoint(Vec2(0, 0)).y || this.previousPadPositions[keys[1]] != this.pads[keys[1]].getWorldPoint(Vec2(0, 0)).y) {
            for (var i = 0; i < keys.length; i++) {
                var pos = {};
                this.previousPadPositions[keys[i]]=this.pads[keys[i]].getWorldPoint(Vec2(0, 0)).y;
                var vec2Pos = this.pads[keys[i]].getWorldPoint(Vec2(0, 0));
                pos['xPos'] = vec2Pos.x / this.MULTIPLIER;
                pos['yPos'] = vec2Pos.y / this.MULTIPLIER;
                padPos[keys[i]] = pos;
            }
        }
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
        return sendPos;
    }
    OnCollision(contact) {
        var fixtureATag = contact.m_fixtureA.m_userData;
        var fixtureBTag = contact.m_fixtureB.m_userData;
        //console.log("qqqqqqqqqqqqqqqqqqqqqqqqqqqq");
        // game.GetBallPosition();
        if ((fixtureATag == "pad1" || fixtureBTag == "pad1" || fixtureATag == "pad2" || fixtureBTag == "pad2" || fixtureATag == "rightEdge" || fixtureBTag == "rightEdge" || fixtureATag == "leftEdge" || fixtureBTag == "leftEdge") && (fixtureATag == "ball" || fixtureBTag == "ball")) {
            this.ballspeed.x = -this.ballspeed.x;
            this.ball.setLinearVelocity(this.ballspeed);
        } else if ((fixtureATag == "upEdge" || fixtureBTag == "upEdge" || fixtureATag == "downEdge" || fixtureBTag == "downEdge") && (fixtureATag == "ball" || fixtureBTag == "ball")) {
            this.ballspeed.y = -this.ballspeed.y;
            this.ball.setLinearVelocity(this.ballspeed);
        }
        //console.log("collision "+fixtureATag+"  "+fixtureBTag);
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
