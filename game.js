const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const logo = new Image(); logo.src = "logo.jpeg";
let logoLoaded = false; logo.onload = () => { logoLoaded = true; };

let gameActive = false, isPaused = false;
let state = { dist: 0, target: 3000, hp: 3, chaseX: -300, freeze: 0, lastQuiz: -1, leg: 0, dept: '' };
let currentPool = [];

async function launchGame() {
    try {
        if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
        if (screen.orientation && screen.orientation.lock) await screen.orientation.lock('landscape');
    } catch (e) {}
    state.dept = document.getElementById('dept-sel').value;
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('game-ui').style.display = 'block';
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    gameActive = true; requestAnimationFrame(loop);
}

function askQuiz() {
    isPaused = true;
    const pool = GAME_QUESTIONS[state.dept] || GAME_QUESTIONS["通用"];
    const qData = pool[Math.floor(Math.random() * pool.length)];
    state.correctIdx = qData.a;
    document.getElementById('quiz-box').style.display = 'flex';
    document.getElementById('q-txt').innerText = qData.q;
    const zone = document.getElementById('ans-zone');
    zone.innerHTML = "";
    qData.options.forEach((t, i) => {
        const b = document.createElement('button'); b.innerText = t;
        b.onclick = () => {
            document.getElementById('quiz-box').style.display = 'none';
            isPaused = false;
            if (i !== state.correctIdx) state.freeze = 180;
            else state.chaseX -= 100;
        };
        zone.appendChild(b);
    });
}

function update() {
    if (!gameActive || isPaused) return;
    if (state.freeze > 0) {
        state.freeze--;
        document.getElementById('freeze-timer').style.display = 'block';
        document.getElementById('freeze-timer').innerText = (state.freeze/60).toFixed(2) + "s";
        state.chaseX += 1.5;
    } else {
        document.getElementById('freeze-timer').style.display = 'none';
        state.dist += 1; state.chaseX += 0.8; state.leg += 0.15;
    }
    let curM = Math.floor(state.dist);
    if (curM > 0 && curM % 150 === 0 && curM !== state.lastQuiz) {
        state.lastQuiz = curM; askQuiz();
    }
    if (state.chaseX > 250) { state.hp--; state.chaseX = -400; if (state.hp <= 0) location.reload(); }
    if (state.dist >= state.target) { alert("成功逃離！"); location.reload(); }
}

function draw() {
    ctx.fillStyle = "#87CEEB"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#444"; ctx.fillRect(0, canvas.height-100, canvas.width, 100);
    
    // 繪製主角 (有手有腳)
    const px = 300, py = canvas.height - 100;
    let swing = Math.sin(state.leg) * 20;
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 6; ctx.lineCap = "round";
    
    // 腳
    ctx.beginPath(); ctx.moveTo(px, py-40); ctx.lineTo(px+swing, py); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px, py-40); ctx.lineTo(px-swing, py); ctx.stroke();
    // 身體與頭
    ctx.fillStyle = "#fff"; ctx.fillRect(px-10, py-70, 20, 40);
    ctx.beginPath(); ctx.arc(px, py-80, 10, 0, Math.PI*2); ctx.fill();
    // 手
    ctx.beginPath(); ctx.moveTo(px, py-60); ctx.lineTo(px-swing, py-40); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px, py-60); ctx.lineTo(px+swing, py-40); ctx.stroke();

    if (logoLoaded) ctx.drawImage(logo, state.chaseX, py-150, 120, 120);
    document.getElementById('hp-txt').innerText = "❤️".repeat(state.hp);
    document.getElementById('dist-txt').innerText = `${Math.floor(state.dist)}m / ${state.target}m`;
    document.getElementById('progress-bar').style.width = (state.dist/state.target*100) + "%";
}

function loop() { update(); draw(); if (gameActive) requestAnimationFrame(loop); }
