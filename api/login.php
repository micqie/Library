<?php
require 'config/database.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

// Add captcha validation
if (isset($_POST['captcha_answer']) && isset($_POST['captcha_correct'])) {
    $captcha_answer = $_POST['captcha_answer'];
    $captcha_correct = $_POST['captcha_correct'];

    if ($captcha_answer != $captcha_correct) {
        echo json_encode(['success' => false, 'message' => 'Incorrect math answer. Please try again.']);
        exit();
    }
}

if (!isset($data['student_id']) || !isset($data['password'])) {
    echo json_encode(['success' => false, 'message' => 'Missing credentials']);
    exit;
}

$db = new Database();
$conn = $db->getConnection();

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database error']);
    exit;
}

// First, check if this is an admin login attempt
$stmt = $conn->prepare("SELECT * FROM tbl_users WHERE user_schoolId = :student_id AND user_typeId = 5");
$stmt->bindParam(':student_id', $data['student_id']);
$stmt->execute();

$admin_user = $stmt->fetch(PDO::FETCH_ASSOC);

// If this is an admin user
if ($admin_user) {
    if ($data['password'] !== $admin_user['user_password']) {
        echo json_encode(['success' => false, 'message' => 'Incorrect password']);
        exit;
    }

    // Start session and store admin user data
    session_start();
    $_SESSION['user_id'] = $admin_user['user_schoolId'];
    $_SESSION['user_name'] = $admin_user['user_firstname'] . ' ' . $admin_user['user_lastname'];
    $_SESSION['user_type'] = $admin_user['user_typeId'];
    $_SESSION['user_level'] = $admin_user['user_level'];

    echo json_encode([
        'success' => true,
        'redirectUrl' => './users/admin_dashboard.html',
        'user_type' => $admin_user['user_typeId']
    ]);
    exit;
}

// If not an admin, proceed with regular user login
$stmt = $conn->prepare("SELECT * FROM tbl_users WHERE user_schoolId = :student_id");
$stmt->bindParam(':student_id', $data['student_id']);
$stmt->execute();

$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode(['success' => false, 'message' => 'Student ID not found']);
    exit;
}

// Check if user is active
if ($user['user_status'] == 0) {
    echo json_encode(['success' => false, 'message' => 'Your account is deactivated. Please contact the administrator.']);
    exit;
}

if ($data['password'] !== $user['user_password']) {
    echo json_encode(['success' => false, 'message' => 'Incorrect password']);
    exit;
}

// Start session and store user data
session_start();
$_SESSION['user_id'] = $user['user_schoolId'];
$_SESSION['user_name'] = $user['user_firstname'] . ' ' . $user['user_lastname'];
$_SESSION['user_type'] = $user['user_typeId'];
$_SESSION['user_level'] = $user['user_level'];

// Check user type and set redirect URL
$redirectUrl = '';
switch ($user['user_typeId']) {
    case 1: // Visitor
    case 2: // Student
    case 3: // Faculty
    case 4: // Employee
        $redirectUrl = './users/user_dashboard.html';
        break;
    case 5: // Admin-Library
        $redirectUrl = './users/admin_dashboard.html';
        break;
    default:
        $redirectUrl = './users/user_dashboard.html';
        break;
}

echo json_encode([
    'success' => true,
    'redirectUrl' => $redirectUrl,
    'user_type' => $user['user_typeId']
]);
