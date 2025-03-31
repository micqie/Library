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

$stmt = $conn->prepare("SELECT * FROM tbl_users WHERE user_schoolId = :student_id");
$stmt->bindParam(':student_id', $data['student_id']);
$stmt->execute();

$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode(['success' => false, 'message' => 'Student ID not found']);
    exit;
}

if ($data['password'] !== $user['user_password']) {
    echo json_encode(['success' => false, 'message' => 'Incorrect password']);
    exit;
}

echo json_encode(['success' => true]);