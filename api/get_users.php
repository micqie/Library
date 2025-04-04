<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Debug connection
    if (!$db) {
        throw new Exception("Database connection failed");
    }

    // Query to get users with their department and course names
    $query = "SELECT 
        u.user_schoolId,
        u.user_firstname,
        u.user_lastname,
        u.user_email,
        ut.user_type as role,
        d.department_name,
        c.course_name,
        u.user_status
    FROM tbl_users u
    LEFT JOIN tbl_departments d ON u.user_departmentId = d.department_id
    LEFT JOIN tbl_courses c ON u.user_courseId = c.course_id
    LEFT JOIN tbl_usertype ut ON u.user_typeId = ut.user_typeId
    ORDER BY u.user_id DESC";

    $stmt = $db->prepare($query);
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Debug output
    error_log("Users data: " . print_r($users, true));

    if (!$users) {
        echo json_encode([]);
        exit;
    }

    // Format the user data
    $formattedUsers = array_map(function ($user) {
        return [
            'school_id' => $user['user_schoolId'] ?? 'N/A',
            'name' => trim(($user['user_firstname'] ?? '') . ' ' . ($user['user_lastname'] ?? '')),
            'email' => $user['user_email'] ?? '',
            'department' => $user['department_name'] ?? 'Not Assigned',
            'course' => $user['course_name'] ?? 'Not Assigned',
            'role' => $user['role'] ?? 'User',
            'status' => $user['user_status'] == 1 ? 'active' : 'inactive'
        ];
    }, $users);

    // Debug output
    error_log("Formatted users: " . print_r($formattedUsers, true));

    echo json_encode($formattedUsers);
} catch (Exception $e) {
    error_log("Error in get_users.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error: ' . $e->getMessage(),
        'details' => $e->getTraceAsString()
    ]);
}
