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

    // Get total count first
    $countQuery = "SELECT COUNT(*) as total FROM lib_logs WHERE user_schoolId = :schoolId";
    $countStmt = $db->prepare($countQuery);
    $countStmt->execute(['schoolId' => $_SESSION['user_id']]);
    $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Get page parameters
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $offset = ($page - 1) * $limit;

    $query = "SELECT 
                l.*,
                CONCAT(l.log_date, ' ', l.time_in) as time_in_full,
                TIME(l.time_in) as time_in,
                CASE 
                    WHEN l.time_out IS NOT NULL THEN TIME(l.time_out)
                    ELSE NULL 
                END as time_out
              FROM lib_logs l
              WHERE l.user_schoolId = :schoolId 
              ORDER BY l.log_date DESC, l.time_in DESC
              LIMIT :limit OFFSET :offset";

    $stmt = $db->prepare($query);
    $stmt->bindValue(':schoolId', $_SESSION['user_id'], PDO::PARAM_STR);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $history = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $history,
        'pagination' => [
            'total' => (int)$totalCount,
            'per_page' => $limit,
            'current_page' => $page,
            'total_pages' => ceil($totalCount / $limit)
        ]
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error',
        'error' => $e->getMessage()
    ]);
}