<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Get period from request (day, week, month)
    $period = isset($_GET['period']) ? $_GET['period'] : 'day';

    // Get department visit stats
    $deptVisitsQuery = "SELECT 
        d.department_name,
        COUNT(*) as visit_count,
        COUNT(DISTINCT l.user_schoolId) as unique_visitors
    FROM lib_logs l
    JOIN tbl_users u ON l.user_schoolId = u.user_schoolId
    JOIN tbl_departments d ON u.user_departmentId = d.department_id
    WHERE ";

    // Add date condition based on period
    switch($period) {
        case 'day':
            $deptVisitsQuery .= "DATE(l.time_in) = CURDATE()";
            break;
        case 'week':
            $deptVisitsQuery .= "YEARWEEK(l.time_in, 1) = YEARWEEK(CURDATE(), 1)";
            break;
        case 'month':
            $deptVisitsQuery .= "YEAR(l.time_in) = YEAR(CURDATE()) AND MONTH(l.time_in) = MONTH(CURDATE())";
            break;
    }

    $deptVisitsQuery .= " GROUP BY d.department_id
        ORDER BY visit_count DESC";

    $stmt = $db->prepare($deptVisitsQuery);
    $stmt->execute();
    $departmentStats = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get total visits for the period
    $totalVisitsQuery = "SELECT COUNT(*) as total FROM lib_logs WHERE ";
    switch($period) {
        case 'day':
            $totalVisitsQuery .= "DATE(time_in) = CURDATE()";
            break;
        case 'week':
            $totalVisitsQuery .= "YEARWEEK(time_in, 1) = YEARWEEK(CURDATE(), 1)";
            break;
        case 'month':
            $totalVisitsQuery .= "YEAR(time_in) = YEAR(CURDATE()) AND MONTH(time_in) = MONTH(CURDATE())";
            break;
    }

    $stmt = $db->prepare($totalVisitsQuery);
    $stmt->execute();
    $totalVisits = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Get currently active visitors
    $activeVisitorsQuery = "SELECT COUNT(*) as active FROM lib_logs WHERE time_out IS NULL";
    $stmt = $db->prepare($activeVisitorsQuery);
    $stmt->execute();
    $activeVisitors = $stmt->fetch(PDO::FETCH_ASSOC)['active'];

    echo json_encode([
        "status" => "success",
        "data" => [
            "period" => $period,
            "totalVisits" => $totalVisits,
            "activeVisitors" => $activeVisitors,
            "departmentStats" => $departmentStats
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database error",
        "debug" => $e->getMessage()
    ]);
}
?> 