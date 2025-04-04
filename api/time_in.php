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

    // For manual entries, skip the cooldown check
    if (!$isManual) {
        // Only check cooldown for QR scans
    }

    // First check if user exists
    $check_query = "SELECT * FROM tbl_users WHERE user_schoolId = :user_schoolId";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(":user_schoolId", $schoolId);
    $check_stmt->execute();

    if ($check_stmt->rowCount() > 0) {
        $user = $check_stmt->fetch(PDO::FETCH_ASSOC);

        // Check if user is active
        if ($user['user_status'] == 0) {
            http_response_code(403);
            echo json_encode(array("message" => "This account is deactivated. Please contact the administrator."));
            exit;
        }

        // Check if user has an active time-in (no time-out)
        $active_query = "SELECT *, TIMESTAMPDIFF(SECOND, time_in, CURRENT_TIMESTAMP) as time_diff 
                       FROM lib_logs 
                       WHERE user_schoolId = :user_schoolId 
                       AND time_out IS NULL 
                       ORDER BY log_id DESC LIMIT 1";
        $active_stmt = $db->prepare($active_query);
        $active_stmt->bindParam(":user_schoolId", $schoolId);
        $active_stmt->execute();

        if ($active_stmt->rowCount() > 0) {
            $active_record = $active_stmt->fetch(PDO::FETCH_ASSOC);

            // Check if at least 1 minute has passed
            if ($active_record['time_diff'] < 60) {
                http_response_code(400);
                echo json_encode(array(
                    "message" => "Cannot timeout yet",
                    "remaining_seconds" => 60 - $active_record['time_diff'],
                    "is_early_timeout" => true
                ));
                exit;
            }

            // User has active time-in and enough time has passed, update with time-out
            $update_query = "UPDATE lib_logs 
                           SET time_out = CURRENT_TIME() 
                           WHERE log_id = :log_id";
            $update_stmt = $db->prepare($update_query);
            $update_stmt->bindParam(":log_id", $active_record['log_id']);

            if ($update_stmt->execute()) {
                // Get user details with time-out time
                $user_query = "SELECT u.*, d.department_name, c.course_name, l.time_in, l.time_out, l.log_id
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
            // Check last record to see if it was a timeout
            $last_record_query = "SELECT * FROM lib_logs 
                                WHERE user_schoolId = :user_schoolId 
                                ORDER BY log_id DESC LIMIT 1";
            $last_record_stmt = $db->prepare($last_record_query);
            $last_record_stmt->bindParam(":user_schoolId", $schoolId);
            $last_record_stmt->execute();
            $last_record = $last_record_stmt->fetch(PDO::FETCH_ASSOC);

            // Create new time-in record if last record has a timeout or no records exist
            if (!$last_record || $last_record['time_out'] !== null) {
                $query = "INSERT INTO lib_logs (user_schoolId, time_in) VALUES (:user_schoolId, CURRENT_TIME())";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":user_schoolId", $schoolId);

                if ($stmt->execute()) {
                    $log_id = $db->lastInsertId();

                    // Get user details with the new time-in
                    $user_query = "SELECT u.*, d.department_name, c.course_name, l.time_in, l.log_id
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
            } else {
                http_response_code(400);
                echo json_encode(array("message" => "User already has an active time-in."));
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
