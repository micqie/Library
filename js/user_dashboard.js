// Function to check if user is logged in
function checkLoginStatus() {
    return axios.get('../api/check_session.php')
        .then(response => response.data.success)
        .catch(() => false);
}

// Function to get user details from session
async function getUserDetails() {
    try {
        // Check login status first
        const isLoggedIn = await checkLoginStatus();
        if (!isLoggedIn) {
            window.location.href = '../index.html';
            return;
        }

        console.log('Fetching user details...');
        const response = await axios.get('../api/get_user_details.php');
        console.log('API Response:', response.data);

        if (response.data.success) {
            const user = response.data.user;
            console.log('User data:', user);

            // Update user information
            const userFullNameElement = document.getElementById('userFullName');
            if (userFullNameElement) {
                userFullNameElement.textContent = `${user.firstname} ${user.lastname}`;
                console.log('Updated userFullName element with:', `${user.firstname} ${user.lastname}`);
            } else {
                console.error('userFullName element not found');
            }

            document.getElementById('userName').textContent = `${user.firstname} ${user.lastname}`;
            document.getElementById('userSchoolId').textContent = user.schoolId;
            document.getElementById('userDepartment').textContent = user.department;
            document.getElementById('userPhinmaedEmail').textContent = user.phinmaedEmail;
            document.getElementById('userPersonalEmail').textContent = user.personalEmail;
            document.getElementById('userContact').textContent = user.contact;

            // Generate QR Code
            generateQRCode(user.schoolId);
        } else {
            console.error('API returned success: false:', response.data.message);
            document.getElementById('userFullName').textContent = 'Error: ' + response.data.message;
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
        document.getElementById('userFullName').textContent = 'Error loading user details';
    }
}

// Function to update error display
function updateErrorDisplay(message) {
    const elements = ['userFullName', 'userName', 'userSchoolId', 'userDepartment',
        'userPhinmaedEmail', 'userPersonalEmail', 'userContact'];

    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = 'Error loading data';
        }
    });
}

// Function to get visit history
async function getVisitHistory() {
    try {
        const response = await axios.get('../api/get_visit_history.php');
        if (response.data.success && response.data.history.length > 0) {
            const history = response.data.history;
            const tbody = document.getElementById('visitHistory');

            tbody.innerHTML = history.map(visit => {
                // Convert MySQL datetime to JavaScript Date object
                const [datePart, timePart] = visit.time_in.split(' ');
                const timeIn = new Date(`${datePart}T${timePart}`);

                let timeOut = null;
                if (visit.time_out) {
                    const [outDatePart, outTimePart] = visit.time_out.split(' ');
                    timeOut = new Date(`${outDatePart}T${outTimePart}`);
                }

                // Format date
                const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
                const formattedDate = timeIn.toLocaleDateString('en-US', dateOptions);

                // Format times
                const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
                const formattedTimeIn = timeIn.toLocaleTimeString('en-US', timeOptions);
                const formattedTimeOut = timeOut ? timeOut.toLocaleTimeString('en-US', timeOptions) : 'Not yet';

                // Calculate duration
                let duration = 'Still inside';
                if (timeOut) {
                    const diff = timeOut - timeIn;
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    duration = `${hours}h ${minutes}m`;
                }

                return `
                    <tr>
                        <td>${formattedDate}</td>
                        <td>${formattedTimeIn}</td>
                        <td>${formattedTimeOut}</td>
                        <td>${duration}</td>
                    </tr>
                `;
            }).join('');
        } else {
            document.getElementById('visitHistory').innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted">
                        No visit history available
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Error fetching visit history:', error);
        document.getElementById('visitHistory').innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted">
                    Error loading visit history
                </td>
            </tr>
        `;
    }
}

// Function to calculate duration
function calculateDuration(timeIn, timeOut) {
    const diff = timeOut - timeIn;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
}

// Function to generate QR Code
function generateQRCode(schoolId) {
    const qrContainer = document.getElementById('qrCode');
    qrContainer.innerHTML = ''; // Clear previous QR code

    new QRCode(qrContainer, {
        text: schoolId,
        width: 200,
        height: 200,
        colorDark: "#004225",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus().then(isLoggedIn => {
        if (isLoggedIn) {
            getUserDetails();
            getVisitHistory();
        } else {
            window.location.href = '../index.html';
        }
    });
});

function fetchVisitHistory() {
    axios.get('../api/get_visit_history.php')
        .then(function (response) {
            const historyData = response.data;
            if (historyData.status === 'success') {
                const visitHistoryTable = document.getElementById('visitHistory');
                visitHistoryTable.innerHTML = ''; // Clear existing content

                historyData.data.forEach(visit => {
                    const row = document.createElement('tr');

                    // Format date
                    const date = new Date(visit.date).toLocaleDateString();

                    // Calculate duration
                    let duration = 'In Progress';
                    if (visit.time_out) {
                        const timeIn = new Date(`${visit.date} ${visit.time_in}`);
                        const timeOut = new Date(`${visit.date} ${visit.time_out}`);
                        const diff = (timeOut - timeIn) / (1000 * 60); // Duration in minutes
                        duration = `${Math.floor(diff)} minutes`;
                    }

                    row.innerHTML = `
                        <td>${date}</td>
                        <td>${visit.time_in}</td>
                        <td>${visit.time_out || 'Not yet'}</td>
                        <td>${duration}</td>
                    `;
                    visitHistoryTable.appendChild(row);
                });
            } else {
                console.error('Error fetching visit history:', historyData.message);
            }
        })
        .catch(function (error) {
            console.error('Error:', error);
        });
}

function generateQRCode() {
    // Get the school ID from the page after it's loaded
    const schoolId = document.getElementById('userSchoolId').textContent;
    if (schoolId && schoolId !== 'Loading...') {
        const qrContainer = document.getElementById('qrCode');
        // Clear previous QR code if any
        qrContainer.innerHTML = '';

        // Generate new QR code
        new QRCode(qrContainer, {
            text: schoolId,
            width: 128,
            height: 128
        });
    } else {
        // If school ID is not yet loaded, wait and try again
        setTimeout(generateQRCode, 1000);
    }
}

// Function to show QR Code Modal
function showQRCodeModal() {
    const modal = new bootstrap.Modal(document.getElementById('qrCodeModal'));
    const modalQRCode = document.getElementById('modalQRCode');
    const qrCodeLoading = document.getElementById('qrCodeLoading');
    const downloadButton = document.getElementById('downloadQRCode');

    // Show loading message and hide other elements
    modalQRCode.innerHTML = '';
    qrCodeLoading.classList.remove('d-none');
    downloadButton.classList.add('d-none');

    // Show the modal
    modal.show();

    // Get user details from session
    axios.get('../api/get_user_details.php')
        .then(response => {
            console.log('API Response:', response.data); // Log the full response
            if (response.data.success) {
                const schoolId = response.data.user.schoolId;
                console.log('School ID:', schoolId); // Log the school ID

                // Clear previous QR code
                modalQRCode.innerHTML = '';

                // Generate new QR code immediately
                new QRCode(modalQRCode, {
                    text: schoolId,
                    width: 200,
                    height: 200,
                    colorDark: "#004225",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });

                // Hide loading message and show download button
                qrCodeLoading.classList.add('d-none');
                downloadButton.classList.remove('d-none');
            } else {
                console.error('API Error:', response.data.message); // Log the error message
                qrCodeLoading.textContent = `Error: ${response.data.message}`;
                qrCodeLoading.classList.remove('d-none');
                downloadButton.classList.add('d-none');
            }
        })
        .catch(error => {
            console.error('Network Error:', error); // Log the full error object
            qrCodeLoading.textContent = `Error: ${error.message || 'Network error occurred'}`;
            qrCodeLoading.classList.remove('d-none');
            downloadButton.classList.add('d-none');
        });
}

// Function to download QR Code
function downloadQRCode() {
    const modalQRCode = document.getElementById('modalQRCode');
    const qrImage = modalQRCode.querySelector('img');

    if (qrImage) {
        // Create a temporary link element
        const link = document.createElement('a');
        link.download = 'library-qr-code.png';
        link.href = qrImage.src;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
} 