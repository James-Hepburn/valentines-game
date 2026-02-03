const canvas = document.getElementById ("gameCanvas");
const ctx = canvas.getContext ("2d");

const bgMusic = new Audio ("sounds/Background.ogg");
bgMusic.loop = true;
bgMusic.volume = 0.15;

const heartSound = new Audio ("sounds/CollectHeart.mp3");
heartSound.volume = 0.5;

const character = {
    x: 210,
    y: 420,
    width: 80,
    height: 80,
    speed: 4,
    direction: "right", 
    moving: false,
    frameCount: 0,
    sprites: {
        up: {
            standing: new Image (),
            walking: new Image (),
            sitting: new Image ()
        },
        down: {
            standing: new Image (),
            walking: new Image (),
            sitting: new Image ()
        },
        left: {
            standing: new Image (),
            walking: new Image (),
            sitting: new Image ()
        },
        right: {
            standing: new Image (),
            walking: new Image (),
            sitting: new Image ()
        }
    }
};

character.sprites.up.standing.src = "sprites/Standing-Up.png";
character.sprites.up.walking.src = "sprites/Walking-Up.png";
character.sprites.up.sitting.src = "sprites/Sitting-Right.png";

character.sprites.down.standing.src = "sprites/Standing-Down.png";
character.sprites.down.walking.src = "sprites/Walking-Down.png";
character.sprites.down.sitting.src = "sprites/Sitting-Left.png";

character.sprites.left.standing.src = "sprites/Standing-Left.png";
character.sprites.left.walking.src = "sprites/Walking-Left.png";
character.sprites.left.sitting.src = "sprites/Sitting-Left.png";

character.sprites.right.standing.src = "sprites/Standing-Right.png";
character.sprites.right.walking.src = "sprites/Walking-Right.png";
character.sprites.right.sitting.src = "sprites/Sitting-Right.png";

const heartImg = new Image ();
heartImg.src = "sprites/heart.png";

let heartsCollected = 0;
let activeHearts = [];

let gameState = "title";

const objectsByArea = {
    GrassArea: [
        {
            x: 150,
            y: -20,
            width: 150,
            height: 150,
            revealed: false,
            imgSrc: "backgrounds/area1/Rock.png",
            message: "I like your piercings"
        },
        {
            x: 20,
            y: 330,
            width: 45,
            height: 45,
            revealed: false,
            imgSrc: "backgrounds/area1/Flowers.png",
            message: "I'm excited to see Motley Crue with you"
        },
        {
            x: 350,
            y: 90,
            width: 70,
            height: 70,
            revealed: false,
            imgSrc: "backgrounds/area1/Bush.png",
            message: "I think you're really pretty"
        },
        {
            x: 300,
            y: 260,
            width: 120,
            height: 70,
            revealed: false,
            imgSrc: "backgrounds/area1/Log.png",
            message: "I love spending time with you"
        },
        {
            x: 20,
            y: 20,
            width: 90,
            height: 180,
            revealed: false,
            imgSrc: "backgrounds/area1/Tree.png",
            message: "I'm really glad we met"
        }
    ],
    SandArea: [
        {
            x: 130,
            y: 450,
            width: 45,
            height: 45,
            revealed: false,
            imgSrc: "backgrounds/area2/Shell1.png",
            message: "You make me smile"
        },
        {
            x: 20,
            y: 330,
            width: 45,
            height: 45,
            revealed: false,
            imgSrc: "backgrounds/area2/Shell2.png",
            message: "I like you"
        },
        {
            x: 350,
            y: 110,
            width: 70,
            height: 70,
            revealed: false,
            imgSrc: "backgrounds/area2/Seaweed.png",
            message: "Kissing you is a lot of fun"
        },
        {
            x: 200,
            y: 260,
            width: 70,
            height: 70,
            revealed: false,
            imgSrc: "backgrounds/area2/Crab.png",
            message: "You're cute"
        },
        {
            x: 20,
            y: 50,
            width: 110,
            height: 180,
            revealed: false,
            imgSrc: "backgrounds/area2/Umbrella.png",
            message: "I like joking around with you"
        }
    ],
    PondArea: [
        {
            x: 130,
            y: 450,
            width: 45,
            height: 45,
            revealed: false,
            imgSrc: "backgrounds/area3/Acorn.png",
            message: "Being around you feels good"
        },
        {
            x: 270,
            y: 30,
            width: 60,
            height: 60,
            revealed: false,
            imgSrc: "backgrounds/area3/Leaf.png",
            message: "Hi"
        },
        {
            x: 350,
            y: 110,
            width: 70,
            height: 70,
            revealed: false,
            imgSrc: "backgrounds/area3/LilyPad.png",
            message: "You're on my mind a lot"
        },
        {
            x: 400,
            y: 280,
            width: 70,
            height: 70,
            revealed: false,
            imgSrc: "backgrounds/area3/Duck.png",
            message: "I like your eyes"
        }
    ]
};

Object.values (objectsByArea).forEach (areaObjects => {
    areaObjects.forEach (obj => {
        obj.img = new Image ();
        obj.img.src = obj.imgSrc;
    });
});

const keys = {};
document.addEventListener ('keydown', e => keys [e.key] = true);
document.addEventListener ('keyup', e => keys [e.key] = false);

document.addEventListener('keydown', e => {
    keys[e.key] = true;

    if (gameState === "playing" && e.key.toLowerCase () === 'e') {
        const areaObjects = objectsByArea [currentArea];

        if (areaObjects) {
            for (let obj of areaObjects) {
                if (!obj.revealed && isNear (character, obj, 60)) {
                    obj.revealed = true;

                    if (!obj.collected) {
                        activeHearts.push ({
                            x: canvas.width / 2,
                            y: canvas.height / 2,
                            size: 10,
                            maxSize: 100,
                            growthRate: 2,
                            alpha: 1,
                            obj: obj,
                            message: obj.message
                        });

                        heartSound.currentTime = 0;
                        heartSound.play ();
                    }

                    break; 
                }
            }
        }
    }
});

let mouseX = 0;
let mouseY = 0;

canvas.addEventListener ("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

let titleBounceFrame = 0;

function drawTitleScreen () {
    titleBounceFrame++;

    ctx.fillStyle = "#f0abff";
    ctx.fillRect (0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ff1493"; 
    ctx.font = "36px Arial";
    ctx.textAlign = "center";

    const bounce = Math.sin (titleBounceFrame * 0.15) * 5;
    ctx.fillText ("Happy Valentine's Day!", canvas.width / 2, canvas.height / 3 - 50 + bounce);

    function drawRoundedRect (x, y, width, height, radius, fillColor, strokeColor, lineWidth = 3) {
        ctx.beginPath ();
        ctx.moveTo (x + radius, y);
        ctx.lineTo (x + width - radius, y);
        ctx.quadraticCurveTo (x + width, y, x + width, y + radius);
        ctx.lineTo (x + width, y + height - radius);
        ctx.quadraticCurveTo (x + width, y + height, x + width - radius, y + height);
        ctx.lineTo (x + radius, y + height);
        ctx.quadraticCurveTo (x, y + height, x, y + height - radius);
        ctx.lineTo (x, y + radius);
        ctx.quadraticCurveTo (x, y, x + radius, y);
        ctx.closePath ();

        if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fill ();
        }

        if (strokeColor) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth;
            ctx.stroke ();
        }
    }

    const btnX = canvas.width / 2 - 75;
    const btnY = canvas.height / 2;
    const btnWidth = 150;
    const btnHeight = 50;

    let btnColor = "#ff69b4"; 

    if (mouseX >= btnX && mouseX <= btnX + btnWidth && mouseY >= btnY && mouseY <= btnY + btnHeight) {
        btnColor = "#ff85c1"; 
    }

    drawRoundedRect (btnX, btnY, btnWidth, btnHeight, 15, btnColor, "#000");

    ctx.fillStyle = "#fff";
    ctx.font = "24px Arial";
    ctx.fillText ("Play", canvas.width / 2, canvas.height / 2 + 33);
}

let musicStarted = false;

canvas.addEventListener ("click", (e) => {
    const rect = canvas.getBoundingClientRect ();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (gameState === "title") {
        if (
            mouseX >= canvas.width / 2 - 75 &&
            mouseX <= canvas.width / 2 + 75 &&
            mouseY >= canvas.height / 2 &&
            mouseY <= canvas.height / 2 + 50
        ) {
            gameState = "cutscene";
            cutsceneStartTime = Date.now ();

            if (!musicStarted) {
                bgMusic.play ();
                musicStarted = true;
            }
        }
    }
});

let cutsceneStartTime = 0;

function drawStartCutscene () {
    const elapsed = Date.now () - cutsceneStartTime;
    let alpha = 1;

    if (elapsed > 5000) {
        alpha = Math.max (0, 1 - (elapsed - 5000) / 1000);

        if (alpha === 0) {
            gameState = "playing"; 
            return;
        }
    }

    ctx.fillStyle = `rgba(240,171,255,${alpha})`; 
    ctx.fillRect (0, 0, canvas.width, canvas.height);

    ctx.fillStyle = `rgba(255,20,147,${alpha})`;
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText ("Instructions:", canvas.width / 2, canvas.height / 2 - 125);
    ctx.textAlign = "left";
    ctx.fillText ("* Use arrow keys to explore", 20, canvas.height / 2 - 75);
    ctx.fillText ("* Press E to interact with items", 20, canvas.height / 2 - 25);
    ctx.fillText ("* Collect all the hearts around the map", 20, canvas.height / 2 + 25);
    ctx.fillText ("* Return to the start after collecting them all", 20, canvas.height / 2 + 75);
}

const areas = {
    MainArea: {
        bg: "backgrounds/MainArea.png",
        exits: {
            top: "GrassArea",
            left: "SandArea",
            right: "PondArea"
        }
    },
    GrassArea: {
        bg: "backgrounds/GrassArea.png",
        exits: {
            bottom: "MainArea"
        }
    },
    SandArea: {
        bg: "backgrounds/SandArea.png",
        exits: {
            right: "MainArea"
        }
    },
    PondArea: {
        bg: "backgrounds/PondArea.png",
        exits: {
            left: "MainArea"
        }
    }
};

let currentArea = "MainArea";

const backgroundImg = new Image ();
backgroundImg.src = areas [currentArea].bg;

function changeArea (newArea, entrySide) {
    currentArea = newArea;
    backgroundImg.src = areas [newArea].bg;

    if (entrySide === "top") character.y = canvas.height - character.height - 20;
    if (entrySide === "bottom") character.y = 20;
    if (entrySide === "left") character.x = canvas.width - character.width - 20;
    if (entrySide === "right") character.x = 20;
}

function isNear (character, obj, distance) {
    const charCenterX = character.x + character.width / 2;
    const charCenterY = character.y + character.height / 2;

    const objCenterX = obj.x + obj.width / 2;
    const objCenterY = obj.y + obj.height / 2;

    const dx = charCenterX - objCenterX;
    const dy = charCenterY - objCenterY;

    return Math.hypot (dx, dy) < distance;
}

const popup = document.getElementById ("heartPopup");
const popupText = document.getElementById ("popupText");
const closePopup = document.getElementById ("closePopup");

let popupActive = false;

function showHeartMessage (text) {
    popupText.textContent = text;
    popup.classList.remove ("hidden");
    popupActive = true;
}

closePopup.addEventListener ("click", () => {
    popup.classList.add ("hidden");
    popupActive = false;
});

function updateGame () {
    ctx.drawImage (backgroundImg, 0, 0, canvas.width, canvas.height);
    character.moving = false;

    if (!popupActive) {
        if (keys ["ArrowUp"]) {
            character.y -= character.speed;
            character.moving = true;
            character.direction = "up";
        }

        if (keys ["ArrowDown"]) {
            character.y += character.speed;
            character.moving = true;
            character.direction = "down";
        }

        if (keys ["ArrowLeft"]) {
            character.x -= character.speed;
            character.moving = true;
            character.direction = "left";
        }

        if (keys ["ArrowRight"]) {
            character.x += character.speed;
            character.moving = true;
            character.direction = "right";
        }
    }

    if (character.y + character.height < 0) {
        const next = areas [currentArea].exits.top;

        if (next) {
            changeArea (next, "top");
            return;
        }
    }

    if (character.y > canvas.height) {
        const next = areas [currentArea].exits.bottom;

        if (next) {
            changeArea (next, "bottom");
            return;
        }
    }

    if (character.x + character.width < 0) {
        const next = areas [currentArea].exits.left;

        if (next) {
            changeArea (next, "left");
            return;
        }
    }

    if (character.x > canvas.width) {
        const next = areas [currentArea].exits.right;

        if (next) {
            changeArea (next, "right");
            return;
        }
    }

    const areaObjects = objectsByArea [currentArea];

    if (areaObjects) {
        areaObjects.forEach (obj => {
            if (!obj.revealed) {
                ctx.drawImage (obj.img, obj.x, obj.y, obj.width, obj.height);
            }
        });
    }

    if (character.moving) character.frameCount++;
    else character.frameCount = 0;

    let spriteToDraw;

    if (character.moving) {
        if (Math.floor (character.frameCount / 10) % 2 === 0) {
            spriteToDraw = character.sprites [character.direction].standing;
        } else {
            spriteToDraw = character.sprites [character.direction].walking;
        }
    } else {
        spriteToDraw = character.sprites [character.direction].sitting;
    }

    ctx.drawImage (spriteToDraw, character.x, character.y, character.width, character.height);

    activeHearts.forEach ((heart, index) => {
        ctx.save ();
        ctx.globalAlpha = heart.alpha;
        ctx.drawImage (
            heartImg,
            heart.x - heart.size / 2,
            heart.y - heart.size / 2,
            heart.size,
            heart.size
        );
        ctx.restore ();

        heart.size += heart.growthRate;
        heart.alpha -= 0.02;

        if (heart.size >= heart.maxSize || heart.alpha <= 0) {
            heart.obj.collected = true;
            heartsCollected++;

            showHeartMessage (heart.message);

            activeHearts.splice (index, 1); 
        }
    });

    if (heartsCollected === 14 && character.x > 190 && character.x < 250 && character.y > 420) {
        gameState = "gameover";
        return;
    }

    ctx.fillStyle = "#ff1493"; 
    ctx.font = "24px Arial";
    ctx.textAlign = "right";
    ctx.fillText(`${heartsCollected} / 14`, canvas.width - 20, 30);
}

function drawEndCutscene () {
    ctx.fillStyle = "#f0abff"; 
    ctx.fillRect (0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ff1493";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.fillText ("Happy", canvas.width / 2, canvas.height / 2 - 150);
    ctx.fillText ("Valentine's", canvas.width / 2, canvas.height / 2 - 80);
    ctx.fillText ("Day!", canvas.width / 2, canvas.height / 2 - 10);

    const time = Date.now () * 0.005;
    const heartSize = 80 + Math.sin (time) * 10; 

    ctx.drawImage (
        heartImg,
        canvas.width / 2 - heartSize / 2,
        canvas.height / 2 + 100 - heartSize / 2,
        heartSize,
        heartSize
    );
}

function gameLoop () {
    ctx.clearRect (0, 0, canvas.width, canvas.height);

    if (gameState === "title") drawTitleScreen ();
    else if (gameState === "cutscene") drawStartCutscene ();
    else if (gameState === "playing") updateGame ();
    else if (gameState === "gameover") drawEndCutscene();

    requestAnimationFrame (gameLoop);
}

gameLoop ();