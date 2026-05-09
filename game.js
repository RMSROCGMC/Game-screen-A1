const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const logo = new Image(); logo.src = "logo.jpeg";
let logoLoaded = false; logo.onload = () => { logoLoaded = true; };

let gameActive = false, isPaused = false;
let state = { dist: 0, target: 3000, hp: 3, chaseX: -380, freeze: 0, lastQuiz: -1, leg: 0, dept: '', grade: '1' };

async function launchGame() {
    try {
        if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
        if (screen.orientation && screen.orientation.lock) await screen.orientation.lock('landscape');
    } catch (e) {}
    state.dept = document.getElementById('dept-sel').value;
    state.grade = document.getElementById('grade-sel').value;
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('tutorial-screen').style.display = 'flex';
}

function startGameActual() {
    document.getElementById('tutorial-screen').style.display = 'none';
    document.getElementById('game-ui').style.display = 'block';
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    gameActive = true; requestAnimationFrame(loop);
}

function showEndGame(isWin) {
    gameActive = false;
    const screen = document.getElementById('end-screen');
    const title = document.getElementById('end-title');
    const msg = document.getElementById('end-msg');
    
    screen.style.display = 'flex';
    if (isWin) {
        title.innerText = "🎉 挑戰成功！";
        title.style.color = "var(--gold)";
        if (state.grade === "1") msg.innerText = "恭喜！表現優異，成功升到了高二！";
        else if (state.grade === "2") msg.innerText = "太強了！你已具備學長風範，成功升到了高三！";
        else msg.innerText = "畢業快樂！你已成功逃離東水，迎向燦爛未來！";
    } else {
        title.innerText = "❌ 遭到逮捕！";
        title.style.color = "#ff4500";
        msg.innerText = "你已被抓到教務處補考了！請回去好好唸書吧。";
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
        state.dist += 1.2; state.chaseX += 1.05; state.leg += 0.15;
    }

    let curM = Math.floor(state.dist);
    if (curM > 0 && curM % 150 === 0 && curM !== state.lastQuiz) {
        state.lastQuiz = curM; isPaused = true;
        const pool = GAME_QUESTIONS[state.dept] || GAME_QUESTIONS["通用"];
        const qData = pool[Math.floor(Math.random() * pool.length)];
        document.getElementById('quiz-box').style.display = 'flex';
        document.getElementById('q-txt').innerText = qData.q;
        const zone = document.getElementById('ans-zone');
        zone.innerHTML = "";
        qData.options.forEach((t, i) => {
            const btn = document.createElement('button');
            btn.innerText = t;
            btn.onclick = () => {
                document.getElementById('quiz-box').style.display = 'none';
                isPaused = false;
                if (i !== qData.a) state.freeze = 180;
                else state.chaseX -= 130;
            };
            zone.appendChild(btn);
        });
    }

    if (state.chaseX > 250) {
        state.hp--; state.chaseX = -450;
        if (state.hp <= 0) showEndGame(false);
    }
    if (state.dist >= state.target) showEndGame(true);
}

function draw() {
    ctx.fillStyle = "#87CEEB"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#444"; ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

    const px = 300, py = canvas.height - 100;
    let swing = Math.sin(state.leg) * 20;
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 6; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(px, py-40); ctx.lineTo(px+swing, py); ctx.stroke(); // 腳
    ctx.beginPath(); ctx.moveTo(px, py-40); ctx.lineTo(px-swing, py); ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.fillRect(px-10, py-70, 20, 35); // 身體
    ctx.beginPath(); ctx.arc(px, py-80, 10, 0, Math.PI*2); ctx.fill(); // 頭
    ctx.beginPath(); ctx.moveTo(px, py-60); ctx.lineTo(px-swing, py-40); ctx.stroke(); // 手
    ctx.beginPath(); ctx.moveTo(px, py-60); ctx.lineTo(px+swing, py-40); ctx.stroke();

    if (logoLoaded) ctx.drawImage(logo, state.chaseX, py-160, 140, 140);
    document.getElementById('hp-txt').innerText = "❤️".repeat(state.hp);
    document.getElementById('dist-txt').innerText = `${Math.floor(state.dist)}m / ${state.target}m`;
    document.getElementById('progress-bar').style.width = (state.dist/state.target*100) + "%";
}

function loop() { update(); draw(); if (gameActive) requestAnimationFrame(loop); }
