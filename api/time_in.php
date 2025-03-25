<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['user_schoolId'])) {
        throw new Exception("School ID is required");
    }
    
    $schoolId = $data['user_schoolId'];
    $isManual = isset($data['is_manual']) ? $data['is_manual'] : false;

    // First check if user exists
    $check_query = "SELECT * FROM lib_users WHERE user_schoolId = :user_schoolId";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(":user_schoolId", $schoolId);
    $check_stmt->execute();

    if ($check_stmt->rowCount() > 0) {
        // Auto timeout users after 24 hours
        $auto_timeout_query = "UPDATE lib_logs 
                             SET time_out = DATE_ADD(time_in, INTERVAL 24 HOUR)
                             WHERE user_schoolId = :user_schoolId 
                             AND time_out IS NULL 
                             AND time_in < DATE_SUB(NOW(), INTERVAL 24 HOUR)";
        $auto_timeout_stmt = $db->prepare($auto_timeout_query);
        $auto_timeout_stmt->bindParam(":user_schoolId", $schoolId);
        $auto_timeout_stmt->execute();

        // Check if user has an active time-in (no time-out)
        $active_query = "SELECT *, 
                        TIMESTAMPDIFF(SECOND, time_in, CURRENT_TIMESTAMP) as time_diff 
                        FROM lib_logs 
                        WHERE user_schoolId = :user_schoolId 
                        AND time_out IS NULL 
                        ORDER BY log_id DESC LIMIT 1";
        
        $active_stmt = $db->prepare($active_query);
        $active_stmt->bindParam(":user_schoolId", $schoolId);
        $active_stmt->execute();

        if ($active_stmt->rowCount() > 0) {
            $active_record = $active_stmt->fetch(PDO::FETCH_ASSOC);
            
            // Keep the 1-minute cooldown check for timeout
            if ($active_record['time_diff'] < 60) {
                $remaining = 60 - $active_record['time_diff'];
                http_response_code(400);
                echo json_encode([
                    "status" => "error",
                    "message" => "Cannot timeout yet. Please wait.",
                    "remaining_seconds" => $remaining,
                    "is_early_timeout" => true
                ]);
                exit;
            }

            // Process timeout
            $update_query = "UPDATE lib_logs 
                           SET time_out = CURRENT_TIMESTAMP 
                           WHERE log_id = :log_id";
            $update_stmt = $db->prepare($update_query);
            $update_stmt->bindParam(":log_id", $active_record['log_id']);
            
            if ($update_stmt->execute()) {
                // Get updated user details
                $user_query = "SELECT u.*, d.department_name, c.course_name, 
                             l.time_in, l.time_out, l.log_id
                             FROM lib_users u 
                             LEFT JOIN lib_departments d ON u.user_departmentId = d.department_id 
                             LEFT JOIN lib_courses c ON u.user_courseId = c.course_id 
                             INNER JOIN lib_logs l ON u.user_schoolId = l.user_schoolId
                             WHERE l.log_id = :log_id";
                $user_stmt = $db->prepare($user_query);
                $user_stmt->bindParam(":log_id", $active_record['log_id']);
                $user_stmt->execute();
                $user_data = $user_stmt->fetch(PDO::FETCH_ASSOC);

                http_response_code(200);
                echo json_encode([
                    "status" => "success",
                    "message" => "Time-out successful",
                    "user_data" => $user_data,
                    "is_timeout" => true
                ]);
            } else {
                throw new Exception("Failed to record time-out");
            }
        } else {
            // Process new time-in
            $query = "INSERT INTO lib_logs (user_schoolId, time_in) 
                     VALUES (:user_schoolId, CURRENT_TIMESTAMP)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":user_schoolId", $schoolId);
            
            if ($stmt->execute()) {
                $log_id = $db->lastInsertId();
                
                // Get user details with new time-in
                $user_query = "SELECT u.*, d.department_name, c.course_name, 
                             l.time_in, l.log_id
                             FROM lib_users u 
                             LEFT JOIN lib_departments d ON u.user_departmentId = d.department_id 
                             LEFT JOIN lib_courses c ON u.user_courseId = c.course_id 
                             INNER JOIN lib_logs l ON u.user_schoolId = l.user_schoolId
                             WHERE l.log_id = :log_id";
                $user_stmt = $db->prepare($user_query);
                $user_stmt->bindParam(":log_id", $log_id);
                $user_stmt->execute();
                $user_data = $user_stmt->fetch(PDO::FETCH_ASSOC);

                http_response_code(200);
                echo json_encode([
                    "status" => "success",
                    "message" => "Time-in successful",
                    "user_data" => $user_data,
                    "is_timeout" => false
                ]);
            } else {
                throw new Exception("Failed to record time-in");
            }
        }
    } else {
        http_response_code(404);
        echo json_encode([
            "status" => "error",
            "message" => "User not found"
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?> 