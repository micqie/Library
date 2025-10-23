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

// Function to sort logs by date and time in descending order
function sortLogs(logs) {
    return logs.sort((a, b) => {
        // First compare dates
        const dateCompare = new Date(b.log_date) - new Date(a.log_date);
        if (dateCompare !== 0) return dateCompare;

        // If dates are the same, compare time_in
        return new Date(`1970-01-01T${b.time_in}`) - new Date(`1970-01-01T${a.time_in}`);
    });
}

// Function to filter logs by status
function filterByStatus(logs) {
    const statusFilter = document.getElementById('statusFilter').value;
    if (statusFilter === 'all') return logs;

    return logs.filter(log => {
        if (statusFilter === 'active') {
            return !log.time_out;
        } else if (statusFilter === 'completed') {
            return log.time_out;
        }
        return true;
    });
}

// Function to filter logs by department
function filterByDepartment(logs) {
    const departmentFilter = document.getElementById('departmentFilter').value;
    if (departmentFilter === 'all') return logs;

    return logs.filter(log => {
        const department = (log.department_name || '').toLowerCase();
        return department.includes(departmentFilter.toLowerCase());
    });
}

// Function to filter logs by search term
function filterBySearch(logs) {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    if (!searchTerm) return logs;

    return logs.filter(log => {
        const fullName = getFullName(
            log.user_firstname || '',
            log.user_middlename || '',
            log.user_lastname || '',
            log.user_suffix || ''
        ).toLowerCase();

        const studentId = (log.user_schoolId || '').toLowerCase();

        return fullName.includes(searchTerm) || studentId.includes(searchTerm);
    });
}

// Update the refreshLogs function
function refreshLogs() {
    // Reset filters
    document.getElementById('dateFrom').value = '';
    document.getElementById('dateTo').value = '';
    document.getElementById('searchInput').value = '';

    // Show loading state
    const tableBody = document.getElementById('logsTableBody');
    tableBody.innerHTML = '<tr><td colspan="9" class="text-center">Loading...</td></tr>';

    // Load all logs using Axios
    axios.get('../api/fetch_logs.php')
        .then(response => {
            if (response.data.status === 'success') {
                allLogs = sortLogs(response.data.data);
                totalEntries = allLogs.length;
                currentPage = 1;
                displayCurrentPage();
                updatePagination();
            } else {
                throw new Error(response.data.message || 'Failed to load logs');
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
    // Apply all filters in sequence
    const statusFilteredLogs = filterByStatus(allLogs);
    const departmentFilteredLogs = filterByDepartment(statusFilteredLogs);
    const searchFilteredLogs = filterBySearch(departmentFilteredLogs);
    const start = (currentPage - 1) * entriesPerPage;
    const end = Math.min(start + entriesPerPage, searchFilteredLogs.length);
    const pageData = searchFilteredLogs.slice(start, end);

    document.getElementById('startEntry').textContent = searchFilteredLogs.length ? start + 1 : 0;
    document.getElementById('endEntry').textContent = end;
    document.getElementById('totalEntries').textContent = searchFilteredLogs.length;

    const tableBody = document.getElementById('logsTableBody');
    if (pageData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="text-center">No records found</td></tr>';
        return;
    }

    const html = pageData.map(log => {
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
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', function () {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            // Implement search functionality here
            console.log('Searching:', this.value);
        }, 300);
    });
}

// Update the initial load function
document.addEventListener('DOMContentLoaded', () => {
    // Event listeners
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) {
        dateFilter.addEventListener('change', function () {
            const filterValue = this.value;
            switch (filterValue) {
                case 'recent':
                    loadTodayLogs(); // This function already loads recent records
                    break;
                case 'today':
                    loadTodayOnlyLogs();
                    break;
                case 'all':
                    refreshLogs();
                    break;
            }
        });
    }
    // Get current date in local timezone
    const now = new Date();
    const currentDate = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });

    // Set both dates to current date
    document.getElementById('dateFrom').value = currentDate;
    document.getElementById('dateTo').value = currentDate;

    // Set initial filter values
    document.getElementById('dateFilter').value = 'recent';
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('departmentFilter').value = 'all';

    // Load recent logs initially
    loadTodayLogs();

    // Add event listeners
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentPage = 1; // Reset to first page when search changes
                displayCurrentPage();
                updatePagination();
            }, 300);
        });
    }

    // Add status filter event listener
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function () {
            currentPage = 1; // Reset to first page when filter changes
            displayCurrentPage();
            updatePagination();
        });
    }

    // Add department filter event listener
    const departmentFilter = document.getElementById('departmentFilter');
    if (departmentFilter) {
        departmentFilter.addEventListener('change', function () {
            currentPage = 1; // Reset to first page when filter changes
            displayCurrentPage();
            updatePagination();
        });
    }
    // Handle sidebar toggle for mobile
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function () {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.toggle('show');
            }
        });
    }
});

// Hide sidebar when clicking outside on mobile
document.addEventListener('click', function (event) {
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');

    if (window.innerWidth <= 768 && sidebar && sidebarToggle) {
        if (!sidebar.contains(event.target) && !sidebarToggle.contains(event.target)) {
            sidebar.classList.remove('show');
        }
    }
});

function filterLogs() {
    const fromDate = document.getElementById('dateFrom').value;
    const toDate = document.getElementById('dateTo').value;

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

    // Make API request using Axios
    axios.post('../api/filter_logs.php', {
        fromDate: fromDate,
        toDate: toDate
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
        .then(response => {
            if (response.data.status === 'success') {
                allLogs = sortLogs(response.data.data || []);
                totalEntries = allLogs.length;

                if (totalEntries === 0) {
                    tableBody.innerHTML = '<tr><td colspan="9" class="text-center">No records found for selected date range</td></tr>';
                    return;
                }

                currentPage = 1;
                displayCurrentPage();
                updatePagination();
            } else {
                throw new Error(response.data.message || 'Failed to filter logs');
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

    // Get current date in local timezone
    const now = new Date();
    const currentDate = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });

    axios.get('../api/fetch_today_logs.php')
        .then(response => {
            if (response.data.status === 'success') {
                allLogs = sortLogs(response.data.data);
                totalEntries = allLogs.length;
                currentPage = 1;

                if (totalEntries === 0) {
                    tableBody.innerHTML = '<tr><td colspan="9" class="text-center">No logs found</td></tr>';
                    return;
                }

                displayCurrentPage();
                updatePagination();
            } else {
                throw new Error(response.data.message || 'Failed to load logs');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">
                Error: ${error.message || 'Failed to load logs'}
            </td></tr>`;
        });
}

// Function to load today's logs only
function loadTodayOnlyLogs() {
    const tableBody = document.getElementById('logsTableBody');
    tableBody.innerHTML = '<tr><td colspan="9" class="text-center">Loading...</td></tr>';

    // Get current date in local timezone
    const now = new Date();
    const currentDate = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });

    axios.post('../api/filter_logs.php', {
        fromDate: currentDate,
        toDate: currentDate
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
        .then(response => {
            if (response.data.status === 'success') {
                allLogs = sortLogs(response.data.data || []);
                totalEntries = allLogs.length;
                currentPage = 1;

                if (totalEntries === 0) {
                    tableBody.innerHTML = '<tr><td colspan="9" class="text-center">No logs found for today</td></tr>';
                    return;
                }

                displayCurrentPage();
                updatePagination();
            } else {
                throw new Error(response.data.message || 'Failed to load logs');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">
                Error: ${error.message || 'Failed to load logs'}
            </td></tr>`;
        });
}

// Function to handle batch timeout
async function batchTimeout() {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to timeout all active users? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, timeout all',
        cancelButtonText: 'Cancel'
    });

    // ✅ This replaces the confirm() logic
    if (!result.isConfirmed) return;

    const tableBody = document.getElementById('logsTableBody');
    tableBody.innerHTML = '<tr><td colspan="9" class="text-center">Processing batch timeout...</td></tr>';

    try {
        const response = await axios.post('../api/batch_timeout.php', {}, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (response.data.status === 'success') {
            await Swal.fire('Success', response.data.message, 'success');
            refreshLogs();
        } else {
            throw new Error(response.data.message || 'Unknown error occurred');
        }
    } catch (error) {
        console.error('Operation failed:', error);
        await Swal.fire('Error', `Failed to process batch timeout: ${error.message}`, 'error');
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-danger">
                    Failed to process batch timeout: ${error.message}
                </td>
            </tr>`;
    }
}
