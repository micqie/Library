<?php
header('Content-Type: application/json');
require_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Database connection failed");
    }

    $query = "SELECT user_typeId, user_type, user_defaultLevel FROM tbl_usertype ORDER BY user_type";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $usertypes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($usertypes === false) {
        throw new Exception("Failed to fetch user types");
    }

    echo json_encode($usertypes);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => 'Failed to fetch user types: ' . $e->getMessage()
    ]);
}

