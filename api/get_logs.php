<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $filter = isset($_GET['filter']) ? $_GET['filter'] : 'today';
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';

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

    // Build the search condition (Case-insensitive and supports full names)
    $searchCondition = "";
    $params = []; // Store parameters for binding
    
    if (!empty($search)) {
        $searchCondition = "AND (
            LOWER(u.user_schoolId) LIKE :search 
            OR LOWER(u.user_firstname) LIKE :search 
            OR LOWER(u.user_lastname) LIKE :search
            OR LOWER(u.user_middlename) LIKE :search
            OR LOWER(CONCAT(u.user_firstname, ' ', u.user_lastname)) LIKE :search
            OR LOWER(CONCAT(u.user_firstname, ' ', u.user_middlename, ' ', u.user_lastname)) LIKE :search
        )";
        $params[':search'] = "%" . strtolower($search) . "%"; // Convert input to lowercase
    }
    
    // Ensure WHERE clause is valid
    $whereClause = "WHERE $dateFilter"; 
    if (!empty($searchCondition)) {
        $whereClause .= " $searchCondition";
    }

    // SQL Query
    $query = "SELECT 
                l.*, 
                u.user_firstname, 
                u.user_middlename, 
                u.user_lastname, 
                u.user_suffix,
                d.department_name,
                c.course_name
            FROM lib_logs l
            JOIN tbl_users u ON l.user_schoolId = u.user_schoolId
            LEFT JOIN tbl_departments d ON u.user_departmentId = d.department_id
            LEFT JOIN tbl_courses c ON u.user_courseId = c.course_id
            $whereClause
            ORDER BY l.time_in DESC";
    
    $stmt = $db->prepare($query);
    
    // Bind parameters
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value, PDO::PARAM_STR);
    }
    
    $stmt->execute();
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "logs" => $logs
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>
