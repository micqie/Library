function loadDashboardStats() {
    const period = document.getElementById('statsPeriod').value;
    
    fetch(`../api/get_stats.php?period=${period}`)
        .then(response => response.json())
        .then(response => {
            if (response.status === 'success') {
                const { totalVisits, activeVisitors, topVisitors } = response.data;
                
                // Update total visits
                document.getElementById('totalVisits').textContent = totalVisits;
                
                // Update active visitors
                document.getElementById('activeVisitors').textContent = activeVisitors;
                
                // Update top visitors list
                const topVisitorsList = document.getElementById('topVisitors');
                topVisitorsList.innerHTML = topVisitors.map(visitor => `
                    <div class="visitor-item">
                        <div class="visitor-info">
                            <p class="visitor-name">${visitor.user_firstname} ${visitor.user_lastname}</p>
                            <p class="visitor-details">${visitor.department_name || 'N/A'} - ${visitor.course_name || 'N/A'}</p>
                        </div>
                        <span class="visit-count">${visitor.visit_count} visits</span>
                    </div>
                `).join('');
            }
        })
        .catch(error => console.error('Error loading stats:', error));
}

// Load stats when period changes
document.getElementById('statsPeriod').addEventListener('change', loadDashboardStats);

// Initial load
document.addEventListener('DOMContentLoaded', loadDashboardStats);

// Refresh stats every 5 minutes
setInterval(loadDashboardStats, 300000); 