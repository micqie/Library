<?php
$server = "localhost";
$username = "root";
$password = "";
$dbname = "librarysystem_db";

$conn = new mysqli($server, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

$data = json_decode(file_get_contents("php://input"), true);
$studentId = $conn->real_escape_string($data['text']);

$sql = "SELECT TIMEIN, TIMEOUT FROM lib_logs WHERE STUDENTID = '$studentId' ORDER BY TIMEIN DESC LIMIT 1";
$result = $conn->query($sql);

$response = ["status" => "not_inside"];

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();

    if (empty($row['TIMEOUT'])) {

        $response["status"] = "still inside";

        // Check if at least 1 minute has passed since time in
        $timeIn = strtotime($row['TIMEIN']);
        $currentTime = time();
        $response["canTimeout"] = ($currentTime - $timeIn) >= 60; // 1 minute
    }
}

echo json_encode($response);
$conn->close();
?>
