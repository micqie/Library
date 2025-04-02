<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT u.*, d.department_name, c.course_name 
              FROM tbl_users u 
              LEFT JOIN tbl_departments d ON u.department_id = d.department_id 
              LEFT JOIN tbl_courses c ON u.course_id = c.course_id";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($users);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?> 