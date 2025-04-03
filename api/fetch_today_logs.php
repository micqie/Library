<?php
require_once 'config/database.php';
header('Content-Type: application/json');

try {
    // Database connection
    $database = new Database();
    $db = $database->getConnection();

    // SQL Query for recent logs
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
              ORDER BY l.log_date DESC, l.time_in DESC
              LIMIT 50"; // Get last 50 records

    $stmt = $db->prepare($query);
    $stmt->execute();

    // Debug: Log the number of rows
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("Number of logs found: " . count($logs));
    error_log("SQL Query: " . $query);

    // Debug: Log the first record if exists
    if (count($logs) > 0) {
        error_log("First record: " . print_r($logs[0], true));
    }

    // Format the data
    $formattedLogs = array_map(function ($log) {
        $formatted = [
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
        error_log("Formatted log entry: " . print_r($formatted, true));
        return $formatted;
    }, $logs);

    $response = [
        'status' => 'success',
        'message' => 'Successfully retrieved logs',
        'data' => $formattedLogs
    ];

    // Debug: Log the final response
    error_log("Sending response: " . json_encode($response));

    echo json_encode($response);
} catch (Exception $e) {
    error_log("Error in fetch_today_logs.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
