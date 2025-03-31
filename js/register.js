// Password validation function
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

document.getElementById('password').addEventListener('input', function () {
    validatePassword(this.value);
    checkPasswordsMatch();
});

document.getElementById('confirmPassword').addEventListener('input', checkPasswordsMatch);

// Toggle password
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

// Form submission
document.getElementById('registrationForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    try {
        const formData = {
            schoolId: document.getElementById('schoolId').value,
            firstname: document.getElementById('firstname').value,
            lastname: document.getElementById('lastname').value,
            middlename: document.getElementById('middlename').value,
            suffix: document.getElementById('suffix').value,
            phinmaedEmail: document.getElementById('phinmaedEmail').value,
            personalEmail: document.getElementById('personalEmail').value,
            contact: document.getElementById('contact').value,
            password: document.getElementById('password').value
        };

        const response = await axios.post('api/register.php', formData);

        if (response.data.success) {
            // Show success modal
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();

            // Add click handler for okay button
            document.getElementById('okayButton').addEventListener('click', function() {
                window.location.href = 'login.html';
            });
        } else {
            alert(response.data.message || 'Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during registration. Please try again.');
    }
});