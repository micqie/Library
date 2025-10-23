// Test if script is loading
console.log('register.js script loaded successfully');

// Store all courses for filtering - make it global and persistent
if (!window.allCourses) {
    window.allCourses = [];
}

// Make filter function globally accessible
window.filterCoursesByDepartment = function() {
    console.log('=== FILTER FUNCTION CALLED ===');
    const departmentSelect = document.getElementById('department');
    const courseSelect = document.getElementById('course');
    const selectedDepartmentId = departmentSelect ? departmentSelect.value : 'NO_ELEMENT';

    console.log('Department select element:', departmentSelect);
    console.log('Course select element:', courseSelect);
    console.log('Filtering courses for department:', selectedDepartmentId);
    console.log('All courses available:', window.allCourses);
    console.log('All courses length:', window.allCourses.length);

    // Clear current options except the first one
    courseSelect.innerHTML = '<option value="">Select Course</option>';

    if (selectedDepartmentId && selectedDepartmentId !== '') {
        console.log('Looking for courses with department ID:', selectedDepartmentId);

        // Filter courses by department from stored data
        const filteredCourses = window.allCourses.filter(course => {
            return course.course_departmentId == selectedDepartmentId;
        });

        console.log('Filtered courses:', filteredCourses);
        console.log('Filtered courses count:', filteredCourses.length);

        // Add filtered courses to dropdown
        filteredCourses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.course_id;
            option.textContent = course.course_name;
            courseSelect.appendChild(option);
        });
    } else {
        console.log('No department selected, showing all courses');
        // If no department selected, show all courses
        window.allCourses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.course_id;
            option.textContent = course.course_name;
            courseSelect.appendChild(option);
        });
    }
};

// Captcha functionality
let currentCaptcha = {};

function generateCaptcha() {
    console.log('generateCaptcha called');

    const canvas = document.getElementById('captchaCanvas');
    const fallback = document.getElementById('captchaFallback');

    if (!canvas) {
        console.error('Captcha canvas not found');
        return;
    }

    console.log('Canvas found:', canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get canvas context, using fallback');
        // Use fallback div instead
        generateCaptchaFallback();
        return;
    }

    console.log('Canvas context obtained');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Generate random text (5-6 characters)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 5 + Math.floor(Math.random() * 2); // 5 or 6 characters
    let captchaText = '';

    for (let i = 0; i < length; i++) {
        captchaText += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    console.log('Generated captcha text:', captchaText);

    // Store the correct answer
    currentCaptcha = {
        text: captchaText,
        answer: captchaText
    };

    document.getElementById('captchaCorrect').value = currentCaptcha.answer;
    document.getElementById('captchaAnswer').value = '';

    // Draw background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    console.log('Background drawn');

    // Add noise lines
    for (let i = 0; i < 20; i++) {
        ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`;
        ctx.lineWidth = Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
    }

    // Add noise dots
    for (let i = 0; i < 50; i++) {
        ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`;
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
    }

    // Draw the text with distortion
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    console.log('About to draw text');

    // Draw each character with individual distortion
    const charWidth = canvas.width / captchaText.length;
    for (let i = 0; i < captchaText.length; i++) {
        const char = captchaText[i];
        const x = (i * charWidth) + (charWidth / 2);
        const y = canvas.height / 2;

        // Save context
        ctx.save();

        // Apply random rotation
        const rotation = (Math.random() - 0.5) * 0.4; // -0.2 to 0.2 radians
        ctx.translate(x, y);
        ctx.rotate(rotation);

        // Random color
        const hue = Math.random() * 360;
        ctx.fillStyle = `hsl(${hue}, 70%, 30%)`;

        // Draw character
        ctx.fillText(char, 0, 0);
        console.log(`Drew character ${i}: ${char}`);

        // Restore context
        ctx.restore();
    }

    console.log('Captcha generation complete');
}

function generateCaptchaFallback() {
    console.log('Using fallback captcha method');

    const fallback = document.getElementById('captchaFallback');
    const canvas = document.getElementById('captchaCanvas');

    if (!fallback) {
        console.error('Fallback div not found');
        return;
    }

    // Generate random text (5-6 characters)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 5 + Math.floor(Math.random() * 2); // 5 or 6 characters
    let captchaText = '';

    for (let i = 0; i < length; i++) {
        captchaText += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    console.log('Generated fallback captcha text:', captchaText);

    // Store the correct answer
    currentCaptcha = {
        text: captchaText,
        answer: captchaText
    };

    document.getElementById('captchaCorrect').value = currentCaptcha.answer;
    document.getElementById('captchaAnswer').value = '';

    // Show fallback, hide canvas
    canvas.style.display = 'none';
    fallback.style.display = 'flex';
    fallback.textContent = captchaText;

    console.log('Fallback captcha generation complete');
}

function validateCaptcha() {
    const userAnswer = document.getElementById('captchaAnswer').value.trim();
    const correctAnswer = document.getElementById('captchaCorrect').value;

    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        document.getElementById('captchaAnswer').classList.remove('is-invalid');
        document.getElementById('captchaAnswer').classList.add('is-valid');
        return true;
    } else if (userAnswer !== '') {
        document.getElementById('captchaAnswer').classList.remove('is-valid');
        document.getElementById('captchaAnswer').classList.add('is-invalid');
        return false;
    }
    return false;
}

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
            await Swal.fire({
                icon: 'error',
                title: 'Load Failed',
                text: 'Failed to load departments. Please try again.',
            });
        }
    } catch (error) {
        console.error('Error loading departments:', error);
        if (error.response) {
            console.error('Error response:', error.response.data);
        }
        await Swal.fire({
            icon: 'error',
            title: 'Network Error',
            text: 'Failed to load departments. Please check your connection and try again.',
        });
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

            // Store all courses for filtering
            window.allCourses = response.data;
            console.log('Courses stored:', window.allCourses.length);

            response.data.forEach(course => {
                const option = document.createElement('option');
                option.value = course.course_id;
                option.textContent = course.course_name;
                option.dataset.departmentId = course.course_departmentId;
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

// Check if passwords match and captcha is valid
function checkPasswordsMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const matchMessage = document.getElementById('passwordMatch');
    const submitBtn = document.getElementById('submitBtn');

    if (confirmPassword) {
        if (password === confirmPassword) {
            matchMessage.textContent = 'Passwords match';
            matchMessage.className = 'form-text text-success';
            const passwordValid = validatePassword(password);
            const captchaValid = validateCaptcha();
            console.log('Password valid:', passwordValid, 'Captcha valid:', captchaValid);
            submitBtn.disabled = !(passwordValid && captchaValid);
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

    // Initialize captcha with a small delay to ensure DOM is ready
    setTimeout(() => {
        generateCaptcha();
    }, 100);

    // Password toggle functionality
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function () {
            const passwordInput = document.getElementById('password');
            const icon = this;

            if (passwordInput && passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('bi-eye-slash');
                icon.classList.add('bi-eye');
            } else if (passwordInput) {
                passwordInput.type = 'password';
                icon.classList.remove('bi-eye');
                icon.classList.add('bi-eye-slash');
            }
        });
    }

    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    if (toggleConfirmPassword) {
        toggleConfirmPassword.addEventListener('click', function () {
            const confirmPasswordInput = document.getElementById('confirmPassword');
            const icon = this;

            if (confirmPasswordInput && confirmPasswordInput.type === 'password') {
                confirmPasswordInput.type = 'text';
                icon.classList.remove('bi-eye-slash');
                icon.classList.add('bi-eye');
            } else if (confirmPasswordInput) {
                confirmPasswordInput.type = 'password';
                icon.classList.remove('bi-eye');
                icon.classList.add('bi-eye-slash');
            }
        });
    }

    // Set as School ID functionality
    const setAsSchoolIdCheckbox = document.getElementById('setAsSchoolId');
    const schoolIdInput = document.getElementById('schoolId');
    const personalEmailInput = document.getElementById('personalEmail');

    if (setAsSchoolIdCheckbox && schoolIdInput && personalEmailInput) {
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
    }

    // Password validation listeners
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function () {
            validatePassword(this.value);
            checkPasswordsMatch();
        });
    }

    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', checkPasswordsMatch);
    }

    // Department change listener
    const departmentSelect = document.getElementById('department');
    if (departmentSelect) {
        departmentSelect.addEventListener('change', function() {
            console.log('Department changed to:', this.value);
            if (window.filterCoursesByDepartment) {
                window.filterCoursesByDepartment();
            }
        });
    }

    // Captcha event listeners
    const captchaAnswerInput = document.getElementById('captchaAnswer');
    if (captchaAnswerInput) {
        captchaAnswerInput.addEventListener('input', function() {
            validateCaptcha();
            checkPasswordsMatch();
        });
    }

    const refreshCaptchaBtn = document.getElementById('refreshCaptcha');
    if (refreshCaptchaBtn) {
        refreshCaptchaBtn.addEventListener('click', function() {
            generateCaptcha();
            checkPasswordsMatch();
        });
    }

    // Allow clicking on canvas to refresh captcha
    const captchaCanvas = document.getElementById('captchaCanvas');
    if (captchaCanvas) {
        captchaCanvas.addEventListener('click', function() {
            generateCaptcha();
            checkPasswordsMatch();
        });
    }

    // Allow clicking on fallback to refresh captcha (if it exists)
    const captchaFallback = document.getElementById('captchaFallback');
    if (captchaFallback) {
        captchaFallback.addEventListener('click', function() {
            generateCaptcha();
            checkPasswordsMatch();
        });
    }

    // Form submission
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        try {
            // Validate captcha before submission
            if (!validateCaptcha()) {
                alert('Please solve the security check correctly.');
                return;
            }

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
                password: document.getElementById('password').value,
                setAsSchoolId: setAsSchoolId,
                captcha_answer: document.getElementById('captchaAnswer').value,
                captcha_correct: document.getElementById('captchaCorrect').value
            };

            console.log('Submitting form data:', formData);
            const response = await axios.post('api/register.php', formData);
            console.log('Registration response:', response.data);

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
}

console.log('About to add DOMContentLoaded listener');
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired');
    initializeEventListeners();
});

// Fallback captcha generation
window.addEventListener('load', function() {
    // Ensure captcha is generated even if DOMContentLoaded didn't work
    setTimeout(() => {
        const canvas = document.getElementById('captchaCanvas');
        if (canvas && !currentCaptcha.text) {
            console.log('Fallback captcha generation triggered');
            generateCaptcha();
        }
    }, 200);
});

// Test function - can be called from browser console
window.testCaptcha = function() {
    console.log('Manual captcha test triggered');
    generateCaptcha();
};

// Immediate test
console.log('Script execution started');
console.log('Current time:', new Date().toISOString());

// Test if we can find the canvas element immediately
setTimeout(() => {
    console.log('Testing canvas element after 1 second...');
    const canvas = document.getElementById('captchaCanvas');
    console.log('Canvas element found:', canvas);
    if (canvas) {
        console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
    }
}, 1000);
