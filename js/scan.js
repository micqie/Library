let scanner = new Instascan.Scanner({ video: document.getElementById('preview') });

const TIMEOUT_DURATION = 60; // 1 minute in seconds
const COOLDOWN_DURATION = 60; // 1 minute cooldown
let activeUsers = new Map(); // Store active users and their start times
let userTimeouts = new Map(); // Store timeout IDs for each user
let cooldownUsers = new Map(); // Store users in cooldown
let cooldownIntervals = new Map(); // Store cooldown intervals


function showMessage(message, type = 'info', countdown = null) {
    const messageContainer = document.getElementById('messageContainer');
    const messageElement = document.createElement('div');
    messageElement.className = 'message toast-message';

    if (countdown) {
        // Create countdown display
        const countdownSpan = document.createElement('span');
        messageElement.textContent = 'Cannot timeout yet. Please wait ';
        messageElement.appendChild(countdownSpan);

        // Start countdown
        let timeLeft = countdown;
        const updateCountdown = () => {
            if (timeLeft > 0) {
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                countdownSpan.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                timeLeft--;
                setTimeout(updateCountdown, 1000);
            }
        };
        updateCountdown();

        // Add to container and show
        messageContainer.appendChild(messageElement);
        setTimeout(() => messageElement.classList.add('show'), 100);

        // Fade out after 5 seconds while countdown continues
        setTimeout(() => {
            messageElement.classList.remove('show');
            messageElement.classList.add('fade-out');
            setTimeout(() => messageElement.remove(), 500);
        }, 5000);
    } else {
        messageElement.textContent = message;

        // Add to container and show
        messageContainer.appendChild(messageElement);
        setTimeout(() => messageElement.classList.add('show'), 100);

        // Handle removal
        setTimeout(() => {
            messageElement.classList.remove('show');
            messageElement.classList.add('fade-out');
            setTimeout(() => messageElement.remove(), 500);
        }, 5000);
    }
}



function showCooldownMessage(userId) {
    const message = document.getElementById('cooldownMessage');
    const timer = document.getElementById('cooldownTimer');
    message.style.display = 'block';

    let timeLeft = COOLDOWN_DURATION;
    const interval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(interval);
            message.style.display = 'none';
            cooldownUsers.delete(userId);
            cooldownIntervals.delete(userId);
            showMessage('You can now scan again.');
        } else {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        timeLeft--;
    }, 1000);

    cooldownIntervals.set(userId, interval);
}

// Helper function to format time in 12-hour format
function formatTime(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    return `${hours}:${minutes}:${seconds} ${ampm}`;
}

// Update clock function
function updateClock() {
    const now = new Date();
    const timeString = formatTime(now);

    const dateString = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    document.getElementById('clock').textContent = timeString;
    document.getElementById('date').textContent = dateString;
}

// For user card times
function formatTimeTo12Hour(dateStr) {
    if (!dateStr) return '';

    // If it's already a Date object
    if (dateStr instanceof Date) {
        return formatTime(dateStr);
    }

    // Handle string time input (e.g., "20:03:39")
    if (typeof dateStr === 'string') {
        const [hours, minutes, seconds] = dateStr.split(':').map(Number);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12; // Convert 0 to 12
        return `${displayHours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
    }

    return dateStr;
}

function createUserCard(userData, isTimeout = false) {
    const cardId = `user-${Date.now()}`;
    const card = document.createElement('div');
    card.className = 'card user-card';
    card.id = cardId;
    card.setAttribute('data-user-id', userData.user_schoolId);

    // Format the times
    const timeIn = formatTimeTo12Hour(userData.time_in);
    const timeOut = isTimeout ? formatTimeTo12Hour(userData.time_out) : '';

    card.innerHTML = `
        <div class="card-header ${isTimeout ? 'bg-danger' : 'bg-success'} text-white">
            <h4 class="mb-0">${isTimeout ? 'Time Out' : 'Time In'}</h4>
        </div>
        <div class="card-body">
            <div class="user-info">
                <p><strong>Name:</strong> ${userData.user_firstname} ${userData.user_middlename || ''} ${userData.user_lastname} ${userData.user_suffix || ''}</p>
                <p><strong>Email:</strong> ${userData.user_email}</p>
                <p><strong>Contact:</strong> ${userData.user_contact}</p>
                <p><strong>Department:</strong> ${userData.department_name || 'N/A'}</p>
                <p><strong>Course:</strong> ${userData.course_name || 'N/A'}</p>
                <p><strong>Time In:</strong> ${timeIn}</p>
                ${isTimeout ? `<p><strong>Time Out:</strong> ${timeOut}</p>` : ''}
            </div>
        </div>
    `;

    document.getElementById('activeUsers').appendChild(card);

    // Always fade out after 5 seconds, regardless of time-in or time-out
    setTimeout(() => {
        card.classList.add('fade-out');
        setTimeout(() => {
            card.remove();
        }, 500);
    }, 5000);

    // Only set up timeout tracking for time-in cards
    if (!isTimeout) {
        // Store user's start time
        const startTime = Date.now();
        activeUsers.set(userData.user_schoolId, startTime);

        // Set timeout for 1 minute
        const timeoutId = setTimeout(() => {
            handleTimeout(userData.user_schoolId, card);
        }, TIMEOUT_DURATION * 1000);

        userTimeouts.set(userData.user_schoolId, timeoutId);
    }

    return cardId;
}

function handleTimeout(userId, card) {
    // Clear the timeout
    const timeoutId = userTimeouts.get(userId);
    if (timeoutId) {
        clearTimeout(timeoutId);
        userTimeouts.delete(userId);
    }

    // Remove from active users
    activeUsers.delete(userId);


}

// Update the scanner initialization code
Instascan.Camera.getCameras().then(function (cameras) {
    if (cameras.length > 0) {
        // Try to get the back camera first
        const backCamera = cameras.find(camera => camera.name.toLowerCase().includes('back'));
        const selectedCamera = backCamera || cameras[0];

        scanner.start(selectedCamera).then(() => {
            console.log('Scanner started successfully');
            showMessage('Scanner ready. Please scan your QR code.');
        }).catch(function (e) {
            console.error('Failed to start scanner:', e);
            showMessage('Failed to start scanner. Please refresh the page or check camera permissions.');
        });
    } else {
        console.error('No cameras found.');
        showMessage('No cameras found. Please check if your device has a camera.');

        // Make manual input more prominent when camera is not available
        const manualInput = document.getElementById('user_schoolId');
        if (manualInput) {
            manualInput.placeholder = 'No camera detected. Please enter ID manually';
        }
    }
}).catch(function (e) {
    console.error('Error accessing cameras:', e);
    showMessage('Camera access denied. Please check your browser permissions and ensure your camera is connected.');

    // Make manual input more prominent when camera access fails
    const manualInput = document.getElementById('user_schoolId');
    if (manualInput) {
        manualInput.placeholder = 'Camera access failed. Please enter ID manually';
    }
});


// Add error handling to the scanner
scanner.addListener('scan-error', function (error) {
    console.error('Scan error:', error);
    showMessage('Scan error occurred. Please try again.');
});

// Update the scan listener to be more robust
scanner.addListener('scan', function (content) {
    if (content && content.trim()) {
        handleScan(content.trim());
    } else {
        showMessage('Invalid QR code. Please try again.');
    }
});

// Add a function to handle scanner restart
function restartScanner() {
    scanner.stop().then(() => {
        Instascan.Camera.getCameras().then(function (cameras) {
            if (cameras.length > 0) {
                const backCamera = cameras.find(camera => camera.name.toLowerCase().includes('back'));
                const selectedCamera = backCamera || cameras[0];

                scanner.start(selectedCamera).then(() => {
                    console.log('Scanner restarted successfully');
                    showMessage('Scanner restarted. Please try scanning again.');
                }).catch(function (e) {
                    console.error('Failed to restart scanner:', e);
                    showMessage('Failed to restart scanner. Please refresh the page.');
                });
            }
        });
    });
}

// Add event listener for visibility change to handle tab switching
document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
        restartScanner();
    }
});

// Add a new function to handle manual entry separately
async function handleManualEntry(schoolId) {
    try {
        const response = await axios.post('./api/time_in.php', {
            user_schoolId: schoolId,
            is_manual: true
        });

        handleApiResponse(response);
    } catch (error) {
        handleApiError(error);
    }
}

// Update the manual entry event listener to use the new function
const schoolIdInput = document.getElementById('user_schoolId');
schoolIdInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        const schoolId = e.target.value.trim();
        if (schoolId) {
            handleManualEntry(schoolId);  // Use handleManualEntry instead of handleScan
            schoolIdInput.value = '';
        }
    }
});

// Keep the original handleScan function for QR scanning
async function handleScan(schoolId) {
    try {
        const response = await axios.post('./api/time_in.php', {
            user_schoolId: schoolId,
            is_manual: false
        });

        handleApiResponse(response);
    } catch (error) {
        handleApiError(error);
    }
}

// Update handleApiResponse to check for existing sessions
function handleApiResponse(response) {
    console.log('API Response:', response.data);

    if (response.data.user_data) {
        const userId = response.data.user_data.user_schoolId;

        // Check if user already has an active session
        if (activeUsers.has(userId)) {
            const startTime = activeUsers.get(userId);
            const elapsedTime = (Date.now() - startTime) / 1000;

            if (elapsedTime < TIMEOUT_DURATION) {
                // User still has an active session
                showMessage('You already have an active session');
                return;
            }
        }

        if (response.data.is_timeout) {
            const card = createUserCard(response.data.user_data, true);
            showMessage('Time-out successful!');
            // Fade out timeout card after 5 seconds (same as time-in)
            setTimeout(() => {
                card.classList.add('fade-out');
                setTimeout(() => {
                    card.remove();
                }, 500);
            }, 5000);
        } else {
            const card = createUserCard(response.data.user_data);
            showMessage('Time-in successful!');
            // Time-in card fade out is handled in createUserCard
        }
        updateTitleWithFade(response.data.user_data);
    } else {
        showMessage('Invalid user ID or no data received.');
    }
}

// Helper function to handle API errors
function handleApiError(error) {
    console.error('API Error Details:', {
        message: error.message,
        response: error.response,
        request: error.request
    });

    if (error.response?.data?.is_early_timeout) {
        const remainingSeconds = error.response.data.remaining_seconds;
        showMessage('', 'info', remainingSeconds);
    } else if (error.response?.data?.error) {
        showMessage(error.response.data.error);
    } else {
        showMessage('Invalid user ID. Please try again.');
    }
}

// Start the clock update
setInterval(updateClock, 1000);
updateClock(); // Initial call

// Configure Axios defaults if needed
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Add Axios interceptor for common error handling
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 404) {
            showMessage('Resource not found. Please try again.');
        } else if (error.response?.status === 500) {
            showMessage('Server error. Please try again later.');
        }
        return Promise.reject(error);
    }
);

// Function to update title text with fade effect
function updateTitleWithFade(userData) {
    const titleText = document.getElementById('titleText');

    // Fade out
    titleText.classList.add('fade-out');

    // Wait for fade out to complete then update text and fade in
    setTimeout(() => {
        // Create full name with middle name and suffix if they exist
        const fullName = `${userData.user_firstname} ${userData.user_middlename || ''} ${userData.user_lastname} ${userData.user_suffix || ''}`.trim();
        titleText.textContent = fullName || 'Library Attendance Monitoring System';
        titleText.classList.remove('fade-out');
        titleText.classList.add('fade-in');

        // Reset after 3 seconds
        if (fullName) {
            setTimeout(() => {
                titleText.classList.add('fade-out');
                setTimeout(() => {
                    titleText.textContent = 'Library Attendance Monitoring System';
                    titleText.classList.remove('fade-out');
                    titleText.classList.add('fade-in');
                }, 500);
            }, 3000);
        }
    }, 500);
}