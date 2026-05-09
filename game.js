const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 素材載入
const logoImg = new Image();
logoImg.src = "logo.jpeg"; 
let logoLoaded = false;
logoImg.onload = () => { 
    logoLoaded = true; 
    document.getElementById('load-fill').style.width = "100%";
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'flex';
    }, 500);
};

// 遊戲狀態
let gameActive = false, isPaused = false, isDev = false;
let clouds = [];
let state = { dist: 0, target: 3000, hp: 3, dept: '', diff: 'easy', chaseX: -300, freeze: 0, leg: 0, lastQuiz: 0 };

// 1. 強制鎖定橫屏邏輯
async function lockOrientation() {
    try {
        if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
        }
        if (screen.orientation && screen.orientation.lock) {
            await screen.orientation.lock('landscape');
        }
    } catch (e) { console.log("無法強制鎖定，請手動旋轉"); }
}

function auth() { document.getElementById('auth-screen').style.display='none'; document.getElementById('level-screen').style.display='flex'; }
function showDev() { document.getElementById('auth-main').style.display='none'; document.getElementById('auth-dev').style.display='block'; }
function verifyDev() { if(document.getElementById('dev-pw').value === '410205x') { isDev = true; document.getElementById('dev-panel').style.display='block'; auth(); } }
function setDept(d) { state.dept = d; document.getElementById('start-ctrl').style.display='block'; }

async function launchGame() {
    await lockOrientation(); // 啟動全螢幕與鎖定
    state.diff = document.getElementById('diff-sel').value;
    const cfg = { easy: [3000, 3], normal: [4500, 2], hard: [6000, 1] };
    [state.target, state.hp] = cfg[state.diff];
    
    document.getElementById('level-screen').style.display = 'none';
    document.getElementById('game-ui').style.display = 'block';
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    for(let i=0; i<6; i++) clouds.push({x: Math.random()*canvas.width, y: 50+Math.random()*80, s: 0.4+Math.random()});
    gameActive = true;
    requestAnimationFrame(loop);
}

// 2. 問答系統 (不卡畫面版)
function triggerQuiz() {
    isPaused = true;
    document.getElementById('quiz-screen').style.display = 'flex';
    document.getElementById('quiz-q').innerText = `【${state.dept}科】專題檢查：\n數位電路中，1+1 在二進位等於 10 嗎？`;
}

function answer(isCorrect) {
    document.getElementById('quiz-screen').style.display = 'none';
    isPaused = false;
    if(!isCorrect) state.freeze = 180; // 凍結 3 秒
}

function update() {
    if(!gameActive || isPaused) return;

    if(state.freeze > 0) {
        state.freeze--;
        document.getElementById('freeze-ui').style.display = 'block';
        document.getElementById('freeze-ui').innerText = (state.freeze/60).toFixed(2) + "s";
        state.chaseX += 1.0; // 凍結時 Boss 逼近速度調慢
    } else {
        document.getElementById('freeze-ui').style.display = 'none';
        state.dist += 0.8; 
        state.chaseX += 0.6; // 正常追擊速度
        state.leg += 0.15;
    }

    if(isDev) {
        state.dist = parseFloat(document.getElementById('d-dist').value) || state.dist;
        state.hp = parseInt(document.getElementById('d-hp').value) || state.hp;
    }

    // 每 200m 觸發一次問答
    if(Math.floor(state.dist) > 0 && Math.floor(state.dist) % 200 === 0 && Math.floor(state.dist) !== state.lastQuiz) {
        state.lastQuiz = Math.floor(state.dist);
        triggerQuiz();
    }

    // 碰撞檢查
    if(state.chaseX > 220) {
        state.hp--; state.chaseX = -400;
        if(state.hp <= 0) { alert("被抓回去補考了！"); location.reload(); }
    }
    if(state.dist >= state.target) { alert("恭喜畢業！成功脫離東水！"); location.reload(); }
}

function draw() {
    let r = 130 - (state.dist/state.target)*100, g = 180 - (state.dist/state.target)*150, b = 255 - (state.dist/state.target)*180;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255,255,255,0.7)";
    clouds.forEach(c => {
        ctx.beginPath(); ctx.arc(c.x, c.y, 20*c.s, 0, Math.PI*2); ctx.fill();
        c.x -= c.s; if(c.x < -100) c.x = canvas.width + 100;
    });

    ctx.fillStyle = "#444"; ctx.fillRect(0, canvas.height-80, canvas.width, 80);

    // 畫主角
    ctx.save(); ctx.translate(280, canvas.height-80);
    if(state.freeze > 0) { ctx.fillStyle = "rgba(0,255,255,0.5)"; ctx.fillRect(-25, -75, 50, 75); }
    ctx.fillStyle = "#fff"; ctx.fillRect(-12, -50, 24, 40); 
    ctx.fillStyle = "#ffdbac"; ctx.beginPath(); ctx.arc(0, -62, 10, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    // 畫校徽 Boss
    if(logoLoaded) {
        ctx.save(); ctx.translate(state.chaseX, canvas.height - 130);
        ctx.shadowBlur = 15; ctx.shadowColor = "red";
        ctx.beginPath(); ctx.arc(0, 0, 55, 0, Math.PI*2); ctx.clip();
        ctx.drawImage(logoImg, -55, -55, 110, 110);
        ctx.restore();
    }

    document.getElementById('hp-ui').innerText = "❤️".repeat(state.hp);
    document.getElementById('dist-ui').innerText = `${Math.floor(state.dist)}m / ${state.target}m`;
    document.getElementById('progress-bar').style.width = (state.dist/state.target*100) + "%";
}

function loop() { update(); draw(); if(gameActive) requestAnimationFrame(loop); }
