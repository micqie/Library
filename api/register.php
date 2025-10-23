<?php
header('Content-Type: application/json');
require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

try {
    $required_fields = [
        'schoolId',
        'lastname',
        'firstname',
        'personalEmail',
        'contact',
        'password',
        'captcha_answer',
        'captcha_correct'
    ];

    foreach ($required_fields as $field) {
        if (empty($data[$field])) {
            throw new Exception("$field is required");
        }
    }

    // Validate captcha
    if ($data['captcha_answer'] != $data['captcha_correct']) {
        echo json_encode(['success' => false, 'message' => 'Security check failed. Please try again.']);
        exit;
    }

    // Check if school ID already exists
    $checkStmt = $db->prepare("SELECT COUNT(*) FROM tbl_users WHERE user_schoolId = ?");
    $checkStmt->execute([$data['schoolId']]);
    if ($checkStmt->fetchColumn() > 0) {
        echo json_encode(['success' => false, 'message' => 'School ID already registered']);
        exit;
    }

    $sql = "INSERT INTO tbl_users (
        user_schoolId, user_lastname, user_firstname, user_middlename,
        user_suffix, phinmaed_email, user_email, user_contact,
        user_password, user_typeId, user_status, user_level" .
        (!empty($data['department']) ? ", user_departmentId" : "") .
        (!empty($data['course']) ? ", user_courseId" : "") .
        ") VALUES (
        :schoolId, :lastname, :firstname, :middlename,
        :suffix, :phinmaedEmail, :personalEmail, :contact,
        :password, :userType, :status, :level" .
        (!empty($data['department']) ? ", :department" : "") .
        (!empty($data['course']) ? ", :course" : "") .
        ")";

    $stmt = $db->prepare($sql);

    // Set user type based on whether email is used as username
    $userType = isset($data['setAsSchoolId']) && $data['setAsSchoolId'] ? 1 : 2;
    $defaultLevel = 10;
    $status = 1;

    // Hash password securely
    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

    // Generate phinmaed email only if user is using a phinmaed account
    $phinmaedEmail = '';
    if (isset($data['setAsSchoolId']) && $data['setAsSchoolId']) {
        // User is using email as school ID, check if it's a phinmaed email
        if (strpos($data['personalEmail'], '@phinmaed.com') !== false) {
            $phinmaedEmail = $data['personalEmail'];
        }
    } else {
        // User provided a separate school ID, generate phinmaed email
        $phinmaedEmail = $data['schoolId'] . '@phinmaed.com';
    }

    $params = [
        ':schoolId' => $data['schoolId'],
        ':lastname' => $data['lastname'],
        ':firstname' => $data['firstname'],
        ':middlename' => $data['middlename'] ?? null,
        ':suffix' => $data['suffix'] ?? null,
        ':phinmaedEmail' => $phinmaedEmail,
        ':personalEmail' => $data['personalEmail'],
        ':contact' => $data['contact'],
        ':password' => $hashedPassword,
        ':userType' => $userType,
        ':status' => $status,
        ':level' => $defaultLevel
    ];

    if (!empty($data['department'])) {
        $params[':department'] = $data['department'];
    }
    if (!empty($data['course'])) {
        $params[':course'] = $data['course'];
    }

    if ($stmt->execute($params)) {
        echo json_encode(['success' => true, 'message' => 'Registration successful']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to insert user data']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'An error occurred: ' . $e->getMessage()]);
}
