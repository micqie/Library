<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login</title>

    <!-- Bootstrap & FontAwesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

    <!-- Axios -->
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>

    <!-- Style -->
    <link rel="stylesheet" href="style.css">

   
</head>
<body>

<div class="login-container">
    <h3>Admin Login</h3>
    <form id="adminLoginForm">
        <div class="mb-3">
            <label class="form-label">Username</label>
            <input type="text" id="username" class="form-control" required>
        </div>
        <div class="mb-3">
            <label class="form-label">Password</label>
            <input type="password" id="password" class="form-control" required>
        </div>
        <button type="submit" class="btn btn-primary w-100">Login</button>
        <!-- user: library_admin pass: admin_12345 -->
    </form>
    <p id="message" class="text-danger mt-2 text-center"></p>
</div>

<script src="js/login.js"></script>

</body>
</html>
