<?php
$server = "localhost";
$username = "root";
$password = "";
$dbname = "db_library";

try {
    $conn = new PDO("mysql:host=$server;dbname=$dbname", $username, $password);
    // Set the PDO error mode to exception
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
    die();
}
?>