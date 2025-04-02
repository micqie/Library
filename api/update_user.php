<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"), true);

try {
    $query = "UPDATE tbl_users SET 
                user_schoolId = :schoolId,
                user_lastname = :lastname,
                user_firstname = :firstname,
                user_middlename = :middlename,
                user_suffix = :suffix,
                phinmaed_email = :phinmaed_email,
                user_email = :email,
                user_contact = :contact,
                user_courseId = :courseId,
                user_departmentId = :departmentId,
                user_schoolyearId = :schoolyearId,
                user_status = :status
              WHERE user_id = :user_id";
    
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(":user_id", $data['user_id']);
    $stmt->bindParam(":schoolId", $data['user_schoolId']);
    $stmt->bindParam(":lastname", $data['user_lastname']);
    $stmt->bindParam(":firstname", $data['user_firstname']);
    $stmt->bindParam(":middlename", $data['user_middlename']);
    $stmt->bindParam(":suffix", $data['user_suffix']);
    $stmt->bindParam(":phinmaed_email", $data['phinmaed_email']);
    $stmt->bindParam(":email", $data['user_email']);
    $stmt->bindParam(":contact", $data['user_contact']);
    $stmt->bindParam(":courseId", $data['user_courseId']);
    $stmt->bindParam(":departmentId", $data['user_departmentId']);
    $stmt->bindParam(":schoolyearId", $data['user_schoolyearId']);
    $stmt->bindParam(":status", $data['user_status']);
    
    if($stmt->execute()) {
        echo json_encode(["message" => "User updated successfully."]);
    }
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?> 