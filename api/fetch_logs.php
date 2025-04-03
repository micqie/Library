<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $filter = isset($_GET['filter']) ? $_GET['filter'] : 'today';
    $search = isset($_GET['search']) ? $_GET['search'] : '';

    // Build the date filter condition
    switch ($filter) {
        case 'today':
            $dateFilter = "DATE(l.time_in) = CURDATE()";
            break;
        case 'week':
            $dateFilter = "YEARWEEK(l.time_in, 1) = YEARWEEK(CURDATE(), 1)";
            break;
        case 'month':
            $dateFilter = "YEAR(l.time_in) = YEAR(CURDATE()) AND MONTH(l.time_in) = MONTH(CURDATE())";
            break;
        default:
            $dateFilter = "1=1"; // All time
    }

    // Build the search condition
    $searchCondition = "";
    if (!empty($search)) {
        $searchCondition = "AND (
            u.user_schoolId LIKE :search 
            OR u.user_firstname LIKE :search 
            OR u.user_lastname LIKE :search
            OR u.user_middlename LIKE :search
        )";
    }

    $query = "SELECT 
                l.*, 
                u.user_firstname, 
                u.user_middlename, 
                u.user_lastname, 
                u.user_suffix,
                d.department_name,
                c.course_name,
                DATE(l.time_in) as log_date
            FROM lib_logs l
            JOIN tbl_users u ON l.user_schoolId = u.user_schoolId
            LEFT JOIN tbl_departments d ON u.user_departmentId = d.department_id
            LEFT JOIN tbl_courses c ON u.user_courseId = c.course_id
            WHERE $dateFilter $searchCondition
            ORDER BY l.time_in DESC";

    $stmt = $db->prepare($query);

    if (!empty($search)) {
        $searchParam = "%$search%";
        $stmt->bindParam(':search', $searchParam);
    }

    $stmt->execute();
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "data" => $logs
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database error",
        "debug" => $e->getMessage()
    ]);
}
