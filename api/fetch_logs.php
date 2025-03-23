<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json");
require_once 'config/database.php';
try {
    // Get filter parameters
    $filter = isset($_GET['filter']) ? $_GET['filter'] : 'all';
    $search = isset($_GET['search']) ? $_GET['search'] : '';
    
    // Base query with user information
    $sql = "SELECT l.*, 
            u.user_firstname, u.user_lastname, u.user_middlename, u.user_suffix,
            d.department_name, c.course_name
            FROM lib_logs l
            LEFT JOIN lib_users u ON l.user_schoolId = u.user_schoolId
            LEFT JOIN lib_departments d ON u.user_departmentId = d.department_id
            LEFT JOIN lib_courses c ON u.user_courseId = c.course_id
            WHERE 1=1";
    
    // Apply date filter
    switch($filter) {
        case 'today':
            $sql .= " AND l.log_date = CURDATE()";
            break;
        case 'week':
            $sql .= " AND l.log_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
            break;
        case 'month':
            $sql .= " AND l.log_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
            break;
    }
    
    // Apply search filter
    if (!empty($search)) {
        $sql .= " AND (u.user_schoolId LIKE :search 
                  OR CONCAT(u.user_firstname, ' ', u.user_lastname) LIKE :search)";
    }
    
    // Order by date and time
    $sql .= " ORDER BY l.log_date DESC, l.time_in DESC";
    
    $stmt = $conn->prepare($sql);
    
    // Bind search parameter if exists
    if (!empty($search)) {
        $searchParam = "%$search%";
        $stmt->bindParam(':search', $searchParam);
    }
    
    $stmt->execute();
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Return JSON response
    echo json_encode(["status" => "success", "data" => $logs]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error fetching logs: " . $e->getMessage()]);
}

$conn = null;
?>