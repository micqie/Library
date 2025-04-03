<?php
header('Content-Type: application/json');
require_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Database connection failed");
    }

    $query = "SELECT course_id, course_name, course_departmentId FROM tbl_courses ORDER BY course_name";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($courses === false) {
        throw new Exception("Failed to fetch courses");
    }

    echo json_encode($courses);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => 'Failed to fetch courses: ' . $e->getMessage()
    ]);
}
