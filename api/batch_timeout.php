<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/php-error.log');

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/config/database.php';

    $database = new Database();
    $conn = $database->getConnection();

    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    date_default_timezone_set('Asia/Manila');

    $currentTime = date('H:i:s');

    $query = "UPDATE lib_logs 
              SET time_out = :time_out
              WHERE time_out IS NULL 
              AND log_date = CURDATE()";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(':time_out', $currentTime);

    if ($stmt->execute()) {
        $affectedRows = $stmt->rowCount();

        $response = [
            'status' => 'success',
            'message' => "Successfully timed out {$affectedRows} active users at " . date('h:i:s A'),
            'affected_rows' => $affectedRows,
            'timeout_time' => $currentTime
        ];

        echo json_encode($response);
    } else {
        throw new Exception("Failed to execute batch timeout");
    }
} catch (Exception $e) {
    error_log("Batch Timeout Error: " . $e->getMessage() . "\n" .
        "File: " . $e->getFile() . "\n" .
        "Line: " . $e->getLine() . "\n" .
        "Trace: " . $e->getTraceAsString());

    $response = [
        'status' => 'error',
        'message' => $e->getMessage()
    ];

    http_response_code(500);
    echo json_encode($response);
}
exit;
