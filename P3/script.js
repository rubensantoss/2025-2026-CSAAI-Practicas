
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let score = 0;
let lives = 3;
let energy = 10;
const maxEnergy = 10;
let gameOver = false;
let gameWon = false;

let lastTime = 0;
let lastEnergyRecharge = 0;
let lastShotTime = 0;

const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
};

const sfxLaser = new Audio('laser.mp3');
const sfxExplosion = new Audio('explosion.mp3'); 
const sfxWin = new Audio('victoria.mp3'); 
const sfxLose = new Audio('derrota.mp3'); 

const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 40,
    speed: 5
};

let playerBullets = [];
let enemyBullets = [];
let explosions = [];

const aliens = [];
const alienRows = 3;
const alienCols = 8;
const totalAliens = alienRows * alienCols;
let activeAliens = totalAliens;
let alienDirection = 1;
let alienBaseSpeed = 1;

for (let r = 0; r < alienRows; r++) {
    for (let c = 0; c < alienCols; c++) {
        aliens.push({
            x: 50 + c * 70,
            y: 50 + r * 60,
            width: 40,
            height: 30,
            active: true
        });
    }
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') keys.ArrowLeft = true;
    if (e.code === 'ArrowRight') keys.ArrowRight = true;
    if (e.code === 'Space') keys.Space = true;
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') keys.ArrowLeft = false;
    if (e.code === 'ArrowRight') keys.ArrowRight = false;
    if (e.code === 'Space') keys.Space = false;
});

function update(deltaTime) {
    if (gameOver || gameWon) return;

    if (keys.ArrowLeft && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys.ArrowRight && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }

    const now = Date.now();
    
    if (now - lastEnergyRecharge > 500 && energy < maxEnergy) {
        energy++;
        lastEnergyRecharge = now;
        updateUI();
    }

    if (keys.Space && energy > 0 && now - lastShotTime > 200) {
        playerBullets.push({ x: player.x + player.width / 2 - 2.5, y: player.y, width: 5, height: 15, speed: 7 });
        energy--;
        lastShotTime = now;
        lastEnergyRecharge = now;
        if (sfxLaser.src) { sfxLaser.currentTime = 0; sfxLaser.play(); }
        updateUI();
    }

    for (let i = playerBullets.length - 1; i >= 0; i--) {
        let b = playerBullets[i];
        b.y -= b.speed;
        if (b.y < 0) playerBullets.splice(i, 1);
    }

    let currentSpeed = alienBaseSpeed + ((totalAliens - activeAliens) * 0.1);
    
    let hitWall = false;
    for (let a of aliens) {
        if (!a.active) continue;
        a.x += currentSpeed * alienDirection;
        if (a.x + a.width >= canvas.width || a.x <= 0) {
            hitWall = true;
        }
    }

    if (hitWall) {
        alienDirection *= -1;
        for (let a of aliens) {
            if (a.active) a.y += 20;
            if (a.active && a.y + a.height >= player.y) {
                triggerGameOver();
            }
        }
    }

    if (activeAliens > 0 && Math.random() < 0.016) {
        let activeList = aliens.filter(a => a.active);
        let randomAlien = activeList[Math.floor(Math.random() * activeList.length)];
        enemyBullets.push({ x: randomAlien.x + randomAlien.width / 2 - 2.5, y: randomAlien.y + randomAlien.height, width: 5, height: 15, speed: 4 });
    }

    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        let eb = enemyBullets[i];
        eb.y += eb.speed;
        if (eb.y > canvas.height) enemyBullets.splice(i, 1);
    }

    for (let i = playerBullets.length - 1; i >= 0; i--) {
        let b = playerBullets[i];
        let hit = false;
        
        for (let a of aliens) {
            if (a.active && b.x < a.x + a.width && b.x + b.width > a.x && b.y < a.y + a.height && b.y + b.height > a.y) {
                a.active = false;
                hit = true;
                score += 10;
                activeAliens--;
                updateUI();
                explosions.push({ x: a.x, y: a.y, width: a.width, height: a.height, frames: 15 });
                if (sfxExplosion.src) { sfxExplosion.currentTime = 0; sfxExplosion.play(); }
                if (activeAliens === 0) triggerVictory();
                break;
            }
        }
        if (hit) playerBullets.splice(i, 1);
    }

    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        let eb = enemyBullets[i];
        if (eb.x < player.x + player.width && eb.x + eb.width > player.x && eb.y < player.y + player.height && eb.y + eb.height > player.y) {
            lives--;
            updateUI();
            enemyBullets.splice(i, 1);
            canvas.style.boxShadow = "0 0 30px red";
            setTimeout(() => { canvas.style.boxShadow = "0 0 20px rgba(0, 255, 255, 0.2)"; }, 150);
            if (lives <= 0) triggerGameOver();
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00f';
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.fill();

    ctx.fillStyle = '#0f0';
    for (let a of aliens) {
        if (a.active) {
            ctx.fillRect(a.x, a.y, a.width, a.height);
            ctx.fillStyle = '#000';
            ctx.fillRect(a.x + 10, a.y + 10, 5, 5);
            ctx.fillRect(a.x + 25, a.y + 10, 5, 5);
            ctx.fillStyle = '#0f0';
        }
    }

    ctx.fillStyle = '#0ff';
    for (let b of playerBullets) {
        ctx.fillRect(b.x, b.y, b.width, b.height);
    }

    ctx.fillStyle = '#f00';
    for (let eb of enemyBullets) {
        ctx.fillRect(eb.x, eb.y, eb.width, eb.height);
    }

    for (let i = explosions.length - 1; i >= 0; i--) {
        let exp = explosions[i];
        if (exp.frames > 0) {
            ctx.fillStyle = (exp.frames % 2 === 0) ? '#ffaa00' : '#ff0000';
            ctx.beginPath();
            ctx.arc(exp.x + exp.width / 2, exp.y + exp.height / 2, 20 + (15 - exp.frames), 0, Math.PI * 2);
            ctx.fill();
            exp.frames--;
        } else {
            explosions.splice(i, 1);
        }
    }
}

function updateUI() {
    document.getElementById('score-display').innerText = `Puntos: ${score}`;
    document.getElementById('lives-display').innerText = `Vidas: ${lives}`;
    let energyBar = "";
    for(let i=0; i<maxEnergy; i++) {
        energyBar += (i < energy) ? "█" : "▒";
    }
    document.getElementById('energy-display').innerText = `Energía: ${energyBar}`;
}

function triggerGameOver() {
    gameOver = true;
    if (sfxLose.src) sfxLose.play();
    const ms = document.getElementById('message-screen');
    ms.classList.remove('hidden');
    ms.classList.add('lose-text');
    document.getElementById('main-message').innerText = "GAME OVER";
}

function triggerVictory() {
    gameWon = true;
    if (sfxWin.src) sfxWin.play();
    const ms = document.getElementById('message-screen');
    ms.classList.remove('hidden');
    ms.classList.add('win-text');
    document.getElementById('main-message').innerText = "¡SECTOR DEFENDIDO!";
}

function gameLoop(timestamp) {
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    update(deltaTime);
    draw();
    if (!gameOver && !gameWon) {
        requestAnimationFrame(gameLoop);
    }
}

updateUI();
requestAnimationFrame(gameLoop);