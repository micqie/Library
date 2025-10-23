<?php
date_default_timezone_set('Asia/Manila');
header('Content-Type: application/json');
require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Test data
    $testData = [
        'schoolId' => 'test123', // This should be the school ID/username
        'firstname' => 'Test',
        'lastname' => 'User',
        'personalEmail' => 'test@gmail.com',
        'contact' => '09123456789',
        'password' => 'TestPassword123',
        'setAsSchoolId' => false
    ];

    // Simulate the registration logic
    $phinmaedEmail = '';
    if (isset($testData['setAsSchoolId']) && $testData['setAsSchoolId']) {
        if (strpos($testData['personalEmail'], '@phinmaed.com') !== false) {
            $phinmaedEmail = $testData['personalEmail'];
        }
    } else {
        if (strpos($testData['schoolId'], '@phinmaed.com') !== false) {
            $phinmaedEmail = $testData['schoolId'];
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'Registration logic test',
        'data' => [
            'schoolId' => $testData['schoolId'],
            'personalEmail' => $testData['personalEmail'],
            'phinmaedEmail' => $phinmaedEmail,
            'expected_user_schoolId' => $testData['schoolId'],
            'expected_user_email' => $testData['personalEmail']
        ]
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
