<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Get period from request (day, week, month)
    $period = isset($_GET['period']) ? $_GET['period'] : 'day';

    // Get top visitors stats
    $topVisitorsQuery = "SELECT 
        u.user_schoolId,
        u.user_firstname,
        u.user_lastname,
        u.user_middlename,
        d.department_name,
        c.course_name,
        COUNT(*) as visit_count
    FROM lib_logs l
    JOIN lib_users u ON l.user_schoolId = u.user_schoolId
    LEFT JOIN lib_departments d ON u.user_departmentId = d.department_id
    LEFT JOIN lib_courses c ON u.user_courseId = c.course_id
    WHERE ";

    // Add date condition based on period
    switch($period) {
        case 'day':
            $topVisitorsQuery .= "DATE(l.time_in) = CURDATE()";
            break;
        case 'week':
            $topVisitorsQuery .= "YEARWEEK(l.time_in, 1) = YEARWEEK(CURDATE(), 1)";
            break;
        case 'month':
            $topVisitorsQuery .= "YEAR(l.time_in) = YEAR(CURDATE()) AND MONTH(l.time_in) = MONTH(CURDATE())";
            break;
    }

    $topVisitorsQuery .= " GROUP BY u.user_schoolId
        ORDER BY visit_count DESC
        LIMIT 5";

    $stmt = $db->prepare($topVisitorsQuery);
    $stmt->execute();
    $topVisitors = $stmt->fetchAll(PDO::FETCH_ASSOC);

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