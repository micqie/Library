// Add pagination variables at the top of the file
let currentPage = 1;
const entriesPerPage = 10;
let totalPages = 1;

// Function to check if user is logged in
async function checkLoginStatus() {
    try {
        const response = await axios.get('../api/check_session.php');
        console.log('Session check response:', response.data);

        if (!response.data.success) {
            console.error('Session check failed:', response.data.message);
            window.location.href = '../index.html';
            return false;
        }

        return true;
    } catch (error) {
        console.error('Session check error:', error);
        window.location.href = '../index.html';
        return false;
    }
}

// Function to get user details from session
async function getUserDetails() {
    try {
        // Check login status first
        const isLoggedIn = await checkLoginStatus();
        if (!isLoggedIn) {
            return; // checkLoginStatus will handle the redirect
        }

        console.log('Fetching user details...');
        const response = await axios.get('../api/get_user_details.php');
        console.log('User details API Response:', response.data);

        if (response.data.success && response.data.user) {
            const user = response.data.user;
            console.log('User data:', user);

            // Update user information - safely handle missing elements
            const elements = {
                userName: `${user.firstname} ${user.lastname}`,
                userSchoolId: user.schoolId,
                userDepartment: user.department || 'Not specified',
                userPhinmaedEmail: user.phinmaedEmail || 'Not specified',
                userPersonalEmail: user.personalEmail || 'Not specified',
                userContact: user.contact || 'Not specified'
            };

            // Safely update each element
            Object.entries(elements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value;
                } else {
                    console.error(`Element not found: ${id}`);
                }
            });

            // After successfully loading user details, get visit history
            await getVisitHistory();
        } else {
            console.error('API returned error:', response.data.message);
            updateErrorDisplay(response.data.message || 'Error loading user data');
            window.location.href = '../index.html';
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
        if (error.response) {
            console.error('Error response:', error.response.data);
        }
        updateErrorDisplay('Error loading user details');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 2000);
    }
}

// Function to update error display
function updateErrorDisplay(message) {
    console.log('Updating error display with message:', message);
    const elements = ['userName', 'userSchoolId', 'userDepartment',
        'userPhinmaedEmail', 'userPersonalEmail', 'userContact'];

    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = message || 'Error loading data';
        } else {
            console.error(`Element not found while displaying error: ${id}`);
        }
    });
}

// Function to format date
function formatDate(dateString) {
    try {
        // If dateString is already in YYYY-MM-DD format, use it directly
        const [year, month, day] = dateString.split('-');
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting date:', error, dateString);
        return 'Invalid date';
    }
}

// Function to format time
function formatTime(timeString) {
    if (!timeString) return '-';
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

// Function to calculate duration
function calculateDuration(timeIn, timeOut) {
    if (!timeOut) return 'Still inside';
    const inTime = new Date(`1970-01-01T${timeIn}`);
    const outTime = new Date(`1970-01-01T${timeOut}`);
    const diff = outTime - inTime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
}

// Function to get visit history
async function getVisitHistory(page = 1) {
    try {
        const response = await axios.get(`../api/get_visit_history.php?page=${page}&limit=${entriesPerPage}`);
        console.log('Visit history response:', response.data);

        const tbody = document.getElementById('visitHistory');
        const paginationContainer = document.getElementById('visitHistoryPagination');

        if (response.data.success && response.data.data.length > 0) {
            const history = response.data.data;
            totalPages = response.data.pagination.total_pages;
            currentPage = response.data.pagination.current_page;

            // Update table content
            tbody.innerHTML = history.map(visit => {
                console.log('Visit record:', visit); // Debug log
                return `
                    <tr>
                        <td>${formatDate(visit.log_date)}</td>
                        <td>${formatTime(visit.time_in)}</td>
                        <td>${visit.time_out ? formatTime(visit.time_out) : 'Not yet'}</td>
                        <td>${calculateDuration(visit.time_in, visit.time_out)}</td>
                    </tr>
                `;
            }).join('');

            // Update pagination
            updatePagination();
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted">
                        No visit history available
                    </td>
                </tr>
            `;
            if (paginationContainer) {
                paginationContainer.innerHTML = '';
            }
        }
    } catch (error) {
        console.error('Error fetching visit history:', error);
        document.getElementById('visitHistory').innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-danger">
                    Error loading visit history
                </td>
            </tr>
        `;
        const paginationContainer = document.getElementById('visitHistoryPagination');
        if (paginationContainer) {
            paginationContainer.innerHTML = '';
        }
    }
}

// Function to update pagination
function updatePagination() {
    const paginationContainer = document.getElementById('visitHistoryPagination');
    if (!paginationContainer) return;

    let paginationHTML = `
        <div class="d-flex justify-content-between align-items-center mt-3">
            <button class="btn btn-sm btn-secondary" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
                Previous
            </button>
            <div class="pagination-numbers">
    `;

    // Add page numbers
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <button class="btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-outline-secondary'} mx-1" 
                    onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }

    paginationHTML += `
            </div>
            <button class="btn btn-sm btn-secondary" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
                Next
            </button>
        </div>
    `;

    paginationContainer.innerHTML = paginationHTML;
}

// Function to change page
async function changePage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    await getVisitHistory(currentPage);
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
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const isLoggedIn = await checkLoginStatus();
        if (isLoggedIn) {
            await getUserDetails();
        }
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        window.location.href = '../index.html';
    }
});

// Function to show QR Code Modal
function showQRCodeModal() {
    const modalElement = document.getElementById('qrCodeModal');
    const modal = new bootstrap.Modal(modalElement);
    const modalQRCode = document.getElementById('modalQRCode');
    const qrCodeLoading = document.getElementById('qrCodeLoading');
    const downloadButton = document.getElementById('downloadQRCode');

    if (!modalQRCode || !qrCodeLoading || !downloadButton) {
        console.error('Required modal elements not found');
        return;
    }

    // Show loading message and hide other elements
    modalQRCode.innerHTML = '';
    qrCodeLoading.classList.remove('d-none');
    downloadButton.classList.add('d-none');

    // Show the modal
    modal.show();

    // Get user details from session
    axios.get('../api/get_user_details.php')
        .then(response => {
            if (response.data.success) {
                const schoolId = response.data.user.schoolId;
                console.log('School ID:', schoolId);

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

                // Focus the download button when it becomes visible
                downloadButton.focus();
            } else {
                console.error('Failed to get user details for QR code');
                qrCodeLoading.textContent = 'Error generating QR code';
            }
        })
        .catch(error => {
            console.error('Error generating QR code:', error);
            qrCodeLoading.textContent = 'Error generating QR code';
        });

    // Handle modal events for accessibility
    modalElement.addEventListener('shown.bs.modal', function () {
        // Focus the close button when modal opens
        const closeButton = modalElement.querySelector('.btn-close');
        if (closeButton) {
            closeButton.focus();
        }
    });

    modalElement.addEventListener('hidden.bs.modal', function () {
        // Return focus to the generate button when modal closes
        const generateButton = document.querySelector('button[onclick="showQRCodeModal()"]');
        if (generateButton) {
            generateButton.focus();
        }
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