<?php
header("Content-Type: application/json; charset=UTF-8");
include_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Tables to check
    $tables = ['lib_users', 'lib_logs', 'lib_departments', 'lib_courses'];
    $results = [];
    
    foreach ($tables as $table) {
        $query = "SHOW TABLES LIKE '$table'";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $results[$table] = $stmt->rowCount() > 0;
    }
    
    // If lib_users exists, check if it has any records
    if ($results['lib_users']) {
        $query = "SELECT COUNT(*) as count FROM lib_users";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $results['user_count'] = $row['count'];
    }
    
    echo json_encode([
        'database_connection' => 'success',
        'tables' => $results
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'error' => $e->getMessage()
    ]);
}
?> 