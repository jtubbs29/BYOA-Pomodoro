// --- DOM Elements ---
document.addEventListener('DOMContentLoaded', () => {
    // Auth elements
    const authContainer = document.getElementById('auth-container');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const authError = document.getElementById('auth-error');
    const toggleModeLink = document.getElementById('toggle-mode');
    const authModeMessage = document.getElementById('auth-mode-message');

    // Timer elements
    const timerScreen = document.getElementById('timer-screen');
    const timeDisplay = document.querySelector('.time-display');
    const startButton = document.getElementById('start');
    const pauseButton = document.getElementById('pause');
    const resetButton = document.getElementById('reset');
    const modeButtons = document.querySelectorAll('.mode');
    const logoutButton = document.getElementById('logout');
    const userEmailDisplay = document.getElementById('user-email');

    // --- Timer State ---
    let timerId = null;
    let isRunning = false;
    let timeLeft = 25 * 60; // Default Pomodoro time
    let currentUser = null;
    let userPreferences = {
        pomodoro: 25,
        shortBreak: 5,
        longBreak: 15
    };
    let currentMode = 'pomodoro'; // 'pomodoro', 'shortBreak', 'longBreak'

    // --- Auth State ---
    let isLoginMode = true;

    // --- Firebase Refs (initialized in index.html) ---
    // const auth = firebase.auth();
    // const db = firebase.firestore();

    // --- Functions ---
    function updateDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        // Update browser title
        document.title = `${timeDisplay.textContent} - Pomodoro`;
    }

    function startTimer() {
        if (!isRunning) {
            isRunning = true;
            timerId = setInterval(() => {
                timeLeft--;
                updateDisplay();
                if (timeLeft <= 0) {
                    clearInterval(timerId); // Stop timer
                    isRunning = false;
                    // TODO: Auto-switch modes or alert
                    alert('Time\'s up!');
                    resetTimer(); // Reset to current mode's time
                }
            }, 1000);
        }
    }

    function pauseTimer() {
        if (isRunning) {
            isRunning = false;
            clearInterval(timerId);
        }
    }

    function resetTimer() {
        pauseTimer();
        const activeModeButton = document.querySelector('.mode.active');
        currentMode = activeModeButton.dataset.mode;
        timeLeft = (userPreferences[currentMode] || parseInt(activeModeButton.dataset.time)) * 60;
        updateDisplay();
    }

    function setMode(button) {
        modeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentMode = button.dataset.mode;
        resetTimer();
        // TODO: Optionally save the last used mode to preferences
    }

    function loadUserPreferences(userId) {
        const userRef = db.collection('users').doc(userId);
        userRef.get().then((doc) => {
            if (doc.exists) {
                const prefs = doc.data().preferences;
                if (prefs) {
                    userPreferences = {
                        pomodoro: prefs.pomodoro || 25,
                        shortBreak: prefs.shortBreak || 5,
                        longBreak: prefs.longBreak || 15
                    };
                    // Update button data-time attributes and reset timer to reflect loaded prefs
                    modeButtons.forEach(btn => {
                        const mode = btn.dataset.mode;
                        if (userPreferences[mode]) {
                            btn.dataset.time = userPreferences[mode];
                        }
                    });
                    resetTimer(); // Apply the loaded preference to the current timer
                    console.log("Preferences loaded:", userPreferences);
                }
            } else {
                // No preferences saved yet, create initial doc
                saveUserPreferences(userId, userPreferences);
                console.log("No preferences found, saving defaults.");
            }
        }).catch((error) => {
            console.error("Error loading preferences: ", error);
        });
    }

    function saveUserPreferences(userId, prefs) {
        const userRef = db.collection('users').doc(userId);
        userRef.set({ preferences: prefs }, { merge: true }) // Use merge to avoid overwriting other potential fields
            .then(() => {
                console.log("Preferences saved successfully!");
            })
            .catch((error) => {
                console.error("Error saving preferences: ", error);
            });
    }

    function handleAuthError(error) {
        console.error("Authentication Error:", error);
        authError.textContent = error.message || "An unknown error occurred.";
    }

    function clearAuthError() {
        authError.textContent = '';
    }

    function updateAuthUI(user) {
        if (user) {
            currentUser = user;
            userEmailDisplay.textContent = user.email;
            authContainer.style.display = 'none';
            timerScreen.style.display = 'block';
            loadUserPreferences(user.uid);
        } else {
            currentUser = null;
            authContainer.style.display = 'block';
            timerScreen.style.display = 'none';
            // Reset to default state when logged out
            userPreferences = { pomodoro: 25, shortBreak: 5, longBreak: 15 };
            modeButtons.forEach(btn => btn.dataset.time = userPreferences[btn.dataset.mode]);
            setMode(document.querySelector('.mode[data-mode="pomodoro"]')); // Reset to pomodoro mode visually
        }
        clearAuthError();
    }

    function toggleAuthMode() {
        isLoginMode = !isLoginMode;
        if (isLoginMode) {
            loginBtn.style.display = 'inline-block';
            registerBtn.style.display = 'none';
            authModeMessage.textContent = 'Login to your account';
            toggleModeLink.textContent = 'Need an account? Register';
            passwordInput.autocomplete = 'current-password';
        } else {
            loginBtn.style.display = 'none';
            registerBtn.style.display = 'inline-block';
            authModeMessage.textContent = 'Create a new account';
            toggleModeLink.textContent = 'Already have an account? Login';
            passwordInput.autocomplete = 'new-password';
        }
        clearAuthError();
    }

    // --- Event Listeners ---
    startButton.addEventListener('click', startTimer);
    pauseButton.addEventListener('click', pauseTimer);
    resetButton.addEventListener('click', resetTimer);
    logoutButton.addEventListener('click', () => auth.signOut());

    modeButtons.forEach(button => {
        button.addEventListener('click', () => setMode(button));
    });

    loginBtn.addEventListener('click', () => {
        clearAuthError();
        const email = emailInput.value;
        const password = passwordInput.value;
        if (!email || !password) {
            authError.textContent = 'Please enter both email and password.';
            return;
        }
        auth.signInWithEmailAndPassword(email, password)
            .catch(handleAuthError);
    });

    registerBtn.addEventListener('click', () => {
        clearAuthError();
        const email = emailInput.value;
        const password = passwordInput.value;
         if (!email || !password) {
            authError.textContent = 'Please enter both email and password.';
            return;
        }
        // Basic password validation (optional)
        if (password.length < 6) {
             authError.textContent = 'Password should be at least 6 characters.';
            return;
        }
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Save default preferences for new user
                saveUserPreferences(userCredential.user.uid, userPreferences);
            })
            .catch(handleAuthError);
    });

    toggleModeLink.addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthMode();
    });

    // Handle Enter key press in password field for login/register
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (isLoginMode) {
                loginBtn.click();
            } else {
                registerBtn.click();
            }
        }
    });

    // Firebase Auth State Listener
    auth.onAuthStateChanged(user => {
        updateAuthUI(user);
    });

    // Initialize UI
    toggleAuthMode(); // Start in register mode initially
    toggleAuthMode(); // Toggle back to login mode (to ensure correct initial state)
    updateDisplay(); // Initial timer display
}); 