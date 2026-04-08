// crono.js
class Cronometro {
    constructor(displayElement) {
        this.displayElement = displayElement;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.interval = null;
        this.isRunning = false;
    }

    start() {
        if (!this.isRunning) {
            this.startTime = Date.now() - this.elapsedTime;
            this.interval = setInterval(() => this.updateDisplay(), 10); 
            this.isRunning = true;
        }
    }

    stop() {
        if (this.isRunning) {
            clearInterval(this.interval);
            this.isRunning = false;
        }
    }

    reset() {
        this.stop();
        this.elapsedTime = 0;
        this.displayElement.innerText = "00:00:00";
    }

    updateDisplay() {
        this.elapsedTime = Date.now() - this.startTime;
        this.displayElement.innerText = this.formatTime(this.elapsedTime);
    }

    formatTime(time) {
        let date = new Date(time);
        let m = date.getUTCMinutes().toString().padStart(2, '0');
        let s = date.getUTCSeconds().toString().padStart(2, '0');
        let ms = Math.floor(date.getUTCMilliseconds() / 10).toString().padStart(2, '0');
        return `${m}:${s}:${ms}`;
    }

    getTimeString() {
        return this.displayElement.innerText;
    }
}