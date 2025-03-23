
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

// Function to refresh logs
function refreshLogs() {
    const filter = document.getElementById('dateFilter').value;
    const search = document.getElementById('searchInput').value;
    
    const tableBody = document.getElementById('logsTableBody');
    tableBody.innerHTML = '<tr><td colspan="9" class="text-center">Loading...</td></tr>';
    
    fetch(`/coc_lib/api/fetch_logs.php?filter=${filter}&search=${search}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(response => {
            if (response.status === 'success') {
                if (response.data.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="9" class="text-center">No records found</td></tr>';
                    return;
                }
                tableBody.innerHTML = response.data.map(log => `
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
            } else {
                let errorMessage = response.message || 'Error loading data';
                if (response.debug) {
                    console.error('Debug info:', response.debug);
                    errorMessage += ' (Check console for details)';
                }
                tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">${errorMessage}</td></tr>`;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">Error: ${error.message}</td></tr>`;
        });
}

// Event listeners
document.getElementById('dateFilter').addEventListener('change', refreshLogs);
document.getElementById('searchInput').addEventListener('input', refreshLogs);

// Initial load
refreshLogs();
