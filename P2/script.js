// script.js
const MAX_ATTEMPTS = 7;
let secretKey = [];
let attemptsLeft = MAX_ATTEMPTS;
let digitsGuessed = 0;
let gameEnded = false;

// Referencias del DOM
const cronoDisplay = document.getElementById('crono-display');
const attemptsCountSpan = document.getElementById('attempts-count');
const instructionsText = document.getElementById('message-text');

// Instanciar el cronómetro importado de crono.js (usa el mismo de antes)
const crono = new Cronometro(cronoDisplay);

window.onload = () => {
    initGame();
    asignarEventosNumPad();
    asignarEventosControles();
};

function initGame() {
    crono.reset();
    gameEnded = false;
    attemptsLeft = MAX_ATTEMPTS;
    digitsGuessed = 0;
    attemptsCountSpan.innerText = attemptsLeft;
    
    updateInstructions("Nueva partida preparada. Pulsa Start o un número para comenzar.");
    generarClaveSecreta();
    resetearTeclado();
    resetearPantallaClave();
}

function generarClaveSecreta() {
    secretKey = [];
    while (secretKey.length < 4) {
        let randomDigit = Math.floor(Math.random() * 10);
        if (!secretKey.includes(randomDigit)) {
            secretKey.push(randomDigit);
        }
    }
    console.log("Clave secreta (solo debug):", secretKey);
}

function asignarEventosNumPad() {
    for (let i = 0; i <= 9; i++) {
        const btn = document.getElementById(`btn-num-${i}`);
        btn.addEventListener('click', () => procesarPulsacion(i, btn));
    }
}

function procesarPulsacion(numero, botonElemento) {
    if (gameEnded) return;

    if (!crono.isRunning) {
        crono.start();
        updateInstructions("Tiempo iniciado. ¡Adivina!");
    }

    botonElemento.disabled = true;
    attemptsLeft--;
    attemptsCountSpan.innerText = attemptsLeft;

    if (secretKey.includes(numero)) {
        secretKey.forEach((digito, index) => {
            if (digito === numero) {
                revelarDigito(index, numero);
                digitsGuessed++;
            }
        });
    }

    comprobarFinDeJuego();
}

function revelarDigito(index, numero) {
    let digitDiv = document.getElementById(`digit-${index}`);
    digitDiv.innerHTML = numero; 
    digitDiv.classList.remove('hidden', 'neu-in');
    digitDiv.classList.add('revealed', 'neu-out'); // Sale hacia afuera al revelarse
}

function comprobarFinDeJuego() {
    if (digitsGuessed === 4) {
        crono.stop();
        gameEnded = true;
        updateInstructions(
            `<strong>¡VICTORIA! 🎉</strong><br>
            Tiempo: ${crono.getTimeString()}<br>
            Intentos consumidos: ${MAX_ATTEMPTS - attemptsLeft}<br>
            Intentos restantes: ${attemptsLeft}`
        );
        desactivarTeclado();
    } else if (attemptsLeft === 0) {
        crono.stop();
        gameEnded = true;
        secretKey.forEach((digito, index) => revelarDigito(index, digito));
        updateInstructions(`<strong>¡HAS PERDIDO! 😢</strong><br>La clave era: ${secretKey.join('')}.`);
        desactivarTeclado();
    }
}

function updateInstructions(text) {
    instructionsText.innerHTML = text;
}

function desactivarTeclado() {
    let botones = document.querySelectorAll('.num-btn');
    botones.forEach(btn => btn.disabled = true);
}

function resetearTeclado() {
    let botones = document.querySelectorAll('.num-btn');
    botones.forEach(btn => btn.disabled = false);
}

function resetearPantallaClave() {
    for (let i = 0; i < 4; i++) {
        let digitDiv = document.getElementById(`digit-${i}`);
        digitDiv.innerHTML = '<span class="asterisco">*</span>';
        digitDiv.className = 'digit hidden neu-in'; // Vuelve a estar hundido
    }
}

function asignarEventosControles() {
    document.getElementById('btn-start').addEventListener('click', () => {
        if (!gameEnded && !crono.isRunning) {
            crono.start();
            updateInstructions("Tiempo iniciado. ¡Adivina!");
        }
    });
    
    document.getElementById('btn-stop').addEventListener('click', () => {
        if (crono.isRunning) {
            crono.stop();
            updateInstructions("Tiempo pausado. Pulsa Start para reanudar.");
        }
    });
    
    document.getElementById('btn-reset').addEventListener('click', initGame);
}