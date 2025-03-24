let scanner = new Instascan.Scanner({ video: document.getElementById('preview') });

const TIMEOUT_DURATION = 60; // 1 minute in seconds
const COOLDOWN_DURATION = 60; // 1 minute cooldown
let activeUsers = new Map(); // Store active users and their timeouts
let cooldownUsers = new Map(); // Store users in cooldown
let cooldownIntervals = new Map(); // Store cooldown intervals


function showMessage(message, type = 'info', countdown = null) {
    const messageContainer = document.getElementById('messageContainer');
    const messageElement = document.createElement('div');
    messageElement.className = 'message';

    if (countdown) {
        // Create countdown display
        const countdownSpan = document.createElement('span');
        messageElement.textContent = 'Cannot timeout yet. Please wait ';
        messageElement.appendChild(countdownSpan);

        // Start countdown
        let timeLeft = countdown;
        const updateCountdown = () => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            countdownSpan.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            if (timeLeft > 0) {
                timeLeft--;
                setTimeout(updateCountdown, 1000);
            }
        };
        updateCountdown();

        // fade out
        setTimeout(() => {
            messageElement.classList.add('fade-out');
            setTimeout(() => {
                messageElement.remove();
            }, 500);
        }, 5000);
    } else {
        messageElement.textContent = message;
    }

    messageContainer.appendChild(messageElement);

    // Fade out after 5 seconds if not a countdown message
    if (!countdown) {
        setTimeout(() => {
            messageElement.classList.add('fade-out');
            setTimeout(() => {
                messageElement.remove();
            }, 500);
        }, 5000);
    } else {
        // For countdown messages, remove after countdown finishes
        setTimeout(() => {
            messageElement.classList.add('fade-out');
            setTimeout(() => {
                messageElement.remove();
            }, 500);
        }, (countdown + 1) * 1000);
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


function createUserCard(userData, isTimeout = false) {
    const cardId = `user-${Date.now()}`;
    const card = document.createElement('div');
    card.className = 'card user-card';
    card.id = cardId;
    card.setAttribute('data-user-id', userData.user_schoolId);

    const timeIn = userData.time_in || new Date().toLocaleTimeString();
    const timeOut = userData.time_out || '';

    card.innerHTML = `
        <div class="card-header ${isTimeout ? 'bg-danger' : 'bg-success'} text-white">
            <h4 class="mb-0">User Details</h4>
        </div>
        <div class="card-body">
            <div class="user-info">
                <p><strong>Name:</strong> ${userData.user_firstname} ${userData.user_middlename || ''} ${userData.user_lastname} ${userData.user_suffix || ''}</p>
                <p><strong>Email:</strong> ${userData.user_email}</p>
                <p><strong>Contact:</strong> ${userData.user_contact}</p>
                <p><strong>Department:</strong> ${userData.department_name || 'N/A'}</p>
                <p><strong>Course:</strong> ${userData.course_name || 'N/A'}</p>
                <p><strong>Time In:</strong> ${timeIn}</p>
                <p><strong>Time Out:</strong> <span class="countdown">${isTimeout ? timeOut : ''}</span></p>
            </div>
        </div>
    `;

    document.getElementById('activeUsers').appendChild(card);

    if (!isTimeout) {
        // Start countdown for this user
        const countdownElement = card.querySelector('.countdown');
        const timeoutId = setTimeout(() => {
            card.classList.add('timeout');
            countdownElement.textContent = new Date().toLocaleTimeString();
            cooldownUsers.set(userData.user_schoolId, Date.now());
            showCooldownMessage(userData.user_schoolId);

            // Fade out and remove the card after timeout
            setTimeout(() => {
                card.classList.add('fade-out');
                setTimeout(() => {
                    card.remove();
                }, 500);
            }, 5000);
        }, TIMEOUT_DURATION * 1000);

        // Store the timeout ID
        activeUsers.set(cardId, timeoutId);
    }

    return cardId;
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
document.addEventListener('visibilitychange', function() {
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

        console.log('API Response:', response.data);

        if (response.data.user_data) {
            if (response.data.is_timeout) {
                const card = createUserCard(response.data.user_data, true);
                showMessage('Time-out successful!');

                // Fade out the card after timeout
                setTimeout(() => {
                    const cardElement = document.getElementById(card);
                    if (cardElement) {
                        cardElement.classList.add('fade-out');
                        setTimeout(() => {
                            cardElement.remove();
                        }, 500);
                    }
                }, 5000);
            } else {
                const card = createUserCard(response.data.user_data);
                showMessage('Time-in successful!');

                // Fade out the card after successful time-in
                setTimeout(() => {
                    const cardElement = document.getElementById(card);
                    if (cardElement) {
                        cardElement.classList.add('fade-out');
                        setTimeout(() => {
                            cardElement.remove();
                        }, 500);
                    }
                }, 5000);
            }
        } else {
            showMessage('Invalid user ID or no data received.');
        }
    } catch (error) {
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

        console.log('API Response:', response.data);

        if (response.data.user_data) {
            if (response.data.is_timeout) {
                const card = createUserCard(response.data.user_data, true);
                showMessage('Time-out successful!');

                // Fade out the card after timeout
                setTimeout(() => {
                    const cardElement = document.getElementById(card);
                    if (cardElement) {
                        cardElement.classList.add('fade-out');
                        setTimeout(() => {
                            cardElement.remove();
                        }, 500);
                    }
                }, 5000);
            } else {
                const card = createUserCard(response.data.user_data);
                showMessage('Time-in successful!');

                // Fade out the card after successful time-in
                setTimeout(() => {
                    const cardElement = document.getElementById(card);
                    if (cardElement) {
                        cardElement.classList.add('fade-out');
                        setTimeout(() => {
                            cardElement.remove();
                        }, 500);
                    }
                }, 5000);
            }
        } else {
            showMessage('Invalid user ID or no data received.');
        }
    } catch (error) {
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
}

// Add this at the beginning of your script section
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const dateString = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    document.getElementById('clock').textContent = timeString;
    document.getElementById('date').textContent = dateString;
}

// Update clock every second
setInterval(updateClock, 1000);
updateClock(); // Initial call
updateClock(); // Initial call