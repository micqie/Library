document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const studentId = document.getElementById('student_id').value.trim();
    const password = document.getElementById('password').value.trim();

    console.log("Attempting login with:", { studentId, password });

    axios.post('./api/login.php', {
        student_id: studentId,
        password: password
    })
        .then(function (response) {
            console.log("Server response:", response.data);
            if (response.data.success) {
                window.location.href = './users/user_dashboard.html';
            } else {
                alert(`Login failed. Server says: ${response.data.message || 'No specific error'}`);
            }
        })
        .catch(function (error) {
            console.error('Full error:', error);
            if (error.response) {
                console.log("Error response data:", error.response.data);
                alert(`Server error: ${error.response.data.message || error.response.statusText}`);
            } else {
                alert('Network error. Check console for details.');
            }
        });
});