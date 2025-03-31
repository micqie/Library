// Generate random numbers for math captcha
function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const answer = num1 + num2;
    
    document.getElementById('num1').value = num1;
    document.getElementById('num2').value = num2;
    document.getElementById('captcha-correct').value = answer;
    
    // Reset validation classes when generating new numbers
    const mathInput = document.getElementById('mathAnswer');
    mathInput.classList.remove('is-valid', 'is-invalid');
    mathInput.value = '';
}

// Validate math answer
function validateMathAnswer() {
    const num1 = parseInt(document.getElementById('num1').value);
    const num2 = parseInt(document.getElementById('num2').value);
    const userAnswer = parseInt(document.getElementById('mathAnswer').value);
    const mathInput = document.getElementById('mathAnswer');
    
    if (!isNaN(userAnswer)) { // Only validate if there's an input
        const correctAnswer = num1 + num2;
        
        if (userAnswer === correctAnswer) {
            mathInput.classList.remove('is-invalid');
            mathInput.classList.add('is-valid');
            return true;
        } else {
            mathInput.classList.remove('is-valid');
            mathInput.classList.add('is-invalid');
            return false;
        }
    } else {
        mathInput.classList.remove('is-valid', 'is-invalid');
        return false;
    }
}

// Add event listener for math answer input - real-time validation
document.getElementById('mathAnswer').addEventListener('input', validateMathAnswer);

// Single submit event listener that handles both math validation and login
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // First check if math answer is correct
    if (!validateMathAnswer()) {
        document.getElementById('error-message').textContent = 'Please enter the correct answer to the math problem.';
        return;
    }

    const studentId = document.getElementById('student_id').value.trim();
    const password = document.getElementById('password').value.trim();

    axios.post('./api/login.php', {
        student_id: studentId,
        password: password
    })
    .then(function (response) {
        console.log("Server response:", response.data);
        if (response.data.success) {
            window.location.href = './users/user_dashboard.html';
        } else {
            document.getElementById('error-message').textContent = response.data.message || 'Login failed';
        }
    })
    .catch(function (error) {
        console.error('Full error:', error);
        if (error.response) {
            document.getElementById('error-message').textContent = error.response.data.message || error.response.statusText;
        } else {
            document.getElementById('error-message').textContent = 'Network error. Please try again.';
        }
    });
});

// Generate captcha when page loads
window.onload = generateCaptcha;