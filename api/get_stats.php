<?php
// Disable error reporting for production
error_reporting(0);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    date_default_timezone_set('Asia/Manila');
    $today = date('Y-m-d');
    error_log("Today's date (PHP): " . $today);

    $query = "
        SELECT
            COUNT(*) as total_visits,
            COUNT(DISTINCT user_schoolId) as unique_visitors,
            (
                SELECT COUNT(*)
                FROM lib_logs
                WHERE time_out IS NULL
                AND log_date = :today
            ) as active_visitors,
            (
                SELECT TIME_FORMAT(time_in, '%h:00 %p')
                FROM lib_logs
                WHERE log_date = :today
                GROUP BY HOUR(time_in)
                ORDER BY COUNT(*) DESC
                LIMIT 1
            ) as peak_hour
        FROM lib_logs
        WHERE log_date = :today
    ";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':today', $today);
    $stmt->execute();
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);

    // Get department stats for today
    $deptQuery = "
        SELECT
            d.department_name,
            COUNT(l.log_id) as total_visits,
            COUNT(DISTINCT l.user_schoolId) as unique_visitors
        FROM tbl_departments d
        LEFT JOIN tbl_users u ON d.department_id = u.user_departmentId
        LEFT JOIN lib_logs l ON u.user_schoolId = l.user_schoolId
        WHERE l.log_date = :today
        GROUP BY d.department_id, d.department_name
        ORDER BY total_visits DESC
        LIMIT 5
    ";

    $stmt = $db->prepare($deptQuery);
    $stmt->bindParam(':today', $today);
    $stmt->execute();
    $departmentStats = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get top visitors for today
    $visitorQuery = "
        SELECT
            u.user_firstname,
            u.user_lastname,
            u.user_schoolId,
            d.department_name,
            COUNT(*) as visit_count
        FROM lib_logs l
        JOIN tbl_users u ON l.user_schoolId = u.user_schoolId
        LEFT JOIN tbl_departments d ON u.user_departmentId = d.department_id
        WHERE l.log_date = :today
        GROUP BY u.user_schoolId
        ORDER BY visit_count DESC
        LIMIT 5
    ";

    $stmt = $db->prepare($visitorQuery);
    $stmt->bindParam(':today', $today);
    $stmt->execute();
    $topVisitors = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Before sending response, log the data
    error_log("Sending response: " . json_encode([
        "status" => "success",
        "data" => [
            "totalVisits" => $stats['total_visits'],
            "uniqueVisitors" => $stats['unique_visitors'],
            "activeVisitors" => $stats['active_visitors'],
            "peakHour" => $stats['peak_hour'],
            "departmentStats" => $departmentStats,
            "topVisitors" => $topVisitors
        ]
    ]));

    echo json_encode([
        "status" => "success",
        "data" => [
            "totalVisits" => $stats['total_visits'],
            "uniqueVisitors" => $stats['unique_visitors'],
            "activeVisitors" => $stats['active_visitors'],
            "peakHour" => $stats['peak_hour'],
            "departmentStats" => $departmentStats,
            "topVisitors" => $topVisitors
        ]
    ]);
} catch (Exception $e) {
    error_log("Stats error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Failed to fetch statistics"
    ]);
}
