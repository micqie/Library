<?php
header('Content-Type: application/json');
require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Fix users where phinmaed_email has duplicate @ symbols
    // This happens when someone uses gmail.com but system still appends @phinmaed.com

    $query = "UPDATE tbl_users
              SET phinmaed_email = ''
              WHERE phinmaed_email LIKE '%@%@%'
              AND phinmaed_email NOT LIKE '%@phinmaed.com'";

    $stmt = $db->prepare($query);
    $result = $stmt->execute();
    $affectedRows = $stmt->rowCount();

    echo json_encode([
        'success' => true,
        'message' => "Cleaned up $affectedRows users with incorrect phinmaed_email",
        'affected_rows' => $affectedRows
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
