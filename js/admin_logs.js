// Function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Function to format time
function formatTime(timeString) {
    if (!timeString) return '-';
    return timeString;
}

// Function to calculate duration
function calculateDuration(timeIn, timeOut) {
    if (!timeOut) return 'Active';
    const inTime = new Date(`1970-01-01T${timeIn}`);
    const outTime = new Date(`1970-01-01T${timeOut}`);
    const diff = outTime - inTime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
}

// Function to get full name
function getFullName(firstname, middlename, lastname, suffix) {
    return `${firstname} ${middlename ? middlename + ' ' : ''}${lastname}${suffix ? ' ' + suffix : ''}`;
}

// Add pagination variables
let currentPage = 1;
const entriesPerPage = 10;
let totalEntries = 0;
let allLogs = [];

// Update the refreshLogs function
function refreshLogs() {
    // Reset filters
    document.getElementById('dateFrom').value = '';
    document.getElementById('dateTo').value = '';
    document.getElementById('searchInput').value = '';

    // Show loading state
    const tableBody = document.getElementById('logsTableBody');
    tableBody.innerHTML = '<tr><td colspan="9" class="text-center">Loading...</td></tr>';

    // Load all logs
    fetch('../api/fetch_logs.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Refresh response:', data); // Debug log

            if (data.status === 'success') {
                allLogs = data.data;
                totalEntries = allLogs.length;
                currentPage = 1;
                displayCurrentPage();
                updatePagination();
            } else {
                throw new Error(data.message || 'Failed to load logs');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">
                Error: ${error.message}
            </td></tr>`;
        });
}

function displayCurrentPage() {
    console.log('Displaying page:', currentPage); // Debug log
    console.log('All logs:', allLogs); // Debug log

    const start = (currentPage - 1) * entriesPerPage;
    const end = Math.min(start + entriesPerPage, totalEntries);
    const pageData = allLogs.slice(start, end);

    console.log('Page data:', pageData); // Debug log

    document.getElementById('startEntry').textContent = totalEntries ? start + 1 : 0;
    document.getElementById('endEntry').textContent = end;
    document.getElementById('totalEntries').textContent = totalEntries;

    const tableBody = document.getElementById('logsTableBody');
    if (pageData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="text-center">No records found</td></tr>';
        return;
    }

    const html = pageData.map(log => {
        console.log('Processing log:', log); // Debug log

        const fullName = getFullName(
            log.user_firstname,
            log.user_middlename,
            log.user_lastname,
            log.user_suffix
        );

        const duration = log.time_out ?
            calculateDuration(log.time_in, log.time_out) :
            'Active';

        const status = log.time_out ? 'Completed' : 'Active';
        const statusClass = log.time_out ? 'bg-success' : 'bg-warning';

        return `
            <tr>
                <td>${log.user_schoolId || 'N/A'}</td>
                <td>${fullName}</td>
                <td>${log.department_name || 'N/A'}</td>
                <td>${log.course_name || 'N/A'}</td>
                <td>${formatDate(log.log_date)}</td>
                <td>${formatTime(log.time_in)}</td>
                <td>${formatTime(log.time_out)}</td>
                <td>${duration}</td>
                <td>
                    <span class="badge ${statusClass}">
                        ${status}
                    </span>
                </td>
            </tr>
        `;
    }).join('');

    console.log('Generated HTML:', html); // Debug log
    tableBody.innerHTML = html;
}

function updatePagination() {
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    const pageNumbers = document.getElementById('pageNumbers');

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;

    // Generate page numbers
    let pageNumbersHtml = '';
    for (let i = 1; i <= totalPages; i++) {
        pageNumbersHtml += `<span class="page-number ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</span>`;
    }
    pageNumbers.innerHTML = pageNumbersHtml;
}

function goToPage(page) {
    currentPage = page;
    displayCurrentPage();
    updatePagination();
}

// Add pagination event listeners
document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        goToPage(currentPage - 1);
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    if (currentPage < totalPages) {
        goToPage(currentPage + 1);
    }
});

// Excel export function
function exportToExcel() {
    const filter = document.getElementById('dateFilter').value;
    const currentDate = new Date().toISOString().slice(0, 10);

    // Prepare the data for export
    const exportData = allLogs.map(log => ({
        'Student ID': log.user_schoolId,
        'Name': getFullName(log.user_firstname, log.user_middlename, log.user_lastname, log.user_suffix),
        'Department': log.department_name || 'N/A',
        'Course': log.course_name || 'N/A',
        'Date': formatDate(log.log_date),
        'Time In': formatTime(log.time_in),
        'Time Out': formatTime(log.time_out),
        'Duration': calculateDuration(log.time_in, log.time_out),
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Logs');

    // Generate filename with current date and filter
    const filename = `library_logs_${filter}_${currentDate}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, filename);
}

// Add debounce to search input
let searchTimeout;
document.getElementById('searchInput').addEventListener('input', function () {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        // Implement search functionality here
        console.log('Searching:', this.value);
    }, 300);
});

// Event listeners
document.getElementById('dateFilter').addEventListener('change', refreshLogs);

// Update the initial load function
document.addEventListener('DOMContentLoaded', () => {
    // Set default dates to last 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    document.getElementById('dateFrom').value = startDate.toISOString().split('T')[0];
    document.getElementById('dateTo').value = endDate.toISOString().split('T')[0];

    // Load recent logs
    loadTodayLogs(); // We'll keep the function name but it now loads recent logs

    // Add event listener for the search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                console.log('Searching:', this.value);
            }, 300);
        });
    }
});

// Handle sidebar toggle for mobile
document.getElementById('sidebarToggle')?.addEventListener('click', function () {
    document.querySelector('.sidebar').classList.toggle('show');
});

// Hide sidebar when clicking outside on mobile
document.addEventListener('click', function (event) {
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');

    if (window.innerWidth <= 768) {
        if (!sidebar.contains(event.target) && !sidebarToggle.contains(event.target)) {
            sidebar.classList.remove('show');
        }
    }
});

function filterLogs() {
    const fromDate = document.getElementById('dateFrom').value;
    const toDate = document.getElementById('dateTo').value;

    console.log('Filtering dates:', { fromDate, toDate }); // Debug log

    // Validate dates
    if (!fromDate || !toDate) {
        alert('Please select both from and to dates');
        return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
        alert('From date cannot be later than To date');
        return;
    }

    // Show loading state
    const tableBody = document.getElementById('logsTableBody');
    tableBody.innerHTML = '<tr><td colspan="9" class="text-center">Loading...</td></tr>';

    // Make API request
    fetch('../api/filter_logs.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            fromDate: fromDate,
            toDate: toDate
        })
    })
        .then(async response => {
            const text = await response.text();
            console.log('Raw response:', text); // Debug log

            try {
                if (!text) {
                    throw new Error('Empty response from server');
                }

                const data = JSON.parse(text);
                console.log('Parsed data:', data); // Debug log

                if (!response.ok) {
                    throw new Error(data.message || 'Network response was not ok');
                }

                if (!data || typeof data !== 'object') {
                    throw new Error('Invalid response format');
                }

                return data;
            } catch (e) {
                console.error('Parse error:', e);
                throw new Error(`Failed to parse server response: ${e.message}`);
            }
        })
        .then(data => {
            if (data.status === 'success') {
                allLogs = data.data || [];
                totalEntries = allLogs.length;

                if (totalEntries === 0) {
                    tableBody.innerHTML = '<tr><td colspan="9" class="text-center">No records found for selected date range</td></tr>';
                    return;
                }

                currentPage = 1;
                displayCurrentPage();
                updatePagination();
            } else {
                throw new Error(data.message || 'Failed to filter logs');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">
            Error: ${error.message || 'Failed to load logs'}
        </td></tr>`;
        });
}

// Function to load today's logs
function loadTodayLogs() {
    const tableBody = document.getElementById('logsTableBody');
    tableBody.innerHTML = '<tr><td colspan="9" class="text-center">Loading...</td></tr>';

    console.log('Fetching logs...'); // Debug log

    fetch('../api/fetch_today_logs.php')
        .then(response => {
            console.log('Response status:', response.status); // Debug log
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Received data:', data); // Debug log

            if (data.status === 'success') {
                allLogs = data.data;
                totalEntries = allLogs.length;
                currentPage = 1;

                console.log('Number of logs:', totalEntries); // Debug log

                if (totalEntries === 0) {
                    tableBody.innerHTML = '<tr><td colspan="9" class="text-center">No logs found</td></tr>';
                    return;
                }

                displayCurrentPage();
                updatePagination();
            } else {
                throw new Error(data.message || 'Failed to load logs');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">
                Error: ${error.message || 'Failed to load logs'}
            </td></tr>`;
        });
}
