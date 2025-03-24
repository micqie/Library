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
    const filter = document.getElementById('dateFilter').value;
    const search = document.getElementById('searchInput').value;
    
    const tableBody = document.getElementById('logsTableBody');
    tableBody.innerHTML = '<tr><td colspan="9" class="text-center">Loading...</td></tr>';
    
    fetch('../api/fetch_logs.php?filter=' + filter + '&search=' + encodeURIComponent(search))
        .then(response => response.json())
        .then(response => {
            if (response.status === 'success') {
                allLogs = response.data;
                totalEntries = allLogs.length;
                displayCurrentPage();
                updatePagination();
            } else {
                console.error('Server response error:', response);
                tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">Error loading data</td></tr>`;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">Error: ${error.message}</td></tr>`;
        });
}

function displayCurrentPage() {
    const start = (currentPage - 1) * entriesPerPage;
    const end = Math.min(start + entriesPerPage, totalEntries);
    const pageData = allLogs.slice(start, end);
    
    document.getElementById('startEntry').textContent = totalEntries ? start + 1 : 0;
    document.getElementById('endEntry').textContent = end;
    document.getElementById('totalEntries').textContent = totalEntries;

    const tableBody = document.getElementById('logsTableBody');
    if (pageData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="text-center">No records found</td></tr>';
        return;
    }

    tableBody.innerHTML = pageData.map(log => `
        <tr>
            <td>${log.user_schoolId}</td>
            <td>${getFullName(log.user_firstname, log.user_middlename, log.user_lastname, log.user_suffix)}</td>
            <td>${log.department_name || 'N/A'}</td>
            <td>${log.course_name || 'N/A'}</td>
            <td>${formatDate(log.log_date)}</td>
            <td>${formatTime(log.time_in)}</td>
            <td>${formatTime(log.time_out)}</td>
            <td>${calculateDuration(log.time_in, log.time_out)}</td>
            <td>
                <span class="badge ${log.time_out ? 'bg-success' : 'bg-warning'} status-badge">
                    ${log.time_out ? 'Completed' : 'Active'}
                </span>
            </td>
        </tr>
    `).join('');
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
document.getElementById('searchInput').addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(refreshLogs, 300);
});

// Event listeners
document.getElementById('dateFilter').addEventListener('change', refreshLogs);

// Initial load
document.addEventListener('DOMContentLoaded', refreshLogs);

// Handle sidebar toggle for mobile
document.getElementById('sidebarToggle')?.addEventListener('click', function() {
    document.querySelector('.sidebar').classList.toggle('show');
});

// Hide sidebar when clicking outside on mobile
document.addEventListener('click', function(event) {
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    if (window.innerWidth <= 768) {
        if (!sidebar.contains(event.target) && !sidebarToggle.contains(event.target)) {
            sidebar.classList.remove('show');
        }
    }
});
