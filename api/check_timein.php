<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$server = "localhost";
$username = "root";
$password = "";
$dbname = "db_library";

$conn = new mysqli($server, $username, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]));
}

// Get user ID from request
$userId = isset($_GET['user_schoolId']) ? $conn->real_escape_string($_GET['user_schoolId']) : '';

if ($userId) {
    $date = date("Y-m-d");
    $sql = "SELECT time_in FROM lib_logs WHERE user_schoolId = '$userId' AND log_date = '$date' AND STATUS = '0' ORDER BY time_in DESC LIMIT 1";
    $query = $conn->query($sql);

    if ($query->num_rows > 0) {
        $row = $query->fetch_assoc();
        $lastTimeIn = strtotime($row['time_in']);
        $currentTime = time();
        $timeDifference = $currentTime - $lastTimeIn;

        echo json_encode(["status" => "success", "time_difference" => $timeDifference]);
    } else {
        echo json_encode(["status" => "no_record"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Missing student ID"]);
}

$conn->close();
?>
