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
        'phinmaedEmail',
        'personalEmail',
        'contact',
        'password'
    ];

    foreach ($required_fields as $field) {
        if (empty($data[$field])) {
            throw new Exception("$field is required");
        }
    }

    $sql = "INSERT INTO lib_users (
        user_schoolId, user_lastname, user_firstname, user_middlename, 
        user_suffix, phinmaed_email, user_email, user_contact, 
        user_password, user_typeId, user_status, user_level
    ) VALUES (
        :schoolId, :lastname, :firstname, :middlename, 
        :suffix, :phinmaedEmail, :personalEmail, :contact, 
        :password, :userType, :status, :level
    )";

    $stmt = $db->prepare($sql);

    // student ang default user
    $defaultUserType = 2;
    $defaultLevel = 10;
    $status = 1;

    $stmt->execute([
        ':schoolId' => $data['schoolId'],
        ':lastname' => $data['lastname'],
        ':firstname' => $data['firstname'],
        ':middlename' => $data['middlename'] ?? null,
        ':suffix' => $data['suffix'] ?? null,
        ':phinmaedEmail' => $data['phinmaedEmail'],
        ':personalEmail' => $data['personalEmail'],
        ':contact' => $data['contact'],
        ':password' => $data['password'],
        ':userType' => $defaultUserType,
        ':status' => $status,
        ':level' => $defaultLevel
    ]);

    echo json_encode(['success' => true, 'message' => 'Registration successful']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
