Number.prototype.padDigits = function(digits) {
    return Array(Math.max(digits - String(this).length + 1, 0)).join(0) + this;
}
Number.prototype.mx = function() {
  return Math.round(this * 10);
}
window.onload = function() {
    let newWorm = new Worm("worm-board",32,40); 
    let buttonList = document.querySelectorAll(".worm-btn");
    [...buttonList].forEach( (button, ind) => {
        newWorm.buttonList.push( { domObj : button } );
        button.onmousedown = function() { newWorm.onKey( null, this.getAttribute("data-id"), true ); };
        button.onmouseup = function() { newWorm.onKey( null, this.getAttribute("data-id"), false ); };
        });
    document.addEventListener('keydown', ev => { return newWorm.onKey(ev, ev.keyCode, true); }, false );
    document.addEventListener('keyup',  ev => { return newWorm.onKey(ev, ev.keyCode, false); }, false );
}
class Worm{
    constructor(container, width, height){
        this.KEY = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, START: 0 };
        this.canvas = document.createElement("canvas");
        this.canvas.width = width.mx();
        this.canvas.height = height.mx();
        this.ctx = this.canvas.getContext("2d");
        document.getElementById(container).appendChild(this.canvas);
        this.buttonList = [];
        this.speedY = 1; this.speedX = 0;
        this.timeFrameMSec = 200;
        this.interval;
        this.wormBody; this.wormFood;
        this.score = 0;
    }
    onKey(ev, key, pressed) {
        if( this.isDrawing === true ) return;
        if( !pressed ) return;
        switch(parseInt(key)) {
            case this.KEY.LEFT:  
                if( this.speedX === 1 ) this.stopGame();
                this.speedY = 0;  this.speedX = -1;  break;
            case this.KEY.RIGHT:
                if( this.speedX === -1 ) this.stopGame();
                this.speedY = 0;  this.speedX =  1;  break;
            case this.KEY.UP:    
                if( this.speedY === 1 ) this.stopGame();
                this.speedX = 0;  this.speedY = -1;  break;
            case this.KEY.DOWN:  
                if( this.speedY === -1 ) this.stopGame();
                this.speedX = 0;  this.speedY =  1;  break;
            case this.KEY.START: this.startGame(); 
                return; break;
            default: return;
        }
        if( ev !== null ) { ev.preventDefault(); }
    }
    initWorm(){
        this.wormBody = [
            {xPos:10,yPos:10,fix:true,color:"green"},
            {xPos:10,yPos:11,fix:true,color:"green"},
            {xPos:10,yPos:12,fix:true,color:"green"},
            {xPos:10,yPos:13,fix:true,color:"green"},
            {xPos:10,yPos:14,fix:true,color:"green"},
            {xPos:10,yPos:15,fix:true,color:"green"},
            {xPos:10,yPos:16,fix:true,color:"green"},
            {xPos:10,yPos:17,fix:true,color:"green"},
            {xPos:10,yPos:18,fix:true,color:"green"},
            {xPos:10,yPos:19,fix:false,color:"green"}
        ];
        this.speedY = 0;
        this.speedX = 1;
        this.wormFood = {xPos:3,yPos:3,fix:true,color:"red"};
    }
    initWormX(){
        let xBody, yBody, xForm, yForm;
        this.score = 0;
        do{
            xBody = this.getRandom(22)+5;
            yBody = this.getRandom(30)+5;
            xFood = this.getRandom(32);
            yFood = this.getRandom(37)+3;
        }
        while( xBody === xFood && yBody === yFood);
        this.speedY = 0; this.speedX = 0;
        switch(this.getRandom(4)) {
            case 0: this.speedY = 1; break;
            case 1: this.speedY = -1; break;
            case 2: this.speedX = 1; break;
            case 3: this.speedX = -1; break;
        }
        this.wormBody = [{xPos:xBody,yPos:yBody,fix:true,color:"green"}];
        this.wormFood = {xPos:xFood,yPos:yFood,fix:true,color:"red"};
    }
    showPad(visible){
        document.querySelector("#worm-pad").style.visibility = (visible?"visible":"hidden");
        document.querySelector("#worm-intro").style.visibility = (visible?"hidden":"visible");
    }
    startGame(){
        this.ctx.clearRect(0,0,(32).mx(),(40).mx());
        this.isDrawing = false;
        this.showPad(true);
        this.initWorm();
        this.updateWorm();
        this.updateWorm = this.updateWorm.bind(this);
        this.interval = setInterval(this.updateWorm, this.timeFrameMSec);
    }
    stopGame(){
        this.isDrawing = false;
        clearInterval(this.interval);
        this.showPad(false);
    }
    updateWorm(){
        if( this.isDrawing === true) return;
        this.isDrawing = true;
        let newX = this.wormBody[0].xPos+this.speedX;
        let newY = this.wormBody[0].yPos+this.speedY;
        if( (3 <= newY &&  newY < 40) && (0 <= newX &&  newX < 32) ){
            this.drawObject(this.wormFood);
            let obj = {xPos:newX,yPos:newY,fix:true,color:"green"};
            if( this.wormBody.reduce( (f,e,i,a) => {
                     return f || ((i < (a.length-1)) ? (e.xPos === obj.xPos && e.yPos === obj.yPos) : false); },false) === true ){
                this.stopGame(); 
            }
            this.wormBody.unshift(obj);
            if( newX === this.wormFood.xPos && newY === this.wormFood.yPos ){
                this.wormBody.map( (v,i,a) => { this.drawObject(v); });
                this.wormFood.xPos = this.getRandom(32);
                this.wormFood.yPos = this.getRandom(37)+3;
                this.score+=1;
                this.drawObject(this.wormFood);
            } else {
                this.wormBody[this.wormBody.length-1].fix = false;                
                this.wormBody.map( (v,i,a) => { this.drawObject(v); });
                this.wormBody.pop();
            }
        } else {
            this.stopGame();
        }
        this.drawScore();
        this.isDrawing = false;
    }
    drawObject(obj){
        this.ctx.fillStyle = (obj.fix === true) ? obj.color : "#191919";
        this.ctx.fillRect(obj.xPos.mx(),obj.yPos.mx(),(1).mx(),(1).mx());
    }
    drawScore(){
        this.ctx.fillStyle = "#393939";
        this.ctx.fillRect(0,0,(40).mx(),(3).mx());
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.font = "20px Arial";
        this.ctx.fillText ( `SCORE: ${this.score.padDigits(3)}`, (17.5).mx(), (2.1).mx());                  
    }
    getRandom(num) {
        return Math.floor(Math.random() * num);
    }
}