const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const logo = new Image();
logo.src = "logo.jpeg"; 
let logoLoaded = false;
logo.onload = () => {
    logoLoaded = true;
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('setup-screen').style.display = 'flex';
};

let gameOn = false, isPaused = false;
let state = { dist: 0, target: 3000, hp: 3, chaseX: -250, freeze: 0, lastQuiz: 0, interval: 150, dept: '' };
let currentPool = [];

// 強制全螢幕與方向
async function lockScreen() {
    try {
        if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
        if (screen.orientation && screen.orientation.lock) await screen.orientation.lock('landscape');
    } catch (e) { console.warn("Lock failed"); }
}

async function launchGame() {
    await lockScreen();
    const dept = document.getElementById('dept-sel').value;
    const diff = document.getElementById('diff-sel').value;
    
    state.dept = dept;
    // 鎖定科別題庫
    const rawData = GAME_QUESTIONS[dept] || GAME_QUESTIONS["通用"];
    currentPool = shufflePool([...rawData]);

    if (diff === "extreme") {
        state.target = 6000;
        state.hp = 1;
        state.interval = 20; 
    } else {
        state.target = 3000;
        state.hp = 3;
        state.interval = 150;
    }

    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('game-ui').style.display = 'block';
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gameOn = true;
    requestAnimationFrame(loop);
}

function askQuiz() {
    isPaused = true;
    if (currentPool.length === 0) {
        const rawData = GAME_QUESTIONS[state.dept] || GAME_QUESTIONS["通用"];
        currentPool = shufflePool([...rawData]);
    }
    
    const qData = currentPool.pop();
    state.correctIdx = qData.a;

    document.getElementById('quiz-box').style.display = 'flex';
    document.getElementById('q-txt').innerText = `【${state.dept}科專業抽考】\n${qData.q}`;
    
    const zone = document.getElementById('ans-zone');
    zone.innerHTML = "";
    qData.options.forEach((text, i) => {
        const btn = document.createElement('button');
        btn.innerText = text;
        btn.onclick = () => handleAns(i);
        zone.appendChild(btn);
    });
}

function handleAns(idx) {
    document.getElementById('quiz-box').style.display = 'none';
    isPaused = false;
    if (idx === state.correctIdx) {
        state.chaseX -= 100; // 答對 Boss 噴遠一點
    } else {
        state.freeze = 180; // 答錯冰凍 3 秒
    }
}

function update() {
    if (!gameOn || isPaused) return;

    if (state.freeze > 0) {
        state.freeze--;
        document.getElementById('freeze-txt').style.display = 'block';
        document.getElementById('freeze-txt').innerText = (state.freeze/60).toFixed(2) + "s";
        state.chaseX += 1.8; 
    } else {
        document.getElementById('freeze-txt').style.display = 'none';
        state.dist += 1;
        state.chaseX += 1.0;
    }

    // 間隔判斷
    if (Math.floor(state.dist) > 0 && Math.floor(state.dist) % state.interval === 0 && Math.floor(state.dist) !== state.lastQuiz) {
        state.lastQuiz = Math.floor(state.dist);
        askQuiz();
    }

    if (state.chaseX > 280) {
        state.hp--;
        state.chaseX = -350;
        if (state.hp <= 0) { alert("逃離失敗，請回教務處報到！"); location.reload(); }
    }
    if (state.dist >= state.target) { alert("恭喜成功逃離東水！畢業快樂！"); location.reload(); }
}

function draw() {
    // 天空背景隨距離變深
    let b = 235 - (state.dist/state.target)*150;
    ctx.fillStyle = `rgb(100, 150, ${b})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#333";
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

    // 玩家
    ctx.fillStyle = "#fff";
    ctx.fillRect(300, canvas.height - 160, 30, 60);

    // Boss
    if (logoLoaded) {
        ctx.save();
        ctx.translate(state.chaseX, canvas.height - 150);
        ctx.beginPath(); ctx.arc(0, 0, 65, 0, Math.PI*2); ctx.clip();
        ctx.drawImage(logo, -65, -65, 130, 130);
        ctx.restore();
    }

    document.getElementById('hp-txt').innerText = "❤️".repeat(state.hp);
    document.getElementById('dist-txt').innerText = `${Math.floor(state.dist)}m / ${state.target}m`;
    document.getElementById('progress').style.width = (state.dist / state.target * 100) + "%";
}

function loop() {
    update(); draw();
    if (gameOn) requestAnimationFrame(loop);
}
