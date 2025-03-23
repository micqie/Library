// Initialize variables for filtering and pagination
let currentFilter = 'today';
let searchQuery = '';

// Function to format date and time
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

// Function to calculate duration between time in and time out
function calculateDuration(timeIn, timeOut) {
    if (!timeOut) return 'Active';
    
    const start = new Date(`2000/01/01 ${timeIn}`);
    const end = new Date(`2000/01/01 ${timeOut}`);
    const diff = Math.abs(end - start);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    return `${hours}h ${remainingMinutes}m`;
}

// Function to get status badge HTML
function getStatusBadge(timeOut) {
    if (!timeOut) {
        return '<span class="badge bg-success status-badge">Active</span>';
    }
    return '<span class="badge bg-secondary status-badge">Completed</span>';
}

// Function to load logs
async function loadLogs() {
    try {
        const tableBody = document.getElementById('logsTableBody');
        tableBody.innerHTML = '<tr><td colspan="9" class="text-center">Loading...</td></tr>';

        const response = await fetch(`../api/get_logs.php?filter=${currentFilter}&search=${searchQuery}`);
        const data = await response.json();

        if (!data.logs || data.logs.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="9" class="text-center">No records found</td></tr>';
            return;
        }

        tableBody.innerHTML = data.logs.map(log => `
            <tr>
                <td>${log.user_schoolId}</td>
                <td>${log.user_firstname} ${log.user_middlename || ''} ${log.user_lastname} ${log.user_suffix || ''}</td>
                <td>${log.department_name || 'N/A'}</td>
                <td>${log.course_name || 'N/A'}</td>
                <td>${new Date(log.time_in).toLocaleDateString()}</td>
                <td>${new Date(`2000/01/01 ${log.time_in}`).toLocaleTimeString()}</td>
                <td>${log.time_out ? new Date(`2000/01/01 ${log.time_out}`).toLocaleTimeString() : '-'}</td>
                <td>${calculateDuration(log.time_in, log.time_out)}</td>
                <td>${getStatusBadge(log.time_out)}</td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error loading logs:', error);
        tableBody.innerHTML = '<tr><td colspan="9" class="text-center text-danger">Error loading data</td></tr>';
    }
}

// Event listeners
document.getElementById('dateFilter').addEventListener('change', (e) => {
    currentFilter = e.target.value;
    loadLogs();
});

document.getElementById('searchInput').addEventListener('input', (e) => {
    searchQuery = e.target.value;
    // Add debounce to prevent too many requests
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(loadLogs, 500);
});

// Function to refresh logs
function refreshLogs() {
    loadLogs();
}

// Load logs when page loads
document.addEventListener('DOMContentLoaded', loadLogs); 