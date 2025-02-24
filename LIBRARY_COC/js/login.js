document.getElementById("adminLoginForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form submission

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    axios.post('http://localhost/test/login.php', {
        username: username,
        password: password
    })
    .then(function(response) {
        if (response.data.success) {
            window.location.href = "admin_dashboard.php"; // Redirect to admin panel
        } else {
            document.getElementById("message").innerText = response.data.message;
        }
    })
    .catch(function(error) {
        console.error("Login failed:", error);
    });
});