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
    $schoolId = $data['user_schoolId'];
    $isManual = isset($data['is_manual']) ? $data['is_manual'] : false;

    // First check if user exists
    $check_query = "SELECT * FROM tbl_users WHERE user_schoolId = :user_schoolId";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(":user_schoolId", $schoolId);
    $check_stmt->execute();

    if ($check_stmt->rowCount() > 0) {
        // First, close any old unclosed sessions from previous days
        $close_old_sessions = "UPDATE lib_logs 
                             SET time_out = time_in
                             WHERE user_schoolId = :user_schoolId 
                             AND time_out IS NULL 
                             AND DATE(time_in) != CURDATE()";
        $close_stmt = $db->prepare($close_old_sessions);
        $close_stmt->bindParam(":user_schoolId", $schoolId);
        $close_stmt->execute();

        // Check for active session today
        $active_query = "SELECT *, TIMESTAMPDIFF(MINUTE, time_in, CURRENT_TIMESTAMP) as time_diff 
                       FROM lib_logs 
                       WHERE user_schoolId = :user_schoolId 
                       AND time_out IS NULL 
                       AND DATE(time_in) = CURDATE()
                       ORDER BY log_id DESC LIMIT 1";
        $active_stmt = $db->prepare($active_query);
        $active_stmt->bindParam(":user_schoolId", $schoolId);
        $active_stmt->execute();

        if ($active_stmt->rowCount() > 0) {
            $active_record = $active_stmt->fetch(PDO::FETCH_ASSOC);
            
            // Apply 1-minute rule for same-day time-outs
            if ($active_record['time_diff'] < 1) {
                http_response_code(400);
                echo json_encode(array(
                    "message" => "Please wait a moment before timing out",
                    "remaining_seconds" => 60 - ($active_record['time_diff'] * 60),
                    "is_early_timeout" => true
                ));
                exit;
            }

            // Process time-out
            $update_query = "UPDATE lib_logs 
                           SET time_out = CURRENT_TIME() 
                           WHERE log_id = :log_id";
            $update_stmt = $db->prepare($update_query);
            $update_stmt->bindParam(":log_id", $active_record['log_id']);
            
            if ($update_stmt->execute()) {
                // Get user details with time-out time
                $user_query = "SELECT u.*, 
                    d.department_name, 
                    c.course_name, 
                    TIME_FORMAT(l.time_in, '%l:%i:%s %p') as time_in,  
                    TIME_FORMAT(l.time_out, '%l:%i:%s %p') as time_out,  
                    l.log_id
                FROM tbl_users u 
                LEFT JOIN tbl_departments d ON u.user_departmentId = d.department_id 
                LEFT JOIN tbl_courses c ON u.user_courseId = c.course_id 
                INNER JOIN lib_logs l ON u.user_schoolId = l.user_schoolId
                WHERE l.log_id = :log_id";
                $user_stmt = $db->prepare($user_query);
                $user_stmt->bindParam(":log_id", $active_record['log_id']);
                $user_stmt->execute();
                $user_data = $user_stmt->fetch(PDO::FETCH_ASSOC);

                http_response_code(200);
                echo json_encode(array(
                    "message" => "Time-out successful.",
                    "user_data" => $user_data,
                    "is_timeout" => true
                ));
            } else {
                throw new Exception("Failed to record time-out.");
            }
        } else {
            // Create new time-in record
            $query = "INSERT INTO lib_logs (user_schoolId, time_in) VALUES (:user_schoolId, CURRENT_TIME())";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":user_schoolId", $schoolId);
            
            if ($stmt->execute()) {
                $log_id = $db->lastInsertId();
                
                // Get user details with the new time-in
                $user_query = "SELECT u.*, 
                    d.department_name, 
                    c.course_name, 
                    TIME_FORMAT(l.time_in, '%l:%i:%s %p') as time_in,  
                    TIME_FORMAT(l.time_out, '%l:%i:%s %p') as time_out,  
                    l.log_id
                FROM tbl_users u 
                LEFT JOIN tbl_departments d ON u.user_departmentId = d.department_id 
                LEFT JOIN tbl_courses c ON u.user_courseId = c.course_id 
                INNER JOIN lib_logs l ON u.user_schoolId = l.user_schoolId
                WHERE l.log_id = :log_id";
                $user_stmt = $db->prepare($user_query);
                $user_stmt->bindParam(":log_id", $log_id);
                $user_stmt->execute();
                $user_data = $user_stmt->fetch(PDO::FETCH_ASSOC);

                http_response_code(200);
                echo json_encode(array(
                    "message" => "Time-in successful.",
                    "user_data" => $user_data,
                    "is_timeout" => false
                ));
            } else {
                throw new Exception("Failed to record time-in.");
            }
        }
    } else {
        http_response_code(404);
        echo json_encode(array("message" => "User not found."));
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?> 