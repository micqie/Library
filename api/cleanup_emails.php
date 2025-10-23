<?php
date_default_timezone_set('Asia/Manila'); // Set timezone to Philippines
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

    // Also convert existing names to proper case using PHP function
    function toCamelCase($str) {
        // Remove extra spaces and trim
        $str = trim(preg_replace('/\s+/', ' ', $str));

        // Handle special cases like "Mc", "Mac", "O'", "De", "La", "Le", "Van", "Von"
        $specialPrefixes = ['Mc', 'Mac', 'O\'', 'De', 'La', 'Le', 'Van', 'Von'];

        // Convert to lowercase first
        $str = strtolower($str);

        // Capitalize first letter of each word
        $str = ucwords($str);

        // Handle special prefixes
        foreach ($specialPrefixes as $prefix) {
            $str = preg_replace('/\b' . preg_quote($prefix, '/') . '\b/i', $prefix, $str);
        }

        return $str;
    }

    // Get all users and update their names
    $getUsersQuery = "SELECT user_id, user_firstname, user_lastname, user_middlename, user_suffix FROM tbl_users";
    $getUsersStmt = $db->prepare($getUsersQuery);
    $getUsersStmt->execute();
    $users = $getUsersStmt->fetchAll(PDO::FETCH_ASSOC);

    $nameUpdateCount = 0;
    foreach ($users as $user) {
        $updateQuery = "UPDATE tbl_users
                        SET user_firstname = :firstname,
                            user_lastname = :lastname,
                            user_middlename = :middlename,
                            user_suffix = :suffix
                        WHERE user_id = :user_id";

        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->execute([
            ':firstname' => toCamelCase($user['user_firstname']),
            ':lastname' => toCamelCase($user['user_lastname']),
            ':middlename' => !empty($user['user_middlename']) ? toCamelCase($user['user_middlename']) : $user['user_middlename'],
            ':suffix' => !empty($user['user_suffix']) ? toCamelCase($user['user_suffix']) : $user['user_suffix'],
            ':user_id' => $user['user_id']
        ]);

        if ($updateStmt->rowCount() > 0) {
            $nameUpdateCount++;
        }
    }

    echo json_encode([
        'success' => true,
        'message' => "Cleaned up $affectedRows users with incorrect phinmaed_email and converted $nameUpdateCount names to proper case",
        'email_fixes' => $affectedRows,
        'name_fixes' => $nameUpdateCount
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
