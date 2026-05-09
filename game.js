const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameActive = false;
let authMode = ''; 
let isDev = false;

// --- 動態物件 ---
let clouds = [];
let birds = [];
for(let i=0; i<5; i++) clouds.push({x: Math.random()*2000, y: 50+Math.random()*100, s: 0.5+Math.random()});
for(let i=0; i<3; i++) birds.push({x: Math.random()*2000, y: 100+Math.random()*50, s: 2+Math.random()});

let gameState = {
    distance: 0, targetDist: 3000, hp: 3, 
    dept: '', grade: 1, diff: 'easy',
    heroY: 0, chaseX: -200, 
    freezeTimer: 0, lastQuizDist: 0,
    legAngle: 0 // 用於跑步動畫
};

// --- 登入邏輯 ---
function showLogin(mode) {
    authMode = mode;
    document.getElementById('login-options').style.display = 'none';
    document.getElementById('auth-form').style.display = 'block';
    if(mode === 'guest') handleAuth(); // 訪客直接進
}

function handleAuth() {
    const user = document.getElementById('user-in').value;
    const pass = document.getElementById('pass-in').value;

    if(authMode === 'dev') {
        if(pass === '410205x') {
            isDev = true;
            document.getElementById('dev-panel').style.display = 'block';
            enterLevelSelect();
        } else alert("密碼錯誤");
    } else {
        enterLevelSelect();
    }
}

function enterLevelSelect() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('level-screen').style.display = 'flex';
}

function selectDept(dept) {
    gameState.dept = dept;
    document.getElementById('sub-setting').style.display = 'block';
}

function startGame() {
    gameState.grade = document.getElementById('sel-grade').value;
    gameState.diff = document.getElementById('sel-diff').value;
    
    if(gameState.diff === 'extreme' && gameState.grade < 2 && !isDev) {
        alert("極限模式僅限高二以上開啟！"); return;
    }

    document.getElementById('level-screen').style.display = 'none';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gameActive = true;
    requestAnimationFrame(gameLoop);
}

// --- 繪圖功能 ---
function drawSun(ratio) {
    let y = 100 + ratio * 400; // 太陽下山
    ctx.fillStyle = ratio > 0.6 ? "#ff4500" : "#fff700";
    ctx.beginPath(); ctx.arc(canvas.width - 100, y, 40, 0, Math.PI*2); ctx.fill();
}

function drawHero(x, y, isFrozen) {
    ctx.save();
    ctx.translate(x, y);

    if(isFrozen) {
        // 冰凍特效 (藍色透明覆蓋)
        ctx.fillStyle = "rgba(0, 255, 255, 0.4)";
        ctx.fillRect(-25, -65, 50, 75);
        ctx.strokeStyle = "#fff";
        ctx.strokeRect(-25, -65, 50, 75);
    } else {
        // 跑步動畫
        gameState.legAngle += 0.2;
        let leftLeg = Math.sin(gameState.legAngle) * 15;
        ctx.fillStyle = "#0033ad";
        ctx.fillRect(-10, 0, 8, 15 + leftLeg); // 左腳
        ctx.fillRect(2, 0, 8, 15 - leftLeg);  // 右腳
    }

    // 身體
    ctx.fillStyle = "#fff"; ctx.fillRect(-20, -50, 40, 50);
    ctx.fillStyle = "#ffdbac"; ctx.beginPath(); ctx.arc(0, -65, 15, 0, Math.PI*2); ctx.fill();
    ctx.restore();
}

function update() {
    if(!gameActive) return;

    // 開發者面板實時更新
    if(isDev) {
        document.getElementById('dev-dist').value = Math.floor(gameState.distance);
        document.getElementById('dev-hp').value = gameState.hp;
    }

    if(gameState.freezeTimer > 0) {
        gameState.freezeTimer--;
        document.getElementById('freeze-ui').style.display = 'block';
        document.getElementById('freeze-ui').innerText = (gameState.freezeTimer/60).toFixed(2) + "s";
        gameState.chaseX += 2.5; // 凍住時校徽追更快
    } else {
        document.getElementById('freeze-ui').style.display = 'none';
        gameState.distance += 1;
        gameState.chaseX += 1.8;
    }

    // 雲朵與鳥移動
    clouds.forEach(c => { c.x -= c.s; if(c.x < -200) c.x = canvas.width + 200; });
    birds.forEach(b => { b.x += b.s; if(b.x > canvas.width + 200) b.x = -200; });
}

function draw() {
    let ratio = gameState.distance / 3000;
    ctx.fillStyle = updateSky(); // 使用之前定義的漸變
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawSun(ratio);

    // 畫雲
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    clouds.forEach(c => {
        ctx.beginPath(); ctx.arc(c.x, c.y, 20*c.s, 0, Math.PI*2); 
        ctx.arc(c.x+20, c.y-10, 25*c.s, 0, Math.PI*2); ctx.fill();
    });

    // 畫鳥 (簡單 V 型)
    ctx.strokeStyle = "#000"; ctx.lineWidth = 2;
    birds.forEach(b => {
        ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x+10, b.y+10); ctx.lineTo(b.x+20, b.y); ctx.stroke();
    });

    // 畫地板
    ctx.fillStyle = "#222"; ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

    drawHero(300, canvas.height - 100, gameState.freezeTimer > 0);
    
    // 畫追趕校徽 (定義在之前的函數)
    drawLogo(gameState.chaseX, canvas.height - 130, 70);
}

function gameLoop() {
    update(); draw();
    if(gameActive) requestAnimationFrame(gameLoop);
}

function updateSky() {
    let r = 135 - (gameState.distance/3000)*100;
    let g = 206 - (gameState.distance/3000)*150;
    let b = 235 - (gameState.distance/3000)*150;
    return `rgb(${r},${g},${b})`;
}
