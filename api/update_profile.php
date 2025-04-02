<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json");

include_once 'config/database.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'No data provided']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $query = "UPDATE tbl_users 
              SET user_firstname = :firstname,
                  user_lastname = :lastname,
                  user_email = :personal_email,
                  user_contact = :contact
              WHERE user_schoolId = :schoolId";

    $stmt = $db->prepare($query);

    $stmt->execute([
        'firstname' => $data['firstname'],
        'lastname' => $data['lastname'],
        'personal_email' => $data['personal_email'],
        'contact' => $data['contact'],
        'schoolId' => $_SESSION['user_id']
    ]);

    if ($stmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Profile updated successfully'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No changes made to profile'
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error',
        'debug' => $e->getMessage()
    ]);
}
