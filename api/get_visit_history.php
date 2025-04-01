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
    
    $query = "SELECT 
                DATE_FORMAT(time_in, '%Y-%m-%d %H:%i:%s') as time_in,
                CASE 
                    WHEN time_out IS NOT NULL THEN DATE_FORMAT(time_out, '%Y-%m-%d %H:%i:%s')
                    ELSE NULL 
                END as time_out
              FROM lib_logs 
              WHERE user_schoolId = :schoolId 
              ORDER BY time_in DESC
              LIMIT 50";
    
    $stmt = $db->prepare($query);
    $stmt->execute(['schoolId' => $_SESSION['user_id']]);
    $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'history' => $history
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Database error',
        'error' => $e->getMessage()
    ]);
}
?> 