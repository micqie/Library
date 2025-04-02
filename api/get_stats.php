<?php
// Add this at the start of the file for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Get period from request (day, week, month)
    $period = isset($_GET['period']) ? $_GET['period'] : 'day';
    
    // Debug log
    error_log("Fetching stats for period: " . $period);

    // Get department visit stats with student details
    $deptVisitsQuery = "SELECT 
        d.department_name,
        u.user_firstname,
        u.user_lastname,
        u.user_schoolId,
        COUNT(*) as visit_count
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

    $deptVisitsQuery .= " GROUP BY d.department_id, u.user_schoolId
        ORDER BY visit_count DESC
        LIMIT 10"; // Get top 10 visitors

    $stmt = $db->prepare($deptVisitsQuery);
    $stmt->execute();
    $topVisitors = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get department summary
    $deptSummaryQuery = "SELECT 
        d.department_name,
        COUNT(DISTINCT l.user_schoolId) as unique_visitors,
        COUNT(*) as total_visits
    FROM lib_logs l
    JOIN tbl_users u ON l.user_schoolId = u.user_schoolId
    JOIN tbl_departments d ON u.user_departmentId = d.department_id
    WHERE ";

    switch($period) {
        case 'day':
            $deptSummaryQuery .= "DATE(l.time_in) = CURDATE()";
            break;
        case 'week':
            $deptSummaryQuery .= "YEARWEEK(l.time_in, 1) = YEARWEEK(CURDATE(), 1)";
            break;
        case 'month':
            $deptSummaryQuery .= "YEAR(l.time_in) = YEAR(CURDATE()) AND MONTH(l.time_in) = MONTH(CURDATE())";
            break;
    }

    $deptSummaryQuery .= " GROUP BY d.department_id
        ORDER BY total_visits DESC";

    $stmt = $db->prepare($deptSummaryQuery);
    $stmt->execute();
    $departmentStats = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get total visits for the period
    $totalVisitsQuery = "SELECT COUNT(*) as total, COUNT(DISTINCT user_schoolId) as unique_users 
    FROM lib_logs WHERE ";
    
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
    $visitStats = $stmt->fetch(PDO::FETCH_ASSOC);

    // Get currently active visitors
    $activeVisitorsQuery = "SELECT COUNT(*) as active FROM lib_logs WHERE time_out IS NULL";
    $stmt = $db->prepare($activeVisitorsQuery);
    $stmt->execute();
    $activeVisitors = $stmt->fetch(PDO::FETCH_ASSOC)['active'];

    // Before sending response, log the data
    error_log("Sending response: " . json_encode([
        "status" => "success",
        "data" => [
            "period" => $period,
            "totalVisits" => $visitStats['total'],
            "uniqueVisitors" => $visitStats['unique_users'],
            "activeVisitors" => $activeVisitors,
            "departmentStats" => $departmentStats,
            "topVisitors" => $topVisitors
        ]
    ]));

    echo json_encode([
        "status" => "success",
        "data" => [
            "period" => $period,
            "totalVisits" => $visitStats['total'],
            "uniqueVisitors" => $visitStats['unique_users'],
            "activeVisitors" => $activeVisitors,
            "departmentStats" => $departmentStats,
            "topVisitors" => $topVisitors
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