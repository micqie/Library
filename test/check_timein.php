<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$server = "localhost";
$username = "root";
$password = "";
$dbname = "librarysystem_db";

$conn = new mysqli($server, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}


$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['text'])) {
    echo json_encode(["error" => "Missing student ID"]);
    exit;
}

$student_id = $conn->real_escape_string($data['text']);


$sql = "SELECT TIMEIN FROM lib_logs WHERE STUDENTID = '$student_id' ORDER BY TIMEIN DESC LIMIT 1";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $lastTimeIn = strtotime($row['TIMEIN']);
    $currentTime = time();

    if (($currentTime - $lastTimeIn) >= 60) { 
        echo json_encode(["canTimeout" => true]);
    } else {
        echo json_encode(["canTimeout" => false]);
    }
} else {
    echo json_encode(["canTimeout" => true]); // If no time-in record, allow
}

$conn->close();
?>
