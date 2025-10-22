// Handle sidebar toggle for mobile
document.addEventListener('DOMContentLoaded', function() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function () {
            document.querySelector('.sidebar').classList.toggle('show');
        });
    }

    // Hide sidebar when clicking outside on mobile
    document.addEventListener('click', function (event) {
        const sidebar = document.querySelector('.sidebar');
        const sidebarToggle = document.getElementById('sidebarToggle');

        if (window.innerWidth <= 768) {
            if (sidebar && sidebarToggle && !sidebar.contains(event.target) && !sidebarToggle.contains(event.target)) {
                sidebar.classList.remove('show');
            }
        }
    });
});

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

        if (!response.data || response.data.length === 0) {
            visitsTableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center">No departments found</td>
                </tr>`;
            return;
        }

        response.data.forEach((visit, index) => {
            const row = document.createElement('tr');
            const visitors = (visit.visitor_list || '').split('|').filter(Boolean);

            // Attach modal data
            row.setAttribute('data-department', visit.department_name);
            row.setAttribute('data-visitors', JSON.stringify(visitors));

            // Add click event to row
            row.addEventListener('click', () => {
                showVisitorsModal(row);
            });

            row.style.cursor = 'pointer'; // Visual cue

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

function showVisitorsModal(row) {
    const departmentName = row.getAttribute('data-department');
    const visitorData = JSON.parse(row.getAttribute('data-visitors') || '[]');

    const modalTitle = document.getElementById('visitorModalLabel');
    const modalBody = document.getElementById('visitorModalBody');

    modalTitle.textContent = `Unique Visitors - ${departmentName}`;

    if (visitorData.length === 0) {
        modalBody.innerHTML = `<p class="text-muted">No visitors found for this department.</p>`;
    } else {
        modalBody.innerHTML = `
            <ul class="list-group">
                ${visitorData.map(visitor => `<li class="list-group-item">${visitor}</li>`).join('')}
            </ul>
        `;
    }

    const modal = new bootstrap.Modal(document.getElementById('visitorModal'));
    modal.show();
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
