<?php

header("Access-Control-Allow-Origin: http://127.0.0.1:5500");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

$server = "localhost";
$username = "root";
$password = "";
$dbname = "librarysystem_db";

$conn = new mysqli($server, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

$sql = "SELECT ID, STUDENTID, TIMEIN, TIMEOUT, 
               DATE(TIMEOUT) AS DATEOUT 
        FROM lib_logs 
        WHERE DATE(TIMEIN) = CURDATE()";

$query = $conn->query($sql);
$data = [];

while ($row = $query->fetch_assoc()) {
    $row['TIMEOUT'] = !empty($row['TIMEOUT']) ? $row['TIMEOUT'] : 'Still Inside';
    $row['DATEOUT'] = !empty($row['TIMEOUT']) ? $row['DATEOUT'] : date('Y-m-d');
    $data[] = $row;
}


echo json_encode($data);
?>
