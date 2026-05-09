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
    width: 40,
    height: 60,
    vx: 0,
    vy: 0,
    speed: 5,
    jump: 16,
    grounded: false,
    direction: 1,
    // 純程式碼繪製勇士
    draw: function(x, y) {
        ctx.save();
        ctx.translate(x + this.width / 2, y + this.height / 2);
        if (this.direction === -1) ctx.scale(-1, 1);

        // 1. 身體 (中山裝風格)
        ctx.fillStyle = '#4a4a4a'; 
        ctx.fillRect(-18, -5, 36, 30);
        
        // 2. 領帶/裝飾
        ctx.fillStyle = '#fff';
        ctx.fillRect(-2, -5, 4, 10);

        // 3. 頭部 (膚色)
        ctx.fillStyle = '#ffdbac';
        ctx.beginPath();
        ctx.arc(0, -22, 16, 0, Math.PI * 2);
        ctx.fill();

        // 4. 特色鬍子
        ctx.fillStyle = '#222';
        ctx.fillRect(-10, -15, 20, 5);

        // 5. 眼睛
        ctx.fillStyle = '#000';
        ctx.fillRect(4, -26, 4, 4);

        // 6. 帽子 (軍帽感)
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(-18, -38, 36, 8);
        ctx.fillStyle = '#f1c40f'; // 徽章
        ctx.fillRect(-2, -37, 4, 4);

        ctx.restore();
    }
};

let platforms = [];

function initLevel() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    hero.y = canvas.height - 200;
    
    // 生成一些具備裝飾感的平台
    platforms = [
        { x: 0, y: canvas.height - 60, w: 10000, h: 60, color: '#2c3e50' }, // 漫長大地
        { x: 400, y: canvas.height - 200, w: 200, h: 20, color: '#e67e22' },
        { x: 750, y: canvas.height - 350, w: 250, h: 20, color: '#e67e22' },
        { x: 1100, y: canvas.height - 250, w: 300, h: 20, color: '#e67e22' }
    ];
}

const keys = {};
window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'ArrowRight') hero.direction = 1;
    if (e.code === 'ArrowLeft') hero.direction = -1;
});
window.addEventListener('keyup', e => keys[e.code] = false);

// 觸控支持
window.addEventListener('touchstart', e => {
    const tx = e.touches[0].clientX;
    if (tx < canvas.width / 2) { keys['ArrowLeft'] = true; hero.direction = -1; }
    else { keys['ArrowRight'] = true; hero.direction = 1; }
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

    if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && hero.grounded) { 
        hero.vy = -hero.jump; 
        hero.grounded = false; 
    }

    if (hero.x < 0) hero.x = 0;
    game.offsetX = hero.x - canvas.width / 3;
    if (game.offsetX < 0) game.offsetX = 0;
}

function draw() {
    if (!game.active) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(-game.offsetX, 0);
    
    // 繪製背景 (代碼生成天空)
    let skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#1a2a6c');
    skyGradient.addColorStop(0.5, '#b21f1f');
    skyGradient.addColorStop(1, '#fdbb2d');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(game.offsetX, 0, canvas.width, canvas.height);
    
    // 繪製裝飾性山脈 (代碼繪圖)
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    for(let i=0; i<5; i++) {
        ctx.beginPath();
        ctx.moveTo(i*800, canvas.height);
        ctx.lineTo(i*800 + 400, canvas.height - 400);
        ctx.lineTo(i*800 + 800, canvas.height);
        ctx.fill();
    }

    // 繪製平台
    platforms.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.w, p.h);
        // 平台邊緣高亮
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(p.x, p.y, p.w, 4);
    });
    
    // 繪製英雄
    hero.draw(hero.x, hero.y);
    
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
