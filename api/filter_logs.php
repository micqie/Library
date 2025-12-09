<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config/database.php';

try {
    $rawData = file_get_contents('php://input');
    error_log("Raw POST data: " . $rawData);

    $data = json_decode($rawData, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON data: ' . json_last_error_msg());
    }

    $fromDate = $data['fromDate'] ?? null;
    $toDate = $data['toDate'] ?? null;

    if (!$fromDate || !$toDate) {
        throw new Exception('Both from and to dates are required');
    }

    // Validate date format
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fromDate) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $toDate)) {
        throw new Exception('Invalid date format. Use YYYY-MM-DD.');
    }

    $database = new Database();
    $db = $database->getConnection();
    if (!$db) {
        throw new Exception('Database connection failed');
    }

    $query = "SELECT
                l.log_id,
                l.user_schoolId,
                l.time_in,
                l.time_out,
                l.log_date,
                u.user_lastname,
                u.user_firstname,
                u.user_middlename,
                u.user_suffix,
                d.department_name,
                c.course_name
              FROM lib_logs l
              LEFT JOIN tbl_users u ON l.user_schoolId = u.user_schoolId
              LEFT JOIN tbl_departments d ON u.user_departmentId = d.department_id
              LEFT JOIN tbl_courses c ON u.user_courseId = c.course_id
              WHERE DATE(l.log_date) BETWEEN :fromDate AND :toDate
              ORDER BY l.log_date DESC, l.time_in DESC";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':fromDate', $fromDate);
    $stmt->bindParam(':toDate', $toDate);

    if (!$stmt->execute()) {
        throw new Exception("Failed to execute query: " . implode(" ", $stmt->errorInfo()));
    }

    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("Found " . count($logs) . " records");

    $formattedLogs = array_map(function ($log) {
        return [
            'user_schoolId' => $log['user_schoolId'] ?? '',
            'user_firstname' => $log['user_firstname'] ?? '',
            'user_middlename' => $log['user_middlename'] ?? '',
            'user_lastname' => $log['user_lastname'] ?? '',
            'user_suffix' => $log['user_suffix'] ?? '',
            'department_name' => $log['department_name'] ?? 'N/A',
            'course_name' => $log['course_name'] ?? 'N/A',
            'log_date' => $log['log_date'] ?? '',
            'time_in' => $log['time_in'] ?? '',
            'time_out' => $log['time_out'] ?? null
        ];
    }, $logs);

    while (ob_get_level()) {
        ob_end_clean();
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Successfully retrieved logs',
        'data' => $formattedLogs
    ], JSON_PRETTY_PRINT);
    exit;
} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    http_response_code(400);

    while (ob_get_level()) {
        ob_end_clean();
    }

    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
    exit;
}
