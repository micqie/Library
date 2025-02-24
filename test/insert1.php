<?php 

// Allow requests from your frontend running on 127.0.0.1:5500 (or change this to your actual frontend URL)
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
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Handle OPTIONS request (preflight for CORS)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Read JSON input
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['text'])) {
    echo json_encode(["error" => "Missing required fields"]);
    exit;
}

$student_id = $conn->real_escape_string($data['text']);
$current_time = date('Y-m-d H:i:s');

// Check if the student has already timed in today
$sql = "SELECT ID, TIMEIN, TIMEOUT FROM lib_logs WHERE STUDENTID = '$student_id' AND DATE(TIMEIN) = CURDATE() ORDER BY TIMEIN DESC LIMIT 1";
$result = $conn->query($sql);

if ($result->num_rows == 0) {
    // No entry found, insert TIMEIN
    $sql = "INSERT INTO lib_logs (STUDENTID, TIMEIN) VALUES ('$student_id', '$current_time')";
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["message" => "Time In recorded"]);
    } else {
        echo json_encode(["error" => "Error: " . $conn->error]);
    }
} else {
    $row = $result->fetch_assoc();
    $timeIn = strtotime($row['TIMEIN']);
    $timeOut = strtotime($row['TIMEOUT']);


    if (empty($row['TIMEOUT']) && (time() - $timeIn >= 60)) {
        $sql = "UPDATE lib_logs SET TIMEOUT = '$current_time' WHERE ID = '{$row['ID']}'";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["message" => "Time Out recorded"]);
        } else {
            echo json_encode(["error" => "Error: " . $conn->error]);
        }
    } else {
        echo json_encode(["error" => "You must wait at least 1 minute before timing out!"]);
    }
}

$conn->close();
?>
