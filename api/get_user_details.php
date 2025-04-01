<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json");

include_once 'config/database.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $query = "SELECT u.*, d.department_name 
              FROM tbl_users u 
              LEFT JOIN tbl_departments d ON u.user_departmentId = d.department_id 
              WHERE u.user_schoolId = :schoolId";
    
    $stmt = $db->prepare($query);
    $stmt->execute(['schoolId' => $_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        echo json_encode([
            'success' => true,
            'user' => [
                'schoolId' => $user['user_schoolId'],
                'firstname' => $user['user_firstname'],
                'lastname' => $user['user_lastname'],
                'department' => $user['department_name'],
                'phinmaedEmail' => $user['user_phinmaedEmail'],
                'contact' => $user['user_contact']
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'User not found']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
?> 