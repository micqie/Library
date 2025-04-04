let currentPage = 1;
const itemsPerPage = 10;
let userData = [];

// Fetch users data from the server
async function fetchUsers() {
    try {
        // Add loading indicator
        document.getElementById('usersTableBody').innerHTML =
            '<tr><td colspan="7" class="text-center">Loading...</td></tr>';

        const response = await axios.get('../api/get_users.php');
        console.log('Raw API Response:', response); // Debug log

        if (response.data.error) {
            throw new Error(`Server error: ${response.data.error}\nDetails: ${response.data.details || 'No details provided'}`);
        }

        // Log the actual data
        console.log('Response data:', response.data);

        // Ensure response.data is an array
        if (!Array.isArray(response.data)) {
            console.error('Invalid data format:', response.data);
            throw new Error('Invalid data format received from server. Expected array, got: ' + typeof response.data);
        }

        // Sort the data alphabetically by name
        userData = response.data.sort((a, b) => {
            const nameA = (a.name || '').toLowerCase();
            const nameB = (b.name || '').toLowerCase();
            return nameA.localeCompare(nameB);
        });

        populateFilterDropdowns();
        displayUsers();
        updatePagination();
    } catch (error) {
        console.error('Error fetching users:', error);
        document.getElementById('usersTableBody').innerHTML =
            `<tr><td colspan="7" class="text-center text-danger">
                Error loading users: ${error.message || 'Unknown error'}<br>
                <small>Check console for more details</small>
            </td></tr>`;
    }
}

// Populate filter dropdowns with unique values
function populateFilterDropdowns() {
    // Get unique departments, courses, and roles
    const departments = [...new Set(userData.map(user => user.department).filter(Boolean))].sort();
    const courses = [...new Set(userData.map(user => user.course).filter(Boolean))].sort();
    const roles = [...new Set(userData.map(user => user.role).filter(Boolean))].sort();

    // Populate department dropdown
    const departmentFilter = document.getElementById('departmentFilter');
    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        departmentFilter.appendChild(option);
    });

    // Populate course dropdown
    const courseFilter = document.getElementById('courseFilter');
    courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course;
        option.textContent = course;
        courseFilter.appendChild(option);
    });

    // Populate role dropdown
    const roleFilter = document.getElementById('roleFilter');
    roles.forEach(role => {
        const option = document.createElement('option');
        option.value = role;
        option.textContent = role;
        roleFilter.appendChild(option);
    });
}

// Display users in the table
function displayUsers(filteredData = null) {
    const data = filteredData || userData;

    // Check if data is an array
    if (!Array.isArray(data)) {
        console.error('Data is not an array:', data);
        document.getElementById('usersTableBody').innerHTML =
            `<tr><td colspan="7" class="text-center text-danger">
                Error: Invalid data format received from server
            </td></tr>`;
        return;
    }

    const tableBody = document.getElementById('usersTableBody');
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedData = data.slice(start, end);

    tableBody.innerHTML = '';

    if (paginatedData.length === 0) {
        tableBody.innerHTML =
            `<tr><td colspan="7" class="text-center">
                No users found
            </td></tr>`;
        return;
    }

    paginatedData.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.school_id || 'N/A'}</td>
            <td>${user.name || 'N/A'}</td>
            <td>${user.email || 'N/A'}</td>
            <td>${user.department || 'Not Assigned'}</td>
            <td>${user.course || 'Not Assigned'}</td>
            <td>${user.role || 'User'}</td>
            <td>
                <span class="badge ${user.status === 'active' ? 'bg-success' : 'bg-danger'}">
                    ${user.status || 'active'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm ${user.status === 'active' ? 'btn-danger' : 'btn-success'}" 
                        onclick="${user.status === 'active' ? 'deactivateUser' : 'activateUser'}('${user.school_id}')" 
                        title="${user.status === 'active' ? 'Deactivate User' : 'Activate User'}">
                    <i class="bi ${user.status === 'active' ? 'bi-person-x' : 'bi-person-check'}"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Update pagination info
    document.getElementById('startEntry').textContent = data.length > 0 ? start + 1 : 0;
    document.getElementById('endEntry').textContent = Math.min(end, data.length);
    document.getElementById('totalEntries').textContent = data.length;
}

// Filter users based on search input and dropdowns
function filterUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const selectedDepartment = document.getElementById('departmentFilter').value;
    const selectedCourse = document.getElementById('courseFilter').value;
    const selectedRole = document.getElementById('roleFilter').value;
    const selectedStatus = document.getElementById('statusFilter').value;

    const filteredData = userData.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm) ||
            user.school_id.toString().toLowerCase().includes(searchTerm);

        const matchesDepartment = !selectedDepartment || user.department === selectedDepartment;
        const matchesCourse = !selectedCourse || user.course === selectedCourse;
        const matchesRole = !selectedRole || user.role === selectedRole;
        const matchesStatus = !selectedStatus || user.status === selectedStatus;

        return matchesSearch && matchesDepartment && matchesCourse && matchesRole && matchesStatus;
    });

    currentPage = 1;
    displayUsers(filteredData);
    updatePagination(filteredData.length);
}

// Update pagination controls
function updatePagination(totalItems = userData.length) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageNumbers = document.getElementById('pageNumbers');

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;

    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            displayUsers();
            updatePagination();
        }
    };

    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayUsers();
            updatePagination();
        }
    };

    pageNumbers.textContent = `Page ${currentPage} of ${totalPages}`;
}

// Export table data to Excel
function exportToExcel() {
    const wb = XLSX.utils.book_new();
    const ws_data = [
        ['School ID', 'Name', 'Email', 'Department', 'Course', 'Role'],
        ...userData.map(user => [
            user.school_id,
            user.name,
            user.email,
            user.department,
            user.course,
            user.role
        ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, 'users_report.xlsx');
}

// Replace deleteUser function with deactivateUser and add activateUser
async function deactivateUser(schoolId) {
    if (confirm('Are you sure you want to deactivate this user?')) {
        try {
            const response = await axios.post('../api/update_user_status.php', {
                school_id: schoolId,
                status: 'inactive'
            });

            if (response.data.success) {
                alert('User deactivated successfully');
                fetchUsers(); // Refresh the user list
            } else {
                throw new Error(response.data.message || 'Failed to deactivate user');
            }
        } catch (error) {
            console.error('Error deactivating user:', error);
            alert('Error deactivating user: ' + error.message);
        }
    }
}

async function activateUser(schoolId) {
    if (confirm('Are you sure you want to activate this user?')) {
        try {
            const response = await axios.post('../api/update_user_status.php', {
                school_id: schoolId,
                status: 'active'
            });

            if (response.data.success) {
                alert('User activated successfully');
                fetchUsers(); // Refresh the user list
            } else {
                throw new Error(response.data.message || 'Failed to activate user');
            }
        } catch (error) {
            console.error('Error activating user:', error);
            alert('Error activating user: ' + error.message);
        }
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();
}); 