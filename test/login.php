<?php
session_start();

// Allow frontend requests
header("Access-Control-Allow-Origin: http://127.0.0.1:5500");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Database connection
$server = "localhost";
$username = "root";
$password = "";
$dbname = "librarysystem_db";

$conn = new mysqli($server, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed."]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$admin_username = trim($data['username'] ?? '');
$admin_password = trim($data['password'] ?? '');

// Validate input
if (empty($admin_username) || empty($admin_password)) {
    echo json_encode(["success" => false, "message" => "Username and password are required."]);
    exit();
}

// Check if user exists
$sql = "SELECT id, username, password FROM lib_admin WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $admin_username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $admin = $result->fetch_assoc();
    

    if ($admin_password === $admin['password']) { 
        $_SESSION['admin_id'] = $admin['id'];
        $_SESSION['admin_username'] = $admin['username'];
        echo json_encode(["success" => true, "message" => "Login successful."]);
    } else {
        echo json_encode(["success" => false, "message" => "Incorrect username or password."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Admin not found."]);
}


$stmt->close();
$conn->close();
?>
