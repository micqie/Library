<?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_name']) || !isset($_SESSION['user_type'])) {
    // User is not logged in, redirect to login page
    header('Location: ../index.html');
    exit();
}

// Optional: Add session timeout check
$session_timeout = 3600; // 1 hour
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $session_timeout)) {
    // Session has expired
    session_unset();
    session_destroy();
    header('Location: ../index.html');
    exit();
}

// Update last activity time
$_SESSION['last_activity'] = time();

header('Content-Type: application/json');

if (isset($_SESSION['user_id'])) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false]);
}
