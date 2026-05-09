const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const game = {
    gravity: 0.8,
    friction: 0.8,
    offsetX: 0,
    active: false
};

const hero = {
    x: 100,
    y: 0,
    width: 50,
    height: 50,
    vx: 0,
    vy: 0,
    speed: 5,
    jump: 16,
    grounded: false
};

let platforms = [];

function initLevel() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    hero.y = canvas.height - 200;
    platforms = [
        { x: 0, y: canvas.height - 60, w: 5000, h: 60 },
        { x: 400, y: canvas.height - 180, w: 200, h: 20 },
        { x: 800, y: canvas.height - 300, w: 300, h: 20 }
    ];
}

const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

// 簡單觸控支持
window.addEventListener('touchstart', e => {
    const tx = e.touches[0].clientX;
    if (tx < canvas.width/2) keys['ArrowLeft'] = true;
    else keys['ArrowRight'] = true;
    if (e.touches.length > 1) keys['Space'] = true;
});
window.addEventListener('touchend', () => { keys['ArrowLeft'] = keys['ArrowRight'] = keys['Space'] = false; });

function update() {
    if (!game.active) return;
    if (keys['ArrowRight']) hero.vx < hero.speed ? hero.vx++ : null;
    if (keys['ArrowLeft']) hero.vx > -hero.speed ? hero.vx-- : null;
    hero.vx *= game.friction;
    hero.vy += game.gravity;
    hero.x += hero.vx;
    hero.y += hero.vy;

    hero.grounded = false;
    platforms.forEach(p => {
        if (hero.x < p.x + p.w && hero.x + hero.width > p.x && hero.y < p.y + p.h && hero.y + hero.height > p.y) {
            if (hero.vy > 0) { hero.y = p.y - hero.height; hero.vy = 0; hero.grounded = true; }
        }
    });

    if ((keys['Space'] || keys['ArrowUp']) && hero.grounded) { hero.vy = -hero.jump; hero.grounded = false; }
    if (hero.x < 0) hero.x = 0;
    game.offsetX = hero.x - canvas.width / 3;
    if (game.offsetX < 0) game.offsetX = 0;
}

function draw() {
    if (!game.active) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(-game.offsetX, 0);
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(game.offsetX, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#5D4037';
    platforms.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));
    ctx.fillStyle = '#D4AC0D';
    ctx.fillRect(hero.x, hero.y, hero.width, hero.height);
    ctx.restore();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

function startGame() {
    initLevel();
    game.active = true;
    loop();
}
