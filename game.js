const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const logo = new Image();
logo.src = "logo.jpeg"; 
let logoLoaded = false;
logo.onload = () => {
    logoLoaded = true;
    document.getElementById('load-fill').style.width = "100%";
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('setup-screen').style.display = 'flex';
    }, 500);
};

let gameActive = false, isPaused = false;
let state = { 
    dist: 0, target: 3000, hp: 3, 
    chaseX: -300, freeze: 0, 
    lastQuiz: -1, // 初始設為 -1，避免 0m 觸發
    interval: 150, dept: '' 
};
let currentPool = [];

// 強制旋轉與全螢幕函數
async function lockScreen() {
    try {
        if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
        }
        if (screen.orientation && screen.orientation.lock) {
            await screen.orientation.lock('landscape').catch(e => console.log("方向鎖定被拒絕，請手動旋轉"));
        }
    } catch (e) { console.warn("Fullscreen/Lock API 不支援"); }
}

async function launchGame() {
    await lockScreen(); // 玩家點擊瞬間執行，瀏覽器才會過
    
    const dept = document.getElementById('dept-sel').value;
    const diff = document.getElementById('diff-sel').value;
    
    state.dept = dept;
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
    gameActive = true;
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
        state.chaseX -= 120; // 答對獎勵：Boss 退後
    } else {
        state.freeze = 180; // 答錯懲罰：凍結 3 秒
    }
}

function update() {
    if (!gameActive || isPaused) return;

    if (state.freeze > 0) {
        state.freeze--;
        document.getElementById('freeze-timer').style.display = 'block';
        document.getElementById('freeze-timer').innerText = (state.freeze/60).toFixed(2) + "s";
        state.chaseX += 1.8; 
    } else {
        document.getElementById('freeze-timer').style.display = 'none';
        state.dist += 1;
        state.chaseX += 1.0;
    }

    // --- 徹底解決訊息狂跳的關鍵邏輯 ---
    let curM = Math.floor(state.dist);
    // 只有在到達間隔公尺數，且「這公尺還沒觸發過」時才動作
    if (curM > 0 && curM % state.interval === 0 && curM !== state.lastQuiz) {
        state.lastQuiz = curM; // 立即上鎖
        askQuiz();
    }

    if (state.chaseX > 280) {
        state.hp--;
        state.chaseX = -400;
        if (state.hp <= 0) { 
            gameActive = false;
            alert("你被抓回去補考了！"); 
            location.reload(); 
        }
    }
    if (state.dist >= state.target) { 
        gameActive = false;
        alert("恭喜成功脫離東水！畢業快樂！"); 
        location.reload(); 
    }
}

function draw() {
    let b = 230 - (state.dist/state.target)*150;
    ctx.fillStyle = `rgb(100, 150, ${b})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#333";
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

    // 玩家
    ctx.fillStyle = "#fff";
    ctx.fillRect(300, canvas.height - 160, 30, 60);

    // 校徽 Boss
    if (logoLoaded) {
        ctx.save();
        ctx.translate(state.chaseX, canvas.height - 150);
        ctx.shadowBlur = 20; ctx.shadowColor = "red";
        ctx.beginPath(); ctx.arc(0, 0, 70, 0, Math.PI*2); ctx.clip();
        ctx.drawImage(logo, -70, -70, 140, 140);
        ctx.restore();
    }

    document.getElementById('hp-txt').innerText = "❤️".repeat(state.hp);
    document.getElementById('dist-txt').innerText = `${Math.floor(state.dist)}m / ${state.target}m`;
    document.getElementById('progress-bar').style.width = (state.dist / state.target * 100) + "%";
}

function loop() {
    update(); draw();
    if (gameActive) requestAnimationFrame(loop);
}

function shufflePool(arr) {
    let array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
