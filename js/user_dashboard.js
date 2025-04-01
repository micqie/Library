// Function to get user details from session
async function getUserDetails() {
    try {
        const response = await axios.get('../api/get_user_details.php');
        if (response.data.success) {
            const user = response.data.user;
            
            // Update user information
            document.getElementById('userFullName').textContent = `${user.firstname} ${user.lastname}`;
            document.getElementById('userName').textContent = `${user.firstname} ${user.lastname}`;
            document.getElementById('userSchoolId').textContent = user.schoolId;
            document.getElementById('userDepartment').textContent = user.department;
            document.getElementById('userEmail').textContent = user.phinmaedEmail;
            document.getElementById('userContact').textContent = user.contact;

            // Generate QR Code
            generateQRCode(user.schoolId);
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
    }
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
    getUserDetails();
    getVisitHistory();
});

function fetchUserDetails() {
    axios.get('../api/get_user_details.php')
        .then(function(response) {
            const userData = response.data;
            if (userData.status === 'success') {
                // Update user profile information
                document.getElementById('userFullName').textContent = userData.data.full_name;
                document.getElementById('userName').textContent = userData.data.full_name;
                document.getElementById('userSchoolId').textContent = userData.data.school_id;
                document.getElementById('userDepartment').textContent = userData.data.department;
                document.getElementById('userEmail').textContent = userData.data.email;
                document.getElementById('userContact').textContent = userData.data.contact;
            } else {
                console.error('Error fetching user details:', userData.message);
            }
        })
        .catch(function(error) {
            console.error('Error:', error);
        });
}

function fetchVisitHistory() {
    axios.get('../api/get_visit_history.php')
        .then(function(response) {
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
        .catch(function(error) {
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