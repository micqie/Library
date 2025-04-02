<?php
header('Content-Type: application/json');
require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT course_id, course_name FROM tbl_courses ORDER BY course_name";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($courses);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch courses']);
}
