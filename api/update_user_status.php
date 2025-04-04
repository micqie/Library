<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get the POST data
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['school_id']) || !isset($data['status'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$school_id = $data['school_id'];
$status = $data['status'] === 'active' ? 1 : 0;

try {
    // Debug connection
    if (!$db) {
        throw new Exception("Database connection failed");
    }

    // Prepare the update statement
    $query = "UPDATE tbl_users SET user_status = :status WHERE user_schoolId = :school_id";
    $stmt = $db->prepare($query);

    // Bind parameters
    $stmt->bindParam(':status', $status, PDO::PARAM_INT);
    $stmt->bindParam(':school_id', $school_id, PDO::PARAM_STR);

    // Execute the update
    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'User status updated successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'No changes made. User may not exist.']);
        }
    } else {
        throw new Exception("Failed to execute update query");
    }
} catch (Exception $e) {
    error_log("Error in update_user_status.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage(),
        'details' => $e->getTraceAsString()
    ]);
}
