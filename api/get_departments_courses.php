<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'config/database.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Get departments
    $deptQuery = "SELECT department_id, department_name FROM tbl_departments ORDER BY department_name";
    $deptStmt = $db->prepare($deptQuery);
    $deptStmt->execute();
    $departments = $deptStmt->fetchAll(PDO::FETCH_ASSOC);

    // Get courses
    $courseQuery = "SELECT course_id, course_name, department_id FROM tbl_courses ORDER BY course_name";
    $courseStmt = $db->prepare($courseQuery);
    $courseStmt->execute();
    $courses = $courseStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'departments' => $departments,
        'courses' => $courses
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error',
        'debug' => $e->getMessage()
    ]);
}
