(function () {
    'use strict';

    var canvas = document.getElementById('the-canvas'),
        ctx = canvas.getContext('2d');

    canvas.style.border = '1px solid #000';

    var startBtn = document.getElementById('start'),
        pauseBtn = document.getElementById('pause');

    var MAX_X = 470,
        MAX_Y = canvas.height,
        DWARF_SIZE = 35,
        DWARF_COLOR = 'black',
        DWARF_MOVING_SPEED = 15,
        ROCK_MIN_SIZE = 10,
        ROCK_MAX_SIZE = 35,
        MIN_FALLING_SPEED = 1,
        MAX_FALLING_SPEED = 4,
        MAX_ROCK_GENERATION_INTERVAL = 40,
        MIN_ROCK_GENERATION_INTERVAL = 4,
        LEVEL_UP_POINTS = 30;

    var rocks,
        dwarf,
        dwarfImgObj,
        score,
        level,
        fallingSpeed,
        isAnimationOn,
        rockGenerationInterval,
        ticks;

    function getRandomValue(min, max) {
        return (Math.random() * (max - min) + min) | 0;
    }

    function getRandomColor(min,max) {
        var red = getRandomValue(min, max);  
        var green = getRandomValue(min, max);
        var blue = getRandomValue(min, max);
        return "rgb(" + red + "," + green + "," + blue + ")";
    }

    var Rock = function (x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.draw = function () {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }
    };

    var Dwarf = function (x, y) {
        this.x = x;
        this.y = y;
        this.draw = function () {
            ctx.strokeStyle = DWARF_COLOR;
            ctx.strokeRect(this.x, this.y, DWARF_SIZE, DWARF_SIZE-1);
            ctx.drawImage(dwarfImgObj,this.x,this.y,DWARF_SIZE,DWARF_SIZE);
        }
    };

    function initializeGame () {
        rocks = [];
        dwarf = new Dwarf(DWARF_SIZE + (MAX_X / DWARF_MOVING_SPEED-1)*5, MAX_Y-DWARF_SIZE);
        dwarfImgObj = new Image();
        dwarfImgObj.src = 'images/alien.jpg';
        score = 0;
        level = 1;
        ticks = 0;
        rockGenerationInterval = MAX_ROCK_GENERATION_INTERVAL;
        fallingSpeed = MIN_FALLING_SPEED;
        isAnimationOn = true;
        pauseBtn.innerHTML = 'Pause';
        pauseBtn.disabled = false;
    }

    function displayMetrics () {
        ctx.fillStyle = '#000';
        ctx.font = '20pt Consolas';
        ctx.fillText('Score', MAX_X + 35, MAX_Y/4);
        ctx.fillText(score, MAX_X + 35, MAX_Y/3);
        ctx.fillText('Level', MAX_X + 35, MAX_Y/2);
        ctx.fillText(level, MAX_X + 35, MAX_Y/1.7);
    }

    function renderAll(){
        ctx.strokeRect(0,0,MAX_X,MAX_Y);
        displayMetrics();
        dwarf.draw();
        rocks.map(function (rock) {
            rock.draw();
        });
    }

    function moveRocks(){
        rocks.map(function (rock) {
            rock.y += fallingSpeed;
        });
    }

    function levelUp() {
        level += 1;

        if(fallingSpeed < MAX_FALLING_SPEED){
            fallingSpeed += 0.5;
        }
        if(rockGenerationInterval >= MIN_ROCK_GENERATION_INTERVAL){
            rockGenerationInterval -= 9;
        }

    }

    function updateScoreAndLevel () {
        //clears fallen(out of sight) rocks
        var initialRocksCount = rocks.length;

        for (var i = 0; i < rocks.length; i++) {
            if(rocks[i]. y > MAX_Y){
                rocks.splice(i,1);
                i--;
            }
        }
        score += initialRocksCount - rocks.length;

        if(score > LEVEL_UP_POINTS * level * level){
            levelUp();
        }
    }

    function createRock(){
        var rockSize = getRandomValue(ROCK_MIN_SIZE, ROCK_MAX_SIZE);
        var rockX = getRandomValue(0, MAX_X-rockSize);
        var rockColor = getRandomColor(0,200);

        rocks.push(new Rock(rockX, -rockSize, rockSize, rockColor));
    }

    function endGame (){
        isAnimationOn = false;
        pauseBtn.disabled = true;
        ctx.font = '24pt Consolas';
        ctx.fillStyle = 'red';
        ctx.fillText('Game Over!' ,MAX_X/3, MAX_Y/2);
    }

    function collisionCheck () {
        for (var i = 0; i < rocks.length; i++) {
            if(rocks[i].x < dwarf.x+DWARF_SIZE && rocks[i].x + rocks[i].size > dwarf.x &&
                rocks[i].y < dwarf.y + DWARF_SIZE && rocks[i].y + rocks[i].size > dwarf.y){
                endGame();
            }
        }
    }

    document.body.addEventListener('keydown', function (ev) {
        switch (ev.keyCode){
            case 37:
                if(dwarf.x - DWARF_MOVING_SPEED >= 0){
                    dwarf.x -= DWARF_MOVING_SPEED;
                }
                break;
            case 39:
                if(dwarf.x < MAX_X - DWARF_MOVING_SPEED - DWARF_SIZE/2 - 5){
                    dwarf.x += DWARF_MOVING_SPEED;
                }
                break;
        }
    }, false);

    function animationFrame() {
        if(ticks === rockGenerationInterval){
            createRock();
            updateScoreAndLevel();
            ticks = 0;
        }

        ctx.clearRect(0,0,canvas.width, canvas.height);
        renderAll();
        moveRocks();
        collisionCheck();
        ticks += 1;

        if(isAnimationOn){
            requestAnimationFrame(animationFrame);
        }
    }

    function onStartBtnClick() {
        if(!isAnimationOn){
            initializeGame();
            requestAnimationFrame(animationFrame);
        }
    }

    function onPauseBtnClick() {
        if(isAnimationOn){
            isAnimationOn = false;
            this.innerHTML = 'Resume';
        } else {
            isAnimationOn = true;
            this.innerHTML = 'Pause';
            requestAnimationFrame(animationFrame);
        }

    }

    document.getElementById('start').addEventListener('click', onStartBtnClick, false);
    document.getElementById('pause').addEventListener('click', onPauseBtnClick, false);
})();
