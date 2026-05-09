const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let gameActive = false;
let isPaused = false;

// --- 1. 深度整合題庫 ---
const questionBank = {
    "電子": {
        "1": [
            { q: "基本電學中，電荷的單位是什麼？", a: ["庫倫(C)", "伏特(V)", "安培(A)"], c: 0 },
            { q: "一個 1kΩ 的電阻，其色碼順序為何？", a: ["棕黑紅金", "棕黑橙金", "黑棕紅金"], c: 0 },
            { q: "歐姆定律的公式為何？", a: ["V=IR", "P=IV", "W=QV"], c: 0 },
            { q: "下列哪種元件具有單向導通特性？", a: ["二極體", "電阻器", "電容器"], c: 0 }
        ]
    },
    "輪機": {
        "1": [
            { q: "四行程引擎中，第二個行程為何？", a: ["進氣", "壓縮", "動力"], c: 1 },
            { q: "輪機員常用來測量零件間隙的工具是？", a: ["厚薄規", "游標卡尺", "分厘卡"], c: 0 },
            { q: "船上用來產生動力的核心機器是？", a: ["主機", "副機", "鍋爐"], c: 0 }
        ]
    },
    "食品": {
        "1": [
            { q: "下列何者為常見的天然防腐劑？", a: ["食鹽", "亞硝酸鹽", "苯甲酸"], c: 0 },
            { q: "食品加工中，罐頭殺菌主要的對象是？", a: ["肉毒桿菌", "大腸桿菌", "黴菌"], c: 0 },
            { q: "烘焙中使麵團發酵的主要微生物是？", a: ["酵母菌", "乳酸菌", "醋酸菌"], c: 0 }
        ]
    },
    "養殖": {
        "1": [
            { q: "養殖池中，最適合大多數魚類生長的 pH 值是？", a: ["5.5-6.5", "7.5-8.5", "9.5-10.5"], c: 1 },
            { q: "下列何者為東港常見的高經濟養殖魚種？", a: ["石斑魚", "吳郭魚", "大肚魚"], c: 0 },
            { q: "水中「溶氧量」過低時，魚類會出現什麼行為？", a: ["浮頭", "鑽底", "側游"], c: 0 }
        ]
    },
    "家政": {
        "1": [
            { q: "下列何者為蛋白質的主要來源？", a: ["米飯", "雞蛋", "蔬菜"], c: 1 },
            { q: "服裝構成中，最基礎的針法是？", a: ["平針縫", "回針縫", "藏針縫"], c: 0 },
            { q: "烹飪中，「紅燒」的主要調味色澤來源是？", a: ["醬油", "食鹽", "白醋"], c: 0 }
        ]
    },
    "航管": {
        "1": [
            { q: "貨櫃運輸中，標準 20 呎櫃的簡寫是？", a: ["TEU", "FEU", "CBM"], c: 0 },
            { q: "在國際貿易中，FOB 代表什麼意思？", a: ["離岸價格", "到岸價格", "工廠交貨價"], c: 0 },
            { q: "碼頭上負責吊掛貨櫃的大型起重機俗稱？", a: ["橋式起重機", "堆高機", "門型吊運機"], c: 0 }
        ]
    }
};

// --- 2. 遊戲邏輯變數 ---
let gameState = {
    distance: 0,
    targetDist: 3000,
    hp: 3,
    maxHp: 3,
    dept: "電子",
    grade: 1,
    diff: "easy",
    heroX: 250,
    chaseX: -100,
    speed: 4,
    freezeTimer: 0,
    lastQuizDist: 0
};

// --- 3. 動態天色系統 ---
function updateSky() {
    let ratio = gameState.distance / gameState.targetDist;
    let r, g, b;

    if (ratio < 0.5) { 
        // 早上到黃昏 (135,206,235 -> 255,140,0)
        r = 135 + (ratio * 2 * (255 - 135));
        g = 206 - (ratio * 2 * (206 - 140));
        b = 235 - (ratio * 2 * 235);
    } else {
        // 黃昏到深夜 (255,140,0 -> 10,10,30)
        let r2 = (ratio - 0.5) * 2;
        r = 255 - (r2 * (255 - 10));
        g = 140 - (r2 * (140 - 10));
        b = r2 * 30;
    }
    return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
}

// --- 4. 遊戲核心循環 ---
function initGame() {
    // 讀取選單設定
    gameState.dept = document.getElementById('select-dept').value;
    gameState.grade = document.getElementById('select-grade').value;
    gameState.diff = document.getElementById('select-diff').value;
    
    // 難度參數初始化
    const config = { "easy": 3000, "normal": 4500, "hard": 5000, "extreme": 6000 };
    const hpConfig = { "easy": 3, "normal": 2, "hard": 1, "extreme": 1 };
    
    gameState.targetDist = config[gameState.diff];
    gameState.hp = hpConfig[gameState.diff];
    gameState.maxHp = gameState.hp;
    gameState.distance = 0;
    gameState.chaseX = -200;
    gameState.lastQuizDist = 0;

    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-ui').style.display = 'block';
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gameActive = true;
    requestAnimationFrame(gameLoop);
}

function showQuiz() {
    isPaused = true;
    const overlay = document.getElementById('quiz-overlay');
    const qText = document.getElementById('quiz-q');
    const optionsBox = document.getElementById('quiz-options');
    
    const pool = questionBank[gameState.dept][gameState.grade];
    const qData = pool[Math.floor(Math.random() * pool.length)];
    
    qText.innerText = `【${gameState.dept}科問答】\n${qData.q}`;
    optionsBox.innerHTML = "";
    
    qData.a.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = "option-btn";
        btn.innerText = opt;
        btn.onclick = () => {
            if (idx !== qData.c) {
                gameState.freezeTimer = 12; // 凍結 0.2s
            }
            overlay.style.display = 'none';
            isPaused = false;
        };
        optionsBox.appendChild(btn);
    });
    overlay.style.display = 'flex';
}

function update() {
    if (!gameActive || isPaused) return;

    if (gameState.freezeTimer > 0) {
        gameState.freezeTimer--;
    } else {
        gameState.distance += 0.8;
        gameState.chaseX += 2.0; // 校徽追趕速度
    }

    // 距離 UI 更新
    document.getElementById('dist-display').innerText = `${Math.floor(gameState.distance)}m / ${gameState.targetDist}m`;
    document.getElementById('progress-bar').style.width = (gameState.distance / gameState.targetDist * 100) + "%";
    document.getElementById('hp-display').innerText = "❤️".repeat(gameState.hp);

    // 每 20 公尺觸發題目
    if (gameState.distance - gameState.lastQuizDist >= 20) {
        gameState.lastQuizDist = gameState.distance;
        showQuiz();
    }

    // 碰撞檢查
    if (gameState.chaseX >= gameState.heroX - 30) {
        gameState.hp--;
        gameState.chaseX = -300; // 撞到後校徽退回
        if (gameState.hp <= 0) {
            alert(`逃離失敗！你最終跑了 ${Math.floor(gameState.distance)}m`);
            saveRecord();
            location.reload();
        }
    }

    // 勝利檢查
    if (gameState.distance >= gameState.targetDist) {
        alert("恭喜！你順利畢業了！");
        unlockNextGrade();
        location.reload();
    }
}

function draw() {
    // 繪製變色天空
    ctx.fillStyle = updateSky();
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 畫英雄 (代碼繪製簡約版)
    ctx.fillStyle = "#fff";
    ctx.fillRect(gameState.heroX, canvas.height - 160, 40, 60);
    ctx.fillStyle = "#000"; // 眼睛
    ctx.fillRect(gameState.heroX + 25, canvas.height - 150, 5, 5);

    // 畫追趕的校徽
    drawLogo(gameState.chaseX, canvas.height - 130, 70);

    // 畫地板
    ctx.fillStyle = "#222";
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
}

function drawLogo(x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI*2);
    ctx.fillStyle = '#0000FF';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = `bold ${size/2.5}px Arial`;
    ctx.fillText("東水", 0, size/4);
    ctx.restore();
}

function saveRecord() {
    const key = `best_${gameState.dept}_${gameState.diff}`;
    const old = localStorage.getItem(key) || 0;
    if (gameState.distance > old) localStorage.setItem(key, Math.floor(gameState.distance));
}

function unlockNextGrade() {
    if (gameState.grade < 3) {
        localStorage.setItem(`unlocked_${gameState.dept}_${parseInt(gameState.grade)+1}`, "true");
    }
}

function gameLoop() {
    update();
    draw();
    if(gameActive) requestAnimationFrame(gameLoop);
}
