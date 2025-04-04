<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/php-error.log');

// Set JSON header
header('Content-Type: application/json');

try {
    // Include database configuration
    require_once __DIR__ . '/config/database.php';

    // Create database connection
    $database = new Database();
    $conn = $database->getConnection();

    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    // Set timezone to Asia/Manila
    date_default_timezone_set('Asia/Manila');

    // Get current time in 24-hour format
    $currentTime = date('H:i:s');

    // Prepare and execute the update query
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
    // Log the error with full details
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
<<<<<<< HEAD
exit;
=======
exit;
>>>>>>> acd3a721cbff1227287d26116351c56f2312b946
