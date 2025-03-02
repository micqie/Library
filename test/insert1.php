<?php 

// Allow CORS for frontend
header("Access-Control-Allow-Origin: http://127.0.0.1:5500");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Database connection
$server = "localhost";
$username = "root";
$password = "";
$dbname = "librarysystem_db";

$conn = new mysqli($server, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
    exit;
}

// Handle OPTIONS request (preflight for CORS)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Read JSON input
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['text']) || empty($data['text'])) {
    echo json_encode(["error" => "Missing required fields"]);
    exit;
}

$student_id = $conn->real_escape_string($data['text']);
$current_time = date('Y-m-d H:i:s');

// Get the latest log entry for the student for today
$sql = "SELECT ID, TIMEIN, TIMEOUT FROM lib_logs WHERE STUDENTID = '$student_id' AND DATE(TIMEIN) = CURDATE() ORDER BY TIMEIN DESC LIMIT 1";
$result = $conn->query($sql);

if ($result->num_rows == 0) {
    // No entry found for today, insert TIMEIN
    $sql = "INSERT INTO lib_logs (STUDENTID, TIMEIN) VALUES ('$student_id', '$current_time')";
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["message" => "Time In recorded"]);
    } else {
        echo json_encode(["error" => "Database error: " . $conn->error]);
    }
} else {
    $row = $result->fetch_assoc();
    $timeIn = strtotime($row['TIMEIN']);
    $timeOut = isset($row['TIMEOUT']) ? strtotime($row['TIMEOUT']) : null;
    $timeDifference = time() - $timeIn;

    if ($timeOut === null && $timeDifference >= 60) {
        // Update TIMEOUT
        $sql = "UPDATE lib_logs SET TIMEOUT = '$current_time' WHERE ID = '{$row['ID']}'";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["message" => "Time Out recorded"]);
        } else {
            echo json_encode(["error" => "Database error: " . $conn->error]);
        }
    } else if ($timeOut !== null) {
        // Allow a new TIMEIN after previous TIMEOUT
        $sql = "INSERT INTO lib_logs (STUDENTID, TIMEIN) VALUES ('$student_id', '$current_time')";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["message" => "New Time In recorded"]);
        } else {
            echo json_encode(["error" => "Database error: " . $conn->error]);
        }
    } else {
        echo json_encode(["error" => "You must wait at least 1 minute before timing out!"]);
    }
}

$conn->close();
?>
