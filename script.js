class PomodoroTimer {
    constructor() {
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.timerId = null;
        this.isRunning = false;
        this.correctPasscode = '917088552957';
        
        // DOM elements
        this.loginScreen = document.getElementById('login-screen');
        this.timerScreen = document.getElementById('timer-screen');
        this.passcodeInput = document.getElementById('passcode');
        this.loginButton = document.getElementById('login');
        this.logoutButton = document.getElementById('logout');
        this.loginError = document.getElementById('login-error');
        this.timeDisplay = document.querySelector('.time-display');
        this.startButton = document.getElementById('start');
        this.pauseButton = document.getElementById('pause');
        this.resetButton = document.getElementById('reset');
        this.modeButtons = document.querySelectorAll('.mode');
        
        // Bind event listeners
        this.loginButton.addEventListener('click', () => this.handleLogin());
        this.logoutButton.addEventListener('click', () => this.handleLogout());
        this.passcodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleLogin();
            }
        });
        
        this.startButton.addEventListener('click', () => this.start());
        this.pauseButton.addEventListener('click', () => this.pause());
        this.resetButton.addEventListener('click', () => this.reset());
        this.modeButtons.forEach(button => {
            button.addEventListener('click', () => this.setMode(button));
        });
        
        this.updateDisplay();
    }
    
    handleLogin() {
        const enteredPasscode = this.passcodeInput.value;
        if (enteredPasscode === this.correctPasscode) {
            this.loginScreen.style.display = 'none';
            this.timerScreen.style.display = 'block';
            this.passcodeInput.value = '';
            this.loginError.textContent = '';
        } else {
            this.loginError.textContent = 'Incorrect passcode';
            this.passcodeInput.value = '';
        }
    }
    
    handleLogout() {
        this.pause();
        this.loginScreen.style.display = 'block';
        this.timerScreen.style.display = 'none';
        this.reset();
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.timerId = setInterval(() => {
                this.timeLeft--;
                this.updateDisplay();
                
                if (this.timeLeft <= 0) {
                    this.reset();
                    // Play a sound or show a notification here
                    alert('Time\'s up!');
                }
            }, 1000);
        }
    }
    
    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            clearInterval(this.timerId);
        }
    }
    
    reset() {
        this.pause();
        const activeMode = document.querySelector('.mode.active');
        this.timeLeft = parseInt(activeMode.dataset.time) * 60;
        this.updateDisplay();
    }
    
    setMode(button) {
        this.modeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        this.reset();
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
}); 