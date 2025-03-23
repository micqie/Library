<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json");

require_once 'config/database.php';

// Read JSON input
$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['text'])) {
    $text = $data['text'];
    $date = date("Y-m-d");
    $time = date("H:i:s");

    try {
        // Check if user already has time-in today and not timed out
        $sql = "SELECT * FROM lib_logs WHERE user_schoolId = :user_schoolId AND log_date = :log_date AND time_out IS NULL";
        $stmt = $conn->prepare($sql);
        $stmt->execute(['user_schoolId' => $text, 'log_date' => $date]);

        if ($stmt->rowCount() > 0) {
            // Time-out logic
            $updateSql = "UPDATE lib_logs SET time_out = :time_out, STATUS = '1' 
                          WHERE user_schoolId = :user_schoolId AND log_date = :log_date AND time_out IS NULL";
            $updateStmt = $conn->prepare($updateSql);
            if ($updateStmt->execute(['time_out' => $time, 'user_schoolId' => $text, 'log_date' => $date])) {
                echo json_encode([
                    "status" => "success",
                    "message" => "Time-out recorded successfully!",
                    "log_date" => $date,
                    "time_out" => $time
                ]);
            } else {
                echo json_encode(["status" => "error", "message" => "Error updating time-out"]);
            }
        } else {
            // Time-in logic
            $insertSql = "INSERT INTO lib_logs (user_schoolId, time_in, log_date, STATUS) 
                          VALUES (:user_schoolId, :time_in, :log_date, '0')";
            $insertStmt = $conn->prepare($insertSql);
            if ($insertStmt->execute(['user_schoolId' => $text, 'time_in' => $time, 'log_date' => $date])) {
                echo json_encode([
                    "status" => "success",
                    "message" => "Time-in recorded successfully!",
                    "log_date" => $date,
                    "time_in" => $time
                ]);
            } else {
                echo json_encode(["status" => "error", "message" => "Error inserting time-in"]);
            }
        }
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Missing student ID"]);
}

// Close the database connection
$conn = null;
?>
