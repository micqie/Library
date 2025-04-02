<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json");

include_once 'config/database.php';

// Debug logging
error_log('Session data: ' . print_r($_SESSION, true));

if (!isset($_SESSION['user_id'])) {
    error_log('User not logged in - no session ID');
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        error_log('Database connection failed');
        echo json_encode(['success' => false, 'message' => 'Database connection failed']);
        exit;
    }

    $query = "SELECT u.*, d.department_name, c.course_name 
              FROM tbl_users u 
              LEFT JOIN tbl_departments d ON u.user_departmentId = d.department_id 
              LEFT JOIN tbl_courses c ON u.user_courseId = c.course_id 
              WHERE u.user_schoolId = :schoolId";

    error_log('Executing query for user_id: ' . $_SESSION['user_id']);

    $stmt = $db->prepare($query);
    $stmt->execute(['schoolId' => $_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    error_log('Query result: ' . print_r($user, true));

    if ($user) {
        $response = [
            'success' => true,
            'user' => [
                'schoolId' => $user['user_schoolId'],
                'firstname' => $user['user_firstname'],
                'lastname' => $user['user_lastname'],
                'department' => $user['department_name'],
                'course' => $user['course_name'],
                'phinmaedEmail' => $user['phinmaed_email'],
                'personalEmail' => $user['user_email'],
                'contact' => $user['user_contact']
            ]
        ];
        error_log('Sending success response: ' . json_encode($response));
        echo json_encode($response);
    } else {
        error_log('User not found for ID: ' . $_SESSION['user_id']);
        echo json_encode(['success' => false, 'message' => 'User not found']);
    }
} catch (Exception $e) {
    error_log('Database error: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error',
        'debug' => $e->getMessage()
    ]);
}
