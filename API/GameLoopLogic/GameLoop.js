module.exports=class GameUpdate {
    constructor(fps,callback) {
        this.fps=fps;
        this.callback=callback;
        this.tickLengthMs = 1000 / fps;
        this.previousTick = Date.now();
        this.delta;
    }
    
    gameLoop(){
        var now = Date.now()
        if (this.previousTick + this.tickLengthMs <= now) {
             this.delta= (now - this.previousTick) / 1000;
            this.previousTick = now;
            this.callback(this.delta);
        }
        if (Date.now() - this.previousTick < this.tickLengthMs - 16) {
            setTimeout(()=>this.gameLoop())
        } else {
            setImmediate(()=>this.gameLoop())
        }
    }
}