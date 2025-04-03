let currentPage = 1;
const itemsPerPage = 10;
let userData = [];

// Fetch users data from the server
async function fetchUsers() {
    try {
        // Add loading indicator
        document.getElementById('usersTableBody').innerHTML = 
            '<tr><td colspan="8" class="text-center">Loading...</td></tr>';
        
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
        
        userData = response.data;
        displayUsers();
        updatePagination();
    } catch (error) {
        console.error('Error fetching users:', error);
        document.getElementById('usersTableBody').innerHTML = 
            `<tr><td colspan="8" class="text-center text-danger">
                Error loading users: ${error.message || 'Unknown error'}<br>
                <small>Check console for more details</small>
            </td></tr>`;
    }
}

// Display users in the table
function displayUsers(filteredData = null) {
    const data = filteredData || userData;
    
    // Check if data is an array
    if (!Array.isArray(data)) {
        console.error('Data is not an array:', data);
        document.getElementById('usersTableBody').innerHTML = 
            `<tr><td colspan="8" class="text-center text-danger">
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
            `<tr><td colspan="8" class="text-center">
                No users found
            </td></tr>`;
        return;
    }

    paginatedData.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.user_id || ''}</td>
            <td>${user.name || ''}</td>
            <td>${user.email || ''}</td>
            <td>${user.department || ''}</td>
            <td>${user.course || ''}</td>
            <td>${user.role || ''}</td>
            <td>
                <span class="badge ${user.status === 'Active' ? 'bg-success' : 'bg-danger'}">
                    ${user.status || 'Unknown'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editUser(${user.user_id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.user_id})">
                    <i class="bi bi-trash"></i>
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

// Filter users based on search input
function filterUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredData = userData.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.user_id.toString().includes(searchTerm) ||
        user.department.toLowerCase().includes(searchTerm)
    );
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
        ['User ID', 'Name', 'Email', 'Department', 'Course', 'Role', 'Status'],
        ...userData.map(user => [
            user.user_id,
            user.name,
            user.email,
            user.department,
            user.course,
            user.role,
            user.status
        ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, 'users_report.xlsx');
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();
}); 