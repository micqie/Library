
let currentPage = 1;
const entriesPerPage = 10;
let totalPages = 1;

// Check Login Status
async function checkLoginStatus() {
    try {
        const response = await axios.get('../api/check_session.php');

        if (!response.data.success) {
            window.location.href = '../index.html';
            return false;
        }

        return true;
    } catch (error) {
        window.location.href = '../index.html';
        return false;
    }
}

// Get User Details
async function getUserDetails() {
    try {
        const isLoggedIn = await checkLoginStatus();
        if (!isLoggedIn) {
            return;
        }

        const response = await axios.get('../api/get_user_details.php');

        if (response.data.success && response.data.user) {
            const user = response.data.user;

            const elements = {
                userName: `${user.firstname} ${user.lastname}`,
                userSchoolId: user.schoolId,
                userDepartment: user.department || 'Not specified',
                userCourse: user.course || 'Not specified',
                userPhinmaedEmail: user.phinmaedEmail || 'Not specified',
                userPersonalEmail: user.personalEmail || 'Not specified',
                userContact: user.contact || 'Not specified'
            };

            Object.entries(elements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value;
                }
            });

            await getVisitHistory();
        } else {
            updateErrorDisplay(response.data.message || 'Error loading user data');
            window.location.href = '../index.html';
        }
    } catch (error) {
        updateErrorDisplay('Error loading user details');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 2000);
    }
}

// Error display
function updateErrorDisplay(message) {
    const elements = ['userName', 'userSchoolId', 'userDepartment',
        'userCourse', 'userPhinmaedEmail', 'userPersonalEmail', 'userContact'];

    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = message || 'Error loading data';
        }
    });
}

// Format Date
function formatDate(dateString) {
    try {
        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return 'Invalid date';
        }

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC'
        });
    } catch (error) {
        return 'Invalid date';
    }
}

// Format Time
function formatTime(timeString) {
    if (!timeString) return '-';
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

// Calculate Duration
function calculateDuration(timeIn, timeOut) {
    if (!timeOut) return 'Still inside';
    const inTime = new Date(`1970-01-01T${timeIn}`);
    const outTime = new Date(`1970-01-01T${timeOut}`);
    const diff = outTime - inTime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
}

// Get Visit History
async function getVisitHistory(page = 1) {
    try {
        const response = await axios.get(`../api/get_visit_history.php?page=${page}&limit=${entriesPerPage}`);

        const tbody = document.getElementById('visitHistory');
        const paginationContainer = document.getElementById('visitHistoryPagination');

        if (response.data.success && response.data.data.length > 0) {
            const history = response.data.data;
            totalPages = response.data.pagination.total_pages;
            currentPage = response.data.pagination.current_page;

            // Update table content
            tbody.innerHTML = history.map(visit => `
                <tr>
                    <td>${formatDate(visit.log_date)}</td>
                    <td>${formatTime(visit.time_in)}</td>
                    <td>${visit.time_out ? formatTime(visit.time_out) : 'Not yet'}</td>
                    <td>${calculateDuration(visit.time_in, visit.time_out)}</td>
                </tr>
            `).join('');

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

// Update Pagination
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

// Change Page
async function changePage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    await getVisitHistory(currentPage);
}

// Generate QR Code
function generateQRCode(schoolId) {
    const qrContainer = document.getElementById('qrCode');
    qrContainer.innerHTML = '';

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
        window.location.href = '../index.html';
    }
});

// Show QR Code Modal
function showQRCodeModal() {
    const modalElement = document.getElementById('qrCodeModal');
    const modal = new bootstrap.Modal(modalElement);
    const modalQRCode = document.getElementById('modalQRCode');
    const qrCodeLoading = document.getElementById('qrCodeLoading');
    const downloadButton = document.getElementById('downloadQRCode');

    if (!modalQRCode || !qrCodeLoading || !downloadButton) {
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
                qrCodeLoading.textContent = 'Error generating QR code';
            }
        })
        .catch(() => {
            qrCodeLoading.textContent = 'Error generating QR code';
        });

    // Handle modal events for accessibility
    modalElement.addEventListener('shown.bs.modal', function () {
        const closeButton = modalElement.querySelector('.btn-close');
        if (closeButton) {
            closeButton.focus();
        }
    });

    modalElement.addEventListener('hidden.bs.modal', function () {
        const generateButton = document.querySelector('button[onclick="showQRCodeModal()"]');
        if (generateButton) {
            generateButton.focus();
        }
    });
}

// Download QR Code
function downloadQRCode() {
    const modalQRCode = document.getElementById('modalQRCode');
    const qrImage = modalQRCode.querySelector('img');

    if (qrImage) {
        const link = document.createElement('a');
        link.download = 'library-qr-code.png';
        link.href = qrImage.src;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Show Edit Profile Modal
async function showEditProfileModal() {
    try {
        const response = await axios.get('../api/get_user_details.php');
        if (response.data.success && response.data.user) {
            const user = response.data.user;

            document.getElementById('editFirstName').value = user.firstname;
            document.getElementById('editLastName').value = user.lastname;
            document.getElementById('editPersonalEmail').value = user.personalEmail;
            document.getElementById('editContact').value = user.contact;

            const modal = new bootstrap.Modal(document.getElementById('editProfileModal'));
            modal.show();
        }
    } catch (error) {
        alert('Error loading profile data. Please try again.');
    }
}

// Save Profile Changes
async function saveProfileChanges() {
    try {
        const firstName = document.getElementById('editFirstName').value;
        const lastName = document.getElementById('editLastName').value;
        const personalEmail = document.getElementById('editPersonalEmail').value;
        const contact = document.getElementById('editContact').value;

        if (!firstName || !lastName || !personalEmail || !contact) {
            alert('Please fill in all fields');
            return;
        }

        const response = await axios.post('../api/update_profile.php', {
            firstname: firstName,
            lastname: lastName,
            personal_email: personalEmail,
            contact: contact
        });

        if (response.data.success) {
            await getUserDetails();

            const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
            modal.hide();

            alert('Profile updated successfully');
        } else {
            alert(response.data.message || 'Error updating profile');
        }
    } catch (error) {
        alert('Error updating profile. Please try again.');
    }
} 