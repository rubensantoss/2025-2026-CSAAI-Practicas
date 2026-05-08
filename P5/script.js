window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const menuScreen = document.getElementById('menu-screen');
    const gameoverScreen = document.getElementById('gameover-screen');
    const messageOverlay = document.getElementById('message-overlay');
    const scoreboard = document.getElementById('scoreboard');
    const scorePlayerEl = document.getElementById('score-player');
    const scoreBotEl = document.getElementById('score-bot');
    const centerMessage = document.getElementById('center-message');
    const gameoverMsg = document.getElementById('gameover-msg');

    let gameState = 'menu';
    let mode = '3goles';
    let scorePlayer = 0;
    let scoreBot = 0;
    let keys = {};

    const player = { id: 'player', x: 250, y: 250, radius: 20, color: '#2a52be', speed: 4 };
    const ally   = { id: 'ally',   x: 150, y: 250, radius: 20, color: '#4a82de', speed: 2 }; 
    const rival1 = { id: 'rival1', x: 550, y: 150, radius: 20, color: '#b93232', speed: 2.2 }; 
    const rival2 = { id: 'rival2', x: 650, y: 350, radius: 20, color: '#d96262', speed: 1.8 }; 

    const entities = [player, ally, rival1, rival2];

    const ball = { x: 400, y: 250, radius: 10, color: 'white', vx: 0, vy: 0, friction: 0.96 };

    const goalWidth = 50;
    const goalTop = 175;
    const goalBottom = 325;

    window.addEventListener('keydown', (e) => keys[e.key] = true);
    window.addEventListener('keyup', (e) => keys[e.key] = false);

    window.startGame = function(selectedMode) {
        mode = selectedMode;
        scorePlayer = 0;
        scoreBot = 0;
        updateScoreboard();
        menuScreen.classList.add('hidden');
        gameoverScreen.classList.add('hidden');
        scoreboard.classList.remove('hidden');
        resetPositions();
        startCountdown();
    };

    window.showMenu = function() {
        gameState = 'menu';
        gameoverScreen.classList.add('hidden');
        scoreboard.classList.add('hidden');
        menuScreen.classList.remove('hidden');
    };

    window.restartGame = function() {
        window.startGame(mode);
    };

    function startCountdown(msg = "3") {
        gameState = 'countdown';
        messageOverlay.classList.remove('hidden');
        
        let count = 3;
        if (msg !== "3") {
            centerMessage.innerText = msg;
            setTimeout(() => startCountdown("3"), 1500); 
            return;
        }

        centerMessage.innerText = count;
        let interval = setInterval(() => {
            count--;
            if (count > 0) {
                centerMessage.innerText = count;
            } else {
                clearInterval(interval);
                centerMessage.innerText = "¡YA!";
                setTimeout(() => {
                    messageOverlay.classList.add('hidden');
                    gameState = 'playing';
                }, 500);
            }
        }, 1000);
    }

    function resetPositions() {
        player.x = 250; player.y = 250;
        ally.x = 150; ally.y = 250;
        rival1.x = 550; rival1.y = 150;
        rival2.x = 650; rival2.y = 350;
        
        ball.x = 400; ball.y = 250;
        ball.vx = 0; ball.vy = 0;
    }

    function updateScoreboard() {
        scorePlayerEl.innerText = scorePlayer;
        scoreBotEl.innerText = scoreBot;
    }

    function handleCollision(entity) {
        let dx = ball.x - entity.x;
        let dy = ball.y - entity.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < entity.radius + ball.radius) {
            let angle = Math.atan2(dy, dx);
            let force = 5; 
            if (entity.id === 'player' && keys[' ']) force = 10; 
            
            ball.vx = Math.cos(angle) * force;
            ball.vy = Math.sin(angle) * force;
        }
    }

    function moveBot(bot, targetX, targetY) {
        if (bot.x > targetX + 5) bot.x -= bot.speed;
        if (bot.x < targetX - 5) bot.x += bot.speed;
        if (bot.y > targetY + 5) bot.y -= bot.speed;
        if (bot.y < targetY - 5) bot.y += bot.speed;

        bot.x = Math.max(bot.radius, Math.min(canvas.width - bot.radius, bot.x));
        bot.y = Math.max(bot.radius, Math.min(canvas.height - bot.radius, bot.y));
    }

    function update() {
        if (gameState !== 'playing') return;

        if (keys['ArrowUp'] && player.y > player.radius) player.y -= player.speed;
        if (keys['ArrowDown'] && player.y < canvas.height - player.radius) player.y += player.speed;
        if (keys['ArrowLeft'] && player.x > player.radius) player.x -= player.speed;
        if (keys['ArrowRight'] && player.x < canvas.width - player.radius) player.x += player.speed;

        moveBot(ally, ball.x - 30, ball.y);
        moveBot(rival1, ball.x, ball.y);    
        let defendX = Math.max(ball.x, 550); 
        moveBot(rival2, defendX, ball.y);   

        ball.vx *= ball.friction;
        ball.vy *= ball.friction;
        ball.x += ball.vx;
        ball.y += ball.vy;

        if (ball.y <= ball.radius) {
            ball.y = ball.radius; 
            ball.vy *= -1;
        } else if (ball.y >= canvas.height - ball.radius) {
            ball.y = canvas.height - ball.radius; 
            ball.vy *= -1;
        }

        if (ball.x <= ball.radius) { 
            if (ball.y > goalTop && ball.y < goalBottom) {
                triggerGoal('bot');
            } else { 
                ball.x = ball.radius; 
                ball.vx *= -1; 
            }
        } else if (ball.x >= canvas.width - ball.radius) { 
            if (ball.y > goalTop && ball.y < goalBottom) {
                triggerGoal('player');
            } else { 
                ball.x = canvas.width - ball.radius; 
                ball.vx *= -1; 
            }
        }

        entities.forEach(entity => handleCollision(entity));
    }

    function triggerGoal(scorer) {
        if (scorer === 'player') scorePlayer++;
        else scoreBot++;

        updateScoreboard();

        if (mode === 'oro' || (mode === '3goles' && (scorePlayer >= 3 || scoreBot >= 3))) {
            gameState = 'gameover';
            gameoverMsg.innerText = scorer === 'player' ? "¡Equipo Azul Gana!" : "¡Equipo Rojo Gana!";
            gameoverScreen.classList.remove('hidden');
            scoreboard.classList.add('hidden');
        } else {
            resetPositions();
            startCountdown(scorer === 'player' ? "¡GOOOL AZUL!" : "¡GOL ROJO!");
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 4;
        
        ctx.beginPath();
        ctx.moveTo(400, 0); 
        ctx.lineTo(400, 500); 
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(400, 250, 60, 0, Math.PI * 2); 
        ctx.stroke();

        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.fillRect(0, goalTop, goalWidth, goalBottom - goalTop); 
        ctx.fillRect(canvas.width - goalWidth, goalTop, goalWidth, goalBottom - goalTop); 

        entities.forEach(entity => {
            ctx.fillStyle = entity.color;
            ctx.beginPath(); 
            ctx.arc(entity.x, entity.y, entity.radius, 0, Math.PI * 2); 
            ctx.fill();
            
            if (entity.id === 'player') {
                ctx.fillStyle = "white";
                ctx.beginPath(); 
                ctx.arc(entity.x + 10, entity.y, 4, 0, Math.PI * 2); 
                ctx.fill();
            }
        });

        ctx.fillStyle = ball.color;
        ctx.beginPath(); 
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2); 
        ctx.fill();
    }

    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
});

