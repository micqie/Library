
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

let currentPage = 1;
const itemsPerPage = 10;
let userData = [];

async function fetchUsers() {
    try {
        document.getElementById('usersTableBody').innerHTML =
            '<tr><td colspan="7" class="text-center">Loading...</td></tr>';

        const response = await axios.get('../api/get_users.php');

        if (response.data.error) {
            throw new Error(`Server error: ${response.data.error}\nDetails: ${response.data.details || 'No details provided'}`);
        }

        if (!Array.isArray(response.data)) {
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
        document.getElementById('usersTableBody').innerHTML =
            `<tr><td colspan="7" class="text-center text-danger">
                Error loading users: ${error.message || 'Unknown error'}
            </td></tr>`;
    }
}

// Populate filter dropdowns
function populateFilterDropdowns() {
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

// Display users
function displayUsers(filteredData = null) {
    const data = filteredData || userData;

    if (!Array.isArray(data)) {
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
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'Do you really want to deactivate this user?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, deactivate',
        cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
        try {
            const response = await axios.post('../api/update_user_status.php', {
                school_id: schoolId,
                status: 'inactive'
            });

            if (response.data.success) {
                await Swal.fire('Success', 'User deactivated successfully.', 'success');
                fetchUsers();
            } else {
                throw new Error(response.data.message || 'Failed to deactivate user');
            }
        } catch (error) {
            Swal.fire('Error', `Error deactivating user: ${error.message}`, 'error');
        }
    }
}
async function activateUser(schoolId) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to activate this user?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, activate',
        cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
        try {
            const response = await axios.post('../api/update_user_status.php', {
                school_id: schoolId,
                status: 'active'
            });

            if (response.data.success) {
                await Swal.fire('Success', 'User activated successfully.', 'success');
                fetchUsers();
            } else {
                throw new Error(response.data.message || 'Failed to activate user');
            }
        } catch (error) {
            Swal.fire('Error', `Error activating user: ${error.message}`, 'error');
        }
    }
}
// Store all courses for filtering in add user modal
let allCourses = [];
let departmentFilterListenerAdded = false;
let activeDepartmentIdsForUsers = [];

// Open Add User Modal and load data
async function openAddUserModal() {
    // Reset form
    const form = document.getElementById('addUserForm');
    if (form) {
        form.reset();
    }

    // Hide error message
    const errorDiv = document.getElementById('addUserErrorMessage');
    if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
    }

    // Reset selects
    const courseSelect = document.getElementById('addUser_courseId');
    if (courseSelect) {
        courseSelect.innerHTML = '<option value="">Select Course</option>';
    }

    // Load all data
    try {
        await Promise.all([
            loadUserTypes(),
            loadDepartmentsForAdd(),
            loadCoursesForAdd()
        ]);
    } catch (error) {
        console.error('Error loading modal data:', error);
        if (errorDiv) {
            errorDiv.textContent = 'Error loading form data. Please try again.';
            errorDiv.style.display = 'block';
        }
    }
}

// Load User Types for Add User Modal
async function loadUserTypes() {
    try {
        const response = await axios.get('../api/get_usertypes.php');
        const userTypeSelect = document.getElementById('addUser_typeId');
        if (userTypeSelect) {
            userTypeSelect.innerHTML = '<option value="">Select User Type</option>';

            if (response.data && Array.isArray(response.data)) {
                response.data.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type.user_typeId;
                    option.textContent = type.user_type;
                    userTypeSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading user types:', error);
        throw error;
    }
}

// Load Departments for Add User Modal
async function loadDepartmentsForAdd() {
    try {
        const response = await axios.get('../api/get_departments.php');
        const departmentSelect = document.getElementById('addUser_departmentId');
        if (departmentSelect) {
            departmentSelect.innerHTML = '<option value="">Select Department</option>';

            if (response.data && Array.isArray(response.data)) {
                const activeDepartments = response.data.filter(
                    dept => dept.department_status === undefined || dept.department_status == 1
                );

                activeDepartmentIdsForUsers = activeDepartments.map(d => d.department_id);

                activeDepartments.forEach(dept => {
                    const option = document.createElement('option');
                    option.value = dept.department_id;
                    option.textContent = dept.department_name;
                    departmentSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading departments:', error);
        throw error;
    }
}

// Load Courses for Add User Modal
async function loadCoursesForAdd() {
    try {
        const response = await axios.get('../api/get_courses.php');
        allCourses = (response.data || []).filter(course =>
            activeDepartmentIdsForUsers.includes(Number(course.course_departmentId)) &&
            (course.course_status === undefined || course.course_status == 1)
        );
        const courseSelect = document.getElementById('addUser_courseId');
        if (courseSelect) {
            courseSelect.innerHTML = '<option value="">Select Course</option>';

            allCourses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.course_id;
                option.textContent = course.course_name;
                option.dataset.departmentId = course.course_departmentId;
                courseSelect.appendChild(option);
            });
        }

        // Add event listener for department filter (only once)
        const departmentSelect = document.getElementById('addUser_departmentId');
        if (departmentSelect && !departmentFilterListenerAdded) {
            departmentSelect.addEventListener('change', filterCoursesByDepartment);
            departmentFilterListenerAdded = true;
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        throw error;
    }
}

// Filter courses by department in Add User Modal
function filterCoursesByDepartment() {
    const departmentSelect = document.getElementById('addUser_departmentId');
    const courseSelect = document.getElementById('addUser_courseId');

    if (!departmentSelect || !courseSelect) {
        return;
    }

    const selectedDepartmentId = departmentSelect.value;
    courseSelect.innerHTML = '<option value="">Select Course</option>';

    if (selectedDepartmentId && allCourses.length > 0) {
        const filteredCourses = allCourses.filter(course =>
            course.course_departmentId == selectedDepartmentId
        );
        filteredCourses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.course_id;
            option.textContent = course.course_name;
            courseSelect.appendChild(option);
        });
    } else if (!selectedDepartmentId && allCourses.length > 0) {
        // Show all courses if no department selected
        allCourses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.course_id;
            option.textContent = course.course_name;
            courseSelect.appendChild(option);
        });
    }
}

// Submit Add User Form
async function submitAddUser() {
    const errorDiv = document.getElementById('addUserErrorMessage');
    if (!errorDiv) {
        console.error('Error div not found');
        return;
    }

    errorDiv.style.display = 'none';
    errorDiv.textContent = '';

    // Get form elements
    const schoolIdEl = document.getElementById('addUser_schoolId');
    const lastnameEl = document.getElementById('addUser_lastname');
    const firstnameEl = document.getElementById('addUser_firstname');
    const middlenameEl = document.getElementById('addUser_middlename');
    const suffixEl = document.getElementById('addUser_suffix');
    const phinmaedEmailEl = document.getElementById('addUser_phinmaed_email');
    const emailEl = document.getElementById('addUser_email');
    const contactEl = document.getElementById('addUser_contact');
    const passwordEl = document.getElementById('addUser_password');
    const typeIdEl = document.getElementById('addUser_typeId');
    const departmentIdEl = document.getElementById('addUser_departmentId');
    const courseIdEl = document.getElementById('addUser_courseId');
    const schoolyearIdEl = document.getElementById('addUser_schoolyearId');

    // Get and trim values
    const user_schoolId = schoolIdEl ? schoolIdEl.value.trim() : '';
    const user_lastname = lastnameEl ? lastnameEl.value.trim() : '';
    const user_firstname = firstnameEl ? firstnameEl.value.trim() : '';
    const user_middlename = middlenameEl ? middlenameEl.value.trim() : '';
    const user_suffix = suffixEl ? suffixEl.value.trim() : '';
    const phinmaed_email = phinmaedEmailEl ? phinmaedEmailEl.value.trim() : '';
    const user_email = emailEl ? emailEl.value.trim() : '';
    const user_contact = contactEl ? contactEl.value.trim() : '';
    const user_password = passwordEl ? passwordEl.value : '';
    const user_typeId = typeIdEl ? typeIdEl.value : '';
    const user_departmentId = departmentIdEl ? departmentIdEl.value : '';
    const user_courseId = courseIdEl ? courseIdEl.value : '';
    const user_schoolyearId = schoolyearIdEl ? schoolyearIdEl.value.trim() : '';

    // Validate required fields
    if (!user_schoolId || !user_lastname || !user_firstname || !user_email ||
        !user_contact || !user_password || !user_typeId) {
        errorDiv.textContent = 'Please fill in all required fields (*)';
        errorDiv.style.display = 'block';
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user_email)) {
        errorDiv.textContent = 'Please enter a valid email address';
        errorDiv.style.display = 'block';
        return;
    }

    // Validate password length
    if (user_password.length < 8) {
        errorDiv.textContent = 'Password must be at least 8 characters long';
        errorDiv.style.display = 'block';
        return;
    }

    // Prepare form data - convert empty strings to null for optional fields
    const formData = {
        user_schoolId: user_schoolId,
        user_lastname: user_lastname,
        user_firstname: user_firstname,
        user_middlename: user_middlename || null,
        user_suffix: user_suffix || null,
        phinmaed_email: phinmaed_email || null,
        user_email: user_email,
        user_contact: user_contact,
        user_password: user_password,
        user_typeId: user_typeId,
        user_departmentId: user_departmentId || null,
        user_courseId: user_courseId || null,
        user_schoolyearId: user_schoolyearId || null
    };

    // Show loading state
    const submitBtn = document.querySelector('#addUserModal .btn-primary');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Adding...';
    }

    try {
        const response = await axios.post('../api/add_user.php', formData);

        if (response.data.success || response.data.message) {
            await Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: response.data.message || 'User added successfully. User must change password on first login.',
                timer: 2000,
                showConfirmButton: false
            });

            // Close modal
            const modalElement = document.getElementById('addUserModal');
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) {
                    modal.hide();
                }
            }

            // Reset form
            const form = document.getElementById('addUserForm');
            if (form) {
                form.reset();
                // Reset course select
                if (courseIdEl) {
                    courseIdEl.innerHTML = '<option value="">Select Course</option>';
                }
            }

            // Refresh users list
            await fetchUsers();
        } else {
            throw new Error(response.data.error || 'Failed to add user');
        }
    } catch (error) {
        let errorMessage = 'Failed to add user';
        if (error.response && error.response.data) {
            errorMessage = error.response.data.error || error.response.data.message || errorMessage;
        } else if (error.message) {
            errorMessage = error.message;
        }
        errorDiv.textContent = errorMessage;
        errorDiv.style.display = 'block';

        // Scroll to error message
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } finally {
        // Restore button state
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    }
}

// Handle modal events
document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();

    // Reset form when modal is hidden
    const addUserModal = document.getElementById('addUserModal');
    if (addUserModal) {
        addUserModal.addEventListener('hidden.bs.modal', function () {
            const form = document.getElementById('addUserForm');
            if (form) {
                form.reset();
                // Clear course select
                const courseSelect = document.getElementById('addUser_courseId');
                if (courseSelect) {
                    courseSelect.innerHTML = '<option value="">Select Course</option>';
                }
                // Hide error message
                const errorDiv = document.getElementById('addUserErrorMessage');
                if (errorDiv) {
                    errorDiv.style.display = 'none';
                    errorDiv.textContent = '';
                }
                // Reset department filter
                const departmentSelect = document.getElementById('addUser_departmentId');
                if (departmentSelect) {
                    departmentSelect.value = '';
                    filterCoursesByDepartment();
                }
            }
        });

        // Load data when modal is shown
        addUserModal.addEventListener('show.bs.modal', function () {
            openAddUserModal();
        });
    }
});
