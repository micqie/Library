async function loadDepartmentVisits(startDate = '', endDate = '') {
    try {
        const visitsTableBody = document.getElementById('departmentVisitsTable');
        visitsTableBody.innerHTML = '<tr><td colspan="4" class="text-center">Loading...</td></tr>';

        const response = await axios.get('../api/get_department_visits.php', {
            params: {
                start_date: startDate,
                end_date: endDate
            }
        });

        visitsTableBody.innerHTML = '';

        // Debug: Log the response
        console.log('API Response:', response.data);

        if (!response.data || response.data.length === 0) {
            visitsTableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center">No departments found</td>
                </tr>`;
            return;
        }

        response.data.forEach((visit, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <span class="badge ${index < 3 ? 'bg-success' : 'bg-secondary'}">#${index + 1}</span>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="bi bi-building me-2"></i>
                        <strong>${visit.department_name || 'Unknown Department'}</strong>
                    </div>
                </td>
                <td>
                    <span class="badge bg-primary">${visit.visit_count || 0} visits</span>
                </td>
                <td>
                    <span class="badge bg-info">${visit.unique_visitors || 0} visitors</span>
                </td>
            `;
            visitsTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching department visits:', error);
        console.error('Error details:', error.response?.data);

        const visitsTableBody = document.getElementById('departmentVisitsTable');
        visitsTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Error loading department visits: ${error.response?.data?.message || error.message}
                </td>
            </tr>
        `;
    }
}

function filterVisits() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (endDate && startDate > endDate) {
        alert('Start date cannot be later than end date');
        return;
    }

    loadDepartmentVisits(startDate, endDate);
}

document.addEventListener('DOMContentLoaded', () => {
    loadDepartmentVisits();
}); 