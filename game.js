const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- 資源預載 ---
const logoImg = new Image();
logoImg.crossOrigin = "anonymous";
// 直接使用你提供的 Wiki 校徽網址
logoImg.src = "https://upload.wikimedia.org/wikipedia/commons/e/e5/National_Marine_Fisheries_Donggang_advanced_vocational_school.JPG";

let logoLoaded = false;
logoImg.onload = () => { 
    logoLoaded = true; 
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'flex';
    }, 1000);
};

// 模擬進度條
let lpb = 0;
const lt = setInterval(() => {
    lpb += 5; document.getElementById('load-bar').style.width = lpb + "%";
    if(lpb >= 100) clearInterval(lt);
}, 50);

// --- 遊戲狀態 ---
let gameActive = false;
let isDev = false;
let isPaused = false;
let clouds = [], birds = [];
let state = { dist: 0, target: 3000, hp: 3, dept: '', grade: 1, diff: 'easy', chaseX: -200, freeze: 0, leg: 0 };

// --- 登入控制 ---
let curMode = '';
function showForm(m) { curMode = m; document.getElementById('auth-main').style.display='none'; document.getElementById('auth-form').style.display='block'; }
function auth(m) { curMode = m; submitAuth(); }

function submitAuth() {
    const u = document.getElementById('uid').value;
    const p = document.getElementById('upw').value;
    if(curMode === 'dev' && p === '410205x') { isDev = true; document.getElementById('dev-console').style.display='block'; }
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('level-screen').style.display = 'flex';
}

function sel(d) { state.dept = d; document.getElementById('difficulty-box').style.display='block'; }

function launch() {
    state.grade = document.getElementById('grade').value;
    state.diff = document.getElementById('diff').value;
    if(state.diff === 'extreme' && state.grade < 2 && !isDev) return alert("高二以上才可開啟極限！");
    
    document.getElementById('level-screen').style.display='none';
    document.getElementById('game-ui').style.display='block';
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    
    // 初始化環境
    for(let i=0; i<6; i++) clouds.push({x: Math.random()*canvas.width, y: Math.random()*150, s: 0.5+Math.random()});
    gameActive = true;
    requestAnimationFrame(loop);
}

// --- 核心循環 ---
function update() {
    if(!gameActive || isPaused) return;

    if(state.freeze > 0) {
        state.freeze--;
        document.getElementById('freeze-timer').style.display = 'block';
        document.getElementById('freeze-timer').innerText = (state.freeze/60).toFixed(2) + "s";
        state.chaseX += 3; // 冰凍時校徽逼近變快
    } else {
        document.getElementById('freeze-timer').style.display = 'none';
        state.dist += 1;
        state.chaseX += 1.8;
        state.leg += 0.2;
    }

    if(isDev) {
        state.dist = parseInt(document.getElementById('d-dist').value) || state.dist;
        state.hp = parseInt(document.getElementById('d-hp').value) || state.hp;
    }

    // 碰撞檢查
    if(state.chaseX > 250) {
        state.hp--; state.chaseX = -300;
        if(state.hp <= 0) { alert("你被抓到了！"); location.reload(); }
    }

    // 問答觸發 (每 20m)
    if(state.dist % 20 === 0 && state.dist > 0) triggerQuiz();
}

function triggerQuiz() {
    isPaused = true;
    const ans = confirm("【專業科目挑戰】\n1+1=2 嗎？(模擬題目，點確定正確，取消錯誤)");
    if(!ans) state.freeze = 120; // 凍結 2 秒
    isPaused = false;
}

function draw() {
    // 天空背景 (隨距離變晚)
    let r = 135 - (state.dist/3000)*100, g = 206 - (state.dist/3000)*150, b = 235 - (state.dist/3000)*150;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 雲朵
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    clouds.forEach(c => {
        ctx.beginPath(); ctx.arc(c.x, c.y, 30*c.s, 0, Math.PI*2); ctx.fill();
        c.x -= c.s; if(c.x < -100) c.x = canvas.width + 100;
    });

    // 地板
    ctx.fillStyle = "#333"; ctx.fillRect(0, canvas.height-100, canvas.width, 100);

    // 英雄 (繪製跑步動作)
    ctx.save();
    ctx.translate(300, canvas.height-100);
    if(state.freeze > 0) {
        ctx.fillStyle = "rgba(0,255,255,0.5)"; ctx.fillRect(-25, -80, 50, 80); // 冰塊
    }
    ctx.fillStyle = "#fff"; ctx.fillRect(-15, -60, 30, 40); // 身體
    ctx.fillStyle = "#ffdbac"; ctx.beginPath(); ctx.arc(0, -75, 12, 0, Math.PI*2); ctx.fill(); // 頭
    // 腿部動畫
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 6;
    let l1 = Math.sin(state.leg)*15, l2 = Math.sin(state.leg + Math.PI)*15;
    ctx.beginPath(); ctx.moveTo(-5, -20); ctx.lineTo(-5 + l1, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(5, -20); ctx.lineTo(5 + l2, 0); ctx.stroke();
    ctx.restore();

    // 畫校徽原圖
    if(logoLoaded) {
        ctx.save();
        ctx.translate(state.chaseX, canvas.height - 150);
        ctx.shadowBlur = 20; ctx.shadowColor = "red";
        // 將原圖畫成圓形
        ctx.beginPath(); ctx.arc(0, 0, 60, 0, Math.PI*2); ctx.clip();
        ctx.drawImage(logoImg, -60, -60, 120, 120);
        ctx.restore();
    }

    // 更新 UI
    document.getElementById('dist-txt').innerText = `${Math.floor(state.dist)}m / ${state.target}m`;
    document.getElementById('progress-bar').style.width = (state.dist/state.target*100) + "%";
    document.getElementById('hp-box').innerText = "❤️".repeat(state.hp);
}

function loop() { update(); draw(); if(gameActive) requestAnimationFrame(loop); }
