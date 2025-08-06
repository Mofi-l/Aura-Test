(function() {
    'use strict';

    // Constants and Configuration
    const currentVersion = "2.7";
    const CognitoConfig = {
        UserPoolId: 'eu-north-1_V9kLPNVXl',
        ClientId: '68caeoofa7hl7p7pvs65bb2hrv',
        Region: 'eu-north-1',
    };

    const l1Names = {
        '1': 'Contact Handling',
        '2': 'On Break',
        '3': 'Microsite Project Work',
        '4': 'Non-Microsite Work',
        '5': 'Offline'
    };

    const l2Mapping = {
        '3': ['Data Dive', 'UAT', 'Round nd Table', 'Quick Question', 'Document Review', 'DPM Request', 'CCRI Dive', 'Non-DE Project', 'Functional Testing', 'Data Analysis', 'Side by Side', 'FUAT', 'VoS (Voice of Sellers)', 'Atlas Validation', 'Actionable Insights', 'Mapping Project', 'Reopen Insights', 'CLRO Deep Dive', 'NRR Deep Dive', 'TTR Deep Dive', 'Contact group validation', 'Cohort Lead Tasks', 'Project Quality Audit'],
        '4': ['Knowledge Retention Mode', 'In a Meeting', 'Personal Time', 'System Issue', 'In Training']
    };

    const l3Mapping = {
        'Data Dive': ['Conduct Project', 'Non Conduct Project'],
        'UAT': ['Conduct Project', 'Non Conduct Project'],
        'Round Table': ['Conduct Project', 'Non Conduct Project'],
        'Quick Question': ['Conduct Project', 'Non Conduct Project'],
        'Document Review': ['Conduct Project', 'Defect Tracker Creation', 'Non Conduct Project'],
        'DPM Request': ['Conduct Project', 'Defect Tracker Creation', 'Non Conduct Project'],
        'CCRI Dive': ['Conduct Project', 'Non Conduct Project'],
        'Non-DE Project': ['Conduct Project', 'Non Conduct Project'],
        'Functional Testing': ['Conduct Project', 'Non Conduct Project'],
        'Data Analysis': ['Conduct Project', 'Non Conduct Project'],
        'Side by Side': ['Conduct Project', 'Non Conduct Project'],
        'FUAT': ['Conduct Project', 'Non Conduct Project'],
        'VoS (Voice of Sellers)': ['Conduct Project', 'Non Conduct Project'],
        'Atlas Validation': ['Conduct Project', 'Non Conduct Project'],
        'Actionable Insights': ['Conduct Project', 'Non Conduct Project'],
        'Mapping Project': ['Conduct Project', 'Non Conduct Project'],
        'Reopen Insights': ['Conduct Project', 'Non Conduct Project'],
        'CLRO Deep Dive': ['Conduct Project', 'Non Conduct Project'],
        'NRR Deep Dive': ['Conduct Project', 'Non Conduct Project'],
        'TTR Deep Dive': ['Conduct Project', 'Non Conduct Project'],
        'Contact group validation': ['Conduct Project', 'Non Conduct Project'],
        'In a Meeting': ['Adhoc Leadership Request', 'Adhoc Leadership Task', 'Engagement Activity', 'Career Developement', 'Team Meeting']
    };

    const combiOptions = [
        { id: 'Combi1', time: '6am - 3pm' },
        { id: 'Combi2', time: '7am - 6pm' },
        { id: 'Combi3', time: '8am - 7pm' },
        { id: 'Combi4', time: '9am - 7pm' },
        { id: 'Combi5', time: '10am - 9pm' },
        { id: 'Combi6', time: '11am - 10pm' },
        { id: 'Combi7', time: '12pm - 11pm' },
        { id: 'Combi8', time: '1pm - 12am' }
    ];

    let lastUpdates = [];
    let dashboardUpdateInterval;
    let dashboardAnimationFrame;
    let isInitialLoad = true;
    let isPaused = false;
    let animationFrameId = null;
    let timerUpdateDebounce = null;
    let isTabFocused = true;

    let lastL3Selection = '';
    let lastSelectedL1 = '';
    let lastSelectedL2 = '';
    let lastSelectedL3 = '';
    let finalSelectionMade = false;

    const gistURL = "https://gist.githubusercontent.com/Mofi-l/878a781fdb73476ad6751c81834badb9/raw/bcdf6e2dbe6375e0ee2b30014d9c9d99b9aeea00/quotes.json";

    // Shared Functions Object
    const SharedFunctions = {
        // Authentication Modal
        async showAuthModal() {
            return new Promise((resolve) => {
                const modal = document.createElement('div');
                modal.className = 'auth-modal';
                modal.innerHTML = `
                <div class="auth-modal-content">
                    <h2 class="auth-modal-title">Authentication Required</h2>
                    <div class="auth-input-container">
                        <input type="text" id="username" class="auth-input" placeholder="Enter your login" autocompletlete="off">
                    </div>
                    <div class="auth-input-container">
                        <input type="password" id="password" class="auth-input" placeholder="Enter your password">
                        <button id="toggle-password" class="toggle-password-btn">
                            <svg viewBox="0 0 24 24" class="eye-icon">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                            </svg>
                        </button>
                    </div>
                    <div class="auth-button-container">
                        <button id="auth-submit" class="auth-submit-btn">Submit</button>
                        <button id="auth-cancel" class="auth-cancel-btn">Cancel</button>
                    </div>
                </div>
            `;

                document.body.appendChild(modal);

                // Add toggle password functionality
                const togglePassword = document.getElementById('toggle-password');
                const passwordInput = document.getElementById('password');

                togglePassword.addEventListener('click', () => {
                    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                    passwordInput.setAttribute('type', type);
                    togglePassword.innerHTML = type === 'password' ?
                        '<svg viewBox="0 0 24 24" class="eye-icon"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>' :
                    '<svg viewBox="0 0 24 24" class="eye-icon"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>';
                });

                document.getElementById('auth-submit').addEventListener('click', () => {
                    const username = document.getElementById('username').value.trim();
                    const password = document.getElementById('password').value.trim();

                    if (!username || !password) {
                        this.showCustomAlert('Both username and password are required.');
                        return;
                    }

                    modal.remove();
                    resolve({ username, password });
                });

                document.getElementById('auth-cancelcel').addEventListener('click', () => {
                    modal.remove();
                    resolve(null);
                });
            });
        },

        // Alert Functions
        showCustomAlert(message) {
            const overlay = document.createElement('div');
            overlay.className = 'custom-overlay';

            const alertBox = document.createElement('div');
            alertBox.className = 'custom-alert-box';

            const alertMessage = document.createElement('p');
            alertMessage.className = 'custom-message';
            alertMessage.textContent = message;

            const okButton = document.createElement('button');
            okButton.textContent = 'Got it!';
            okButton.className = 'custom-button primary';

            okButton.addEventListener('click', () => {
                document.bodbody.removeChild(overlay);
            });

            alertBox.appendChild(alertMessage);
            alertBox.appendChild(okButton);
            overlay.appendChild(alertBox);

            document.body.appendChild(overlay);
        },

        showCustomConfirm(message, callback) {
            const overlay = document.createElement('div');
            overlay.className = 'custom-overlay';

            const confirmBox = document.createElement('div');
            confirmBox.className = 'custom-alert-box';

            const confirmMessage = document.createElement('p');
            confirmMessage.className = 'custom-message';
            confirmMessage.textContent = message;

            const yesButton = document.createElement('button');
            yesButton.textContent = 'Yes';
            yesButton.className = 'custom-button primary';

            const noButton = document.createElement('button');
            noButton.textContent = 'No';
            noButton.className = 'custom-button danger';

            yesButton.addEventListener('click', () => {
                document.body.removeChild(overlay);
                callback(true);
            });

            noButton.addEventListener('click', () => {
                document.body.removeChild(overlay);
                callback(false);
            });

            confirmBox.appendChild(confirmMessage);
            confirmBox.appendChild(yesButton);
            confirmBox.appendChild(noButton);
            overlay.appendChild(confirmBox);
            document.body.appendChild(overlay);
        },

        // SDK Loading Functions
        async loadCognitoSDK() {
            return new Promise((resolve, reject) => {
                if (window.AmazonCognitoIdentity) {
                    resolve();
                    return;
                }

                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/amazon-cognito-identity-js/5.2.1/amazon-cognito-identity.min.js';
                script.async = true;

                script.onload = () => {
                    console.log('Amazon Cognito SDK loaded successfully');
                    resolve();
                };

                script.onerror = () => {
                    console.warn('Primary SDK load failed. Trying alternate source.');
                    const fallbackScript = document.createElement('script');
                    fallbackScript.src = 'https://unpkg.com/amazon-cognito-identity-js@5.2.1/dist/amazon-cognito-identity.min.js';
                    fallbackScript.async = true;

                    fallbackScript.onload = () => {
                        console.log('Fallback Amazon Cognito SDK loaded successfully');
                        resolve();
                    };

                    fallbackScript.onerror = () => {
                        const error = new Error('Failed to load Amazon Cognito SDK from all sources');
                        console.error(error);
                        reject(error);
                    };

                    document.head.appendChild(fallbackScript);
                };

                document.head.appendChild(script);
            });
        },

        async loadAwsSdk() {
            return new Promise((resolve, reject) => {
                if (typeof AWS !== 'undefined' && AWS.S3) {
                    console.log('AWS SDK is already loaded and AWS.S3 is available.');
                    resolve();
                } else {
                    console.log('Loading AWS SDK...');
                    const script = document.createElement('script');
                    script.src = 'https://sdk.amazonaws.com/js/aws-sdk-2.1409.0.min.js';
                    script.onload = () => {
                        console.log('AWS SDK loaded successfully.');
                        if (typeof AWS === 'undefined' || !AWS.S3) {
                            reject('AWS SDK loaded but AWS.S3 is not available');
                        } else {
                            resolve();
                        }
                    };
                    script.onerror = (error) => {
                        console.error('Failed to load AWS SDK', error);
                        reject('Failed to load AWS SDK');
                    };
                    document.head.appendChild(script);
                }
            });
        },

        // Loading Indicator
        createLoadingIndicator() {
            const loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'loading-indicator';
            loadingIndicator.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">Importing data...</div>
        `;
            return loadingIndicator;
        },

        // Username and Avatar
        async displayUsername() {
            return new Promise((resolve) => {
                console.log("Attempting to display username...");

                const widgetSelector = "lighthouse-notification-widget";
                const maxRetries = 20;
                let attempt = 0;

                const username = localStorage.getItem('lastAuthUsername');
                if (!username) {
                    console.log("No authenticated username found");
                    return null;
                }

                console.log("Displaying username:", username);

                const usernameDisplay = createUsernameDisplay();
                if (!usernameDisplay) {
                    console.error("Failed to create username display element");
                    return null;
                }

                setupUsername(username);
                return username;

                function tryDisplay() {
                    console.log(`Attempt ${attempt + 1} to find the widget element...`);
                    const widgetElement = document.querySelector(widgetSelector);

                    if (widgetElement) {
                        console.log("Widget element found:", widgetElement);

                        const username = widgetElement.getAttribute("login");
                        console.log("Extracted username:", username);

                        if (username) {
                            setupUsername(username);
                            resolve(username);
                        } else {
                            console.error("Failed to extract username. 'login' attribute is missing.");
                            const usernameDisplay = document.getElementById("username-display") || createUsernameDisplay();
                            usernameDisplay.textContent = "Unable to load username.";
                            usernameDisplay.style.color = "red";
                            resolve(null);
                        }
                    } else if (attempt < maxRetries) {
                        attempt++;
                        setTimeout(tryDisplay, 500);
                    } else {
                        console.error("Failed to find widget element after maximum retries.");
                        resolve(null);
                    }
                }

                function setupUsername(username) {
                    let usernameDisplay = document.getElementById("username-display");
                    if (!usernameDisplay) {
                        usernameDisplay = createUsernameDisplay();
                    }

                    localStorage.setItem("currentUsername", username);

                    const avatarContainer = document.createElement("div");
                    avatarContainer.id = "avatar-container";
                    avatarContainer.className = "avatar-container";

                    const avatarLink = document.createElement("a");
                    avatarLink.href = `https://phonetool.amazon.com/users/${username}`;
                    avatarLink.target = "_blank";
                    avatarLink.className = "avatar-link";

                    const avatarImage = document.createElement("img");
                    const storedAvatar = localStorage.getItem("customAvatar") || `https://badgephotos.corp.amazon.com/?uid=${username}`;
                    avatarImage.src = storedAvatar;
                    avatarImage.alt = `${username}'s Avatar`;
                    avatarImage.className = "avatar-image";
                    avatarLink.appendChild(avatarImage);

                    const usernameTextNode = document.createElement("span");
                    usernameTextNode.textContent = username;
                    usernameTextNode.className = "username-text";

                    avatarContainer.appendChild(avatarLink);
                    avatarContainer.appendChild(usernameTextNode);
                    usernameDisplay.innerHTML = "";
                    usernameDisplay.appendChild(avatarContainer);
                }

                function createUsernameDisplay() {
                    let usernameDisplay = document.getElementById("username-display");
                    if (!usernameDisplay) {
                        usernameDisplay = document.createElement("div");
                        usernameDisplay.id = "username-display";
                        const widget = document.getElementById("aux-widget");
                        if (widget) {
                            widget.insertBefore(usernameDisplay, widget.firstChild);
                        } else {
                            console.error("Widget not found. Cannot display username.");
                        }
                    }
                    return usernameDisplay;
                }

                tryDisplay();
            });
        }
    };
    ////////////////////////////////////////////////////////////
    // Timer Management Functions
    async function startAUXTimer(auxLabel, elapsedTime = 0) {
        cleanupTimer();
        isPaused = false; // Reset pause state

        const auxState = JSON.parse(localStorage.getItem('auxState'));

        if (auxState && auxState.auxLabel === auxLabel) {
            updateTimerDisplay(auxLabel, calculateTimeSpent(auxState.startTime));
            return;
        }

        stopAUXTimer();

        const startTime = new Date().getTime() - elapsedTime;
        localStorage.setItem('auxState', JSON.stringify({
            auxLabel,
            startTime,
            timestamp: Date.now(),
            isPaused: false
        }));

        console.log('AUX state updated in localStorage:', auxLabel);
        const timerElement = displayTimer();
        requestAnimationFrame(() => updateTimer(startTime, auxLabel, timerElement));

        // Reset pause button text
        const pauseButton = document.getElementById('pause-button');
        if (pauseButton) {
            pauseButton.textContent = 'Pause';
        }

        localStorage.setItem('auxChange', JSON.stringify({
            action: 'startTimer',
            auxLabel,
            timestamp: Date.now()
        }));

        saveAUXData({
            auxLabel,
            timeSpent: 0,
            date: formatDate(new Date()),
            username: SharedFunctions.displayUsername(),
            projectTitle: '',
            areYouPL: '',
            comment: ''
        });
        localStorage.setItem('auxStartTime', startTime);
    }

    function stopAUXTimer() {
        cleanupTimer();
        if (timerUpdateDebounce) {
            clearTimeout(timerUpdateDebounce);
        }

        const auxState = JSON.parse(localStorage.getItem('auxState'));
        if (auxState) {
            const { auxLabel, startTime, isPaused, pauseTime } = auxState;
            const timeSpent = isPaused ?
                  calculateTimeSpent(startTime, pauseTime) :
            calculateTimeSpent(startTime);

            saveAUXData({
                date: formatDate(new Date()),
                username: SharedFunctions.displayUsername(),
                auxLabel,
                timeSpent
            });
            localStorage.removeItem('auxState');
            localStorage.setItem('auxChange', JSON.stringify({
                action: 'stopTimer',
                timestamp: Date.now()
            }));
        }
    }

    function updateTimer(startTime, auxLabel, timerElement) {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }

        const auxState = JSON.parse(localStorage.getItem('auxState')) || {};
        const currentTime = Date.now();
        let elapsedTime;

        if (auxState.isPaused) {
            // If paused, use the pause time to calculate elapsed time
            elapsedTime = auxState.pauseTime - startTime - (auxState.totalPauseDuration || 0);
        } else {
            // If not paused, calculate current elapsed time
            elapsedTime = currentTime - startTime - (auxState.totalPauseDuration || 0);
        }

        // Ensure elapsed time is never negative
        elapsedTime = Math.max(0, elapsedTime);

        const cleanedAuxLabel = auxLabel.replace(/\s*-\s*N\/A\s*/g, '').trim();
        const auxParts = cleanedAuxLabel.split(' - ').filter(part => part.trim() !== '');
        let displayedAuxLabel = auxParts[auxParts.length - 1] || 'No AUX available';

        // Update timer display
        if (timerElement) {
            let displayText = `${displayedAuxLabel} : ${formatTime(elapsedTime)}`;
            if (auxState.isPaused) {
                displayText += ' (Paused)';
            }
            timerElement.textContent = displayText;
            timerElement.title = `Current AUX: ${cleanedAuxLabel}`;
        }

        // Store current state
        auxState.currentTime = elapsedTime;
        auxState.lastUpdate = currentTime;
        localStorage.setItem('auxState', JSON.stringify(auxState));

        // Continue animation frame only if not paused
        if (!auxState.isPaused) {
            animationFrameId = requestAnimationFrame(() => updateTimer(startTime, auxLabel, timerElement));
        }

        return elapsedTime;
    }

    async function togglePause() {
        try {
            const auxState = JSON.parse(localStorage.getItem('auxState'));
            if (!auxState) {
                console.log('No active timer to pause');
                return;
            }

            const currentTime = Date.now();
            auxState.isPaused = !auxState.isPaused;

            if (auxState.isPaused) {
                auxState.pauseTime = currentTime;
                auxState.status = 'paused';
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
            } else {
                const pauseDuration = currentTime - (auxState.pauseTime || currentTime);
                auxState.totalPauseDuration = (auxState.totalPauseDuration || 0) + pauseDuration;
                delete auxState.pauseTime;
                auxState.status = 'active';
                const timerElement = document.getElementById('aux-timer');
                if (timerElement) {
                    requestAnimationFrame(() => updateTimer(auxState.startTime, auxState.auxLabel, timerElement));
                }
            }

            // Update localStorage
            auxState.lastUpdate = currentTime;
            localStorage.setItem('auxState', JSON.stringify(auxState));

            // Update UI elements
            updateUIForPauseState(auxState.isPaused, auxState);

            // Update pause button
            const pauseButton = document.getElementById('pause-button');
            if (pauseButton) {
                pauseButton.textContent = auxState.isPaused ? 'Resume' : 'Pause';
                pauseButton.className = auxState.isPaused ? 'pause-button paused' : 'pause-button';
            }

            // Broadcast state change
            window.dispatchEvent(new CustomEvent('auxStateChange', {
                detail: {
                    isPaused: auxState.isPaused,
                    auxState,
                    timestamp: currentTime
                }
            }));

            // Send update to AWS
            await sendAuxUpdate();

            // Update dashboard if open
            if (document.getElementById('aux-dashboard')) {
                await updateDashboardData(true);
            }

        } catch (error) {
            console.error('Error in togglePause:', error);
            SharedFunctions.showCustomAlert('Error updating pause state');
        }
    }

    function cleanupTimer() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    function displayTimer() {
        let timerElement = document.getElementById('aux-timer');
        if (!timerElement) {
            timerElement = document.createElement('div');
            timerElement.id = 'aux-timer';
            timerElement.className = 'timer-display';
            const widget = document.getElementById('aux-widget');
            if (widget) {
                widget.appendChild(timerElement);
            }
        }
        return timerElement;
    }

    function updateUIForPauseState(isPaused, auxState) {
        const timerElement = document.getElementById('aux-timer');
        if (timerElement) {
            timerElement.className = isPaused ? 'timer-display paused' : 'timer-display';
        }

        const statusIndicator = document.querySelector('.pause-status-indicator');
        if (statusIndicator) {
            statusIndicator.className = isPaused ? 
                'pause-status-indicator paused' : 
            'pause-status-indicator active';
        }
    }

    // Additional Timer Management Functions
    function calculateTimeSpent(startTime, pauseTime = null) {
        const endTime = new Date();
        let timeSpent = 0;

        if (pauseTime) {
            // If paused, use the pause time instead of current time
            timeSpent = new Date(pauseTime) - new Date(startTime);
        } else {
            timeSpent = endTime - new Date(startTime);
        }

        return Math.max(0, timeSpent);
    }

    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function updateTimerDisplay(auxLabel, elapsedTime) {
        const timerElement = displayTimer();
        if (!timerElement) {
            console.error('Timer element not found.');
            return 0;
        }

        // Get current AUX state
        const auxState = JSON.parse(localStorage.getItem('auxState')) || {};
        const currentTime = Date.now();
        let actualElapsedTime;

        // Calculate actual elapsed time based on pause state
        if (auxState.isPaused) {
            // If paused, use the stored pause time
            actualElapsedTime = auxState.pauseTime - auxState.startTime - (auxState.totalPauseDuration || 0);
        } else {
            // If not paused, calculate from current time
            actualElapsedTime = currentTime - auxState.startTime - (auxState.totalPauseDuration || 0);
        }

        // Ensure time is never negative
        actualElapsedTime = Math.max(0, actualElapsedTime);

        // Clean and process AUX label
        const cleanedAuxLabel = auxLabel.replace(/\s*-\s*N\/A\s*/g, '').trim();
        const auxParts = cleanedAuxLabel.split(' - ').filter(part => part.trim() !== '');
        let displayedAuxLabel = auxParts[auxParts.length - 1] || 'No AUX available';

        // Style updates for pause state
        timerElement.className = auxState.isPaused ? 'timer-display paused' : 'timer-display';

        // Construct display text
        let displayText = `${displayedAuxLabel} : ${formatTime(actualElapsedTime)}`;
        if (auxState.isPaused) {
            displayText += ' (Paused)';
            if (auxState.pauseTime) {
                const pauseDuration = currentTime - auxState.pauseTime;
                displayText += ` - Pause duration: ${formatTime(pauseDuration)}`;
            }
        }

        // Update timer text
        timerElement.textContent = displayText;

        // Set tooltip with detailed information
        timerElement.title = `Current AUX: ${cleanedAuxLabel}
Status: ${auxState.isPaused ? 'Paused' : 'Active'}
Total Time: ${formatTime(actualElapsedTime)}
${auxState.totalPauseDuration ? `Total Pause Duration: ${formatTime(auxState.totalPauseDuration)}` : ''}
${auxState.startTime ? `Started: ${new Date(auxState.startTime).toLocaleTimeString()}` : ''}`;

        // Store the current time state
        auxState.currentTime = actualElapsedTime;
        auxState.lastUpdate = currentTime;
        localStorage.setItem('auxState', JSON.stringify(auxState));

        // Broadcast timer update
        broadcastTimerUpdate({
            auxLabel: displayedAuxLabel,
            elapsedTime: actualElapsedTime,
            isPaused: auxState.isPaused,
            timestamp: currentTime,
            totalPauseDuration: auxState.totalPauseDuration || 0
        });

        return actualElapsedTime;
    }

    function broadcastTimerUpdate(updateData) {
        const event = new CustomEvent('timerUpdate', { detail: updateData });
        window.dispatchEvent(event);
    }

    function restoreTimer() {
        const auxState = JSON.parse(localStorage.getItem('auxState'));
        const manualAUXChange = localStorage.getItem('manualAUXChange');

        if (auxState) {
            isPaused = auxState.isPaused || false;
            updateUIForPauseState(isPaused);
            const pauseButton = document.getElementById('pause-button');
            if (pauseButton) {
                pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
            }

            if (auxState.startTime) {
                const startTime = auxState.startTime;
                let auxLabel = auxState.auxLabel;

                auxLabel = auxLabel.replace(/\s*-\s*N\/A\s*/g, '').trim();
                const auxParts = auxLabel.split(' - ').filter(part => part.trim() !== '');
                let displayedAuxLabel = '';

                if (auxParts.length === 1) {
                    displayedAuxLabel = auxParts[0];
                } else if (auxParts.length === 2) {
                    displayedAuxLabel = auxParts[1];
                } else if (auxParts.length === 3) {
                    displayedAuxLabel = auxParts[2];
                } else {
                    displayedAuxLabel = 'No AUX available';
                }

                updateAuxSelection();

                const timerElement = displayTimer();
                if (!isPaused) {
                    requestAnimationFrame(() => updateTimer(startTime, auxLabel, timerElement));
                } else {
                    const elapsedTime = auxState.pauseTime - startTime;
                    timerElement.textContent = `${displayedAuxLabel} : ${formatTime(elapsedTime)}`;
                    timerElement.title = `Current AUX: ${auxLabel}`;
                }
            }
        }
        restoreSelections();
    }

    ////////////////////////////////////////////////////////////
    // Dashboard Functions
    async function showDashboard() {
        try {
            const storedUsername = localStorage.getItem('lastAuthUsername');
            const storedPassword = localStorage.getItem('lastAuthPassword');
            let token;

            if (!storedUsername || !storedPassword) {
                const credentials = await SharedFunctions.showAuthModal();
                if (credentials) {
                    token = await authenticate(credentials.username, credentials.password);
                    localStorage.setItem('lastAuthUsername', credentials.username);
                    localStorage.setItem('lastAuthPassword', credentials.password);
                }
            } else {
                try {
                    token = await authenticate(storedUsername, storedPassword);
                } catch (error) {
                    localStorage.removeItem('lastAuthUsername');
                    localStorage.removeItem('lastAuthPassword');
                    const credentials = await SharedFunctions.showAuthModal();
                    if (credentials) {
                        token = await authenticate(credentials.username, credentials.password);
                        localStorage.setItem('lastAuthUsername', credentials.username);
                        localStorage.setItem('lastAuthPassword', credentials.password);
                    }
                }
            }

            if (token) {
                initializeDashboard();
            }

        } catch (error) {
            console.error('Dashboard initialization error:', error);
            SharedFunctions.showCustomAlert('Failed to initialize dashboard');
        }
    }

    function initializeDashboard() {
        let dashboard = document.getElementById('aux-dashboard');
        if (dashboard) {
            stopDashboardUpdates();
            dashboard.remove();
            return;
        }

        // Create dashboard container
        dashboard = document.createElement('div');
        dashboard.id = 'aux-dashboard';
        dashboard.className = 'dashboard-container';

        // Create dashboard structure
        dashboard.innerHTML = `
        <div class="dashboard-header">
            <h2 class="dashboard-title">Real-time AUX Dashboard</h2>
            <div class="dashboard-controls">
                <button class="dashboard-button refresh-btn" title="Refresh Data">↻</button>
                <button class="dashboard-button download-btn" title="Download CSV">⬇️</button>
                <button class="dashboard-button close-btn">×</button>
            </div>
        </div>
        <div class="search-container">
            <input type="text" class="search-input" placeholder="Search by username...">
            <select class="status-filter">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="away">Away</option>
                <option value="inactive">Inactive</option>
                <option value="paused">Paused</option>
            </select>
        </div>
        <div class="dashboard-content">
            <table class="dashboard-table">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Current AUX</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Last Update</th>
                        <th>Total Pause Time</th>
                        <th>Login Time</th>
                        <th>Logout Time</th>
                    </tr>
                </thead>
                <tbody id="dashboard-data"></tbody>
            </table>
        </div>
    `;

        document.body.appendChild(dashboard);

        // Add event listeners
        const refreshBtn = dashboard.querySelector('.refresh-btn');
        const closeBtn = dashboard.querySelector('.close-btn');
        const searchInput = dashboard.querySelector('.search-input');
        const statusFilter = dashboard.querySelector('.status-filter');
        const downloadBtn = dashboard.querySelector('.download-btn');

        refreshBtn.onclick = () => {
            refreshBtn.style.transform = 'rotate(360deg)';
            updateDashboardData(true);
            setTimeout(() => {
                refreshBtn.style.transform = 'rotate(0deg)';
            }, 1000);
        };

        closeBtn.onclick = () => {
            stopDashboardUpdates();
            dashboard.remove();
        };

        downloadBtn.onclick = () => downloadDashboardData();

        searchInput.addEventListener('input', () => filterDashboard());
        statusFilter.addEventListener('change', () => filterDashboard());

        // Start updates
        startDashboardUpdates();

        // Add escape key listener
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && document.getElementById('aux-dashboard')) {
                stopDashboardUpdates();
                dashboard.remove();
            }
        });
    }

    async function startDashboardUpdates() {
        try {
            await updateDashboardData(true); // Initial update

            // Use requestAnimationFrame for smooth updates
            function updateLoop() {
                if (document.getElementById('aux-dashboard')) {
                    updateDashboardTimers();
                    dashboardAnimationFrame = requestAnimationFrame(updateLoop);
                }
            }

            requestAnimationFrame(updateLoop);

            // Keep the interval for data refresh, but not for timer updates
            dashboardUpdateInterval = setInterval(() => updateDashboardData(false), 30000);

        } catch (error) {
            console.error('Failed to start dashboard updates:', error);
            SharedFunctions.showCustomAlert('Failed to initialize dashboard updates');
        }
    }

    function stopDashboardUpdates() {
        if (dashboardAnimationFrame) {
            cancelAnimationFrame(dashboardAnimationFrame);
            dashboardAnimationFrame = null;
        }
        if (dashboardUpdateInterval) {
            clearInterval(dashboardUpdateInterval);
            dashboardUpdateInterval = null;
        }
    }

    async function updateDashboardData(isImmediateUpdate = false) {
        try {
            console.log('Updating dashboard data...', isImmediateUpdate ? '(Immediate update)' : '');

            // First, ensure AWS SDK is loaded
            await SharedFunctions.loadAwsSdk();

            // Check and refresh credentials if needed
            let token;
            try {
                token = await refreshCredentials();
            } catch (credError) {
                console.log('Credential refresh failed, requesting new authentication');
                const credentials = await SharedFunctions.showAuthModal();
                if (!credentials) throw new Error('Authentication cancelled');

                token = await authenticate(credentials.username, credentials.password);
                localStorage.se.setItem('lastAuthUsername', credentials.username);
                localStorage.setItem('lastAuthPassword', credentials.password);
            }

            // Configure AWS with the token
            AWS.config.update({
                region: 'eu-north-1',
                credentials: new AWS.CognitoIdentityCredentials({
                    IdentityPoolId: 'eu-north-1:98c07095-e731-4219-bebe-db4dab892ea8',
                    Logins: {
                        'cognito-idp.eu-north-1.amazonaws.com/eu-north-1_V9kLPNVXl': token
                    }
                })
            });

            // Wait for credentials to be initialized
            await new Promise((resolve, reject) => {
                AWS.config.credentials.get(err => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            const s3 = new AWS.S3();
            const response = await s3.listObjectsV2({
                Bucket: 'real-time-databucket',
                Prefix: 'aux-realtime/',
                MaxKeys: 1000
            }).promise();

            console.log(`Found ${response.Contents.length} AUX updates`);

            const currentTime = Date.now();
            const currentUsername = localStorage.getItem('lastAuthUsername');

            // Process all updates first
            const updates = await Promise.all(response.Contents.map(async (item) => {
                try {
                    const data = await s3.getObject({
                        Bucket: 'real-time-databucket',
                        Key: item.Key
                    }).promise();

                    const userState = JSON.parse(data.Body.toString());
                    const lastUpdateTime = new Date(userState.lastUpdate).getTime();
                    const timeSinceUpdate = currentTime - lastUpdateTime;

                    return {
                        ...userState,
                        fileKey: item.Key,
                        lastModified: item.LastModified,
                        timeSinceUpdate,
                        isPaused: userState.isPaused || false,
                        status: calculateUserStatus(
                            lastUpdateTime,
                            userState.auxLabel,
                            userState.isPaused
                        )
                    };
                } catch (error) {
                    console.error(`Error processing file ${item.Key}:`, error);
                    return null;
                }
            }));

            // Filter out nulls and sort updates
            const validUpdates = updates
            .filter(update => update !== null)
            .map(update => {
                const status = calculateUserStatus(
                    new Date(update.lastUpdate).getTime(),
                    update.auxLabel,
                    update.isPaused
                );
                return {
                    ...update,
                    status
                };
            })
            .sort((a, b) => {
                if (a.username === currentUsername) return -1;
                if (b.username === currentUsername) return 1;
                return new Date(b.lastUpdate) - new Date(a.lastUpdate);
            });

            // Store the latest updates for CSV download
            lastUpdates = validUpdates;

            // Update UI with the processed data
            updateDashboardUI(validUpdates);

        } catch (error) {
            console.error('Error updating dashboard:', error);
            handleUpdateError(error);
        }
    }

    function updateDashboardUI(updates) {
        const currentUsername = localStorage.getItem("currentUsername");
        const tbody = document.getElementById('dashboard-data');
        if (!tbody) {
            console.error('Dashboard table body not found');
            return;
        }

        // Clear existing content
        tbody.innerHTML = '';

        updates.forEach((update, index) => {
            const row = tbody.insertRow();
            const isCurrentUser = update.username === currentUsername;

            // Add highlighting for current user
            if (isCurrentUser) {
                row.classList.add('current-user');
            }

            // Set data attributes for filtering
            row.setAttribute('data-username', update.username);
            row.setAttribute('data-status', update.status);

            // Create and populate cells
            createUserCell(row, update);
            createAuxCell(row, update);
            createTimeCell(row, update);
            createStatusCell(row, update);
            createLastUpdateCell(row, update);
            createPauseTimeCell(row, update);
            createLoginTimeCell(row, update);
            createLogoutTimeCell(row, update);

            // Add hover information
            addRowTooltip(row, update);
        });
    }

    function filterDashboard() {
        const searchInput = document.querySelector('.search-input');
        const statusFilter = document.querySelector('.status-filter');
        const searchTerm = searchInput.value.toLowerCase();
        const statusValue = statusFilter.value;

        const rows = document.querySelectorAll('#dashboard-data tr');
        rows.forEach(row => {
            const username = row.getAttribute('data-username').toLowerCase();
            const status = row.getAttribute('data-status');

            const matchesSearch = username.includes(searchTerm);
            const matchesStatus = statusValue === 'all' || status === statusValue;

            row.style.display = matchesSearch && matchesStatus ? '' : 'none';
        });
    }

    function calculateUserStatus(lastUpdateTime, auxLabel, isPaused) {
        if (isPaused) {
            return 'paused';
        }

        if (auxLabel && auxLabel.toLowerCase().includes('offline')) {
            return 'inactive';
        }

        if (auxLabel && auxLabel.toLowerCase().includes('undefined')) {
            return 'inactive';
        }

        if (auxLabel && auxLabel.toLowerCase().includes('on break')) {
            return 'away';
        }

        return auxLabel ? 'active' : 'inactive';
    }

    function handleUpdateError(error) {
        if (error.code === 'CredentialsError' ||
            error.message.includes('credentials') ||
            error.message.includes('Authentication')) {

            console.log('Credentials error, requesting re-authentication...');
            localStorage.removeItem('lastAuthUsername');
            localStorage.removeItem('lastAuthPassword');
            stopDashboardUpdates();

            // Show authentication modal on next update
            setTimeout(async () => {
                try {
                    const credentials = await SharedFunctions.showAuthModal();
                    if (credentials) {
                        const token = await authenticate(credentials.username, credentials.password);
                        localStorage.setItem('lastAuthUsername', credentials.username);
                        localStorage.setItem('lastAuthPassword', credentials.password);
                        startDashboardUpdates();
                    }
                } catch (authError) {
                    console.error('Re-authentication failed:', authError);
                    SharedFunctions.showCustomAlert('Authentication failed. Please try again.');
                }
            }, 0);
        } else {
            SharedFunctions.showCustomAlert('Error updating dashboard: ' + error.message);
        }
    }

    function downloadDashboardData() {
        const csvContent = generateCSV(lastUpdates);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'aux_dashboard_data.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    function generateCSV(updates) {
        const headers = ['Date', 'Username', 'Login Time', 'Paused Time', 'Logout Time', 'Total Time'];
        const rows = updates.map(update => {
            const date = new Date(update.loginTime).toLocaleDateString();
            const loginTime = new Date(update.loginTime).toLocaleTimeString();
            const logoutTime = update.logoutTime ? new Date(update.logoutTime).toLocaleTimeString() : 'Active';
            const pausedTime = formatTime(update.totalPauseDuration || 0);
            const totalTime = formatTime(
                (update.logoutTime ? new Date(update.logoutTime) : new Date()) - new Date(update.loginTime) - (update.totalPauseDuration || 0)
            );
            return [date, update.username, loginTime, pausedTime, logoutTime, totalTime];
        });

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    // Additional Dashboard Functions
    function updateDashboardTimers() {
        const dashboardRows = document.querySelectorAll('.dashboard-table tr[data-username]');
        dashboardRows.forEach(row => {
            const username = row.getAttribute('data-username');
            const timerCell = row.querySelector('.timer-cell');
            if (timerCell) {
                const auxState = JSON.parse(localStorage.getItem('auxState'));
                if (auxState && auxState.username === username) {
                    const elapsedTime = calculateElapsedTime(auxState.startTime, auxState.isPaused, auxState.pauseTime);
                    timerCell.textContent = formatTime(elapsedTime);
                }
            }
        });
    }

    function createUserCell(row, update) {
        const cell = row.insertCell();
        cell.innerHTML = `
        <div class="user-info">
            <div class="avatar-wrapper">
                <img src="https://badgephotos.corp.amazon.com/?uid=${update.username}"
                     alt="User avatar"
                     class="user-avatar"
                     onerror="this.style.display='none'">
                <span class="status-indicator"></span>
            </div>
            <span>${update.username}</span>
        </div>
    `;
    }

    function createAuxCell(row, update) {
        const cell = row.insertCell();
        const auxLabel = update.auxLabel || 'N/A';
        cell.textContent = auxLabel;
        if (update.isPaused) {
            const pauseIndicator = document.createElement('span');
            pauseIndicator.innerHTML = ' ⏸️';
            pauseIndicator.title = 'AUX Paused';
            pauseIndicator.style.opacity = '0.7';
            cell.appendChild(pauseIndicator);
        }
    }

    function createTimeCell(row, update) {
        const cell = row.insertCell();
        cell.className = 'timer-cell';
        const elapsedTime = calculateElapsedTime(update.startTime, update.isPaused, update.pauseTime);
        cell.textContent = formatTime(elapsedTime);
    }

    function createStatusCell(row, update) {
        const cell = row.insertCell();
        const status = calculateUserStatus(update.lastUpdate, update.auxLabel, update.isPaused);
        cell.innerHTML = `
        <span class="status-indicator status-${status}"></span>
        ${status.charAt(0).toUpperCase() + status.slice(1)}
    `;
        if (update.isPaused) {
            cell.style.color = '#FFA500';
            cell.style.fontWeight = 'bold';
        }
    }

    function createLastUpdateCell(row, update) {
        const cell = row.insertCell();
        cell.textContent = new Date(update.lastUpdate).toLocaleTimeString();
    }

    function createPauseTimeCell(row, update) {
        const cell = row.insertCell();
        const totalPause = update.totalPauseDuration || 0;
        cell.textContent = formatTime(totalPause);
    }

    function createLoginTimeCell(row, update) {
        const cell = row.insertCell();
        if (update.loginTime) {
            cell.textContent = new Date(update.loginTime).toLocaleTimeString();
        } else {
            cell.textContent = 'No login time';
        }
    }

    function createLogoutTimeCell(row, update) {
        const cell = row.insertCell();
        if (update.logoutTime) {
            cell.textContent = new Date(update.logoutTime).toLocaleTimeString();
        } else {
            cell.textContent = 'Active';
        }
    }

    function addRowTooltip(row, update) {
        row.title = `
        Last Updated: ${new Date(update.lastUpdate).toLocaleString()}
        Total Pause Duration: ${formatTime(update.totalPauseDuration || 0)}
        Status: ${calculateUserStatus(update.lastUpdate, update.auxLabel, update.isPaused)}
        ${update.isPaused ? `Paused Since: ${new Date(update.pauseTime).toLocaleString()}` : ''}
    `;
    }

    function calculateElapsedTime(startTime, isPaused, pauseTime) {
        if (!startTime) return 0;
        const now = Date.now();
        return isPaused ? 
            pauseTime - startTime :
        now - startTime;
    }
    ////////////////////////////////////////////////////////////
    // AWS Integration Functions
    async function authenticate(username, password) {
        try {
            if (!username || !password) {
                throw new Error('Username and password are required');
            }

            await SharedFunctions.loadCognitoSDK();

            const authenticationData = { 
                Username: username, 
                Password: password 
            };
            const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
            const poolData = {
                UserPoolId: CognitoConfig.UserPoolId,
                ClientId: CognitoConfig.ClientId,
            };
            const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
            const userData = { Username: username, Pool: userPool };
            const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

            return new Promise((resolve, reject) => {
                cognitoUser.authenticateUser(authenticationDetails, {
                    onSuccess: function(result) {
                        const idToken = result.getIdToken().getJwtToken();
                        resolve(idToken);
                    },
                    onFailure: function(err) {
                        // Clear credentials only on auth failure
                        if (err.name === 'NotAuthorizedException') {
                            localStorage.removeItem('lastAuthUsername');
                            localStorage.removeItem('lastAuthPassword');
                        }
                        reject(err);
                    }
                });
            });
        } catch (error) {
            console.error('Authentication error:', error);
            // Clear credentials only on auth failure
            if (error.name === 'NotAuthorizedException') {
                localStorage.removeItem('lastAuthUsername');
                localStorage.removeItem('lastAuthPassword');
            }
            throw error;
        }
    }

    async function refreshCredentials(retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                const username = localStorage.getItem('lastAuthUsername');
                const password = localStorage.getItem('lastAuthPassword');

                if (!username || !password) {
                    throw new Error('No stored credentials');
                }

                const token = await authenticate(username, password);
                return token;
            } catch (error) {
                if (i === retries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
        throw new Error('Failed to refresh credentials after multiple attempts');
    }

    async function updateAWSCredentials(token) {
        AWS.config.update({
            region: 'eu-north-*',
            credentials: new AWS.CognitoIdentityCredentials({
                IdentityPoolId: 'eu-north-1:98c07095-e731-4219-bebe-db4dab892ea8',
                Logins: {
                    'cognito-idp.eu-north-1.amazonaws.com/eu-north-1_V9kLPNVXl': token
                }
            })
        });

        // Wait for credentials to be refreshed
        return new Promise((resolve, reject) => {
            AWS.config.credentials.get(err => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    async function makeAWSCall(operation) {
        try {
            return await operation();
        } catch (error) {
            if (error.code === 'CredentialsError') {
                await refreshCredentials();
                return operation();
            }
            throw error;
        }
    }

    async function sendAuxUpdate() {
        try {
            const currentState = JSON.parse(localStorage.getItem('auxState'));
            console.log('Attempting to send AUX update:', currentState);
            if (!currentState) {
                console.log('No current AUX state to send');
                return;
            }

            let username = localStorage.getItem('lastAuthUsername');
            let password = localStorage.getItem('lastAuthPassword');

            if (!username || !password) {
                console.log('No stored credentials, requesting authentication...');
                const credentials = await SharedFunctions.showAuthModal();
                if (!credentials) {
                    throw new Error('Authentication cancelled');
                }
                username = credentials.username;
                password = credentials.password;
                localStorage.setItem('lastAuthUsername', username);
                localStorage.setItem('lastAuthPassword', password);
            }

            console.log('Authenticating with AWS...');
            const token = await authenticate(username, password);
            await updateAWSCredentials(token);

            const s3 = new AWS.S3();
            const today = new Date().toISOString().split('T')[0];
            const data = {
                username: username,
                auxLabel: currentState.auxLabel,
                startTime: currentState.startTime,
                lastUpdate: new Date().toISOString(),
                isPaused: currentState.isPaused || false,
                pauseTime: currentState.pauseTime || null,
                totalPauseDuration: currentState.totalPauseDuration || 0,
                loginTime: localStorage.getItem('dailyLoginTime'),
                logoutTime: currentState.auxLabel.toLowerCase().includes('offline') ?
                localStorage.getItem('dailyLogoutTime') || new Date().toISOString() : null,
                lastAuxUpdate: new Date().toISOString(),
                date: today,
                status: calculateUserStatus(
                    new Date().getTime(),
                    currentState.auxLabel,
                    currentState.isPaused
                )
            };

            console.log('Sending data to S3:', data);

            await s3.putObject({
                Bucket: 'real-time-databucket',
                Key: `aux-realtime/${username}.json`,
                Body: JSON.stringify(data),
                ContentType: 'application/json'
            }).promise();

            console.log('Successfully sent data to S3:', data);
            return true;

        } catch (error) {
            console.error('Error sending AUX update:', error);
            if (error.code === 'CredentialsError' || error.message.includes('NetworkingError')) {
                try {
                    await sendAuxUpdateWithRetry(3);
                } catch (retryError) {
                    console.error('All retries failed:', retryError);
                    localStorage.removeItem('lastAuthUsername');
                    localStorage.removeItem('lastAuthPassword');
                    throw new Error('Failed to send AUX update after multiple attempts');
                }
            } else {
                throw error;
            }
        }
    }

    async function sendAuxUpdateWithRetry(maxRetries = 3, baseDelay = 1000) {
        let attempt = 0;
        while (attempt < maxRetries) {
            try {
                await sendAuxUpdate();
                console.log('AUX update sent successfully on attempt', attempt + 1);
                return;
            } catch (error) {
                attempt++;
                if (attempt === maxRetries) throw error;
                const delay = baseDelay * Math.pow(2, attempt);
                console.log(`Retry attempt ${attempt} failed, waiting ${delay}ms before next attempt`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    async function exportToAWS() {
        const isDataSent = localStorage.getItem('isDataSent') === 'true';

        if (isDataSent) {
            SharedFunctions.showCustomConfirm('Your NPT was already sent, do you want to send a duplicate entry?', (userConfirmed) => {
                if (!userConfirmed) return;
                authenticateAndExport();
            });
            return;
        }

        SharedFunctions.showCustomConfirm('Are you sure you want to export the data to AWS?', (userConfirmed) => {
            if (!userConfirmed) return;
            authenticateAndExport();
        });
    }

    async function authenticateAndExport() {
        try {
            await SharedFunctions.injectAuthStyles();
            await SharedFunctions.loadCognitoSDK();

            const credentials = await SharedFunctions.showAuthModal();
            if (!credentials) {
                throw new Error('Authentication cancelled');
            }

            const token = await authenticate(credentials.username, credentials.password);
            if (!token) {
                throw new Error('Authentication failed');
            }

            await updateAWSCredentials(token);

            const auxDataString = localStorage.getItem('auxData');
            let auxData = JSON.parse(auxDataString) || [];
            console.log('AUX Data:', auxData);

            const restoreTimestamp = localStorage.getItem('lastRestoreTimestamp');
            auxData = auxData.filter(entry => {
                const entryDate = new Date(entry.date).getTime();
                if (restoreTimestamp) {
                    if (entry.auxLabel === 'Late Login' && entryDate >= restoreTimestamp) {
                        return false;
                    }
                }
                return true;
            });

            auxData = auxData.filter(entry => entry.auxLabel !== 'undefined - N/A - N/A' && entry.date !== undefined);

            const csvContent = 'Date,Username,AUX Label,Time Spent,Project Title,Related Audits,Are You the PL?,Comment\n' +
                  auxData.map(entry =>
                              `${entry.date},${entry.username},${entry.auxLabel},${entry.timeSpent},${entry.projectTitle || ''},${entry.relatedAudits || ''},${entry.areYouPL ? `"${entry.areYouPL}"` : ''},${entry.comment ? `"${entry.comment}"` : ''}`
            ).join('\n');

            console.log('CSV Content:', csvContent);

            const response = await fetch('https://09umyreyjb.execute-api.eu-north-1.amazonaws.com/Prod/auxData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/csv',
                    Authorization: token,
                },
                body: csvContent,
            });

            if (!response.ok) {
                throw new Error(`Failed to send data: ${response.statusText}`);
            }

            SharedFunctions.showCustomAlert('NPT Data successfully sent to AWS');
            localStorage.setItem('isDataSent', 'true');
        } catch (error) {
            console.error('Error during AWS export:', error);
            SharedFunctions.showCustomAlert('Failed to export NPT data. Please check your credentials or try again later.');
        }
    }

    async function importFromAws() {
        try {
            await SharedFunctions.injectAuthStyles();
            await SharedFunctions.loadAwsSdk();
            await SharedFunctions.loadCognitoSDK();

            let startDateTime, endDateTime;
            try {
                const dateRange = await selectDateRange();
                startDateTime = dateRange.startDateTime;
                endDateTime = dateRange.endDateTime;
            } catch (err) {
                console.error('Date range selection error:', err);
                return;
            }

            const credentials = await SharedFunctions.showAuthModal();
            if (!credentials) {
                throw new Error('Authentication cancelled');
            }

            const token = await authenticate(credentials.username, credentials.password);
            if (!token) {
                throw new Error('Authentication failed');
            }

            await updateAWSCredentials(token);

            const loadingIndicator = SharedFunctions.createLoadingIndicator();
            document.body.appendChild(loadingIndicator);

            try {
                const s3 = new AWS.S3();
                const bucketName = 'aux-data-bucket';
                const prefixes = ['Aura_NPT_', 'aux_data_'];
                const relevantData = new Set();

                for (const prefix of prefixes) {
                    const listedObjects = await s3.listObjectsV2({
                        Bucket: bucketName,
                        Prefix: prefix
                    }).promise();

                    for (const item of listedObjects.Contents) {
                        const fileData = await s3.getObject({
                            Bucket: bucketName,
                            Key: item.Key
                        }).promise();

                        const csvContent = fileData.Body.toString('utf-8');
                        const rows = csvContent.split('\n').slice(1);

                        for (const row of rows) {
                            const [date, rowUsername, auxLabel, timeSpent, ...rest] = row.split(',');
                            const rowDate = new Date(date).getTime();

                            if (rowDate >= startDateTime && rowDate <= endDateTime && rowUsername === credentials.username) {
                                relevantData.add(row);
                            }
                        }
                    }
                }

                if (relevantData.size === 0) {
                    SharedFunctions.showCustomAlert('No data found for the selected date range.');
                    return;
                }

                const csvContent = `Date,Username,AUX Label,Time Spent,Project Title,Related Audits,Are You the PL?,Comment,Site\n${Array.from(relevantData).join('\n')}`;
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${credentials.username}_imported_data_${new Date(startDateTime).toISOString().split('T')[0]}_to_${new Date(endDateTime).toISOString().split('T')[0]}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                SharedFunctions.showCustomAlert('Data successfully imported and downloaded!');
            } finally {
                document.body.removeChild(loadingIndicator);
            }
        } catch (error) {
            console.error('Error in importFromAws:', error);
            SharedFunctions.showCustomAlert('Failed to import data: ' + error.message);
        }
    }

    // Additional AWS Integration Function
    async function selectDateRange() {
        return new Promise((resolve, reject) => {
            const flatpickrCSS = document.createElement('link');
            flatpickrCSS.rel = 'stylesheet';
            flatpickrCSS.href = 'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css';
            document.head.appendChild(flatpickrCSS);

            const flatpickrJS = document.createElement('script');
            flatpickrJS.src = 'https://cdn.jsdelivr.net/npm/flatpickr';
            flatpickrJS.onload = () => {
                const modal = document.createElement('div');
                modal.className = 'date-range-modal';
                modal.innerHTML = `
                <div class="modal-overlay">
                    <div class="modal-content">
                        <h2>Select Date Range</h2>
                        <p>Click and drag to select the date range.</p>
                        <div id="calendar-container"></div>
                        <div class="button-container">
                            <button id="apply-date-range" class="btn-primary">OK</button>
                            <button id="cancel-date-range" class="btn-secondary">Cancel</button>
                        </div>
                    </div>
                </div>
            `;

                document.body.appendChild(modal);

                const calendar = document.getElementById('calendar-container');
                const flatpickrInstance = flatpickr(calendar, {
                    mode: 'range',
                    dateFormat: 'Y-m-d',
                    inline: true,
                    onClose: (selectedDates) => {
                        if (selectedDates.length < 2) {
                            SharedFunctions.showCustomAlert('Please select a date range.');
                        }
                    },
                });

                document.getElementById('apply-date-range').addEventListener('click', () => {
                    const selectedDates = flatpickrInstance.selectedDates;
                    if (selectedDates.length < 2) {
                        SharedFunctions.showCustomAlert('Please select a date range.');
                        return;
                    }

                    const startDateTime = selectedDates[0].getTime();
                    const endDateTime = selectedDates[1].getTime();

                    modal.classList.add('fade-out');
                    setTimeout(() => {
                        modal.remove();
                        flatpickrCSS.remove();
                    }, 300);
                    resolve({ startDateTime, endDateTime });
                });

                document.getElementById('cancel-date-range').addEventListener('click', () => {
                    modal.classList.add('fade-out');
                    setTimeout(() => {
                        modal.remove();
                        flatpickrCSS.remove();
                    }, 300);
                    reject('Date range selection canceled.');
                });

                setTimeout(() => modal.classList.add('fade-in'), 0);
            };
            document.body.appendChild(flatpickrJS);
        });
    }
    ////////////////////////////////////////////////////////////
    // Project Management Functions
    function showProjectDetailsForm() {
        const popup = document.createElement('div');
        popup.className = 'project-details-popup';
        popup.innerHTML = `
        <div class="popup-content">
            <h2>Project Details</h2>
            <div class="form-group">
                <label>Select your Combi</label>
                <select id="combi-select" required>
                    <option value="">Select Combi</option>
                    ${combiOptions.map(combi =>
                                       `<option value="${combi.id}">${combi.id} ${combi.time}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Active projects with SIM number (Mention PL/PC)</label>
                <input type="text" id="active-projects" required>
            </div>
            <div class="form-group">
                <label>Back up POC, if PL</label>
                <input type="text" id="backup-poc">
            </div>
            <div class="form-group">
                <label>Project hours for the day</label>
                <input type="number" id="project-hours" required>
            </div>
            <div class="form-group">
                <label>Parked/yet to begin projects</label>
                <input type="text" id="parked-projects">
            </div>
            <div class="form-group">
                <label>ETA of active projects (comma separated, TBD if not decided)</label>
                <input type="text" id="project-eta" required>
            </div>
            <div class="form-group">
                <label>Comments</label>
                <textarea id="project-comments"></textarea>
            </div>
            <div class="button-group">
                <button type="button" id="submit-project-details">Submit</button>
                <button type="button" id="cancel-project-details">Cancel</button>
            </div>
        </div>
    `;
        document.body.appendChild(popup);

        document.getElementById('submit-project-details').addEventListener('click', handleProjectDetailsSubmit);
        document.getElementById('cancel-project-details').addEventListener('click', closeProjectDetailsForm);
    }

    async function handleProjectDetailsSubmit() {
        try {
            await SharedFunctions.loadAwsSdk();

            const credentials = await SharedFunctions.showAuthModal();
            if (!credentials) {
                throw new Error('Authentication cancelled');
            }

            const token = await authenticate(credentials.username, credentials.password);
            if (!token) {
                throw new Error('Authentication failed');
            }

            await updateAWSCredentials(token);

            const s3 = new AWS.S3();
            const bucketName = 'project-details-bucket';

            const data = {
                date: new Date().toISOString(),
                username: localStorage.getItem("currentUsername"),
                combi: document.getElementById('combi-select').value,
                activeProjects: document.getElementById('active-projects').value,
                backupPOC: document.getElementById('backup-poc').value,
                projectHours: document.getElementById('project-hours').value,
                parkedProjects: document.getElementById('parked-projects').value,
                projectETA: document.getElementById('project-eta').value,
                comments: document.getElementById('project-comments').value
            };

            if (!data.combi) {
                throw new Error('Please select your Combi');
            }

            if (!data.activeProjects || !data.projectHours || !data.projectETA) {
                throw new Error('Please fill in all required fields');
            }

            const currentDate = new Date().toISOString().split('T')[0];
            const filename = `project_details_${data.username}_${currentDate}_${Date.now()}.json`;

            await s3.putObject({
                Bucket: bucketName,
                Key: filename,
                Body: JSON.stringify(data),
                ContentType: 'application/json'
            }).promise();

            SharedFunctions.showCustomAlert('Project details saved successfully!');
            closeProjectDetailsForm();

        } catch (error) {
            console.error('Error:', error);
            if (error.message === 'Authentication cancelled') {
                SharedFunctions.showCustomAlert('Operation cancelled');
            } else if (error.code === 'NoSuchBucket') {
                SharedFunctions.showCustomAlert('Error: Project details bucket not found. Please contact administrator.');
            } else {
                SharedFunctions.showCustomAlert(error.message || 'Error saving project details. Please try again.');
            }
        }
    }

    function closeProjectDetailsForm() {
        const popup = document.querySelector('.project-details-popup');
        if (popup) {
            popup.remove();
        }
    }

    async function showProjectDashboard() {
        try {
            const existingDashboard = document.querySelector('.project-dashboard');
            if (existingDashboard) {
                existingDashboard.remove();
            }

            const username = localStorage.getItem("currentUsername");

            await SharedFunctions.loadAwsSdk();
            await SharedFunctions.loadCognitoSDK();

            let credentials = {
                username: localStorage.getItem('lastAuthUsername'),
                password: localStorage.getItem('lastAuthPassword')
            };

            if (!credentials.username || !credentials.password) {
                credentials = await SharedFunctions.showAuthModal();
                if (credentials) {
                    localStorage.setItem('lastAuthUsername', credentials.username);
                    localStorage.setItem('lastAuthPassword', credentials.password);
                }
            }

            if (!credentials) {
                throw new Error('Authentication cancelled');
            }

            const token = await authenticate(credentials.username, credentials.password);
            if (!token) {
                throw new Error('Authentication failed');
            }

            await updateAWSCredentials(token);

            const loadingIndicator = SharedFunctions.createLoadingIndicator();
            document.body.appendChild(loadingIndicator);

            try {
                const s3 = new AWS.S3();
                const bucketName = 'project-details-bucket';
                const prefix = 'project_details_';
                const projectData = [];

                const listedObjects = await s3.listObjectsV2({
                    Bucket: bucketName,
                    Prefix: prefix
                }).promise();

                console.log(`Found ${listedObjects.Contents.length} project detail files`);

                for (const item of listedObjects.Contents) {
                    try {
                        const fileData = await s3.getObject({
                            Bucket: bucketName,
                            Key: item.Key,
                            RequestPayer: 'requester',
                            ResponseCacheControl: 'no-cache'
                        }).promise();

                        const content = JSON.parse(fileData.Body.toString('utf-8'));
                        if (Array.isArray(content)) {
                            projectData.push(...content);
                        } else {
                            projectData.push(content);
                        }
                    } catch (fileError) {
                        console.error(`Error processing file ${item.Key}:`, fileError);
                        continue;
                    }
                }

                createProjectDashboard(projectData, username);

            } finally {
                document.body.removeChild(loadingIndicator);
            }

        } catch (error) {
            console.error('Error in showProjectDashboard:', error);
            SharedFunctions.showCustomAlert('Failed to load project dashboard');
        }
    }

    function createProjectDashboard(projectData, currentUsername) {
        const dashboard = document.createElement('div');
        dashboard.className = 'project-dashboard';

        const dashboardHTML = `
        <div iv class="dashboard-content">
            <div class="dashboard-sidebar">
                <div class="sidebar-header">
                    <h2>Project Hub</h2>
                </div>
                <div class="sidebar-filters">
                    <div class="search-container">
                        <i class="fas fa-search"></i>
                        <input type="text" class="search-input" placeholder="Search projects...">
                    </div>
                    <div class="filter-group">
                        <h3>Time Range</h3>
                        <select class="date-filter">
                            <option value="all">All Time</option>
                            <option value="today" selected>Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <h3>Quick Stats</h3>
                        <div class="stats-grid">
                            <div class="stat-card">
                                <span class="st"stat-value">${projectData.length}</span>
                                <span class="stat-label">Total Updates</span>
                            </div>
                            <div class="stat-card">
                                <span class="stat-value">${new Set(projectData.map(p => p.username)).size}</span>
                                <span class="stat-label">Active Users</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="dashboard-main">
                <div class="main-header">
                    <div class="header-title">
                        <h1>Project Details</h1>
                        <span class="subtitle">Real-time project updates from team members</span>
                    </div>
                    <div class="header-actions">
                        <button class="action-btn refresh-btn">
                            <i class="fas fa-sync-alt"></i>
                            <span>Refresh</span>
                        </button>
                        <button class="action-btn download-btn">
                            <i class="fas fa-downloadoad"></i>
                            <span>Export</span>
                        </button>
                        <button class="action-btn close-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <div class="projects-container">
                    <div class="project-grid">
                        ${projectData.map(project => `
                            <div class="project-card">
                                <div class="card-header">
                                    <div class="user-info">
                                        <div class="avatar-wrapper">
                                            <img src="https://badgephotos.corp.amazon.com/?uid=${project.username}"
                                                 alt="User avatar"
                                                 class="user-avatar"
                                                 onerror="this.src='default-avatar.png'">
                                            <span class="status-indicator"></span>
                                        </div>
                                        <div class="user-details">
                                            <span class="username">${project.username}</span>
                                            <span class="date">
                                                <i class="far fa-clock"></i>
                                                ${new Date(project.date).toLocaleString()}
                                            </span>
                                            <span class="combi-info">
                                                <i class="fas fa-clock"></i>
                                                ${project.combi ? getCombiTimeRange(project.combi) : 'No Combi selected'}
                                            </span>
                                        </div>
                                    </div>
                                    <div class="card-actions">
                                        <div class="dropdown">
                                            <button class="card-menu-btn">
                                                <i class="fas fa-ellipsis-v"></i>
                                            </button>
                                            <div class="dropdown-content">
                                                ${project.username === currentUsername ?
                                          `<a href="#" class="edit-option" data-project-id="${project.date}">Edit</a>
                                                     <a href="#" class="delete-option" data-project-id="${project.date}">Delete</a>`
                                                    : ''}
                                                <a href="#" class="view-option" data-project-id="${project.date}">View Details</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="card-content">
                                    <div class="info-grid">
                                        <div class="info-item">
                                            <i class="fas fa-tasks"></i>
                                            <div class="info-details">
                                                <span class="info-label">Active Projects</span>
                                                <span class="info-value">${project.activeProjects}</span>
                                            </div>
                                        </div>
                                        <div class="info-item">
                                            <i class="fas fa-user-shield"></i>
                                            <div class="info-details">
                                                <span class="info-label">Backup POC</span>
                                                <span class="info-value">${project.backupPOC || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div class="info-item">
                                            <i class="fas fa-clock"></i>
                                            <div class="info-details">
                                                <span class="info-label">Hours Today</span>
                                                <span class="info-value">${project.projectHours}h</span>
                                            </div>
                                        </div>
                                        <div class="info-item">
                                            <i class="fas fa-pause-circle"></i>
                                            <div class="info-details">
                                                <span class="info-label">Parked Projects</span>
                                                <span class="info-value">${project.parkedProjects || 'None'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="project-eta">
                                        <span class="eta-label">Project ETA</span>
                                        <span class="eta-value">${project.projectETA}</span>
                                    </div>

                                    ${project.comments ? `
                                        <div class="project-comments">
                                            <span class="comments-label">Comments</span>
                                            <p class="comments-value">${project.comments}</p>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;

        dashboard.innerHTML = dashboardHTML;
        document.body.appendChild(dashboard);

        // Add event listeners
        const searchInput = dashboard.querySelector('.search-input');
        const dateFilter = dashboard.querySelector('.date-filter');
        const refreshBtn = dashboard.querySelector('.refresh-btn');
        const downloadBtn = dashboard.querySelector('.download-btn');
        const closeBtn = dashboard.querySelector('.close-btn');
        const editOptions = dashboard.querySelectorAll('.edit-option');
        const deleteOptions = dashboard.querySelectorAll('.delete-option');
        const viewOptions = dashboard.querySelectorAll('.view-option');

        // Search functionality
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            dashboard.querySelectorAll('.project-card').forEach(card => {
                const content = card.textContent.toLowerCase();
                card.style.display = content.includes(searchTerm) ? 'block' : 'none';
            });
        });

        // Date filter functionality
        dateFilter.addEventListener('change', (e) => {
            const filterValue = e.target.value;
            const now = new Date();

            dashboard.querySelectorAll('.project-card').forEach(card => {
                const dateStr = card.querySelector('.date').textContent.trim();
                const cardDate = new Date(dateStr);

                let show = true;
                if (filterValue === 'today') {
                    show = cardDate.toDateString() === now.toDateString();
                } else if (filterValue === 'week') {
                    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
                    show = cardDate >= weekAgo;
                } else if (filterValue === 'month') {
                    show = cardDate.getMonth() === now.getMonth() &&
                        cardDate.getFullYear() === now.getFullYear();
                }

                card.style.display = show ? 'block' : 'none';
            });

            updateFilteredStats(projectData, filterValue);
        });

        // Refresh button
        refreshBtn.addEventListener('click', async () => {
            refreshBtn.style.transform = 'rotate(360deg)';
            await showProjectDashboard();
            setTimeout(() => {
                refreshBtn.style.transform = 'rotate(0deg)';
            }, 1000);
        });

        // Download button
        downloadBtn.addEventListener('click', () => {
            downloadProjectDetails(projectData);
        });

        // Close button
        closeBtn.addEventListener('click', () => {
            dashboard.remove();
        });

        // Edit options
        editOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const projectId = e.target.getAttribute('data-project-id');
                editProjectDetails(projectId, projectData);
            });
        });

        // Delete options
        deleteOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const projectId = e.target.getAttribute('data-project-id');
                deleteProjectDetails(projectId);
            });
        });

        // View options
        viewOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const projectId = e.target.getAttribute('data-project-id');
                viewProjectDetails(projectId, projectData);
            });
        });

        // Initial filter for today's projects
        dateFilter.value = 'today';
        dateFilter.dispatchEvent(new Event('change'));
    }

    function getCombiTimeRange(combiId) {
        const combiMap = {
            'Combi1': '6am - 3pm',
            'Combi2': '7am - 6pm',
            'Combi3': '8am - 7pm',
            'Combi4': '9am - 7pm',
            'Combi5': '10am - 9pm',
            'Combi6': '11am - 10pm',
            'Combi7': '12pm - 11pm',
            'Combi8': '1pm - 12am'
        };
        return combiMap[combiId] || 'Invalid Combi';
    }

    function updateFilteredStats(data, filterValue) {
        const now = new Date();
        const filteredData = data.filter(project => {
            const projectDate = new Date(project.date);
            if (filterValue === 'today') {
                return projectDate.toDateString() === now.toDateString();
            } else if (filterValue === 'week') {
                const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
                return projectDate >= weekAgo;
            } else if (filterValue === 'month') {
                return projectDate.getMonth() === now.getMonth() &&
                    projectDate.getFullYear() === now.getFullYear();
            }
            return true;
        });

        const statsContainer = document.querySelector('.stats-grid');
        if (statsContainer) {
            statsContainer.innerHTML = `
            <div class="stat-card">
                <span class="stat-value">${filteredData.length}</span>
                <span class="stat-label">Updates</span>
            </div>
            <div class="stat-card">
                <span class="stat-value">${new Set(filteredData.map(p => p.username)).size}</span>
                <span class="stat-label">Users</span>
            </div>
        `;
        }
    }

    function downloadProjectDetails(data) {
        const headers = [
            'Date',
            'Username',
            'Combi',
            'Active Projects',
            'Backup POC',
            'Project Hours',
            'Parked Projects',
            'Project ETA',
            'Comments'
        ];

        const csvContent = [
            headers.join(','),
            ...data.map(project => [
                new Date(project.date).toISOString(),
                project.username,
                `"${project.combi || ''}"`,
                `"${project.activeProjects}"`,
                `"${project.backupPOC || ''}"`,
                project.projectHours,
                `"${project.parkedProjects || ''}"`,
                `"${project.projectETA}"`,
                `"${(project.comments || '').replace(/"/g, '""')}"`,
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `project_details_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    function editProjectDetails(projectId, allData) {
        const project = allData.find(p => p.date === projectId);
        if (!project) {
            SharedFunctions.showCustomAlert('Project not found');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'project-modal';
        modal.innerHTML = `
        <div class="modal-content">
            <h2>Edit Project Details</h2>
            <div class="form-group">
                <label>Select your Combi</label>
                <select id="edit-combi-select" required>
                    <option value="">Select Combi</option>
                    ${combiOptions.map(combi =>
                                       `<option value="${combi.id}" ${project.combi === combi.id ? 'selected' : ''}>
                            ${combi.id} ${combi.time}
                        </option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Active projects with SIM number</label>
                <input type="text" id="edit-active-projects" value="${project.activeProjects}" required>
            </div>
            <div class="form-group">
                <label>Back up POC, if PL</label>
                <input type="text" id="edit-backup-poc" value="${project.backupPOC || ''}">
            </div>
            <div class="form-group">
                <label>Project hours for the day</label>
                <input type="number" id="edit-project-hours" value="${project.projectHours}" required>
            </div>
            <div class="form-group">
                <label>Parked/yet to begin projects</label>
                <input type="text" id="edit-parked-projects" value="${project.parkedProjects || ''}">
            </div>
            <div class="form-group">
                <label>ETA of active projects</label>
                <input type="text" id="edit-project-eta" value="${project.projectETA}" required>
            </div>
            <div class="form-group">
                <label>Comments</label>
                <textarea id="edit-project-comments">${project.comments || ''}</textarea>
            </div>
            <div class="button-group">
                <button type="button" id="update-project">Update</button>
                <button type="button" id="close-modal">Cancel</button>
            </div>
        </div>
    `;

        document.body.appendChild(modal);

        document.getElementById('update-project').addEventListener('click', () => updateProjectDetails(projectId));
        document.getElementById('close-modal').addEventListener('click', closeModal);
    }

    async function deleteProjectDetails(projectId) {
        try {
            SharedFunctions.showCustomConfirm('Are you sure you want to delete this project details?', async (confirmed) => {
                if (!confirmed) return;

                let token;
                try {
                    const credentials = await SharedFunctions.showAuthModal();
                    if (!credentials) throw new Error('Authentication cancelled');
                    token = await authenticate(credentials.username, credentials.password);
                } catch (error) {
                    SharedFunctions.showCustomAlert('Authentication failed');
                    return;
                }

                await updateAWSCredentials(token);

                const s3 = new AWS.S3();
                const bucketName = 'project-details-bucket';
                const dateStr = new Date(projectId).toISOString().split('T')[0];
                const username = localStorage.getItem("currentUsername");
                const timestamp = new Date(projectId).getTime();
                const key = `project_details_${username}_${dateStr}_${timestamp}.json`;

                await s3.deleteObject({
                    Bucket: bucketName,
                    Key: key
                }).promise();

                SharedFunctions.showCustomAlert('Project details deleted successfully');

                const dashboard = document.querySelector('.project-dashboard');
                if (dashboard) {
                    dashboard.remove();
                    await showProjectDashboard();
                }
            });
        } catch (error) {
            console.error('Error deleting project details:', error);
            SharedFunctions.showCustomAlert('Failed to delete project details');
        }
    }

    function viewProjectDetails(projectId, allData) {
        const project = allData.find(p => p.date === projectId);
        if (!project) {
            SharedFunctions.showCustomAlert('Project not found');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'project-modal';
        modal.innerHTML = `
        <div class="modal-content">
            <h2>Project Details</h2>
            <p><strong>Date:</strong> ${new Date(project.date).toLocaleString()}</p>
            <p><strong>Username:</strong> ${project.username}</p>
            <p><strong>Combi:</strong> ${project.combi}</p>
            <p><strong>Active Projects:</strong> ${project.activeProjects}</p>
            <p><strong>Backup POC:</strong> ${project.backupPOC || 'N/A'}</p>
            <p><strong>Project Hours:</strong> ${project.projectHours}</p>
            <p><strong>Parked Projects:</strong> ${project.parkedProjects || 'None'}</p>
            <p><strong>Project ETA:</strong> ${project.projectETA}</p>
            <p><strong>Comments:</strong> ${project.comments || 'None'}</p>
            <div class="button-group">
                <button type="button" id="close-modal">Close</button>
            </div>
        </div>
    `;

        document.body.appendChild(modal);
        document.getElementById('close-modal').addEventListener('click', closeModal);
    }

    function closeModal() {
        const modal = document.querySelector('.project-modal');
        if (modal) {
            modal.remove();
        }
    }

    async function updateProjectDetails(projectId) {
        try {
            await SharedFunctions.loadAwsSdk();
            const credentials = await SharedFunctions.showAuthModal();

            if (!credentials) {
                throw new Error('Authentication cancelled');
            }

            const token = await authenticate(credentials.username, credentials.password);
            if (!token) {
                throw new Error('Authentication failed');
            }

            await updateAWSCredentials(token);

            const currentDate = new Date();
            const currentISOString = currentDate.toISOStOString();

            const updatedData = {
                date: currentISOString,
                username: localStorage.getItem("currentUsername"),
                combi: document.getElementById('edit-combi-select').value,
                activeProjects: document.getElementById('edit-active-projects').value,
                backupPOC: document.getElementById('edit-backup-poc').value,
                projectHours: document.getElementBntById('edit-project-hours').value,
                parkedProjects: document.getElementById('edit-parked-projects').value,
                projectETA: document.getElementById('edit-project-eta').value,
                comments: document.getElementById('edit-project-comments').value
            };

            if (!updatedData.combi || !updatedData.activeProjects || !updatedData.projectHours || !updatedData.projectETA) {
                throw new Error('Please fill in all required fields');
            }

            const s3 = new AWS.S3();
            const bucketName = 'project-details-bucket';

            const dateStr = new Date(projectId).toISOString().split('T')[0];
            const timestamp = new Date(projectId).getTime();
            const key = `project_details_${updatedData.username}_${dateStr}_${timestamp}.json`;

            try {
                await s3.deleteObject({
                    Bucket: bucketName,
                    Key: key
                }).promise();
            } catch (error) {
                console.log('No existing file to delete or error deleting:', error);
            }

            await s3.putObject({
                Bucket: bucketName,
                Key: key,
                Body: JSON.stringify(updatedData),
                ContentType: 'application/json'
            }).promise();

            SharedFunctions.showCustomAlert('Project details updated successfully!');
            closeModal();

            const dashboard = document.querySelector('.project-dashboard');
            if (dashboard) {
                dashboard.remove();
            }

            setTimeout(async () => {
                await showProjectDashboard();
            }, 100);

        } catch (error) {
            console.error('Error updating project details:', error);
            SharedFunctions.showCustomAlert(error.message || 'Error updating project details');
        }
    }
    ////////////////////////////////////////////////////////////
    // Data Management Functions
    async function saveAUXData(entry) {
        try {
            const username = await (entry.username instanceof Promise ?
                                    entry.username :
                                    entry.username || localStorage.getItem("currentUsername"));

            if (!username) {
                console.error("Username is missing. Data cannot be saved.");
                return;
            }

            function formatTimeForStorage(timeInMs) {
                const totalSeconds = Math.floor(timeInMs / 1000);
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }

            const timeSpentInSeconds = entry.timeSpent / 1000;
            const formattedTime = formatTimeForStorage(entry.timeSpent);

            function saveUniqueValue(key, value) {
                let storedValues = JSON.parse(localStorage.getItem(key)) || [];
                if (value && !storedValues.includes(value)) {
                    storedValues.push(value);
                    localStorage.setItem(key, JSON.stringify(storedValues));
                }
            }

            const auxData = JSON.parse(localStorage.getItem('auxData')) || [];
            const lastEntry = auxData.length > 0 ? auxData[auxData.length - 1] : null;

            // Check for duplicate entries
            if (lastEntry &&
                lastEntry.auxLabel === entry.auxLabel &&
                lastEntry.username === username &&
                Math.abs(new Date(lastEntry.date).getTime() - new Date(entry.date).getTime()) < 500) {
                console.log('Skipping duplicate entry within 500ms window');
                return;
            }

            // Modified audit count handling
            const wasPreviousConductProject = lastEntry &&
                  lastEntry.auxLabel.toLowerCase().includes('conduct project');

            if (entry.relatedAudits && wasPreviousConductProject) {
                if (lastEntry) {
                    lastEntry.relatedAudits = entry.relatedAudits;
                    auxData[auxData.length - 1] = lastEntry;
                    try {
                        await updatePreviousEntryInS3(lastEntry, username);
                    } catch (error) {
                        console.error('Error updating previous entry in S3:', error);
                    }
                    entry.relatedAudits = null;
                }
            }

            // Handle offline entries
            if (entry.auxLabel === "Offline - N/A - N/A") {
                if (!auxData.some(item => item.auxLabel === "Offline - N/A - N/A")) {
                    const uniqueId = `${username}-${entry.date}-${entry.auxLabel}-${Math.random().toString(36).substr(2, 9)}`;
                    saveUniqueValue('relatedAudits', entry.relatedAudits);

                    const newEntry = {
                        uniqueId,
                        date: entry.date,
                        username,
                        auxLabel: entry.auxLabel,
                        timeSpent: formattedTime,
                        projectTitle: entry.projectTitle || localStorage.getItem('projectTitle-' + entry.auxLabel),
                        relatedAudits: entry.relatedAudits,
                        areYouPL: entry.areYouPL || localStorage.getItem('areYouPL-' + entry.auxLabel),
                        comment: entry.comment || localStorage.getItem('comment-' + entry.auxLabel),
                        timestamp: new Date().toISOString()
                    };

                    auxData.push(newEntry);
                    localStorage.setItem('auxData', JSON.stringify(auxData));
                    await saveToS3WithUserFolder(newEntry, username);
                    console.log('Offline entry saved:', newEntry);
                }
            } else if (timeSpentInSeconds > 5) {
                const uniqueId = `${username}-${entry.date}-${entry.auxLabel}-${Math.random().toString(36).substr(2, 9)}`;
                saveUniqueValue('relatedAudits', entry.relatedAudits);

                const newEntry = {
                    uniqueId,
                    date: entry.date,
                    username,
                    auxLabel: entry.auxLabel,
                    timeSpent: formattedTime,
                    projectTitle: entry.projectTitle || localStorage.getItem('projectTitle-' + entry.auxLabel),
                    relatedAudits: entry.relatedAudits,
                    areYouPL: entry.areYouPL || localStorage.getItem('areYouPL-' + entry.auxLabel),
                    comment: entry.comment || localStorage.getItem('comment-' + entry.auxLabel),
                    timestamp: new Date().toISOString()
                };

                auxData.push(newEntry);
                localStorage.setItem('auxData', JSON.stringify(auxData));
                await saveToS3WithUserFolder(newEntry, username);
                console.log('AUX Data saved:', newEntry);

                if (document.getElementById('aux-dashboard')) {
                    await updateDashboardData(true);
                }
            } else {
                console.log('Time spent is less than 5 seconds. Skipping entry.');
            }

            displayAUXData(false);

            // Send update to AWS if online
            if (navigator.onLine) {
                try {
                    await sendAuxUpdate();
                } catch (error) {
                    console.error('Failed to send update to AWS:', error);
                    const pendingUploads = JSON.parse(localStorage.getItem('pendingUploads')) || [];
                    pendingUploads.push(entry);
                    localStorage.setItem('pendingUploads', JSON.stringify(pendingUploads));
                }
            }

        } catch (error) {
            console.error('Error in saveAUXData:', error);
            SharedFunctions.showCustomAlert('Failed to save AUX data: ' + error.message);

            const failedUploads = JSON.parse(localStorage.getItem('failedUploads')) || [];
            failedUploads.push({
                entry,
                timestamp: new Date().toISOString(),
                error: error.message
            });
            localStorage.setItem('failedUploads', JSON.stringify(failedUploads));
        }
    }

    async function updatePreviousEntryInS3(entry, username) {
        const currentDate = new Date().toISOString().split('T')[0];
        const token = await refreshCredentials();

        try {
            await updateAWSCredentials(token);

            const s3 = new AWS.S3();
            const bucketName = 'real-time-databucket';
            const folderKey = `${username}/${currentDate}_aux_data.csv`;

            // Get existing file
            const existingFile = await s3.getObject({
                Bucket: bucketName,
                Key: folderKey
            }).promise();

            const csvContent = existingFile.Body.toString('utf-8');
            const rows = csvContent.split('\n');
            const headers = rows[0];

            // Update the last Conduct Project entry with audit count
            const updatedRows = rows.slice(1).map(row => {
                const columns = row.split(',');
                if (columns[2].toLowerCase().includes('conduct project')) {
                    columns[5] = entry.relatedAudits; // Update audit count
                }
                return columns.join(',');
            });

            // Combine and upload
            const updatedContent = [headers, ...updatedRows].join('\n');
            await s3.putObject({
                Bucket: bucketName,
                Key: folderKey,
                Body: updatedContent,
                ContentType: 'text/csv'
            }).promise();

            console.log('Successfully updated previous entry in S3');

        } catch (error) {
            console.error('Error updating previous entry in S3:', error);
            throw error;
        }
    }

    async function saveToS3WithUserFolder(entry, username) {
        const currentDate = new Date().toISOString().split('T')[0];
        const token = await refreshCredentials();

        try {
            await updateAWSCredentials(token);

            const s3 = new AWS.S3();
            const bucketName = 'real-time-databucket';
            const folderKey = `${username}/${currentDate}_aux_data.csv`;

            // Try to get existing file
            let existingContent;
            try {
                const existingFile = await s3.getObject({
                    Bucket: bucketName,
                    Key: folderKey
                }).promise();
                existingContent = existingFile.Body.toString('utf-8');
            } catch (error) {
                if (error.code === 'NoSuchKey') {
                    // Create new file with headers
                    existingContent = 'Date,Username,AUX Label,Time Spent,Project Title,Related Audits,Are You the PL?,Comment,Timestamp\n';
                } else {
                    throw error;
                }
            }

            // Create new row
            const newRow = [
                entry.date,
                entry.username,
                entry.auxLabel,
                entry.timeSpent,
                entry.projectTitle || '',
                entry.relatedAudits || '',
                entry.areYouPL ? `"${entry.areYouPL}"` : '',
                entry.comment ? `"${entry.comment}"` : '',
                entry.timestamp

            ].join(',') + '\n';

            // Combine and upload
            await s3.putObject({
                Bucket: bucketName,
                Key: folderKey,
                Body: existingContent + newRow,
                ContentType: 'text/csv'
            }).promise();

            console.log('Successfully saved to S3:', folderKey);
            localStorage.setItem('lastSuccessfulSync', new Date().toISOString());

        } catch (error) {
            console.error('Error saving to S3:', error);
            throw error;
        }
    }

    async function recoverDataFromS3() {
        try {
            const username = localStorage.getItem("currentUsername");
            if (!username) {
                throw new Error('No username found');
            }

            const token = await refreshCredentials();
            await updateAWSCredentials(token);

            const s3 = new AWS.S3();
            const currentDate = new Date().toISOString().split('T')[0];
            const folderKey = `${username}/${currentDate}_aux_data.csv`;

            try {
                const data = await s3.getObject({
                    Bucket: 'real-time-databucket',
                    Key: folderKey
                }).promise();

                const csvContent = data.Body.toString('utf-8');
                const rows = csvContent.split('\n').slice(1); // Skip header
                const recoveredData = rows.filter(row => row.trim()).map(row => {
                    const [date, username, auxLabel, timeSpent, projectTitle, relatedAudits, areYouPL, comment, timestamp] = row.split(',');
                    return {
                        date,
                        username,
                        auxLabel,
                        timeSpent: parseInt(timeSpent),
                        projectTitle,
                        relatedAudits,
                        areYouPL: areYouPL.replace(/"/g, ''),
                        comment: comment.replace(/"/g, ''),
                        timestamp
                    };
                });

                return recoveredData;

            } catch (error) {
                if (error.code === 'NoSuchKey') {
                    console.log('No data found for today');
                    return [];
                }
                throw error;
            }

        } catch (error) {
            console.error('Error recovering data:', error);
            throw error;
        }
    }

    function exportToCSV() {
        try {
            let auxDataString = localStorage.getItem('auxData');
            let auxData = JSON.parse(auxDataString) || [];
            console.log('AUX Data from localStorage (Parsed):', auxData);

            const restoreTimestamp = localStorage.getItem('lastRestoreTimestamp');

            auxData = auxData.filter(entry => {
                const entryDate = new Date(entry.date).getTime();
                if (restoreTimestamp) {
                    if (entry.auxLabel === 'Late Login' && entryDate >= restoreTimestamp) {
                        return false;
                    }
                }
                return true;
            });

            auxData = auxData.filter(entry => entry.auxLabel !== 'undefined - N/A - N/A' && entry.date !== undefined);

            const csvContent = "data:text/csv;charset=utf-8," +
                  "Date,Username,AUX Label,Time Spent,Project Title,Related Audits,Are You the PL?,Comment\n" +
                  auxData.map(entry => {
                      const username = entry.username || "Unknown User";
                      return `${entry.date},${username},${entry.auxLabel},${formatTime(entry.timeSpent)},${entry.projectTitle},${entry.relatedAudits},${entry.areYouPL ? `"${entry.areYouPL}"` : ""},${entry.comment ? `"${entry.comment}"` : ""}`;
                  }).join("\n");

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', 'aux_data.csv');
            document.body.appendChild(link);

            link.click();
        } catch (error) {
            console.error('Error exporting AUX data to CSV:', error);
        }
    }

    function restoreFromCSV(event) {
        const file = event.target.files[0];
        if (!file) {
            console.error('No file selected');
            return;
        }

        const existingAuxDataString = localStorage.getItem('auxData');
        let existingAuxData = existingAuxDataString ? JSON.parse(existingAuxDataString) : [];

        existingAuxData = existingAuxData.filter(entry => entry.auxLabel !== 'Late Login');
        localStorage.setItem('auxData', JSON.stringify(existingAuxData));

        const reader = new FileReader();
        reader.onload = function(e) {
            const contents = e.target.result;
            const lines = contents.split('\n').slice(1);
            const restoredAuxData = lines.map(line => {
                const [
                    date,
                    username,
                    auxLabel,
                    timeSpent,
                    projectTitle,
                    relatedAudits,
                    areYouPL,
                    comment
                ] = line.split(',');

                if (!timeSpent || timeSpent === "undefined") {
                    console.error('Invalid timeSpent value:', timeSpent);
                    return null;
                }

                return {
                    date,
                    username,
                    auxLabel,
                    timeSpent: parseTime(timeSpent),
                    projectTitle,
                    relatedAudits,
                    areYouPL,
                    comment,
                    isRestored: true
                };
            }).filter(entry => entry && entry.date);

            const combinedAuxData = [...existingAuxData, ...restoredAuxData];

            localStorage.setItem('auxData', JSON.stringify(combinedAuxData));
            localStorage.setItem('lastRestoreTimestamp', Date.now());

            console.log('AUX Data merged and restored to localStorage:', combinedAuxData);
            SharedFunctions.showCustomAlert('AUX Data restored and merged');
            localStorage.removeItem('manualAUXChange');
        };

        reader.onerror = function() {
            console.error('Error reading file:', reader.error);
        };

        reader.readAsText(file);
    }

    // Helper function to parse time
    function parseTime(timeString) {
        if (!timeString) return 0;

        if (typeof timeString === 'number') {
            return timeString;
        }

        if (timeString.includes(':')) {
            const [hours, minutes, seconds] = timeString.split(':').map(Number);
            return ((hours * 3600) + (minutes * 60) + seconds) * 1000;
        }

        return parseInt(timeString, 10);
    }

    function displayAUXData(showTable = false) {
        let popupContainer = document.getElementById('auxTablePopup');

        if (!popupContainer) {
            popupContainer = document.createElement('div');
            popupContainer.id = 'auxTablePopup';
            popupContainer.className = 'aux-table-popup';
            document.body.appendChild(popupContainer);
        }

        let auxData = JSON.parse(localStorage.getItem('auxData')) || [];
        const restoreTimestamp = localStorage.getItem('lastRestoreTimestamp');

        auxData = auxData.filter(entry => {
            const entryDate = new Date(entry.date).getTime();
            const entryTime = new Date(entry.date).toTimeString().split(' ')[0];

            if (restoreTimestamp) {
                if (entry.auxLabel === 'Late Login' &&
                    entryTime === '00:00:00' &&
                    entryDate >= restoreTimestamp) {
                    return false;
                }
            }
            return true;
        });

        auxData = auxData.filter(entry =>
                                 entry.auxLabel !== 'undefined - N/A - N/A' &&
                                 entry.date !== undefined
                                );

        if (auxData.length === 0) {
            popupContainer.innerHTML = `
            <div class="no-data-message">
                No AUX Data available. Please refresh the page or view from a different page.
            </div>`;
            if (showTable) {
                popupContainer.style.display = 'block';
            }
            return;
        }

        const table = createAuxDataTable(auxData);
        popupContainer.innerHTML = '';
        popupContainer.appendChild(table);

        if (showTable) {
            popupContainer.style.display = 'block';
        } else {
            popupContainer.style.display = 'none';
        }
    }

    function createAuxDataTable(auxData) {
        const table = document.createElement('table');
        table.className = 'aux-data-table';

        const headers = ['Date', 'Username', 'AUX Label', 'Time Spent', 'Project Title', 'Related Audits', 'Are You PL', 'Comment'];
        const headerRow = table.insertRow();
        headers.forEach(headerText => {
            const header = document.createElement('th');
            header.textContent = headerText;
            headerRow.appendChild(header);
        });

        auxData.forEach(entry => {
            const row = table.insertRow();
            headers.forEach(header => {
                const cell = row.insertCell();
                const key = header.toLowerCase().replace(/ /g, '');
                if (key === 'timespent') {
                    cell.textContent = formatTime(entry[key]);
                } else {
                    cell.textContent = entry[key] || 'N/A';
                }
            });
        });

        return table;
    }
    ////////////////////////////////////////////////////////////
    // UI Helper Functions
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function validateTimeFormat(timeString) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
        return timeRegex.test(timeString);
    }

    function formatToMMDDYYYY(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }

    function getLocalTimeString(date) {
        return date.te.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    function convertToUTC(timeString) {
        const date = new Date();
        const [hours, minutes, seconds] = timeString.split(':').map(Number);
        date.setHours(hours, minutes, seconds);
        return date.toUTCString();
    }

    function getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
    }

    function getMonthName(date) {
        return new Date(date).toLocaleString('default', { month: 'long' });
    }

    function convertMinutesToHours(minutes) {
        return (parseFloat(minutes) / 60).toFixed(2);
    }

    function convertTimeToMinutes(timeValue) {
        if (!timeValue) return '0.00';

        if (/^\d{1,2}:\d{2}:\d{2}$/.test(timeValue)) {
            const [hours, minutes, seconds] = timeValue.split(':').map(Number);
            return ((hours * 60) + minutes + (seconds / 60)).toFixed(2);
        }

        const numericValue = parseFloat(timeValue);
        if (!numericValue || isNaN(numericValue)) {
            return '0.00';
        }

        return timeValue.includes('.') ? numericValue.toFixed(2) : (numericValue / 60).toFixed(2);
    }

    function handleEmptyValue(value) {
        if (value === null || value === undefined || value.toString().trim() === '') {
            return 'N/A';
        }
        return value;
    }

    function escapeCSVField(field) {
        if (field === null || field === undefined) {
            return 'N/A';
        }

        const stringField = field.toString();
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
            return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
    }

    function showTimerDetails(auxState, displayedAuxLabel, elapsedTime) {
        const details = {
            'AUX Label': displayedAuxLabel,
            'Status': auxState.isPaused ? 'Paused' : 'Active',
            'Total Time': formatTime(elapsedTime),
            'Total Pause Duration': formatTime(auxState.totalPauseDuration || 0),
            'Start Time': new Date(auxState.startTime).toLocaleTimeString(),
            'Last Updated': new Date().toLocaleTimeString()
        };

        const detailsText = Object.entries(details)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

        SharedFunctions.showCustomAlert(detailsText);
    }

    function addFileInput() {
        const input = document.createElement('input');
        input.type = 'file';
        input.id = 'csvFileInput';
        input.style.display = 'none';
        input.accept = '.csv';
        input.addEventListener('change', restoreFromCSV);
        document.body.appendChild(input);
    }
    ////////////////////////////////////////////////////////////
    // Event Listeners
    function initializeEventListeners() {
        // DOM Content Loaded
        document.addEventListener('DOMContentLoaded', async () => {
            const pauseButton = document.getElementById('pause-button');
            if (pauseButton) {
                pauseButton.addEventListener('click', togglePause);
            }
            const initialAuxState = localStorage.getItem('auxState');
            console.log('Initial AUX state:', initialAuxState);
            SharedFunctions.injectAuthStyles();
            cleanupTimer();
            await SharedFunctions.displayUsername();
            restoreTimer();
            addFileInput();
            checkLoginStatus();
            restoreSelections();
            const auxState = JSON.parse(localStorage.getItem('auxState'));
            if (auxState && auxState.auxLabel) {
                updateAuxSelection(auxState.auxLabel);
            }
            isInitialLoad = false;
            console.log('Initial load complete, isInitialLoad set to false');
        });

        // Storage Event
        window.addEventListener('storage', function(event) {
            if (event.key === 'auxState') {
                const auxState = JSON.parse(event.newValue);
                if (auxState) {
                    cleanupTimer();
                    const startTime = auxState.startTime;
                    const elapsedTime = calculateTimeSpent(auxState.startTime);
                    const auxLabel = auxState.auxLabel;
                    const timerElement = displayTimer();

                    // Update pause state
                    isPaused = auxState.isPaused || false;
                    const pauseButton = document.nt.getElementById('pause-button');
                    if (pauseButton) {
                        pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
                    }

                    updateAuxSelection(auxLabel);
                    updateTimerDisplay(auxLabel, elapsedTime);

                    if (!isPaused) {
                        requestAnimationFrame(() => updateTimer(startTime, auxLabel, timerElement));
                    }
                }
            } else if (event.key === 'auxChange') {
                const data = JSON.parse(event.newValue);
                if (data && data.action === 'pauseStateChange') {
                    isPaused = data.isPaused;
                    const pauseButton = document.getElementById('pause-button');
                    if (pauseButton) {
                        pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
                    }

                    if (!isPaused) {
                        const timerElement = displayTimer();
                        requestAnimationFrame(() => updateTimer(data.startTime, data.auxLabel, timerElement));
                    }
                } else if (data && data.action === 'startTimer') {
                    const auxState = JSON.parse(localStorage.getItem('auxState'));
                    if (auxState && auxState.timestamp === data.timestamp) {
                        isPaused = false;
                        const pauseButton = document.getElementById('pause-button');
                        if (pauseButton) {
                            pauseButton.textContent = 'Pause';
                        }
                        updateAuxSelection(data.auxLabel);
                    }
                } else if (data && data.action === 'stopTimer') {
                    cleanupTimer();
                    updateTimerDisplay('', 0);
                }
            }
        });

        // Online/Offline Events
        window.addEventListener('online', () => {
            console.log('Connection restored, restarting dashboard updates...');
            if (document.getElementById('aux-dashboard')) {
                startDashboardUpdates();
            }
        });

        window.addEventListener('offline', () => {
            console.log('Connection lost, stopping dashboard updates...');
            stopDashboardUpdates();
            if (document.getElementById('aux-dashboard')) {
                SharedFunctions.showCustomAlert('Connection lost. Dashboard updates paused.');
            }
        });

        // Timer State Change Event
        window.addEventListener('auxStateChange', async (event) => {
            const { isPaused, auxState, timestamp } = event.detail;
            updateUIForPauseState(isPaused, auxState);
            if (document.getElementById('aux-dashboard')) {
                await updateDashboardData(true);
            }
        });

        // Unhandled Promise Rejection
        window.addEventListener('unhandledrejection', event => {
            console.error('Unhandled promise rejection:', event.reason);
            if (event.reason.code === 'CredentialsError') {
                handleUpdateError(event.reason);
            }
        });

        // Button Click Events
        document.getElementById('exportToCSVButton').addEventListener('click', exportToCSV);
        document.getElementById('searchProjectTimeButton').addEventListener('click', searchProjectTime);
        document.getElementById('restoreCSVButton').addEventListener('click', function() {
            SharedFunctions.showCustomAlert('This option is no longer available')
        });
        document.getElementById('exportToAWSButton').addEventListener('click', displayAUXData);
        document.getElementById('displayAuxDataButton').addEventListener('click', function() {
            const popupContainer = document.getElementById('auxTablePopup');
            if (popupContainer) {
                if (popupContainer.style.display === 'none') {
                    displayAUXData(true);
                } else {
                    popupContainer.style.display = 'none';
                }
            } else {
                displayAUXData(true);
            }
        });
        document.getElementById('importFromAws').addEventListener('click', importFromAws);
        document.getElementById('getFullDataButton').addEventListener('click', getFullData);
        document.getElementById('projectDetailsButton').addEventListener('click', showProjectDetailsForm);
        document.getElementById('getProjectDetailsButton').addEventListener('click', showProjectDashboard);
        document.getElementById('flashDataButton').addEventListener('click', flashData);
        document.getElementById('auraGuidelines').addEventListener('click', function() {
            window.open('https://drive.corp.amazon.com/view/mofila@/Microsite%20Automated%20NPT/Microsite%20NPT%20Prod/Microsite%20NPT%20Guidelines.pdf', '_blank');
        });
        document.getElementById('reportBugImage').addEventListener('click', function() {
            window.open('https://amazon.enterprise.slack.com/archives/C0941UXQ7DJ');
        });
        document.getElementById('clearLocalStorageButton').addEventListener('click', function () {
            SharedFunctions.showCustomConfirm('Action will clear the current NPT data. Do you want to proceed?', (userConfirmed) => {
                if (userConfirmed) {
                    localStorage.clear();
                    SharedFunctions.showCustomAlert('Local storage has been cleared successfully.');
                }
            });
        });

        // AUX Level Change Events
        document.addEventListener('change', function(event) {
            const auxLabel = event.target.value;
            if (event.target && event.target.id === 'aux-label') {
                if (auxLabel) {
                    startAUXTimer(auxLabel);
                } else {
                    stopAUXTimer();
                }
            }
        });

        // Version Text Hover Event
        const versionText = document.getElementById('version-text');
        if (versionText) {
            versionText.addEventListener('mouseenter', () => {
                fetch(gistURL)
                    .then(response => response.json())
                    .then(data => {
                    const randomQuote = data[Math.floor(Math.random() * data.length)];
                    versionText.setAttribute('title', randomQuote);
                })
                    .catch(err => {
                    console.error('Failed to fetch quotes:', err);
                    versionText.setAttribute('title', 'Error fetching quote.');
                });
            });
        }

        // Before Unload Event
        window.addEventListener('beforeunload', function(e) {
            const popup = document.getElementById('combined-popup');
            if (popup) {
                e.preventDefault();
                e.returnValue = '';
            }
        });

        // Unload Event
        window.addEventListener('unload', () => {
            cleanupTimer();
            if (timerUpdateDebounce) {
                clearTimeout(timerUpdateDebounce);
            }
        });

        // Focus/Blur Events
        window.addEventListener('focus', () => {
            isTabFocused = true;
        });

        window.addEventListener('blur', () => {
            isTabFocused = false;
        });
    }
    ////////////////////////////////////////////////////////////
    // DOM Manipulation Functions
    function makeWidgetDraggable() {
        const widget = document.getElementById('aux-widget');
        let isDragging = false;
        let offsetX, offsetY;

        widget.addEventListener('mousedown', (event) => {
            isDragging = true;
            offsetX = event.clientX - widget.getBoundingClientRect().left;
            offsetY = event.clientY - widget.getBoundingClientRect().top;
        });

        document.addEventListener('mousemove', (event) => {
            if (isDragging) {
                const newX = event.clientX - offsetX;
                const newY = event.clientY - offsetY;
                widget.style.left = newX + 'px';
                widget.style.top = newY + 'px';
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    function createAuthModal() {
        const modal = document.createElement('div');
        modal.innerHTML = `
        <div class="auth-modal">
            <div class="auth-modal-content">
                <h2 class="auth-modal-title">Authentication Required</h2>
                <div class="auth-input-container">
                    <input type="text"
                        id="username"
                        class="auth-input"
                        placeholder="Enter your login"
                        autocomplete="off">
                </div>
                <div class="auth-input-container">
                    <input type="password"
                        id="password"
                        class="auth-input"
                        placeholder="Enter your password">
                    <button id="toggle-password" class="toggle-password-btn">
                        <svg viewBox="0 0 24 24" class="eye-icon">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                    </button>
                </div>
                <div class="auth-button-container">
                    <button id="auth-submit" class="auth-submit-btn">Submit</button>
                    <button id="auth-cancel" class="auth-cancel-btn">Cancel</button>
                </div>
            </div>
        </div>
    `;
        return modal;
    }

    function createParticles() {
        const particlesContainer = document.querySelector('.particles');
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.width = Math.random() * 5 + 'px';
            particle.style.height = particle.style.width;
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 10 + 's';
            particlesContainer.appendChild(particle);
        }
    }

    function updateAuxSelection(auxLabel) {
        if (!auxLabel) return;

        const parts = auxLabel.split(' - ');
        const l1Value = parts[0];
        const l2Value = parts[1] !== 'N/A' ? parts[1] : '';
        const l3Value = parts[2] !== 'N/A' ? parts[2] : '';

        const auxL1 = document.getElementById('aux-l1');
        const auxL2Container = document.getElementById('aux-l2-container');
        const auxL3Container = document.getElementById('aux-l3-container');

        if (auxL1 && l1Value) {
            auxL1.value = Object.keys(l1Names).find(key => l1Names[key] === l1Value);
            auxL1.dispatchEvent(new Event('change'));
        }

        setTimeout(() => {
            const auxL2 = document.getElementById('aux-l2');
            if (auxL2 && l2Value) {
                auxL2.value = l2Value;
                auxL2.dispatchEvent(new Event('change'));
            }

            setTimeout(() => {
                const auxL3 = document.getElementById('aux-l3');
                if (auxL3 && l3Value) {
                    auxL3.value = l3Value;
                    auxL3.dispatchEvent(new Event('change'));
                }
            }, 100);
        }, 100);
    }
    ////////////////////////////////////////////////////////////
    // Event Handling Functions
    function handleL1Change(event) {
        console.log(`L1 change event fired. isInitialLoad: ${isInitialLoad}`);
        const l1Value = event.target.value;
        console.log('New L1 value:', l1Value);
        const l2Container = document.getElementById('aux-l2-container');
        const l3Container = document.getElementById('aux-l3-container');

        const isRestoring = event.isTrusted === false;

        localStorage.setItem('auxL1', l1Value);
        l2Container.innerHTML = '';
        l3Container.innerHTML = '';
        l2Container.style.display = 'none';
        l3Container.style.display = 'none';

        const l2Value = document.getElementById('aux-l2') ? document.getElementById('aux-l2').value : '';

        if (l2Mapping[l1Value]) {
            let l2SelectHTML = '<select id="aux-l2" onchange="handleL2Change(event)">';
            l2SelectHTML += '<option value="">Select L2</option>';
            l2Mapping[l1Value].forEach(opt => {
                l2SelectHTML += `<option value="${opt}">${opt}</option>`;
            });
            l2SelectHTML += '</select>';
            l2Container.innerHTML = l2SelectHTML;

            document.getElementById('aux-l2').addEventListener('change', function(event) {
                const l2Value = event.target.value;
                const l1Value = document.getElementById('aux-l1').value;
                if (l2Value) {
                    if (!l3Mapping[l2Value]) {
                        handleAuxStateChange(`${l1Names[l1Value]} - ${l2Value} - N/A`);
                    }
                } else {
                    stopAUXTimer();
                }
            });

            // Show L2 container if same L1 is selected again
            const lastL1Value = localStorage.getItem('lastSelectedL1');
            if (l1Value === lastL1Value) {
                l2Container.style.display = 'block';
            } else {
                l2Container.style.display = 'block';
            }
            localStorage.setItem('lastSelectedL1', l1Value);
        } else {
            const newAuxLabel = `${l1Names[l1Value]} - N/A - N/A`;
            handleAuxStateChange(newAuxLabel);

            if (l1Value) {
                localStorage.setItem('manualAUXChange', 'true');
                handleAuxStateChange(l1Names[l1Value] + ' - N/A - N/A');
            } else {
                stopAUXTimer();
            }

            if (l1Value !== '' && isTabFocused && !isRestoring) {
                showCombinedPopup(newAuxLabel, (auditData) => {
                    console.log('Audit data submitted:', auditData);
                });
            }
        }

        if (localStorage.getItem('previousAux') === 'CP' &&
            !l1Value.toLowerCase().includes('conduct project') &&
            isTabFocused &&
            !isInitialLoad) {
            SharedFunctions.showCustomAlert('Your previous AUX was Conduct Project, please enter Audit counts if applicable');
        }
        localStorage.setItem('previousAux', l1Value.toLowerCase() === 'conduct project' ? 'CP' : '');

        saveCurrentSelections();
    }

    function handleL2Change(event) {
        console.log('L2 change event fired');
        const l2Value = event.target.value;
        console.log('New L2 value:', l2Value);
        const l3Container = document.getElementById('aux-l3-container');
        const l1Value = document.getElementById('aux-l1').value;

        const isRestoring = event.isTrusted === false;

        localStorage.setItem('auxL2', l2Value);
        l3Container.innerHTML = '';
        l3Container.style.display = 'none';

        if (l3Mapping[l2Value]) {
            let l3SelectHTML = '<select id="aux-l3" onchange="handleL3Change(event)">';
            l3SelectHTML += '<option value="">Select L3</option>';
            l3Mapping[l2Value].forEach(opt => {
                l3SelectHTML += `<option value="${opt}">${opt}</option>`;
            });
            l3SelectHTML += '</select>';
            l3Container.innerHTML = l3SelectHTML;

            document.getElementById('aux-l3').addEventListener('change', function(event) {
                const l3Value = event.target.value;
                const l2Value = document.getElementById('aux-l2').value;
                const l1Value = document.getElementById('aux-l1').value;
                if (l3Value) {
                    handleAuxStateChange(`${l1Names[l1Value]} - ${l2Value} - ${l3Value}`);
                } else {
                    stopAUXTimer();
                }
            });

            l3Container.style.display = 'block';
        } else {
            const newAuxLabel = `${l1Names[l1Value]} - ${l2Value} - N/A`;
            handleAuxStateChange(newAuxLabel);
        }

        const newAuxLabel = `${l1Names[l1Value]} - ${l2Value} - N/A`;
        updateTimerDisplay(newAuxLabel, 0);

        if (l2Value !== '' && !l3Mapping[l2Value] && !isRestoring) {
            if (isTabFocused) {
                showCombinedPopup(newAuxLabel, (auditData) => {
                    console.log('Audit data submitted:', auditData);
                });
            }
        }

        if (localStorage.getItem('previousAux') === 'CP' &&
            !l2Value.toLowerCase().includes('conduct project') &&
            isTabFocused &&
            !isInitialLoad) {
            SharedFunctions.showCustomAlert('Your previous AUX was Conduct Project, please enter Audit counts if applicable');
        }
        localStorage.setItem('previousAux', l2Value.toLowerCase() === 'conduct project' ? 'CP' : '');

        saveCurrentSelections();
    }

    // Event Handling Functions (continued)
    function handleL3Change(event) {
        console.log('L3 change event fired');
        const l3Value = event.target.value;
        console.log('New L3 value:', l3Value);
        const l2Value = document.getElementById('aux-l2').value;
        const l1Value = document.getElementById('aux-l1').value;

        const isRestoring = event.isTrusted === false;

        localStorage.setItem('auxL3', l3Value);
        const PreviousAux = localStorage.getItem('PreviousAux');

        if (l3Value !== '') {
            const newAuxLabel = `${l1Names[l1Value]} - ${l2Value} - ${l3Value}`;

            const currentState = JSON.parse(localStorage.getItem('auxState')) || {};
            if (currentState.auxLabel !== newAuxLabel && !isRestoring) {
                handleAuxStateChange(newAuxLabel);
            }

            if (isTabFocused && !isRestoring && !isInitialLoad) {
                showCombinedPopup(newAuxLabel, (auditData) => {
                    console.log('Audit data submitted:', auditData);
                });
            }
        }

        localStorage.setItem('PreviousAux', l3Value);
        const startTime = JSON.parse(localStorage.getItem('auxState'))?.startTime || Date.now();
        const endTime = new Date();
        const timeSpent = endTime - new Date(startTime);

        const formattedTimeSpent = formatTime(timeSpent);
        const newAuxLabel = `${l1Names[l1Value]} - ${l2Value} - ${l3Value}`;
        updateTimerDisplay(newAuxLabel, timeSpent);

        const currentState = JSON.parse(localStorage.getItem('auxState')) || {};
        if (currentState.auxLabel === newAuxLabel && !isRestoring && !isInitialLoad) {
            saveAUXData({
                auxLabel: newAuxLabel,
                timeSpent: timeSpent,
                date: formatDate(new Date())
            });
        }

        lastSelectedL1 = l1Value;
        lastSelectedL2 = l2Value;
        lastSelectedL3 = l3Value;
        lastL3Selection = l3Value;
        finalSelectionMade = true;

        if (finalLayerSelected() && !isRestoring && !isInitialLoad) {
            const auxLabel = `${l1Names[l1Value]} - ${l2Value} - ${l3Value}`;
            const timeSpent = calculateTimeSpent(startTime);
            saveAUXData({ auxLabel, timeSpent });
            exportToCSV();
            exportToAWS();
        }

        if (localStorage.getItem('previousAux') === 'CP' &&
            !l3Value.toLowerCase().includes('conduct project') &&
            isTabFocused &&
            !isInitialLoad) {
            SharedFunctions.showCustomAlert('Your previous AUX was Conduct Project, please enter Audit counts if applicable');
        }
        localStorage.setItem('previousAux', l3Value.toLowerCase() === 'conduct project' ? 'CP' : '');

        saveCurrentSelections();
    }

    function handleAuxStateChange(newAuxLabel) {
        console.log(`handleAuxStateChange called with: ${newAuxLabel}`);
        console.log(`isInitialLoad: ${isInitialLoad}`);
        console.log(`Current time: ${new Date().toISOString()}`);

        if (isInitialLoad) {
            console.log('Skipping AUX state change during initial load');
            console.trace();
            return;
        }

        const prevState = JSON.parse(localStorage.getItem('auxState'));
        const now = Date.now();

        // Store the current total pause duration before state change
        const currentTotalPauseDuration = prevState ? prevState.totalPauseDuration || 0 : 0;

        if (prevState && prevState.auxLabel !== newAuxLabel) {
            const timeSpent = prevState.isPaused ?
                  (prevState.pauseTime - prevState.startTime) - (prevState.totalPauseDuration || 0) :
            (now - prevState.startTime) - (prevState.totalPauseDuration || 0);

            saveAUXData({
                auxLabel: prevState.auxLabel,
                timeSpent: timeSpent,
                date: formatDate(new Date()),
                projectTitle: localStorage.getItem('projectTitle-' + prevState.auxLabel),
                relatedAudits: localStorage.getItem('relatedAudits-' + prevState.auxLabel),
                areYouPL: localStorage.getItem('areYouPL-' + prevState.auxLabel),
                comment: localStorage.getItem('comment-' + prevState.auxLabel)
            });
        }

        if (!prevState || prevState.auxLabel !== newAuxLabel) {
            cleanupTimer();

            // Create new state
            const newState = {
                auxLabel: newAuxLabel,
                startTime: now,
                timestamp: now,
                isPaused: false,
                totalPauseDuration: 0 // Reset pause duration for new AUX
            };

            // Store the new state
            localStorage.setItem('auxState', JSON.stringify(newState));

            // Start the timer immediately
            const timerElement = displayTimer();
            if (timerElement) {
                updateTimer(now, newAuxLabel, timerElement);
            }
        }

        // Ensure pause duration is maintained when going offline
        if (newAuxLabel.toLowerCase().includes('offline')) {
            const currentState = JSON.parse(localStorage.getItem('auxState'));
            currentState.totalPauseDuration = currentTotalPauseDuration;
            localStorage.setItem('auxState', JSON.stringify(currentState));
        }

        sendAuxUpdate();
        sendAuxUpdateWithRetry();

        if (document.getElementById('aux-dashboard')) {
            updateDashboardData(true);
        }
    }

    // Additional Event Handling Helper Functions
    function finalLayerSelected() {
        const auxL1Value = document.getElementById('aux-l1').value;
        const auxL2Value = document.getElementById('aux-l2')?.value;
        const auxL3Value = document.getElementById('aux-l3')?.value;
        return auxL1Value && auxL2Value && auxL3Value && !l3Mapping[auxL2Value];
    }

    function saveCurrentSelections() {
        const l1 = document.getElementById('aux-l1')?.value || '';
        const l2 = document.getElementById('aux-l2')?.value || '';
        const l3 = document.getElementById('aux-l3')?.value || '';

        localStorage.setItem('currentSelections', JSON.stringify({
            l1, l2, l3
        }));
    }

    function restoreSelections() {
        const saved = localStorage.getItem('currentSelections');
        if (saved) {
            try {
                const {l1, l2, l3} = JSON.parse(saved);

                const l1Select = document.getElementById('aux-l1');
                if (l1Select && l1) {
                    l1Select.value = l1;
                    const event = new Event('change', { bubbles: true });
                    l1Select.dispatchEvent(event);

                    setTimeout(() => {
                        const l2Select = document.getElementById('aux-l2');
                        if (l2Select && l2) {
                            l2Select.value = l2;
                            l2Select.dispatchEvent(new Event('change', { bubbles: true }));

                            setTimeout(() => {
                                const l3Select = document.getElementById('aux-l3');
                                if (l3Select && l3) {
                                    l3Select.value = l3;
                                    l3Select.dispatchEvent(new Event('change', { bubbles: true }));
                                }
                            }, 100);
                        }
                    }, 100);
                }
            } catch (error) {
                console.error('Error restoring selections:', error);
            }
        }
    }
    ////////////////////////////////////////////////////////////////////
    // Feature Functions/Operations

    async function showCombinedPopup(auxLabel, callback) {
        if (!isTabFocused) return;
        console.log('showCombinedPopup function called');

        const auxData = JSON.parse(localStorage.getItem('auxData')) || [];
        const previousEntry = auxData[auxData.length - 1];

        // Check if previous AUX was strictly "Conduct Project"
        const wasPreviousConductProject = previousEntry &&
              previousEntry.auxLabel &&
              previousEntry.auxLabel.split(' - ').some(part =>
                                                       part.trim() === 'Conduct Project' &&
                                                       !part.trim().includes('Non Conduct Project')
                                                      );

        const currentLabel = auxLabel.toLowerCase();

        // Enable audit count for ANY new AUX if previous was Conduct Project
        const enableAuditCount = wasPreviousConductProject;

        const popup = document.createElement('div');
        popup.id = 'combined-popup';
        popup.className = 'combined-popup';
        popup.innerHTML = `
        <div class="popup-content">
            <h2>Enter Data</h2>

            <div class="input-container">
                <div class="input-field">
                    <label for="projectTitle">Project Title</label>
                    <input
                        type="text"
                        id="projectTitle"
                        name="projectTitle"
                        placeholder="Enter project title"
                        autocomplete="off"
                    >
                </div>

                <div class="input-field">
                    <label for="relatedAudits">Audit Counts ${enableAuditCount ? '*' : ''}</label>
                    <input
                        type="number"
                        id="relatedAudits"
                        name="relatedAudits"
                        placeholder="${enableAuditCount ? 'Enter number of audits' : 'Audit count not required'}"
                        min="0"
                        ${enableAuditCount ? 'required' : ''}
                        ${!enableAuditCount ? 'disabled' : ''}
                        ${!enableAuditCount ? 'style="background-color: #f5f5f5;"' : ''}
                        onkeypress="return (event.charCode >= 48 && evenvent.charCode <= 57)"
                        oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                    >
                    ${!enableAuditCount ?
            '<small style="color: #666; display: block; margin-top: 5px;">Audit count is only required after "Conduct Project"</small>'
        : ''}
                </div>

            <div class="input-field">
                <label for="comment-text">Comment</label>
                <textarea
                    id="comment-text"
                    rows="4"
                    placeholder="Enter your comment here..."
                ></textarea>
            </div>


            <div class="radio-group">
                <label class="radio-label">Are you the PL?</label>
                <div class="radio-options">
                    <label class="radio-option">
                        <input type="radio" id="areYouPLYes" name="areYouPL" value="Yes">
                        <span class="radio-label">Yes</span>
                    </label>

                    <label class="radio-option">
                        <input type="radio" id="areYouPLNo" name="areYouPL" value="No">
                        <span class="radio-label">No</span>
                    </label>

                    <label class="radio-option">
                        <input type="radio" id="areYouPLNA" name="areYouPL" value="N/A">
                        <span class="radio-label">N/A</span>
                    </label>
                </div>
            </div>

            <div class="button-group">
                <button type="button" id="submit-btn" class="popup-button">
                    Submit
                </button>
                <button type="button" id="cancel-btn" class="popup-button">
                    Cancel
                </button>
            </div>
        </div>
    `;
        document.body.appendChild(popup);

        const auditInput = document.getElementById('relatedAudits');

        auditInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '');

            if (this.value < 0) {
                this.value = 0;
            }
        });

        auditInput.addEventListener('keypress', function(e) {
            if (e.charCode < 48 || e.charCode > 57) {
                e.preventDefault();
            }
        });


        document.getElementById('submit-btn').addEventListener('click', function() {
            const auditInput = document.getElementById('relatedAudits');
            const auditCount = auditInput.value;

            if (enableAuditCount) {
                if (!auditCount || isNaN(auditCount) || auditCount < 0) {
                    SharedFunctions.showCustomAlert('Please enter a valid number for audit counts');
                    return;
                }
            }

            if (validateInputs()) {
                submitCombinedData(auxLabel, callback);
                closePopup();
            } else {
                SharedFunctions.showCustomAlert('Please fill in all required fields');
            }
        });


        document.getElementById('cancel-btn').addEventListener('click', function() {
            if (wasPreviousConductProject) {
                SharedFunctions.showCustomAlert('You cannot skip the audit count when the previous AUX was "Conduct Project"');
            } else {
                closePopup();
            }
        });

        function closePopup() {
            const popup = document.getElementById('combined-popup');
            if (!popup) {
                console.warn('Popup element not found, skipping close operation.');
                return;
            }

            popup.style.animation = 'popupOut 0.3s forwards';
            setTimeout(() => {
                if (popup.parentNode) {
                    popup.remove();
                }
            }, 300);
        }

        window.addEventListener('beforeunload', function(e) {
            const popup = document.getElementById('combined-popup');
            if (popup) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    function validateInputs() {
        const projectTitle = document.getElementById('projectTitle');
        const comment = document.getElementById('comment-text');
        const relatedAudits = document.getElementById('relatedAudits');

        if (!projectTitle || !comment || !relatedAudits) {
            console.error('One or more required input elements not found');
            return false;
        }

        const titleValue = projectTitle.value.trim();
        const commentValue = comment.value.trim();
        const auditValue = relatedAudits.value.trim();

        if (!titleValue) {
            SharedFunctions.showCustomAlert('Please enter a project title');
            projectTitle.focus();
            return false;
        }

        if (!commentValue) {
            SharedFunctions.showCustomAlert('Please enter a comment');
            comment.focus();
            return false;
        }

        if (!relatedAudits.disabled) {
            if (!auditValue) {
                SharedFunctions.showCustomAlert('Please enter the number of audits');
                relatedAudits.focus();
                return false;
            }

            if (isNaN(auditValue) || parseInt(auditValue) < 0) {
                SharedFunctions.showCustomAlert('Please enter a valid positive number for audit counts');
                relatedAudits.focus();
                return false;
            }
        }

        return true;
    }

    function submitCombinedData(auxLabel, callback) {
        const comment = document.getElementById('comment-text').value;
        const projectTitle = document.getElementById('projectTitle').value;
        const relatedAudits = document.getElementById('relatedAudits').value;
        const areYouPL = document.querySelector('input[name="areYouPL"]:checked').value;

        localStorage.setItem('comment-' + auxLabel, comment);
        localStorage.setItem('areYouPL-' + auxLabel, areYouPL);
        localStorage.setItem('projectTitle-' + auxLabel, projectTitle);
        localStorage.setItem('relatedAudits-' + auxLabel, relatedAudits);

        document.getElementById('combined-popup').remove();

        callback({
            comment,
            areYouPL,
            projectTitle,
            relatedAudits
        });
    }


    // Feature Functions/Operations (continued)
    async function searchProjectTime() {
        try {
            await SharedFunctions.injectAuthStyles();
            await SharedFunctions.loadAwsSdk();
            await SharedFunctions.loadCognitoSDK();

            // Try to use stored credentials first
            const storedUsername = localStorage.getItem('lastAuthUsername');
            const storedPassword = localStorage.getItem('lastAuthPassword');
            let token;

            if (storedUsername && storedPassword) {
                try {
                    token = await authenticate(storedUsername, storedPassword);
                } catch (error) {
                    console.log('Stored credentials invalid, requesting new authentication');
                    localStorage.removeItem('lastAuthUsername');
                    localStorage.removeItem('lastAuthPassword');
                }
            }

            // If no stored credentials or they're invalid, show auth modal
            if (!token) {
                const credentials = await SharedFunctions.showAuthModal();
                if (credentials) {
                    token = await authenticate(credentials.username, credentials.password);
                    // Store new credentials
                    localStorage.setItem('lastAuthUsername', credentials.username);
                    localStorage.setItem('lastAuthPassword', credentials.password);
                } else {
                    throw new Error('Authentication cancelled');
                }
            }

            const searchContainer = document.createElement('div');
            searchContainer.className = 'search-container';
            searchContainer.innerHTML = `
            <div class="search-header">
                <div class="search-title">Search Project Time</div>
                <button class="search-close">&times;</button>
            </div>

            <div class="search-type-container">
                <label class="search-type-label">Search Type:</label>
                <div class="search-type-options">
                    <div class="search-type-option" data-type="my">My Project Time</div>
                    <div class="search-type-option" data-type="total">Total Project Time</div>
                </div>
            </div>

            <input type="text" class="search-input" placeholder="Enter Project Title">
            <button class="search-button">Search</button>
            <div class="search-results"></div>
        `;
            document.body.appendChild(searchContainer);

            const searchBtn = searchContainer.querySelector('.search-button');
            const searchInput = searchContainer.querySelector('.search-input');
            const resultsDiv = searchContainer.querySelector('.search-results');
            const closeBtn = searchContainer.querySelector('.search-close');

            closeBtn.onclick = () => document.body.removeChild(searchContainer);

            let selectedSearchType = 'my';

            const searchTypeOptions = searchContainer.querySelectorAll('.search-type-option');
            searchTypeOptions.forEach(option => {
                option.addEventListener('click', () => {
                    searchTypeOptions.forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');
                    selectedSearchType = option.dataset.type;
                });
            });

            searchTypeOptions[0].classList.add('selected');

            searchBtn.onclick = async () => {
                const projectTitle = searchInput.value.trim().toLowerCase();
                if (!projectTitle) {
                    SharedFunctions.showCustomAlert('Please enter a project title');
                    return;
                }

                try {
                    searchBtn.innerHTML = '<span class="loading-spinner"></span>Searching...';
                    searchBtn.disabled = true;

                    await updateAWSCredentials(token);

                    const s3 = new AWS.S3();
                    const bucketName = 'aux-data-bucket';
                    const prefixes = ['Aura_NPT_', 'aux_data_'];
                    let totalTimeInMinutes = 0;
                    const currentUsername = localStorage.getItem("currentUsername");
                    let matchCount = 0;

                    for (const prefix of prefixes) {
                        try {
                            const listedObjects = await s3.listObjectsV2({
                                Bucket: bucketName,
                                Prefix: prefix
                            }).promise();

                            for (const item of listedObjects.Contents) {
                                try {
                                    const fileData = await s3.getObject({
                                        Bucket: bucketName,
                                        Key: item.Key
                                    }).promise();

                                    const fileContent = fileData.Body.toString('utf-8');
                                    const rows = fileContent.split('\n');

                                    for (let i = 1; i < rows.length; i++) {
                                        const row = rows[i].split(',');
                                        if (row.length >= 5) {
                                            const [date, rowUsername, auxLabel, timeSpent, rowProjectTitle] = row;

                                            if (rowProjectTitle && rowProjectTitle.toLowerCase().includes(projectTitle)) {
                                                if (selectedSearchType === 'my' && rowUsername !== currentUsername) {
                                                    continue;
                                                }

                                                let minutes = 0;
                                                if (timeSpent) {
                                                    if (timeSpent.includes(':')) {
                                                        const [hours, mins, secs] = timeSpent.split(':').map(Number);
                                                        minutes = (hours * 60) + mins + (secs / 60);
                                                    } else {
                                                        const numValue = parseFloat(timeSpent);
                                                        if (!isNaN(numValue)) {
                                                            minutes = numValue;
                                                        }
                                                    }
                                                }

                                                if (!isNaN(minutes)) {
                                                    totalTimeInMinutes += minutes;
                                                    matchCount++;
                                                }
                                            }
                                        }
                                    }
                                } catch (fileError) {
                                    console.error(`Error processing file ${item.Key}:`, fileError);
                                    continue;
                                }
                            }
                        } catch (prefixError) {
                            console.error(`Error processing prefix ${prefix}:`, prefixError);
                            continue;
                        }
                    }

                    const hours = Math.floor(totalTimeInMinutes / 60);
                    const minutes = Math.floor(totalTimeInMinutes % 60);
                    const seconds = Math.floor((totalTimeInMinutes * 60) % 60);
                    const formattedTotal = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                    resultsDiv.innerHTML = `
                    <div class="total-time">
                        ${selectedSearchType === 'my' ? 'Your' : 'Total'} Time spent on "${projectTitle}":<br>
                        ${formattedTotal}<br>
                        <span style="font-size: 14px; color: rgba(255,255,255,0.7);">
                            (Found in ${matchCount} entries)
                        </span>
                    </div>
                `;

                    if (matchCount === 0) {
                        SharedFunctions.showCustomAlert('No matching projects found');
                    }

                } catch (error) {
                    console.error('Search error:', error);
                    if (error.code === 'CredentialsError' || error.message.includes('credentials')) {
                        localStorage.removeItem('lastAuthUsername');
                        localStorage.removeItem('lastAuthPassword');
                        SharedFunctions.showCustomAlert('Authentication expired. Please try again.');
                    } else {
                        SharedFunctions.showCustomAlert('Error searching project data');
                    }
                } finally {
                    searchBtn.innerHTML = 'Search';
                    searchBtn.disabled = false;
                }
            };

        } catch (error) {
            console.error('Initialization error:', error);
            SharedFunctions.showCustomAlert('Failed to initialize search functionality');
        }
    }

    async function getFullData() {
        const currentUsername = localStorage.getItem("currentUsername");

        try {
            const isAuthorized = await checkAuthorization(currentUsername);

            if (!isAuthorized) {
                SharedFunctions.showCustomAlert("You don't have permission to download full data");
                return;
            }

            await SharedFunctions.injectAuthStyles();
            await SharedFunctions.loadAwsSdk();
            await SharedFunctions.loadCognitoSDK();

            // Create selection modal
            const selectionModal = document.createElement('div');
            selectionModal.className = 'selection-modal';
            selectionModal.innerHTML = `
            <div class="modal-content">
                <h2 class="modal-title">Select Data Range</h2>
                <button id="ytd-btn" class="selection-btn">Year to Date</button>
                <button id="date-range-btn" class="selection-btn">Custom Date Range</button>
                <button id="cancel-btn" class="selection-btn cancel">Cancel</button>
            </div>
        `;
            document.body.appendChild(selectionModal);

            let dateRange = await new Promise((resolve) => {
                document.getElementById('ytd-btn').onclick = () => {
                    const now = new Date();
                    const startOfYear = new Date(now.getFullYear(), 0, 1);
                    resolve({
                        startDateTime: startOfYear.getTime(),
                        endDateTime: now.getTime()
                    });
                    selectionModal.remove();
                };

                document.getElementById('date-range-btn').onclick = async () => {
                    selectionModal.remove();
                    try {
                        const range = await selectDateRange();
                        resolve(range);
                    } catch (err) {
                        resolve(null);
                    }
                };

                document.getElementById('cancel-btn').onclick = () => {
                    selectionModal.remove();
                    resolve(null);
                };
            });

            if (!dateRange) {
                return;
            }

            const token = await new Promise((resolve, reject) => {
                const modal = createAuthModal();
                document.body.appendChild(modal);

                document.getElementById('auth-submit').addEventListener('click', async () => {
                    const username = document.getElementById('username').value.trim();
                    const password = document.getElementById('password').value.trim();

                    if (!username || !password) {
                        SharedFunctions.showCustomAlert('Both username and password are required.');
                        return;
                    }

                    try {
                        const token = await authenticate(username, password);
                        document.body.removeChild(modal);
                        resolve(token);
                    } catch (error) {
                        SharedFunctions.showCustomAlert('Authentication failed. Please try again.');
                        console.error('Authentication error:', error);
                    }
                });

                document.getElementById('auth-cancel').addEventListener('click', () => {
                    document.body.removeChild(modal);
                    reject(new Error('Authentication cancelled'));
                });
            });

            await updateAWSCredentials(token);

            const loadingIndicator = SharedFunctions.createLoadingIndicator();
            document.body.appendChild(loadingIndicator);

            try {
                const s3 = new AWS.S3();
                const bucketName = 'aux-data-bucket';
                const prefixes = ['Aura_NPT_', 'aux_data_'];
                const relevantData = new Set();

                // Load MS_Sites mapping
                const siteMap = await loadMSSitesData();

                for (const prefix of prefixes) {
                    try {
                        const listedObjects = await s3.listObjectsV2({
                            Bucket: bucketName,
                            Prefix: prefix
                        }).promise();

                        console.log(`Found ${listedObjects.Contents.length} files with prefix ${prefix}`);

                        for (const item of listedObjects.Contents) {
                            try {
                                const fileData = await s3.getObject({
                                    Bucket: bucketName,
                                    Key: item.Key
                                }).promise();

                                const fileContent = fileData.Body.toString('utf-8');
                                const processedData = processCSVData(fileContent);

                                for (const row of processedData) {
                                    if (row.length >= 4) {
                                        try {
                                            const date = row[0];
                                            if (!date || date.trim() === '') {
                                                continue;
                                            }

                                            const rowDate = new Date(date).getTime();

                                            if (rowDate >= dateRange.startDateTime &&
                                                rowDate <= dateRange.endDateTime) {

                                                const username = row[1] || 'N/A';
                                                const auxLabel = row[2] || 'N/A';
                                                const timeSpent = formatTimeSpent(row[3]);
                                                const projectTitle = row[4] || 'N/A';
                                                const relatedAudits = row[5] ?
                                                      row[5].replace(/[^\d]/g, '') : 'N/A';
                                                const areYouPL = validateAreYouPL(row[6]);
                                                const comment = row[7] || 'N/A';
                                                const site = handleEmptyValue(siteMap[username] || 'N/A');

                                                if (timeSpent === '00:00:00') continue;

                                                const auxLabels = splitAuxLabel(auxLabel);
                                                const weekNum = getWeekNumber(date);
                                                const month = getMonthName(date);
                                                const timeMinutes = convertTimeToMinutes(timeSpent);
                                                const timeHours = convertMinutesToHours(timeMinutes);

                                                const processedRow = [
                                                    escapeCSVField(date),
                                                    escapeCSVField(weekNum),
                                                    escapeCSVField(month),
                                                    escapeCSVField(username),
                                                    escapeCSVField(handleEmptyValue(auxLabels['Aux L1'])),
                                                    escapeCSVField(handleEmptyValue(auxLabels['Aux L2'])),
                                                    escapeCSVField(handleEmptyValue(auxLabels['Aux L3'])),
                                                    escapeCSVField(handleEmptyValue(projectTitle)),
                                                    escapeCSVField(handleEmptyValue(relatedAudits)),
                                                    escapeCSVField(handleEmptyValue(areYouPL)),
                                                    escapeCSVField(handleEmptyValue(comment)),
                                                    escapeCSVField(timeMinutes),
                                                    escapeCSVField(timeHours),
                                                    escapeCSVField(site)
                                                ].join(',');

                                                relevantData.add(processedRow);
                                            }
                                        } catch (dateError) {
                                            console.error('Error processing date for row:', row, dateError);
                                            continue;
                                        }
                                    }
                                }
                            } catch (fileError) {
                                console.error(`Error processing file ${item.Key}:`, fileError);
                                continue;
                            }
                        }
                    } catch (prefixError) {
                        console.error(`Error processing prefix ${prefix}:`, prefixError);
                        continue;
                    }
                }

                if (relevantData.size === 0) {
                    SharedFunctions.showCustomAlert('No data found for the selected date range.');
                    return;
                }

                // Create CSV with headers
                const headers = [
                    'Date',
                    'Week',
                    'Month',
                    'Username',
                    'Aux Label 1',
                    'Aux Label 2',
                    'Aux Label 3',
                    'Project Title',
                    'Related Audits',
                    'Are You the PL?',
                    'Comment',
                    'Time (minutes)',
                    'Time (hours)',
                    'Site'
                ].join(',');

                const csvContent = `${headers}\n${Array.from(relevantData).join('\n')}`;

                // Download the file
                const startDate = new Date(dateRange.startDateTime).toISOString().split('T')[0];
                const endDate = new Date(dateRange.endDateTime).toISOString().split('T')[0];

                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `full_data_${startDate}_to_${endDate}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                SharedFunctions.showCustomAlert('Data successfully exported!');

            } finally {
                document.body.removeChild(loadingIndicator);
            }

        } catch (error) {
            console.error('Error in getFullData:', error);
            SharedFunctions.showCustomAlert('Failed to retrieve full data');
        }
    }

    // Helper functions for getFullData
    async function checkAuthorization(username) {
        try {
            const script = document.createElement('script');
            script.src = 'https://mofi-l.github.io/aux-auth-config/auth-config.js';

            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });

            const isAuthorized = window.AUTH_CONFIG.authorizedUsers.includes(username);

            document.head.removeChild(script);
            delete window.AUTH_CONFIG;

            return isAuthorized;
        } catch (error) {
            console.error('Authorization check failed:', error);
            return false;
        }
    }

    function processCSVData(csvContent) {
        const lines = csvContent.split(/\r?\n/);
        const processedData = [];
        let currentLine = [];
        let inQuotedField = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Skip empty lines
            if (!line.trim()) continue;

            const fields = parseCSVLine(line);

            if (!inQuotedField) {
                currentLine = fields;
            } else {
                const lastIndex = currentLine.length - 1;
                currentLine[lastIndex] += '\n' + fields.join(',');
            }

            const quoteCounts = line.split('"').length - 1;
            if (quoteCounts % 2 === 1) {
                inQuotedField = !inQuotedField;
            } else if (!inQuotedField) {
                processedData.push([...currentLine]);
            }
        }

        return processedData;
    }

    function parseCSVLine(line) {
        const result = [];
        let field = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    // Handle escaped quotes
                    field += '"';
                    i++;
                } else {
                    // Toggle quote state
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                // End of field
                result.push(field.trim());
                field = '';
            } else {
                field += char;
            }
        }

        result.push(field.trim());
        return result;
    }

    function splitAuxLabel(auxLabel) {
        if (!auxLabel || auxLabel.trim() === '') {
            return {
                'Aux L1': 'N/A',
                'Aux L2': 'N/A',
                'Aux L3': 'N/A'
            };
        }

        const parts = auxLabel.split(' - ');
        return {
            'Aux L1': parts[0] || 'N/A',
            'Aux L2': parts[1] || 'N/A',
            'Aux L3': parts[2] || 'N/A'
        };
    }

    function formatTimeSpent(timeValue) {
        if (!timeValue) return '00:00:00';

        // If it's already in HH:MM:SS format, return as is
        if (/^\d^\d{1,2}:\d{2}:\d{2}$/.test(timeValue)) {
            return timeValue;
        }

        // If it's a number (assuming minutes), convert to HH:MM:SS
        const numericValue = parseFloat(timeValue);
        if (!isNaN(numericValue)) {
            const hours = Math.floor(numericValue / 60);
            const minutes = Math.floor(numericValue % 60);
            const seconds = Math.floor((numericValue * 60) % 60);

            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        // If it's neither a valid time string nor a number, return '00:00:00'
        return '00:00:00';
    }

    function validateAreYouPL(value) {
        if (!value) return 'N/A';
        const cleanValue = value.replace(/^["']+|["']+$/g, '').trim();
        return ['Yes', 'No', 'N/A'].includes(cleanValue) ? cleanValue : 'N/A';
    }

    // Helper function to load MS_Sites data
    async function loadMSSitesData() {
        const s3 = new AWS.S3();
        const bucketName = 'aux-data-bucket';
        const key = 'MS_sites.csv';

        try {
            const data = await s3.getObject({ Bucket: bucketName, Key: key }).promise();
            const csvContent = data.Body.toString('utf-8');
            const rows = csvContent.split('\n').slice(1); // Skip header row
            const siteMap = {};

            rows.forEach(row => {
                if (!row.trim()) return;
                const [username, site] = row.split(',');
                if (username && site) {
                    siteMap[username.trim()] = site.trim();
                }
            });

            return siteMap;
        } catch (error) {
            console.error('Error loading MS_Sites data:', error);
            return {};
        }
    }

    async function flashData() {
        console.log('Starting flashData function...');
        try {
            // Authenticate and get AWS credentials
            const credentials = await SharedFunctions.showAuthModal();
            if (!credentials) {
                console.error('Authentication cancelled by user');
                throw new Error('Authentication cancelled');
            }

            const token = await authenticate(credentials.username, credentials.password);
            if (!token) {
                console.error('Authentication failed - no token received');
                throw new Error('Authentication failed');
            }
            console.log('Authentication successful');

            // Configure AWS
            // After authentication succeeds, configure AWS:
            AWS.config.update({
                region: 'eu-north-1',
                credentials: new AWS.CognitoIdentityCredentials({
                    IdentityPoolId: 'eu-north-1:98c07095-e731-4219-bebe-db4dab892ea8',
                    Logins: {
                        'cognito-idp.eu-north-1.amazonaws.com/eu-north-1_V9kLPNVXl': token
                    }
                })
            });

            // Wait for credentials to be initialized:
            await new Promise((resolve, reject) => {
                AWS.config.credentials.get(err => {
                    if (err) reject(err);
                    else resolve();
                });
            });


            // Initialize S3 client and fetch data
            const s3 = new AWS.S3();
            const bucketName = 'aux-data-bucket';
            const prefixes = ['Aura_NPT_', 'aux_data_'];
            let combinedData = [];

            // Show loading indicator
            const loadingIndicator = SharedFunctions.createLoadingIndicator();
            document.body.appendChild(loadingIndicator);

            try {
                // Fetch data from S3
                for (const prefix of prefixes) {
                    const listParams = {
                        Bucket: bucketName,
                        Prefix: prefix
                    };

                    const listedObjects = await s3.listObjectsV2(listParams).promise();

                    for (const item of listedObjects.Contents) {
                        const data = await s3.getObject({
                            Bucket: bucketName,
                            Key: item.Key
                        }).promise();

                        const csvContent = data.Body.toString('utf-8');
                        const rows = csvContent.split('\n')
                        .filter(line => line.trim())
                        .map(row => row.split(','));

                        combinedData = combinedData.concat(rows);
                    }
                }

                // Create Flash Data window
                createFlashDataWindow(combinedData);

            } finally {
                document.body.removeChild(loadingIndicator);
            }

        } catch (error) {
            console.error('Error in flashData:', error);
            SharedFunctions.showCustomAlert('Failed to fetch and display data: ' + error.message);
        }
    }

    function createFlashDataWindow(combinedData) {
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
        <html>
        <head>
            <title>Flash Data Dashboard</title>
            <style>
                body {
                    font-family: 'Segoe UI', Arial, sans-serif;
                    margin: 20px;
                    background-color: #f5f5f5;
                }

                .dashboard-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .site-buttons {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                    justify-content: center;
                }

                .site-button {
                    padding: 10px 20px;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background-color 0.3s;
                }

                .site-button:hover {
                    background-color: #0056b3;
                }

                .site-button.active {
                    background-color: #0056b3;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }

                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }

                th {
                    background-color: #f8f9fa;
                }

                .loading {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(255,255,255,0.8);
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
            </style>
        </head>
        <body>
            <div class="dashboard-container">
                <div class="site-buttons">
                    ${['HYD', 'PEK', 'BCN', 'DE'].map(site => `
                        <button class="site-button" onclick="showSiteData('${site}')">${site}</button>
                    `).join('')}
                </div>
                <div id="tableContainer">
                    <table id="dataTable"></table>
                </div>
            </div>
            <div id="loadingIndicator" class="loading" style="display: none">
                Loading data...
            </div>
        </body>
        </html>
    `);

        // Add necessary functions to new window
        addFunctionsToWindow(newWindow, combinedData);
        newWindow.document.close();
    }

    function addFunctionsToWindow(newWindow, combinedData) {
        // Add data to window scope
        newWindow.combinedData = combinedData;

        newWindow.showSiteData = function(site) {
            const loadingIndicator = newWindow.document.getElementById('loadingIndicator');
            loadingIndicator.style.display = 'block';

            // Update active button state
            newWindow.document.querySelectorAll('.site-button').forEach(btn => {
                btn.classList.toggle('active', btn.textContent === site);
            });

            try {
                // Filter data for selected site
                const siteData = combinedData.filter(row => row[3] === site);
                const processedData = newWindow.processDataForTable(siteData);
                newWindow.updateTable(processedData);
            } catch (error) {
                console.error('Error processing site data:', error);
                newWindow.showCustomAlert('Error processing data for ' + site);
            } finally {
                loadingIndicator.style.display = 'none';
            }
        };

        newWindow.processDataForTable = function(data) {
            const tableStructure = [
                {
                    bodyOfWork: 'Data Dive (RCE, Non-RCE, Mapping, HMD etc)',
                    dataTypes: ['Overall project hours', 'Conduct hours', 'Total audit count']
                },
                {
                    bodyOfWork: 'Document review (DPM/Non DPM/IPR etc.)',
                    dataTypes: ['Overall project hours', 'Conduct hours', 'Total audit count']
                },
                {
                    bodyOfWork: 'Testing',
                    dataTypes: ['Overall project hours', 'Conduct hours', 'Total audit count']
                },
                {
                    bodyOfWork: 'SME consultation(Round table, quick question, WTS (Walk the store), SBS (Side by Side) etc)',
                    dataTypes: ['Overall project hours', 'Conduct hours']
                }
            ];

            // Initialize processed data structure
            const processedData = [];
            tableStructure.forEach(category => {
                category.dataTypes.forEach(dataType => {
                    processedData.push({
                        bodyOfWork: category.bodyOfWork,
                        dataType: dataType,
                        YTD: 0
                    });
                });
            });

            // Process data rows
            if (data && data.length > 0) {
                data.forEach(row => {
                    const [date, , auxLabel, timeSpent, , relatedAudits] = row;
                    if (!date || !auxLabel) return;

                    const [bodyOfWork, dataType] = newWindow.identifyBodyOfWorkAndDataType(auxLabel);
                    if (!bodyOfWork || !dataType) return;

                    const week = newWindow.getWeekNumber(new Date(date));
                    const weekColumn = `WK${week}`;

                    const targetRow = processedData.find(r =>
                                                         r.bodyOfWork === bodyOfWork && r.dataType === dataType
                                                        );

                    if (targetRow) {
                        const value = dataType === 'Total audit count'
                        ? (parseInt(relatedAudits) || 0)
                        : newWindow.convertTimeToHours(timeSpent);

                        targetRow.YTD = (targetRow.YTD || 0) + value;
                        targetRow[weekColumn] = (targetRow[weekColumn] || 0) + value;
                    }
                });
            }

            return processedData;
        };

        newWindow.updateTable = function(data) {
            const table = newWindow.document.getElementById('dataTable');
            if (!table) return;

            // Clear existing content
            table.innerHTML = '';

            // Get unique week columns
            const weekColumns = Array.from(new Set(
                data.flatMap(row => Object.keys(row).filter(key => key.startsWith('WK')))
            )).sort((a, b) => parseInt(a.slice(2)) - parseInt(b.slice(2)));

            // Create header row
            const headerRow = table.insertRow();
            ['Body of work', 'Data Type', 'YTD', ...weekColumns].forEach(header => {
                const th = newWindow.document.createElement('th');
                th.textContent = header;
                headerRow.appendChild(th);
            });

            // Track current body of work for row spanning
            let currentBodyOfWork = '';
            let rowSpanCount = 0;

            // Add data rows
            data.forEach((row, index) => {
                const tr = table.insertRow();

                if (row.bodyOfWork !== currentBodyOfWork) {
                    currentBodyOfWork = row.bodyOfWork;
                    rowSpanCount = data.filter(r => r.bodyOfWork === currentBodyOfWork).length;

                    const bodyOfWorkCell = tr.insertCell();
                    bodyOfWorkCell.textContent = currentBodyOfWork;
                    bodyOfWorkCell.rowSpan = rowSpanCount;
                    bodyOfWorkCell.style.backgroundColor = '#f8f9fa';
                }

                // Add data type
                const dataTypeCell = tr.insertCell();
                dataTypeCell.textContent = row.dataType;

                // Add YTD value
                const ytdCell = tr.insertCell();
                ytdCell.textContent = newWindow.formatValue(row.YTD, row.dataType);

                // Add weekly values
                weekColumns.forEach(week => {
                    const cell = tr.insertCell();
                    cell.textContent = newWindow.formatValue(row[week] || 0, row.dataType);
                });
            });

            // Add summary row
            newWindow.addTableSummary(table, data, weekColumns);
        };

        newWindow.identifyBodyOfWorkAndDataType = function(auxLabel) {
            const parts = auxLabel.split(' - ');
            const l2 = parts[1] || '';

            let bodyOfWork = '';
            let dataType = '';

            // Map L2 labels to body of work
            if (['RCE Dive', 'Non RCE Dive', 'Mapping Project', 'HMD Quality Audit'].includes(l2)) {
                bodyOfWork = 'Data Dive (RCE, Non-RCE, Mapping, HMD etc)';
            } else if (['Document Review', 'DPM'].includes(l2)) {
                bodyOfWork = 'Document review (DPM/Non DPM/IPR etc.)';
            } else if (l2 === 'Testing') {
                bodyOfWork = 'Testing';
            } else if (['Round Table', 'Quick Questions', 'Side by Side'].includes(l2)) {
                bodyOfWork = 'SME consultation(Round table, quick question, WTS (Walk the store), SBS (Side by Side) etc)';
            }

            // Determine data type
            if (parts[2]?.includes('Conduct Project')) {
                dataType = 'Conduct hours';
            } else if (parts[2]?.toLowerCase().includes('audit')) {
                dataType = 'Total audit count';
            } else {
                dataType = 'Overall project hours';
            }

            return [bodyOfWork, dataType];
        };

        newWindow.convertTimeToHours = function(timeString) {
            if (!timeString) return 0;

            try {
                if (typeof timeString === 'number') {
                    return timeString / 3600000; // Convert milliseconds to hours
                }

                if (timeString.includes(':')) {
                    const [hours, minutes, seconds] = timeString.split(':').map(Number);
                    return hours + (minutes / 60) + (seconds / 3600);
                }

                return parseFloat(timeString) || 0;
            } catch (error) {
                console.error('Error converting time:', error);
                return 0;
            }
        };

        newWindow.getWeekNumber = function(date) {
            const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            const dayNum = d.getUTCDay() || 7;
            d.setUTCDate(d.getUTCDate() + 4 - dayNum);
            const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
            return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
        };

        newWindow.formatValue = function(value, dataType) {
            if (!value) return '0';
            if (dataType === 'Total audit count') {
                return Math.round(value).toString();
            }
            return parseFloat(value).toFixed(2);
        };

        newWindow.addTableSummary = function(table, data, weekColumns) {
            const summaryRow = table.insertRow();
            summaryRow.style.backgroundColor = '#e3f2fd';

            // Add "Total" cell spanning two columns
            const totalCell = summaryRow.insertCell();
            totalCell.textContent = 'Total';
            totalCell.colSpan = 2;
            totalCell.style.textAlign = 'right';
            totalCell.style.fontWeight = 'bold';

            // Calculate and add YTD total
            const ytdTotal = data.reduce((sum, row) => sum + (parseFloat(row.YTD) || 0), 0);
            const ytdCell = summaryRow.insertCell();
            ytdCell.textContent = newWindow.formatValue(ytdTotal, 'Overall project hours');
            ytdCell.style.fontWeight = 'bold';

            // Calculate and add weekly totals
            weekColumns.forEach(week => {
                const weekTotal = data.reduce((sum, row) => sum + (parseFloat(row[week]) || 0), 0);
                const weekCell = summaryRow.insertCell();
                weekCell.textContent = newWindow.formatValue(weekTotal, 'Overall project hours');
                weekCell.style.fontWeight = 'bold';
            });
        };

        newWindow.showCustomAlert = function(message) {
            newWindow.alert(message);
        };

        // Auto-select first site
        setTimeout(() => {
            const firstSiteButton = newWindow.document.querySelector('.site-button');
            if (firstSiteButton) {
                firstSiteButton.click();
            }
        }, 500);
    }
    ////////////////////////////////////////////////////////////////////
    // Initialization Function
    async function initializeScript() {
        try {
            await loadDependencies();
            checkAuthentication();
            initializeEventListeners();
            restoreTimer();
            addFileInput();
            checkLoginStatus();
            setInitialLoginTime();
            clearLocalStorageIfNeeded();
            addVersionText();
        } catch (error) {
            console.error('Initialization error:', error);
        }
    }

    // Helper functions for initialization
    async function loadDependencies() {
        try {
            await loadScript('https://sdk.amazonaws.com/js/aws-sdk-2.1109.0.min.js');
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/amazon-cognito-identity-js/5.2.1/amazon-cognito-identity.min.js');
            console.log('AWS SDK and Cognito SDK loaded successfully');
        } catch (error) {
            console.error('Failed to load dependencies:', error);
        }
    }

    function loadScript(url) {
        return new Promise((resolve, reject) => {
            let script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function checkAuthentication() {
        if (!hasStoredCredentials()) {
            SharedFunctions.showAuthModal()
                .then(credentials => {
                if (credentials) {
                    saveAuthCredentials(credentials.username, credentials.password);
                    startAuxUpdates();
                }
            })
                .catch(error => console.error('Authentication failed:', error));
        } else {
            startAuxUpdates();
        }
    }

    function setInitialLoginTime() {
        const today = new Date().toISOString().split('T')[0];
        const storedDate = localStorage.getItem('lastLoginDate');

        if (storedDate !== today) {
            // New day - clear previous login time
            localStorage.removeItem('dailyLoginTime');
            localStorage.setItem('lastLoginDate', today);
        }

        if (!localStorage.getItem('dailyLoginTime')) {
            localStorage.setItem('dailyLoginTime', new Date().toISOString());
        }
    }

    function clearLocalStorageIfNeeded() {
        const now = new Date();
        const currentHour = now.getHours();
        const todayDate = now.toISOString().split('T')[0];
        const lastClearedDate = localStorage.getItem('lastClearedDate');

        if (!lastClearedDate || (lastClearedDate !== todayDate && currentHour >= 5)) {
            const lastCleared = new Date(lastClearedDate);

            if (!lastClearedDate || (now - lastCleared > 24 * 60 * 60 * 1000)) {
                // Save authentication credentials before clearing
                const authUsername = localStorage.getItem('lastAuthUsername');
                const authPassword = localStorage.getItem('lastAuthPassword');

                // Clear localStorage
                localStorage.clear();

                // Restore authentication credentials
                if (authUsername) localStorage.setItem('lastAuthUsername', authUsername);
                if (authPassword) localStorage.setItem('lastAuthPassword', authPassword);

                // Update last cleared date
                localStorage.setItem('lastClearedDate', todayDate);
                console.log('Local storage cleared while preserving authentication.');
            }
        }

        if (lastClearedDate !== todayDate) {
            localStorage.removeItem('loggedBefore12');
        }
    }

    function addVersionText() {
        const versionText = document.createElement('div');
        versionText.id = 'version-text';
        versionText.style.position = 'absolute';
        versionText.style.bottom = '10px';
        versionText.style.right = '10px';
        versionText.style.color = 'white';
        versionText.style.cursor = 'pointer';
        versionText.style.fontSize = '12px';
        versionText.innerText = `v${currentVersion}`;

        const widget = document.getElementById('aux-widget');
        widget.appendChild(versionText);

        versionText.addEventListener('mouseenter', () => {
            fetch(gistURL)
                .then(response => response.json())
                .then(data => {
                const randomQuote = data[Math.floor(Math.random() * data.length)];
                versionText.setAttribute('title', randomQuote);
            })
                .catch(err => {
                console.error('Failed to fetch quotes:', err);
                versionText.setAttribute('title', 'Error fetching quote.');
            });
        });
    }

    // Call the initialization function
    initializeScript();

    // Additional Initialization Helper Functions
    function checkLoginStatus() {
        const username = SharedFunctions.displayUsername();
        if (username) {
            localStorage.setItem('userLoggedIn', true);
            console.log('User logged in:', username);

            const now = new Date();
            if (now.getHours() < 12) {
                localStorage.setItem('loggedBefore12', true);
            }

            localStorage.removeItem('timerStatus');
        }
    }

    function startAuxUpdates() {
        sendAuxUpdate();
        return setInterval(() => {
            sendAuxUpdate();
        }, 10000);
    }

    function hasStoredCredentials() {
        const credentials = getStoredCredentials();
        return !!(credentials.username && credentials.password);
    }

    function getStoredCredentials() {
        return {
            username: localStorage.getItem('lastAuthUsername'),
            password: localStorage.getItem('lastAuthPassword')
        };
    }

    function saveAuthCredentials(username, password) {
        if (username && password) {
            try {
                localStorage.setItem('lastAuthUsername', username);
                localStorage.setItem('lastAuthPassword', password);
                console.log('Authentication credentials saved successfully');
                return true;
            } catch (error) {
                console.error('Failed to save credentials:', error);
                return false;
            }
        }
        return false;
    }

    // Add isAfter12PM helper function
    function isAfter12PM() {
        const now = new Date();
        return now.getHours() >= 12;
    }
    ////////////////////////////////////////////////////////////////////
})();
