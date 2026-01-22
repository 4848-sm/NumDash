// ゲームモードの定義
const GAME_MODES = [
    {
        name: '初級（1-9）',
        description: '1から9まで順番にタップ',
        numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9]
    },
    {
        name: '2の倍数',
        description: '2の倍数を順番にタップ',
        numbers: []
    },
    {
        name: '3の倍数',
        description: '3の倍数を順番にタップ',
        numbers: []
    },
    {
        name: '4の倍数',
        description: '4の倍数を順番にタップ',
        numbers: []
    },
    {
        name: '5の倍数',
        description: '5の倍数を順番にタップ',
        numbers: []
    },
    {
        name: '6の倍数',
        description: '6の倍数を順番にタップ',
        numbers: []
    },
    {
        name: '7の倍数',
        description: '7の倍数を順番にタップ',
        numbers: []
    },
    {
        name: '8の倍数',
        description: '8の倍数を順番にタップ',
        numbers: []
    },
    {
        name: '9の倍数',
        description: '9の倍数を順番にタップ',
        numbers: []
    }
];

// ゲーム状態
let gameState = 'menu'; // 'menu', 'difficulty', 'playing', 'finished'
let selectedMode = null;
let selectedDifficulty = null;
let numberPositions = [];
let currentIndex = 0;
let startTime = null;
let endTime = null;
let isMobile = false;
let scores = [];
let gameTimer = null;

// DOM要素の取得
const screens = {
    menu: document.getElementById('menu-screen'),
    difficulty: document.getElementById('difficulty-screen'),
    game: document.getElementById('game-screen'),
    finish: document.getElementById('finish-screen')
};

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    checkDevice();
    loadScores();
    
    // テスト用：初回起動時にダミースコアを追加
    if (scores.length === 0) {
        scores = [
            { mode: '初級（1-9）', time: 5.23, date: '2024/01/01' },
            { mode: '2の倍数（3x3）', time: 7.45, date: '2024/01/01' },
            { mode: '2の倍数（4x4）', time: 12.67, date: '2024/01/01' },
            { mode: '3の倍数（3x3）', time: 8.91, date: '2024/01/01' },
            { mode: '3の倍数（4x4）', time: 15.32, date: '2024/01/01' }
        ];
        localStorage.setItem('numberTapGameScores', JSON.stringify(scores));
    }
    
    setupEventListeners();
    renderGameModes();
    showScreen('menu');
    
    // リサイズイベント
    window.addEventListener('resize', checkDevice);
});

// デバイス判定
function checkDevice() {
    isMobile = window.innerWidth < 768 || 'ontouchstart' in window;
    updateMobileUI();
}

function updateMobileUI() {
    const pcControls = document.getElementById('pc-controls');
    const pcGameControls = document.getElementById('pc-game-controls');
    const pcFinishControls = document.getElementById('pc-finish-controls');
    
    if (isMobile) {
        if (pcControls) pcControls.style.display = 'none';
        if (pcGameControls) pcGameControls.style.display = 'none';
        if (pcFinishControls) pcFinishControls.style.display = 'none';
        
        // モバイル用のサブタイトル更新
        const subtitle = document.querySelector('.subtitle');
        if (subtitle) {
            subtitle.textContent = 'タップして数字を順番に押そう！';
        }
    } else {
        if (pcControls) pcControls.style.display = 'block';
        if (pcGameControls) pcGameControls.style.display = 'block';
        if (pcFinishControls) pcFinishControls.style.display = 'block';
        
        // PC用のサブタイトル更新
        const subtitle = document.querySelector('.subtitle');
        if (subtitle) {
            subtitle.textContent = 'クリックして数字を順番に押そう！';
        }
    }
}

// イベントリスナーの設定
function setupEventListeners() {
    // 難易度選択
    document.getElementById('easy-btn').addEventListener('click', () => startGame(selectedMode, '3x3'));
    document.getElementById('hard-btn').addEventListener('click', () => startGame(selectedMode, '4x4'));
    document.getElementById('back-to-menu-btn').addEventListener('click', backToMenu);
    
    // ゲーム画面
    document.getElementById('menu-btn').addEventListener('click', backToMenu);
    
    // 完了画面
    document.getElementById('play-again-btn').addEventListener('click', playAgain);
    document.getElementById('finish-menu-btn').addEventListener('click', backToMenu);
    
    // キーボードイベント
    document.addEventListener('keydown', handleKeyPress);
}

// キーボード操作
function handleKeyPress(event) {
    if (gameState === 'playing' && !isMobile) {
        const key = event.key;
        if (key >= '0' && key <= '9') {
            const number = parseInt(key);
            handleNumberClick(number);
        } else if (key === 'Enter' || key === ' ') {
            const expectedNumber = selectedMode.numbers[currentIndex];
            handleNumberClick(expectedNumber);
        }
    }
    
    if (key === 'Escape') {
        backToMenu();
    }
}

// 画面表示切り替え
function showScreen(screenName) {
    Object.values(screens).forEach(screen => {
        screen.classList.add('hidden');
    });
    screens[screenName].classList.remove('hidden');
    gameState = screenName === 'game' ? 'playing' : screenName;
}

// スコア関連
function loadScores() {
    const savedScores = localStorage.getItem('numberTapGameScores');
    if (savedScores) {
        scores = JSON.parse(savedScores);
    }
}

function saveScore(mode, time) {
    const newScore = {
        mode: mode,
        time: time,
        date: new Date().toLocaleDateString('ja-JP')
    };
    
    scores.push(newScore);
    scores.sort((a, b) => a.time - b.time);
    scores = scores.slice(0, 50); // 上位50件のみ保持
    
    localStorage.setItem('numberTapGameScores', JSON.stringify(scores));
    
    // スコア保存後にゲームモード表示を更新
    renderGameModes();
}

function getBestScore(mode) {
    const modeScores = scores.filter(score => score.mode === mode);
    return modeScores.length > 0 ? modeScores[0].time : null;
}



// ゲームモード表示
function renderGameModes() {
    const gameModesGrid = document.getElementById('game-modes');
    gameModesGrid.innerHTML = '';
    
    GAME_MODES.forEach((mode, index) => {
        const modeBtn = document.createElement('button');
        modeBtn.className = 'mode-btn';
        modeBtn.addEventListener('click', () => selectMode(mode));
        
        let bestScoreHtml = '';
        if (mode.name === '初級（1-9）') {
            const bestScore = getBestScore(mode.name);
            if (bestScore) {
                bestScoreHtml = `<div class="mode-best">ベスト: ${bestScore.toFixed(2)}秒</div>`;
            }
        } else {
            const bestScore3x3 = getBestScore(`${mode.name}（3x3）`);
            const bestScore4x4 = getBestScore(`${mode.name}（4x4）`);
            if (bestScore3x3 || bestScore4x4) {
                bestScoreHtml = '<div class="mode-best">';
                if (bestScore3x3) bestScoreHtml += `3×3: ${bestScore3x3.toFixed(2)}秒<br>`;
                if (bestScore4x4) bestScoreHtml += `4×4: ${bestScore4x4.toFixed(2)}秒`;
                bestScoreHtml += '</div>';
            }
        }
        
        modeBtn.innerHTML = `
            <h3 class="mode-title">${mode.name}</h3>
            <p class="mode-desc">${mode.description}</p>
            ${bestScoreHtml}
        `;
        
        gameModesGrid.appendChild(modeBtn);
    });
}

// モード選択
function selectMode(mode) {
    selectedMode = mode;
    if (mode.name === '初級（1-9）') {
        startGame(mode, '3x3');
    } else {
        document.getElementById('difficulty-mode-name').textContent = mode.name;
        showScreen('difficulty');
    }
}

// 倍数生成
function generateMultiples(multiplier, difficulty) {
    const count = difficulty === '3x3' ? 9 : 16;
    return Array.from({ length: count }, (_, i) => (i + 1) * multiplier);
}

// 数字配置生成
function shuffleNumbers(numbers) {
    let gridPositions;
    
    if (numbers.length === 9) {
        // 3×3グリッド
        gridPositions = [
            { x: 25, y: 30 }, { x: 50, y: 30 }, { x: 75, y: 30 },
            { x: 25, y: 50 }, { x: 50, y: 50 }, { x: 75, y: 50 },
            { x: 25, y: 70 }, { x: 50, y: 70 }, { x: 75, y: 70 }
        ];
    } else if (numbers.length === 16) {
        // 4×4グリッド
        gridPositions = [
            { x: 20, y: 30 }, { x: 40, y: 30 }, { x: 60, y: 30 }, { x: 80, y: 30 },
            { x: 20, y: 45 }, { x: 40, y: 45 }, { x: 60, y: 45 }, { x: 80, y: 45 },
            { x: 20, y: 60 }, { x: 40, y: 60 }, { x: 60, y: 60 }, { x: 80, y: 60 },
            { x: 20, y: 75 }, { x: 40, y: 75 }, { x: 60, y: 75 }, { x: 80, y: 75 }
        ];
    }
    
    // 数字をシャッフル
    const shuffledNumbers = [...numbers].sort(() => Math.random() - 0.5);
    
    return shuffledNumbers.map((number, index) => ({
        number: number,
        x: gridPositions[index].x,
        y: gridPositions[index].y,
        isCompleted: false
    }));
}

// ゲーム開始
function startGame(mode, difficulty) {
    selectedDifficulty = difficulty;
    
    let numbers;
    if (mode.name === '初級（1-9）') {
        numbers = mode.numbers;
    } else {
        const multiplier = parseInt(mode.name.charAt(0));
        numbers = generateMultiples(multiplier, difficulty);
    }
    
    selectedMode = { ...mode, numbers };
    numberPositions = shuffleNumbers(numbers);
    currentIndex = 0;
    startTime = null;
    endTime = null;
    
    updateGameUI();
    renderNumberButtons();
    showScreen('game');
    startGameTimer();
}

// ゲームUI更新
function updateGameUI() {
    const modeTitle = selectedMode.name + (selectedDifficulty ? `（${selectedDifficulty}）` : '');
    document.getElementById('game-mode-title').textContent = `🍭 ${modeTitle} 🍩`;
    document.getElementById('progress').textContent = `🍓 ${currentIndex + 1} / ${selectedMode.numbers.length} 🍪`;
    document.getElementById('next-number').textContent = `🎯 次: ${selectedMode.numbers[currentIndex] || '完了'}`;
}

// 数字ボタン描画
function renderNumberButtons() {
    const gameArea = document.getElementById('game-area');
    gameArea.innerHTML = '';
    
    const sizeClass = selectedMode.numbers.length === 9 ? 'size-3x3' : 'size-4x4';
    
    numberPositions.forEach((pos, index) => {
        const button = document.createElement('button');
        button.className = `number-btn ${sizeClass}`;
        button.textContent = pos.number;
        button.style.left = `${pos.x}%`;
        button.style.top = `${pos.y}%`;
        button.disabled = pos.isCompleted;
        
        button.addEventListener('click', () => handleNumberClick(pos.number));
        
        gameArea.appendChild(button);
    });
}

// ゲームタイマー
function startGameTimer() {
    if (gameTimer) {
        clearInterval(gameTimer);
    }
    
    gameTimer = setInterval(() => {
        if (gameState === 'playing' && startTime) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
            document.getElementById('timer').textContent = `⏱️ ${elapsed}秒`;
        }
    }, 10);
}

function stopGameTimer() {
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
}

// 数字クリック処理
function handleNumberClick(clickedNumber) {
    if (gameState !== 'playing' || !selectedMode) return;
    
    const expectedNumber = selectedMode.numbers[currentIndex];
    
    // 最初のクリックでタイマー開始
    if (currentIndex === 0 && startTime === null) {
        startTime = Date.now();
    }
    
    if (clickedNumber === expectedNumber) {
        // 正解
        numberPositions = numberPositions.map(pos => 
            pos.number === clickedNumber 
                ? { ...pos, isCompleted: true }
                : pos
        );
        
        currentIndex++;
        updateGameUI();
        renderNumberButtons();
        
        // ゲーム完了チェック
        if (currentIndex >= selectedMode.numbers.length) {
            endTime = Date.now();
            stopGameTimer();
            
            // スコア保存
            if (startTime) {
                const finalTime = (endTime - startTime) / 1000;
                const modeWithDifficulty = selectedDifficulty ? 
                    `${selectedMode.name}（${selectedDifficulty}）` : selectedMode.name;
                saveScore(modeWithDifficulty, finalTime);
            }
            
            showFinishScreen();
        }
    } else {
        // 不正解 - 視覚的フィードバック
        const gameScreen = document.getElementById('game-screen');
        gameScreen.classList.add('shake', 'error-bg');
        
        setTimeout(() => {
            gameScreen.classList.remove('shake', 'error-bg');
        }, 500);
    }
}

// 完了画面表示
function showFinishScreen() {
    const currentTime = (endTime - startTime) / 1000;
    const modeWithDifficulty = selectedDifficulty ? 
        `${selectedMode.name}（${selectedDifficulty}）` : selectedMode.name;
    const bestScore = getBestScore(modeWithDifficulty);
    const isNewRecord = !bestScore || currentTime < bestScore;
    
    document.getElementById('final-time').textContent = `${currentTime.toFixed(2)}秒`;
    document.getElementById('finish-mode').textContent = `${modeWithDifficulty}をクリアしました！`;
    
    const newRecordEl = document.getElementById('new-record');
    const bestScoreEl = document.getElementById('best-score-display');
    
    if (isNewRecord) {
        newRecordEl.classList.remove('hidden');
        bestScoreEl.classList.add('hidden');
    } else {
        newRecordEl.classList.add('hidden');
        bestScoreEl.textContent = `ベスト記録: ${bestScore.toFixed(2)}秒`;
        bestScoreEl.classList.remove('hidden');
    }
    
    showScreen('finish');
}

// もう一度プレイ
function playAgain() {
    if (selectedMode && selectedDifficulty) {
        startGame(selectedMode, selectedDifficulty);
    }
}

// メニューに戻る
function backToMenu() {
    stopGameTimer();
    selectedMode = null;
    selectedDifficulty = null;
    numberPositions = [];
    currentIndex = 0;
    startTime = null;
    endTime = null;
    
    // ゲームモード表示を更新（新しいスコアが追加された可能性があるため）
    renderGameModes();
    
    showScreen('menu');
}