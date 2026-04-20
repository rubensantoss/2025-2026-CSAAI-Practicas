let isPlaying = false;
let timerId = null;
let sequenceId = null;
let timeElapsed = 0;
let currentLevel = 1;
let currentStep = 0;

const levelConfig = {
    1: { speed: 1000, layout: [0, 0, 0, 0, 1, 1, 1, 1] },
    2: { speed: 800,  layout: [0, 1, 0, 1, 0, 1, 0, 1] },
    3: { speed: 600,  layout: [0, 0, 1, 1, 0, 0, 1, 1] },
    4: { speed: 400,  layout: [0, 1, 1, 0, 1, 0, 0, 1] },
    5: { speed: 250,  layout: [1, 1, 0, 1, 0, 0, 1, 0] }
};

const elWordDisplay = document.getElementById('current-word');
const elLevelDisplay = document.getElementById('level-display');
const elTimeDisplay = document.getElementById('time-display');
const elStatusDisplay = document.getElementById('status-display');
const selWordPair = document.getElementById('word-pair');
const selStartLevel = document.getElementById('start-level');
const btnStart = document.getElementById('btn-start');
const btnStop = document.getElementById('btn-stop');
const btnMusic = document.getElementById('btn-music');
const bgMusic = document.getElementById('bg-music');
const gridItems = Array.from(document.querySelectorAll('.grid-item'));

btnStart.addEventListener('click', startGame);
btnStop.addEventListener('click', stopGame);
btnMusic.addEventListener('click', toggleMusic);

function startGame() {
    if (isPlaying) return;
    
    isPlaying = true;
    timeElapsed = 0;
    currentStep = 0;
    currentLevel = parseInt(selStartLevel.value);
    
    btnStart.disabled = true;
    selWordPair.disabled = true;
    selStartLevel.disabled = true;
    btnStop.disabled = false;
    
    elStatusDisplay.textContent = "Preparando...";
    elTimeDisplay.textContent = "00:00";
    
    timerId = setInterval(updateTimer, 1000);
    setTimeout(startRound, 1500);
}

function stopGame(isVictory = false) {
    isPlaying = false;
    clearInterval(timerId);
    clearTimeout(sequenceId);
    
    gridItems.forEach(item => item.classList.remove('active'));
    btnStart.disabled = false;
    selWordPair.disabled = false;
    selStartLevel.disabled = false;
    btnStop.disabled = true;
    
    if (isVictory) {
        elStatusDisplay.textContent = "¡Juego Completado!";
        elWordDisplay.textContent = "¡Felicidades!";
    } else {
        elStatusDisplay.textContent = "Partida detenida";
        elWordDisplay.textContent = "Juego parado";
    }
}

function startRound() {
    if (!isPlaying) return;
    if (currentLevel > 5) {
        stopGame(true);
        return;
    }

    elLevelDisplay.textContent = currentLevel;
    elStatusDisplay.textContent = "¡Jugando!";
    currentStep = 0;
    
    setupGridForLevel();
    runSequenceStep();
}

function runSequenceStep() {
    if (!isPlaying) return;

    gridItems.forEach(item => item.classList.remove('active'));

    if (currentStep >= 8) {
        currentLevel++;
        elWordDisplay.textContent = "¡Siguiente nivel!";
        elStatusDisplay.textContent = "Preparando...";
        setTimeout(startRound, 2000);
        return;
    }

    gridItems[currentStep].classList.add('active');
    
    const words = selWordPair.value.split(',');
    const layout = levelConfig[currentLevel].layout;
    const currentWordIndex = layout[currentStep];
    
    elWordDisplay.textContent = words[currentWordIndex];

    const speed = levelConfig[currentLevel].speed;
    currentStep++;
    sequenceId = setTimeout(runSequenceStep, speed);
}

function setupGridForLevel() {
    const emojis = selWordPair.value === "cama,casa" ? ["🛏️", "🏠"] : ["🐱", "🐶"];
    const layout = levelConfig[currentLevel].layout;

    gridItems.forEach((item, index) => {
        const wordIndex = layout[index];
        item.textContent = emojis[wordIndex];
    });
}

function updateTimer() {
    timeElapsed++;
    const minutes = Math.floor(timeElapsed / 60).toString().padStart(2, '0');
    const seconds = (timeElapsed % 60).toString().padStart(2, '0');
    elTimeDisplay.textContent = `${minutes}:${seconds}`;
}

function toggleMusic() {
    if (bgMusic.paused) {
        bgMusic.play();
        btnMusic.textContent = "🔊 Música: ON";
        btnMusic.classList.replace("outline", "primary");
    } else {
        bgMusic.pause();
        btnMusic.textContent = "🔊 Música: OFF";
        btnMusic.classList.replace("primary", "outline");
    }
}