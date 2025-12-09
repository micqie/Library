<?php
date_default_timezone_set('Asia/Manila');
session_start();
header('Content-Type: application/json');
require_once 'config/database.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['current_password']) || !isset($data['new_password']) || !isset($data['confirm_password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$currentPassword = $data['current_password'];
$newPassword = $data['new_password'];
$confirmPassword = $data['confirm_password'];

// Validate new password matches confirmation
if ($newPassword !== $confirmPassword) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'New password and confirmation do not match']);
    exit;
}

// Validate new password strength
if (strlen($newPassword) < 8) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'New password must be at least 8 characters long']);
    exit;
}

$db = new Database();
$conn = $db->getConnection();

if (!$conn) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
    exit;
}

try {
    // Get user from database
    $stmt = $conn->prepare("SELECT * FROM tbl_users WHERE user_schoolId = :user_id");
    $stmt->bindParam(':user_id', $_SESSION['user_id']);
    $stmt->execute();

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }

    // Verify current password
    $stored = $user['user_password'];
    $isValid = false;

    if (!empty($stored) && str_starts_with($stored, '$')) {
        $isValid = password_verify($currentPassword, $stored);
    } else {
        // Legacy plaintext fallback
        $isValid = hash_equals($stored, $currentPassword);
    }

    if (!$isValid) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Current password is incorrect']);
        exit;
    }

    // Hash new password
    $hashedNewPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    // Update password and clear must_change_password flag
    $updateStmt = $conn->prepare("UPDATE tbl_users SET user_password = :password, must_change_password = 0 WHERE user_schoolId = :user_id");
    $updateStmt->bindParam(':password', $hashedNewPassword);
    $updateStmt->bindParam(':user_id', $_SESSION['user_id']);

    if ($updateStmt->execute()) {
        // Determine redirect URL based on user type
        $redirectUrl = './users/user_dashboard.html';
        switch ($user['user_typeId']) {
            case 5: // Admin-Library
                $redirectUrl = './users/admin_dashboard.html';
                break;
            case 6: // Scanner
                $redirectUrl = './users/admin_scanner.html';
                break;
        }

        echo json_encode([
            'success' => true,
            'message' => 'Password changed successfully',
            'redirectUrl' => $redirectUrl
        ]);
    } else {
        throw new Exception('Failed to update password');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

