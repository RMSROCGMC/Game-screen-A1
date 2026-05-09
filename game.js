const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const logoImg = new Image();
logoImg.src = "logo.jpeg"; // 修正為你的檔案路徑

let logoLoaded = false;
let gameActive = false, isPaused = false, isDev = false;
let clouds = [], birds = [];
let state = { dist: 0, target: 3000, hp: 3, dept: '', grade: 1, diff: 'easy', chaseX: -200, freeze: 0, leg: 0 };

logoImg.onload = () => { 
    logoLoaded = true;
    document.getElementById('load-fill').style.width = "100%";
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'flex';
    }, 800);
};

function auth(m) {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('level-screen').style.display = 'flex';
}

function showForm(m) {
    document.getElementById('auth-main').style.display = 'none';
    document.getElementById('auth-form').style.display = 'block';
}

function checkDev() {
    if(document.getElementById('dev-pw').value === '410205x') {
        isDev = true;
        document.getElementById('dev-panel').style.display = 'block';
        auth();
    } else alert("密碼錯誤");
}

function setDept(d) {
    state.dept = d;
    document.getElementById('game-sets').style.display = 'block';
}

function start() {
    state.grade = document.getElementById('grade-sel').value;
    state.diff = document.getElementById('diff-sel').value;
    const targets = { easy: 3000, normal: 4500, hard: 5000, extreme: 6000 };
    const hps = { easy: 3, normal: 2, hard: 1, extreme: 1 };
    state.target = targets[state.diff];
    state.hp = hps[state.diff];

    document.getElementById('level-screen').style.display = 'none';
    document.getElementById('game-ui').style.display = 'block';
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    for(let i=0; i<5; i++) clouds.push({x: Math.random()*canvas.width, y: 50+Math.random()*100, s: 0.5+Math.random()});
    gameActive = true;
    requestAnimationFrame(loop);
}

function update() {
    if(!gameActive || isPaused) return;

    if(state.freeze > 0) {
        state.freeze--;
        document.getElementById('freeze-ui').style.display = 'block';
        document.getElementById('freeze-ui').innerText = (state.freeze/60).toFixed(2) + "s";
        state.chaseX += 2.5;
    } else {
        document.getElementById('freeze-ui').style.display = 'none';
        state.dist += 1; state.chaseX += 1.8; state.leg += 0.2;
    }

    if(isDev) {
        if(document.getElementById('d-dist').value) state.dist = parseInt(document.getElementById('d-dist').value);
        if(document.getElementById('d-hp').value) state.hp = parseInt(document.getElementById('d-hp').value);
    }

    if(state.chaseX > 250) {
        state.hp--; state.chaseX = -300;
        if(state.hp <= 0) { alert("逃離失敗！"); location.reload(); }
    }
    
    if(state.dist >= state.target) { alert("您畢業了！"); location.reload(); }
    if(state.dist % 20 === 0 && state.dist > 0) {
        isPaused = true;
        if(!confirm("【專業挑戰】準備好了嗎？(模擬答題，取消即凍結)")) state.freeze = 120;
        isPaused = false;
    }
}

function draw() {
    // 天空漸變
    let ratio = state.dist / state.target;
    let r = 135 - ratio*100, g = 206 - ratio*160, b = 235 - ratio*200;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 雲朵動畫
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    clouds.forEach(c => {
        ctx.beginPath(); ctx.arc(c.x, c.y, 25*c.s, 0, Math.PI*2); ctx.fill();
        c.x -= c.s; if(c.x < -100) c.x = canvas.width + 100;
    });

    // 地板與英雄
    ctx.fillStyle = "#333"; ctx.fillRect(0, canvas.height-100, canvas.width, 100);
    ctx.save(); ctx.translate(300, canvas.height-100);
    if(state.freeze > 0) { ctx.fillStyle = "rgba(0,255,255,0.4)"; ctx.fillRect(-25, -80, 50, 80); }
    ctx.fillStyle = "#fff"; ctx.fillRect(-15, -60, 30, 45); 
    ctx.fillStyle = "#ffdbac"; ctx.beginPath(); ctx.arc(0, -72, 12, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    // 繪製校徽
    if(logoLoaded) {
        ctx.save(); ctx.translate(state.chaseX, canvas.height - 150);
        ctx.beginPath(); ctx.arc(0, 0, 60, 0, Math.PI*2); ctx.clip();
        ctx.drawImage(logoImg, -60, -60, 120, 120);
        ctx.restore();
    }

    document.getElementById('dist-display').innerText = `${Math.floor(state.dist)}m / ${state.target}m`;
    document.getElementById('progress-bar').style.width = (state.dist/state.target*100) + "%";
    document.getElementById('hp-display').innerText = "❤️".repeat(state.hp);
}

function loop() { update(); draw(); if(gameActive) requestAnimationFrame(loop); }
