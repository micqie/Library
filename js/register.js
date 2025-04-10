// Password validation
function validatePassword(password) {
    const conditions = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password)
    };

    document.getElementById('length').className = conditions.length ? 'text-success' : 'text-danger';
    document.getElementById('uppercase').className = conditions.uppercase ? 'text-success' : 'text-danger';
    document.getElementById('lowercase').className = conditions.lowercase ? 'text-success' : 'text-danger';
    document.getElementById('number').className = conditions.number ? 'text-success' : 'text-danger';

    return Object.values(conditions).every(condition => condition === true);
}

// Load departments
async function loadDepartments() {
    try {
        console.log('Fetching departments...');
        const response = await axios.get('./api/get_departments.php');
        console.log('Departments response:', response.data);

        if (response.data && Array.isArray(response.data)) {
            const departmentSelect = document.getElementById('department');
            departmentSelect.innerHTML = '<option value="">Select Department</option>';

            response.data.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.department_id;
                option.textContent = dept.department_name;
                departmentSelect.appendChild(option);
            });
        } else {
            console.error('Invalid department data format:', response.data);
            alert('Failed to load departments. Please try again.');
        }
    } catch (error) {
        console.error('Error loading departments:', error);
        if (error.response) {
            console.error('Error response:', error.response.data);
        }
        alert('Failed to load departments. Please check your connection and try again.');
    }
}

// Load all courses
async function loadCourses() {
    try {
        console.log('Fetching courses...');
        const response = await axios.get('./api/get_courses.php');
        console.log('Courses response:', response.data);

        if (response.data && Array.isArray(response.data)) {
            const courseSelect = document.getElementById('course');
            courseSelect.innerHTML = '<option value="">Select Course</option>';

            response.data.forEach(course => {
                const option = document.createElement('option');
                option.value = course.course_id;
                option.textContent = course.course_name;
                courseSelect.appendChild(option);
            });
        } else {
            console.error('Invalid course data format:', response.data);
            alert('Failed to load courses. Please try again.');
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        if (error.response) {
            console.error('Error response:', error.response.data);
        }
        alert('Failed to load courses. Please check your connection and try again.');
    }
}

// Check if passwords match
function checkPasswordsMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const matchMessage = document.getElementById('passwordMatch');
    const submitBtn = document.getElementById('submitBtn');

    if (confirmPassword) {
        if (password === confirmPassword) {
            matchMessage.textContent = 'Passwords match';
            matchMessage.className = 'form-text text-success';
            submitBtn.disabled = !validatePassword(password);
        } else {
            matchMessage.textContent = 'Passwords do not match';
            matchMessage.className = 'form-text text-danger';
            submitBtn.disabled = true;
        }
    } else {
        matchMessage.textContent = '';
        submitBtn.disabled = true;
    }
}

// Initialize all event listeners
function initializeEventListeners() {
    loadDepartments();
    loadCourses();

    // Password toggle functionality
    document.getElementById('togglePassword').addEventListener('click', function () {
        const passwordInput = document.getElementById('password');
        const icon = this;

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('bi-eye-slash');
            icon.classList.add('bi-eye');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('bi-eye');
            icon.classList.add('bi-eye-slash');
        }
    });

    document.getElementById('toggleConfirmPassword').addEventListener('click', function () {
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const icon = this;

        if (confirmPasswordInput.type === 'password') {
            confirmPasswordInput.type = 'text';
            icon.classList.remove('bi-eye-slash');
            icon.classList.add('bi-eye');
        } else {
            confirmPasswordInput.type = 'password';
            icon.classList.remove('bi-eye');
            icon.classList.add('bi-eye-slash');
        }
    });

    // Set as School ID functionality
    const setAsSchoolIdCheckbox = document.getElementById('setAsSchoolId');
    const schoolIdInput = document.getElementById('schoolId');
    const personalEmailInput = document.getElementById('personalEmail');

    function updateSchoolId() {
        if (setAsSchoolIdCheckbox.checked) {
            schoolIdInput.value = personalEmailInput.value;
            schoolIdInput.readOnly = true;
            schoolIdInput.classList.add('bg-light');
        } else {
            schoolIdInput.readOnly = false;
            schoolIdInput.classList.remove('bg-light');
        }
    }

    setAsSchoolIdCheckbox.addEventListener('change', updateSchoolId);
    personalEmailInput.addEventListener('input', function () {
        if (setAsSchoolIdCheckbox.checked) {
            schoolIdInput.value = personalEmailInput.value;
        }
    });

    // Password validation listeners
    document.getElementById('password').addEventListener('input', function () {
        validatePassword(this.value);
        checkPasswordsMatch();
    });

    document.getElementById('confirmPassword').addEventListener('input', checkPasswordsMatch);

    // Form submission
    document.getElementById('registrationForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        try {
            const setAsSchoolId = document.getElementById('setAsSchoolId').checked;
            const personalEmail = document.getElementById('personalEmail').value;

            const formData = {
                schoolId: setAsSchoolId ? personalEmail : document.getElementById('schoolId').value,
                firstname: document.getElementById('firstname').value,
                lastname: document.getElementById('lastname').value,
                middlename: document.getElementById('middlename').value,
                suffix: document.getElementById('suffix').value,
                personalEmail: personalEmail,
                contact: document.getElementById('contact').value,
                department: document.getElementById('department').value,
                course: document.getElementById('course').value,
                password: document.getElementById('password').value
            };

            const response = await axios.post('api/register.php', formData);

            if (response.data.success) {
                const successModal = new bootstrap.Modal(document.getElementById('successModal'));
                successModal.show();

                document.getElementById('okayButton').addEventListener('click', function () {
                    window.location.href = 'index.html';
                });
            } else {
                alert(response.data.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during registration. Please try again.');
        }
    });
}

document.addEventListener('DOMContentLoaded', initializeEventListeners);