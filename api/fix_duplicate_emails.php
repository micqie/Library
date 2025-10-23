<?php
header('Content-Type: application/json');
require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Find users with duplicate @ symbols in phinmaed_email
    $query = "SELECT user_id, user_schoolId, phinmaed_email, user_email
              FROM tbl_users
              WHERE phinmaed_email LIKE '%@%@%'";

    $stmt = $db->prepare($query);
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'message' => 'Found ' . count($users) . ' users with duplicate email domains',
        'users' => $users
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
