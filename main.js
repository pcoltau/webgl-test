import keyboard from './keyboard.js';

let utils = PIXI.utils,
    loader = PIXI.Loader.shared,
    resources = loader.resources;

let charm = new Charm(PIXI);
let bump = new Bump(PIXI);

let type = "WebGL"
if(!utils.isWebGLSupported()){
  type = "canvas"
}

utils.sayHello(type)

//Create a Pixi Application
let app = new PIXI.Application({
    width: 256, 
    height: 256,
    antialias: true,    // default: false
    transparent: false, // default: false
    resolution: 1       // default: 1
});

app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoDensity = true;
app.renderer.resize(window.innerWidth, window.innerHeight);

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

//load an image and run the `setup` function when it's done
loader
    .add("cat", "images/cat.png")
    .add("mine", "images/mine.png")
    .add("cannon", "images/cannon.png")
    .load(setup);
      
let cat;
let mines = [];
let minesContainer;
let cannon;
let catIsDead = false

//This `setup` function will run when the image has loaded
function setup() {
    console.log(new utils.EventEmitter());

    //Create the cat sprite
    cat = new PIXI.Sprite(resources.cat.texture);

    cat.x = app.renderer.width / 2 - cat.width / 2;
    cat.y = app.renderer.height - cat.height;
    cat.vx = 0;
    cat.vy = 0;
    cat.pivot.x = cat.width / 2;
    cat.pivot.y = cat.height / 2;

    //Add the cat to the stage
    app.stage.addChild(cat);

    minesContainer = new PIXI.Container();
    app.stage.addChild(minesContainer);

    cannon = new PIXI.Sprite(resources.cannon.texture);
    cannon.x = -100;
    cannon.y = 0;

    app.stage.addChild(cannon);

    //Capture the keyboard arrow keys
    let left = keyboard("ArrowLeft"),
        right = keyboard("ArrowRight");

    left.press = () => {
        //Change the cat's velocity when the key is pressed
        cat.vx = -5;
        cat.vy = 0;
    };
    right.press = () => {
        //Change the cat's velocity when the key is pressed
        cat.vx = 5;
        cat.vy = 0;
    };

    //Start the game loop by adding the `gameLoop` function to
    //Pixi's `ticker` and providing it with a `delta` argument.
    app.ticker.add(delta => gameLoop(delta));
}

let timerCounter = 0;

function gameLoop(delta) {
    timerCounter += delta;
    if (!catIsDead) {
        if (timerCounter > 100) {
            timerCounter %= 100;
            if (mines.length < 200) {
                animateCannon();
            }
        }    

        bounceSprite(cat, delta);

        cat.x += cat.vx * delta;

        mines.forEach(function(mine) {
            mine.vy += 0.05;

            bounceSprite(mine, delta);

            mine.x += mine.vx * delta;
            mine.y += mine.vy * delta;

            if (bump.hitTestRectangle(cat, mine)) {
                catDied();
            }
        });

    } else {
        cat.rotation += 0.2 * delta
        if (cat.rotation > 15) {
            minesContainer.removeChildren();
            mines = [];
            cat.rotation = 0;
            catIsDead = false;
        }
    }
    charm.update();
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function spawnMine() {
    let mine = new PIXI.Sprite(resources.mine.texture);

    mine.x = 30;
    mine.y = 10;
    mine.vx = randomInt(200, 500) / 100;
    mine.vy = 0;

    minesContainer.addChild(mine);

    mines.push(mine)
}

function bounceSprite(sprite, delta) {
    let vx = sprite.vx * delta;
    let vy = sprite.vy * delta;

    if (sprite.x + vx < 0) {
        sprite.vx = -sprite.vx;
        sprite.x = 0;
    } 
    if (sprite.x + vx > (app.renderer.width - sprite.width)) {
        sprite.vx = -sprite.vx;
        sprite.x = (app.renderer.width - sprite.width);
    } 

    if (sprite.y + vy < 0) {
        sprite.yx = -sprite.yx;
        sprite.y = 0;
    } 
    if (sprite.y + vy > (app.renderer.height - sprite.height)) {
        sprite.vy = -sprite.vy;
        sprite.y = (app.renderer.height - sprite.height);
    } 
}

function animateCannon() {
    let cannonTween = charm.slide(cannon, -150, 0, 3);
    cannonTween.onComplete = () => { 
        spawnMine();
        charm.slide(cannon, -100, 0, 10);
    }
}

function catDied() {
    catIsDead = true;
}