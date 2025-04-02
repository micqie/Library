<?php
header('Content-Type: application/json');
require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT department_id, department_name FROM tbl_departments ORDER BY department_name";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $departments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($departments);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch departments']);
}
