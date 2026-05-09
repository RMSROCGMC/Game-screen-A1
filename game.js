const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 設置畫布為全螢幕
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// 遊戲狀態
const game = {
    gravity: 0.8,
    friction: 0.8,
    offsetX: 0, // 攝影機偏移量
    state: 'playing'
};

// 勇士 (Hero)
const hero = {
    x: 100,
    y: 100,
    width: 50,
    height: 50,
    velocityX: 0,
    velocityY: 0,
    speed: 5,
    jumpForce: 16,
    grounded: false,
    color: '#D4AC0D' // 勇士金色（蔣先生風格）
};

// 關卡地形 (x, y, width, height)
const platforms = [
    { x: 0, y: canvas.height - 60, w: 3000, h: 60 }, // 地板
    { x: 400, y: canvas.height - 200, w: 200, h: 20 },
    { x: 700, y: canvas.height - 350, w: 200, h: 20 },
    { x: 1000, y: canvas.height - 250, w: 300, h: 20 },
    { x: 1500, y: canvas.height - 150, w: 400, h: 20 }
];

// 控制器
const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

// 觸控控制邏輯 (輔助手機遊玩)
canvas.addEventListener('touchstart', (e) => {
    const touchX = e.touches[0].clientX;
    if (touchX < canvas.width / 3) keys['ArrowLeft'] = true;
    else if (touchX > (canvas.width / 3) * 2) keys['ArrowRight'] = true;
    else keys['Space'] = true; // 點擊中間跳躍
});
canvas.addEventListener('touchend', () => {
    keys['ArrowLeft'] = false;
    keys['ArrowRight'] = false;
    keys['Space'] = false;
});

function update() {
    if (game.state !== 'playing') return;

    // 左右移動
    if (keys['ArrowRight'] || keys['KeyD']) {
        if (hero.velocityX < hero.speed) hero.velocityX++;
    }
    if (keys['ArrowLeft'] || keys['KeyA']) {
        if (hero.velocityX > -hero.speed) hero.velocityX--;
    }

    // 應用摩擦力
    hero.velocityX *= game.friction;
    
    // 應用重力
    hero.velocityY += game.gravity;
    
    // 更新位置
    hero.x += hero.velocityX;
    hero.y += hero.velocityY;
    
    // 碰撞檢測 (平台)
    hero.grounded = false;
    for (let p of platforms) {
        if (hero.x < p.x + p.w && hero.x + hero.width > p.x &&
            hero.y < p.y + p.h && hero.y + hero.height > p.y) {
            
            // 從上方落到平台
            if (hero.velocityY > 0 && hero.y + hero.height - hero.velocityY <= p.y) {
                hero.y = p.y - hero.height;
                hero.velocityY = 0;
                hero.grounded = true;
            }
        }
    }

    // 跳躍
    if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && hero.grounded) {
        hero.velocityY = -hero.jumpForce;
        hero.grounded = false;
    }

    // 攝影機跟隨 (Camera Follow)
    // 當勇士走到畫面中央後，地圖開始滾動
    game.offsetX = hero.x - canvas.width / 3;
    if (game.offsetX < 0) game.offsetX = 0;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-game.offsetX, 0); // 移動攝影機

    // 畫背景 (簡單的天空)
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(game.offsetX, 0, canvas.width, canvas.height);

    // 畫地板與平台
    ctx.fillStyle = '#5D4037'; // 土褐色
    for (let p of platforms) {
        ctx.fillRect(p.x, p.y, p.w, p.h);
        // 加點裝飾線
        ctx.strokeStyle = '#3E2723';
        ctx.strokeRect(p.x, p.y, p.w, p.h);
    }

    // 畫勇士 (現在是一個簡單的方塊，之後可以貼圖)
    ctx.fillStyle = hero.color;
    ctx.fillRect(hero.x, hero.y, hero.width, hero.height);
    // 畫個小眼睛表示方向
    ctx.fillStyle = 'black';
    let eyeX = hero.velocityX >= 0 ? hero.x + 30 : hero.x + 10;
    ctx.fillRect(eyeX, hero.y + 10, 8, 8);

    ctx.restore();

    // UI 介面
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('移動: 左右箭頭 / 點擊兩側 | 跳躍: 空格 / 點擊中央', 20, 30);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// 這個函數會被 index.html 中的「開始遊戲」按鈕呼叫
function startGame() {
    gameLoop();
}
