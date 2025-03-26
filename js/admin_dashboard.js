// Function to load statistics
function loadStats(period = 'today') {
    axios.get(`../api/get_stats.php`, {
        params: { period: period }
    })
    .then(response => {
        if (response.data.status === 'success') {
            const { totalVisits, activeVisitors, departmentStats } = response.data.data;
            
            // Update total visits
            document.getElementById('totalVisits').textContent = totalVisits;
            
            // Update active visitors
            document.getElementById('activeVisitors').textContent = activeVisitors;
            
            // Update department stats list
            const topVisitorsList = document.getElementById('topVisitors');
            topVisitorsList.innerHTML = departmentStats.map(dept => `
                <div class="visitor-item">
                    <div class="visitor-info">
                        <p class="visitor-name">${dept.department_name}</p>
                        <p class="visitor-details">${dept.unique_visitors} unique visitors</p>
                    </div>
                    <span class="visit-count">${dept.visit_count} visits</span>
                </div>
            `).join('');
        }
    })
    .catch(error => {
        console.error('Error loading stats:', error);
        // You might want to show an error message to the user
        const topVisitorsList = document.getElementById('topVisitors');
        topVisitorsList.innerHTML = '<div class="error-message">Failed to load statistics</div>';
    });
}

// Configure Axios defaults if needed
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Add Axios interceptor for common error handling
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 404) {
            console.error('Resource not found');
        } else if (error.response?.status === 500) {
            console.error('Server error');
        }
        return Promise.reject(error);
    }
);

// You can also add an async/await version if you prefer
async function loadStatsAsync(period = 'today') {
    try {
        const response = await axios.get(`../api/get_stats.php`, {
            params: { period: period }
        });

        if (response.data.status === 'success') {
            const { totalVisits, activeVisitors, departmentStats } = response.data.data;
            
            document.getElementById('totalVisits').textContent = totalVisits;
            document.getElementById('activeVisitors').textContent = activeVisitors;
            
            const topVisitorsList = document.getElementById('topVisitors');
            topVisitorsList.innerHTML = departmentStats.map(dept => `
                <div class="visitor-item">
                    <div class="visitor-info">
                        <p class="visitor-name">${dept.department_name}</p>
                        <p class="visitor-details">${dept.unique_visitors} unique visitors</p>
                    </div>
                    <span class="visit-count">${dept.visit_count} visits</span>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading stats:', error);
        const topVisitorsList = document.getElementById('topVisitors');
        topVisitorsList.innerHTML = '<div class="error-message">Failed to load statistics</div>';
    }
}

// Load stats when period changes
document.getElementById('statsPeriod').addEventListener('change', loadStats);

// Initial load
document.addEventListener('DOMContentLoaded', loadStats);

// Refresh stats every 5 minutes
setInterval(loadStats, 300000); 