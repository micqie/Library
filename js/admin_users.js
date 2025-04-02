$(document).ready(function() {
    let usersTable = $('#usersTable').DataTable({
        ajax: {
            url: '../api/get_users.php',
            dataSrc: ''
        },
        columns: [
            { data: 'user_schoolId' },
            { 
                data: null,
                render: function(data, type, row) {
                    return `${row.user_firstname} ${row.user_middlename || ''} ${row.user_lastname} ${row.user_suffix || ''}`.trim();
                }
            },
            { data: 'user_email' },
            { data: 'user_contact' },
            { data: 'department_name' },
            { data: 'course_name' },
            {
                data: null,
                render: function(data, type, row) {
                    return `
                        <button class="btn btn-sm btn-primary edit-user" data-id="${row.user_id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-user" data-id="${row.user_id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;
                }
            }
        ]
    });

    // Load departments and courses for dropdowns
    loadDepartments();
    loadCourses();

    // Add User
    $('#saveUserBtn').click(function() {
        const formData = new FormData($('#addUserForm')[0]);
        
        $.ajax({
            url: '../api/add_user.php',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                $('#addUserModal').modal('hide');
                usersTable.ajax.reload();
                alert('User added successfully!');
            },
            error: function(xhr) {
                alert('Error adding user: ' + xhr.responseText);
            }
        });
    });

    // Edit User
    $('#usersTable').on('click', '.edit-user', function() {
        const userId = $(this).data('id');
        
        $.ajax({
            url: '../api/get_user.php',
            method: 'GET',
            data: { user_id: userId },
            success: function(user) {
                // Populate edit form
                $('#editUserForm [name="user_id"]').val(user.user_id);
                // Populate other fields...
                $('#editUserModal').modal('show');
            }
        });
    });

    // Update User
    $('#updateUserBtn').click(function() {
        const formData = new FormData($('#editUserForm')[0]);
        
        $.ajax({
            url: '../api/update_user.php',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                $('#editUserModal').modal('hide');
                usersTable.ajax.reload();
                alert('User updated successfully!');
            },
            error: function(xhr) {
                alert('Error updating user: ' + xhr.responseText);
            }
        });
    });

    // Delete User
    $('#usersTable').on('click', '.delete-user', function() {
        if (confirm('Are you sure you want to delete this user?')) {
            const userId = $(this).data('id');
            
            $.ajax({
                url: '../api/delete_user.php',
                method: 'POST',
                data: { user_id: userId },
                success: function(response) {
                    usersTable.ajax.reload();
                    alert('User deleted successfully!');
                },
                error: function(xhr) {
                    alert('Error deleting user: ' + xhr.responseText);
                }
            });
        }
    });

    function loadDepartments() {
        $.ajax({
            url: '../api/get_departments.php',
            method: 'GET',
            success: function(departments) {
                const select = $('select[name="department_id"]');
                select.empty().append('<option value="">Select Department</option>');
                departments.forEach(dept => {
                    select.append(`<option value="${dept.department_id}">${dept.department_name}</option>`);
                });
            }
        });
    }

    function loadCourses() {
        $.ajax({
            url: '../api/get_courses.php',
            method: 'GET',
            success: function(courses) {
                const select = $('select[name="course_id"]');
                select.empty().append('<option value="">Select Course</option>');
                courses.forEach(course => {
                    select.append(`<option value="${course.course_id}">${course.course_name}</option>`);
                });
            }
        });
    }
}); 