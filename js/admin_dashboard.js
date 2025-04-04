// Function to load statistics
function loadStats() {
    console.log('Loading stats...'); // Debug log

    axios.get('../api/get_stats.php')
    .then(response => {
        console.log('Response:', response.data); // Debug log
        
        if (response.data.status === 'success') {
            const { 
                totalVisits, 
                uniqueVisitors,
                activeVisitors,
                peakHour,
                departmentStats, 
                topVisitors 
            } = response.data.data;
            
            // Update total visits
            document.getElementById('totalVisits').innerHTML = `
                ${totalVisits}
                <small class="text-muted d-block">${uniqueVisitors} unique visitors</small>
            `;
            
            // Update active visitors
            document.getElementById('activeVisitors').textContent = activeVisitors;
            
            // Update peak hour
            document.getElementById('avgDuration').innerHTML = `
                ${peakHour || 'No visits yet'}
                <small class="text-muted d-block">Peak hour today</small>
            `;
            
            // Update department stats
            const departmentStatsList = document.getElementById('departmentStats');
            if (departmentStats && departmentStats.length > 0) {
                departmentStatsList.innerHTML = `
                    ${departmentStats.map(dept => `
                        <div class="stat-item">
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="stat-name">${dept.department_name}</span>
                                <span class="badge bg-primary">${dept.total_visits}</span>
                            </div>
                            <small class="text-muted">${dept.unique_visitors} unique visitors</small>
                        </div>
                    `).join('')}
                `;
            } else {
                departmentStatsList.innerHTML = '<div class="text-muted p-3">No department data available</div>';
            }
            
            // Update top visitors
            const topVisitorsList = document.getElementById('topVisitors');
            if (topVisitors && topVisitors.length > 0) {
                topVisitorsList.innerHTML = `
                    ${topVisitors.map(visitor => `
                        <div class="stat-item">
                            <div class="visitor-info">
                                <p class="visitor-name">${visitor.user_firstname} ${visitor.user_lastname}</p>
                                <p class="visitor-details">
                                    <small class="text-muted">
                                        ${visitor.department_name || 'No Department'}<br>
                                        ID: ${visitor.user_schoolId}
                                    </small>
                                </p>
                            </div>
                            <span class="visit-count">${visitor.visit_count} visits</span>
                        </div>
                    `).join('')}
                `;
            } else {
                topVisitorsList.innerHTML = '<div class="text-muted p-3">No visitors data available</div>';
            }
        }
    })
    .catch(error => {
        console.error('Error loading stats:', error);
        // Show error messages in the respective containers
        document.getElementById('totalVisits').textContent = 'Error';
        document.getElementById('activeVisitors').textContent = 'Error';
        document.getElementById('avgDuration').textContent = 'Error';
        document.getElementById('departmentStats').innerHTML = '<div class="text-danger p-3">Failed to load statistics</div>';
        document.getElementById('topVisitors').innerHTML = '<div class="text-danger p-3">Failed to load statistics</div>';
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

// Add event listener for period change
document.getElementById('statsPeriod').addEventListener('change', (e) => {
    loadStats(e.target.value);
});

// Load initial data when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
});

// Refresh stats every 5 minutes
setInterval(loadStats, 300000); 