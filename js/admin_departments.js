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

// ============= DEPARTMENTS MANAGEMENT =============

let departmentsData = [];
let coursesData = [];
const DEPT_COURSE_API = '../api/department_course.php';

async function fetchDepartmentCourseData() {
    const response = await axios.get(DEPT_COURSE_API);
    departmentsData = response.data.departments || [];
    coursesData = response.data.courses || [];
}

// Load Departments
async function loadDepartments() {
    try {
        const tableBody = document.getElementById('departmentsTableBody');
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center">Loading...</td></tr>';

        await fetchDepartmentCourseData();

        if (departmentsData.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-5">
                        <i class="bi bi-inbox display-4 text-muted d-block mb-3"></i>
                        <h6 class="text-muted">No departments found</h6>
                        <p class="text-muted small mb-0">Click "Add Department" to create your first department</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = '';

        // Load courses for each department (already fetched together)
        const courses = coursesData || [];

        departmentsData.forEach((dept) => {
            const deptCourses = courses.filter(c => c.course_departmentId == dept.department_id);
            const activeDeptCourses = deptCourses.filter(c => c.course_status === undefined || c.course_status == 1);
            const isActive = dept.department_status === undefined || dept.department_status == 1;
            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            row.classList.add('department-row');
            if (!isActive) {
                row.classList.add('department-row-inactive');
            }
            row.setAttribute('data-department-id', dept.department_id);
            row.setAttribute('data-department-name', dept.department_name);
            row.setAttribute('data-courses', JSON.stringify(deptCourses));

            // Add hover effect
            row.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#f0f8f0';
            });
            row.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '';
            });

            // Make row clickable
            row.addEventListener('click', (e) => {
                // Don't trigger if clicking on action button
                if (!e.target.closest('.btn')) {
                    showDepartmentCourses(dept.department_id, dept.department_name, deptCourses);
                }
            });

            row.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <div class="department-icon me-3">
                            <i class="bi bi-building-fill text-success fs-5"></i>
                        </div>
                        <div>
                            <strong class="d-block">${dept.department_name}</strong>
                            <small class="text-muted d-block">
                                <i class="bi bi-cursor me-1"></i>Click to view courses
                            </small>
                            <small class="text-muted">
                                Status:
                                <span class="badge ${isActive ? 'bg-success' : 'bg-secondary'}">
                                    ${isActive ? 'Active' : 'Inactive'}
                                </span>
                            </small>
                        </div>
                    </div>
                </td>
                <td class="text-center">
                    <span class="badge bg-info px-3 py-2 fs-6">
                        <i class="bi bi-book me-1"></i>${activeDeptCourses.length} ${activeDeptCourses.length !== 1 ? 'courses' : 'course'}
                    </span>
                </td>
                <td class="text-center">
                    <span class="badge ${isActive ? 'bg-success' : 'bg-secondary'} px-3 py-2">
                        <i class="bi ${isActive ? 'bi-check-circle' : 'bi-slash-circle'} me-1"></i>${isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm ${isActive ? 'btn-outline-warning' : 'btn-outline-success'}"
                            onclick="event.stopPropagation(); updateDepartmentStatus(${dept.department_id}, '${dept.department_name.replace(/'/g, "\\'")}', ${isActive ? 0 : 1})"
                            title="${isActive ? 'Mark Inactive' : 'Mark Active'}"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top">
                        <i class="bi ${isActive ? 'bi-slash-circle' : 'bi-check-circle'}"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading departments:', error);
        const tableBody = document.getElementById('departmentsTableBody');
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-5">
                    <i class="bi bi-exclamation-triangle display-4 text-danger d-block mb-3"></i>
                    <h6 class="text-danger mb-2">Error Loading Departments</h6>
                    <p class="text-muted small mb-0">${error.message || 'An error occurred. Please try again.'}</p>
                </td>
            </tr>
        `;
    }
}

// Load Courses
async function loadCourses() {
    try {
        const tableBody = document.getElementById('coursesTableBody');
        tableBody.innerHTML = '<tr><td colspan="3" class="text-center">Loading...</td></tr>';

        if (!departmentsData.length || !coursesData.length) {
            await fetchDepartmentCourseData();
        }

        const departments = departmentsData || [];

        const departmentStatusMap = {};
        departments.forEach(d => {
            departmentStatusMap[d.department_id] = d.department_status === undefined ? 1 : d.department_status;
        });

        if (coursesData.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center py-5">
                        <i class="bi bi-book display-4 text-muted d-block mb-3"></i>
                        <h6 class="text-muted">No courses found</h6>
                        <p class="text-muted small mb-0">Click "Add Course" to create your first course</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = '';

        coursesData.forEach(course => {
            const department = departments.find(d => d.department_id == course.course_departmentId);
            const isActiveDept = departmentStatusMap[course.course_departmentId] === undefined || departmentStatusMap[course.course_departmentId] == 1;
            const isActiveCourse = course.course_status === undefined || course.course_status == 1;
            const row = document.createElement('tr');
            if (!isActiveDept || !isActiveCourse) {
                row.classList.add('department-row-inactive');
            }
            row.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <div class="course-icon me-3">
                            <i class="bi bi-book-fill text-primary fs-5"></i>
                        </div>
                        <div>
                            <strong class="d-block">${course.course_name}</strong>
                            <small class="text-muted d-block">
                                Course is ${isActiveCourse ? '<span class="text-success">Active</span>' : '<span class="text-secondary">Inactive</span>'}
                            </small>
                            <small class="text-muted d-block">
                                Department is ${isActiveDept ? '<span class="text-success">Active</span>' : '<span class="text-secondary">Inactive</span>'}
                            </small>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge ${isActiveDept ? 'bg-success' : 'bg-secondary'} px-3 py-2">
                        <i class="bi bi-building me-1"></i>${department ? department.department_name : 'Unknown'}
                    </span>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm ${isActiveCourse ? 'btn-outline-warning' : 'btn-outline-success'}"
                            onclick="updateCourseStatus(${course.course_id}, '${course.course_name.replace(/'/g, "\\'")}', ${isActiveCourse ? 0 : 1})"
                            title="${isActiveCourse ? 'Mark Inactive' : 'Mark Active'}"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top">
                        <i class="bi ${isActiveCourse ? 'bi-slash-circle' : 'bi-check-circle'}"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading courses:', error);
        const tableBody = document.getElementById('coursesTableBody');
        tableBody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center py-5">
                    <i class="bi bi-exclamation-triangle display-4 text-danger d-block mb-3"></i>
                    <h6 class="text-danger mb-2">Error Loading Courses</h6>
                    <p class="text-muted small mb-0">${error.message || 'An error occurred. Please try again.'}</p>
                </td>
            </tr>
        `;
    }
}

// Open Add Department Modal
async function openAddDepartmentModal() {
    const form = document.getElementById('addDepartmentForm');
    const errorDiv = document.getElementById('addDepartmentErrorMessage');

    if (form) form.reset();
    if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
    }
}

// Submit Add Department
async function submitAddDepartment() {
    const errorDiv = document.getElementById('addDepartmentErrorMessage');
    const departmentNameInput = document.getElementById('department_name');
    const submitBtn = document.getElementById('submitDepartmentBtn');

    if (!errorDiv || !departmentNameInput) return;

    errorDiv.style.display = 'none';
    errorDiv.textContent = '';

    const department_name = departmentNameInput.value.trim();

    if (!department_name) {
        errorDiv.textContent = 'Department name is required';
        errorDiv.style.display = 'block';
        return;
    }

    const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Adding...';
    }

    try {
        const response = await axios.post(DEPT_COURSE_API, {
            action: 'add_department',
            department_name: department_name
        });

        if (response.data.success) {
            await Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: response.data.message || 'Department added successfully',
                timer: 2000,
                showConfirmButton: false
            });

            const modal = bootstrap.Modal.getInstance(document.getElementById('addDepartmentModal'));
            if (modal) modal.hide();

            await fetchDepartmentCourseData();
            await loadDepartments();
            await loadCourses();
        } else {
            throw new Error(response.data.error || 'Failed to add department');
        }
    } catch (error) {
        let errorMessage = 'Failed to add department';
        if (error.response && error.response.data) {
            errorMessage = error.response.data.error || error.response.data.message || errorMessage;
        } else if (error.message) {
            errorMessage = error.message;
        }
        errorDiv.textContent = errorMessage;
        errorDiv.style.display = 'block';
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    }
}

// Open Add Course Modal
async function openAddCourseModal() {
    const form = document.getElementById('addCourseForm');
    const errorDiv = document.getElementById('addCourseErrorMessage');
    const departmentSelect = document.getElementById('course_departmentId');

    if (form) form.reset();
    if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
    }

    // Load departments
    try {
        if (!departmentsData.length) {
            await fetchDepartmentCourseData();
        }
        if (departmentSelect) {
            departmentSelect.innerHTML = '<option value="">Select Department</option>';
            departmentsData.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.department_id;
                option.textContent = dept.department_name;
                departmentSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading departments:', error);
    }
}

// Submit Add Course
async function submitAddCourse() {
    const errorDiv = document.getElementById('addCourseErrorMessage');
    const courseNameInput = document.getElementById('course_name');
    const departmentSelect = document.getElementById('course_departmentId');
    const submitBtn = document.getElementById('submitCourseBtn');

    if (!errorDiv || !courseNameInput || !departmentSelect) return;

    errorDiv.style.display = 'none';
    errorDiv.textContent = '';

    const course_name = courseNameInput.value.trim();
    const course_departmentId = departmentSelect.value;

    if (!course_departmentId) {
        errorDiv.textContent = 'Please select a department';
        errorDiv.style.display = 'block';
        return;
    }

    if (!course_name) {
        errorDiv.textContent = 'Course name is required';
        errorDiv.style.display = 'block';
        return;
    }

    const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Adding...';
    }

    try {
        const response = await axios.post(DEPT_COURSE_API, {
            action: 'add_course',
            course_name: course_name,
            course_departmentId: course_departmentId
        });

        if (response.data.success) {
            await Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: response.data.message || 'Course added successfully',
                timer: 2000,
                showConfirmButton: false
            });

            const modal = bootstrap.Modal.getInstance(document.getElementById('addCourseModal'));
            if (modal) modal.hide();

            await fetchDepartmentCourseData();
            await loadDepartments();
            await loadCourses();
        } else {
            throw new Error(response.data.error || 'Failed to add course');
        }
    } catch (error) {
        let errorMessage = 'Failed to add course';
        if (error.response && error.response.data) {
            errorMessage = error.response.data.error || error.response.data.message || errorMessage;
        } else if (error.message) {
            errorMessage = error.message;
        }
        errorDiv.textContent = errorMessage;
        errorDiv.style.display = 'block';
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    }
}

// Show Department Courses Modal
function showDepartmentCourses(departmentId, departmentName, courses) {
    const modalTitle = document.getElementById('departmentCoursesModalLabel');
    const modalSubtitle = document.getElementById('departmentCoursesModalSubtitle');
    const coursesList = document.getElementById('departmentCoursesList');

    if (modalTitle) modalTitle.textContent = departmentName;
    if (modalSubtitle) modalSubtitle.textContent = `${courses.length} course${courses.length !== 1 ? 's' : ''} in this department`;

        if (coursesList) {
            if (courses.length === 0) {
                coursesList.innerHTML = `
                    <div class="text-center py-5">
                        <i class="bi bi-book display-1 text-muted d-block mb-3"></i>
                        <h6 class="text-muted mb-2">No courses in this department</h6>
                        <p class="text-muted small mb-0">Add courses in the Courses tab</p>
                    </div>
                `;
            } else {
                coursesList.innerHTML = `
                    <div class="list-group list-group-flush">
                        ${courses.map((course, index) => `
                            <div class="list-group-item d-flex justify-content-between align-items-start py-3 border-bottom">
                                <div class="d-flex align-items-center flex-grow-1">
                                    <div class="me-3">
                                        <div class="bg-primary bg-opacity-10 rounded-circle p-2">
                                            <i class="bi bi-book text-primary fs-5"></i>
                                        </div>
                                    </div>
                                    <div class="flex-grow-1">
                                        <h6 class="mb-1">${course.course_name}</h6>
                                        <small class="text-muted">
                                            <i class="bi bi-hash me-1"></i>Course ${index + 1} of ${courses.length}
                                        </small>
                                    </div>
                                </div>
                                <span class="badge bg-primary rounded-pill px-3 py-2">#${index + 1}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }

    const modalElement = document.getElementById('departmentCoursesModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}

// Update Department Status (active/inactive)
async function updateDepartmentStatus(id, name, status) {
    const isActivating = status === 1;
    const result = await Swal.fire({
        title: isActivating ? 'Mark as Active?' : 'Mark as Inactive?',
        text: `Are you sure you want to ${isActivating ? 'activate' : 'mark inactive'} "${name}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: isActivating ? 'Yes, activate' : 'Yes, mark inactive',
        cancelButtonText: 'Cancel',
        confirmButtonColor: isActivating ? '#28a745' : '#6c757d'
    });

    if (result.isConfirmed) {
        try {
            const response = await axios.post(DEPT_COURSE_API, {
                action: 'update_department_status',
                department_id: id,
                status: isActivating ? 'active' : 'inactive'
            });

            if (response.data.success) {
                await Swal.fire({
                    icon: 'success',
                    title: isActivating ? 'Activated!' : 'Marked Inactive!',
                    text: response.data.message,
                    timer: 2000,
                    showConfirmButton: false
                });

                await loadDepartments();
                await loadCourses(); // Reload courses to reflect updated departments
            } else {
                throw new Error(response.data.error || 'Failed to update department status');
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.error || error.message || 'Failed to update department status', 'error');
        }
    }
}

// Update Course Status (active/inactive)
async function updateCourseStatus(id, name, status) {
    const isActivating = status === 1;
    const result = await Swal.fire({
        title: isActivating ? 'Mark course as Active?' : 'Mark course as Inactive?',
        text: `Are you sure you want to ${isActivating ? 'activate' : 'mark inactive'} "${name}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: isActivating ? 'Yes, activate' : 'Yes, mark inactive',
        cancelButtonText: 'Cancel',
        confirmButtonColor: isActivating ? '#28a745' : '#6c757d'
    });

    if (result.isConfirmed) {
        try {
            const response = await axios.post(DEPT_COURSE_API, {
                action: 'update_course_status',
                course_id: id,
                status: isActivating ? 'active' : 'inactive'
            });

            if (response.data.success) {
                await Swal.fire({
                    icon: 'success',
                    title: isActivating ? 'Activated!' : 'Marked Inactive!',
                    text: response.data.message,
                    timer: 2000,
                    showConfirmButton: false
                });

                await fetchDepartmentCourseData();
                await loadDepartments();
                await loadCourses();
            } else {
                throw new Error(response.data.error || 'Failed to update course status');
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.error || error.message || 'Failed to update course status', 'error');
        }
    }
}

// ============= STATISTICS (existing code) =============

async function loadDepartmentVisits(startDate = '', endDate = '') {
    try {
        const visitsTableBody = document.getElementById('departmentVisitsTable');
        if (!visitsTableBody) return;

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

            row.setAttribute('data-department', visit.department_name);
            row.setAttribute('data-visitors', JSON.stringify(visitors));

            row.addEventListener('click', () => {
                showVisitorsModal(row);
            });

            row.style.cursor = 'pointer';

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
        if (visitsTableBody) {
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
}

function showVisitorsModal(row) {
    const departmentName = row.getAttribute('data-department');
    const visitorData = JSON.parse(row.getAttribute('data-visitors') || '[]');

    const modalTitle = document.getElementById('visitorModalLabel');
    const modalBody = document.getElementById('visitorModalBody');

    if (modalTitle) modalTitle.textContent = `Unique Visitors - ${departmentName}`;

    if (modalBody) {
        if (visitorData.length === 0) {
            modalBody.innerHTML = `<p class="text-muted">No visitors found for this department.</p>`;
        } else {
            modalBody.innerHTML = `
                <ul class="list-group">
                    ${visitorData.map(visitor => `<li class="list-group-item">${visitor}</li>`).join('')}
                </ul>
            `;
        }
    }

    const modalElement = document.getElementById('visitorModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}

function filterVisits() {
    const startDateEl = document.getElementById('startDate');
    const endDateEl = document.getElementById('endDate');

    if (!startDateEl || !endDateEl) return;

    const startDate = startDateEl.value;
    const endDate = endDateEl.value;

    if (endDate && startDate > endDate) {
        Swal.fire('Error', 'Start date cannot be later than end date', 'error');
        return;
    }

    loadDepartmentVisits(startDate, endDate);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadDepartments();
    loadCourses();
    loadDepartmentVisits();

    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Re-initialize tooltips after content loads
    setTimeout(() => {
        tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }, 500);

    // Modal event listeners
    const addDeptModal = document.getElementById('addDepartmentModal');
    if (addDeptModal) {
        addDeptModal.addEventListener('show.bs.modal', openAddDepartmentModal);
    }

    const addCourseModal = document.getElementById('addCourseModal');
    if (addCourseModal) {
        addCourseModal.addEventListener('show.bs.modal', openAddCourseModal);
    }

    // Tab change event - reload data when switching tabs
    const tabs = document.querySelectorAll('#managementTabs button[data-bs-toggle="tab"]');
    tabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function (e) {
            const targetTab = e.target.getAttribute('data-bs-target');
            if (targetTab === '#departments') {
                loadDepartments();
            } else if (targetTab === '#courses') {
                loadCourses();
            } else if (targetTab === '#statistics') {
                loadDepartmentVisits();
            }

            // Re-initialize tooltips after tab change
            setTimeout(() => {
                tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
                tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
                    return new bootstrap.Tooltip(tooltipTriggerEl);
                });
            }, 300);
        });
    });
});
