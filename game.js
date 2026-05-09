// 模擬資源加載
let loadProgress = 0;
const loadingScreen = document.getElementById('loading-screen');
const loadingBar = document.getElementById('loading-bar');
const percentText = document.getElementById('percent');

function simulateLoading() {
    if (loadProgress < 100) {
        loadProgress += Math.random() * 5; // 隨機增加進度
        if (loadProgress > 100) loadProgress = 100;
        
        loadingBar.style.width = loadProgress + '%';
        percentText.innerText = Math.floor(loadProgress) + '%';
        
        setTimeout(simulateLoading, 100);
    } else {
        // 加載完成，點擊後消失（符合瀏覽器自動播放政策）
        percentText.innerText = "完成！點擊螢幕開始對決";
        loadingScreen.addEventListener('click', () => {
            loadingScreen.style.display = 'none';
            initGame(); // 呼叫你的遊戲初始化函數
        });
    }
}

// 啟動加載
simulateLoading();

function initGame() {
    // 這裡放你之前的 gameLoop() 啟動代碼
    gameLoop();
}
