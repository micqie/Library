<?php

header("Access-Control-Allow-Origin: http://127.0.0.1:5500");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$server = "localhost";
$username = "root";
$password = "";
$dbname = "librarysystem_db";

$conn = new mysqli($server, $username, $password, $dbname);

// Check database connection
if ($conn->connect_error) {
    die(json_encode(["error" => "Database connection failed: " . $conn->connect_error]));
}

// Get raw POST data
$data = json_decode(file_get_contents("php://input"), true);

// Debugging: Check if data is received
if (!$data) {
    die(json_encode(["error" => "No data received."]));
}

// Debugging: Check if STUDENTID exists
if (!isset($data['STUDENTID']) || empty($data['STUDENTID'])) {
    die(json_encode(["error" => "STUDENTID is missing."]));
}

$STUDENTID = trim($data['STUDENTID']); // Remove any extra spaces

// Debugging: Log received student ID
error_log("📌 Received STUDENTID: " . $STUDENTID);

$sql = "SELECT 
            u.STUDENTID, u.NAME, u.YEAR, u.COURSE, 
            l.TIMEIN, l.TIMEOUT 
        FROM lib_users u
        LEFT JOIN lib_logs l ON u.STUDENTID = l.STUDENTID 
        WHERE u.STUDENTID = ? 
        ORDER BY l.TIMEIN DESC 
        LIMIT 1"; // Get the latest log

$stmt = $conn->prepare($sql);

if (!$stmt) {
    die(json_encode(["error" => "SQL prepare failed: " . $conn->error]));
}

$stmt->bind_param("s", $STUDENTID);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    echo json_encode($row);
} else {
    echo json_encode(["error" => "Student not found"]);
}

// Debugging: Log query errors if any
if ($stmt->error) {
    error_log("🚨 SQL Error: " . $stmt->error);
}

$stmt->close();
$conn->close();
?>
