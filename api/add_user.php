<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"), true);

try {
  $query = "INSERT INTO tbl_users (
                user_schoolId, user_lastname, user_firstname, 
                user_middlename, user_suffix, phinmaed_email,
                user_email, user_contact, user_password,
                user_courseId, user_departmentId, user_schoolyearId,
                user_typeId, user_status, user_level
              ) VALUES (
                :schoolId, :lastname, :firstname,
                :middlename, :suffix, :phinmaed_email,
                :email, :contact, :password,
                :courseId, :departmentId, :schoolyearId,
                :typeId, :status, :level
              )";

  $stmt = $db->prepare($query);

  $defaultPassword = "phinma-coc";
  $defaultStatus = 1;
  $defaultLevel = 1;
  $defaultTypeId = 1;

  $stmt->bindParam(":schoolId", $data['user_schoolId']);
  $stmt->bindParam(":lastname", $data['user_lastname']);
  $stmt->bindParam(":firstname", $data['user_firstname']);
  $stmt->bindParam(":middlename", $data['user_middlename']);
  $stmt->bindParam(":suffix", $data['user_suffix']);
  $stmt->bindParam(":phinmaed_email", $data['phinmaed_email']);
  $stmt->bindParam(":email", $data['user_email']);
  $stmt->bindParam(":contact", $data['user_contact']);
  $stmt->bindParam(":password", $defaultPassword);
  $stmt->bindParam(":courseId", $data['user_courseId']);
  $stmt->bindParam(":departmentId", $data['user_departmentId']);
  $stmt->bindParam(":schoolyearId", $data['user_schoolyearId']);
  $stmt->bindParam(":typeId", $defaultTypeId);
  $stmt->bindParam(":status", $defaultStatus);
  $stmt->bindParam(":level", $defaultLevel);

  if ($stmt->execute()) {
    http_response_code(201);
    echo json_encode(["message" => "User created successfully."]);
  }
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
