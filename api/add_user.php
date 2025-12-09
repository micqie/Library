<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"), true);

try {
  // Validate required fields
  if (empty($data['user_schoolId']) || empty($data['user_lastname']) || empty($data['user_firstname']) ||
      empty($data['user_email']) || empty($data['user_contact']) || empty($data['user_password']) ||
      empty($data['user_typeId'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required fields"]);
    exit;
  }

  // Check if school ID already exists
  $checkStmt = $db->prepare("SELECT COUNT(*) FROM tbl_users WHERE user_schoolId = ?");
  $checkStmt->execute([$data['user_schoolId']]);
  if ($checkStmt->fetchColumn() > 0) {
    http_response_code(400);
    echo json_encode(["error" => "School ID already exists"]);
    exit;
  }

  // Get default level from user type
  $typeStmt = $db->prepare("SELECT user_defaultLevel FROM tbl_usertype WHERE user_typeId = ?");
  $typeStmt->execute([$data['user_typeId']]);
  $userType = $typeStmt->fetch(PDO::FETCH_ASSOC);
  $defaultLevel = $userType ? $userType['user_defaultLevel'] : 10;

  // Hash password
  $hashedPassword = password_hash($data['user_password'], PASSWORD_DEFAULT);

  // Admin-created users must change password on first login
  $mustChangePassword = 1;
  $defaultStatus = 1;

  // Handle optional fields
  $middlename = $data['user_middlename'] ?? null;
  $suffix = $data['user_suffix'] ?? null;
  $phinmaed_email = $data['phinmaed_email'] ?? '';
  $courseId = !empty($data['user_courseId']) ? $data['user_courseId'] : null;
  $departmentId = !empty($data['user_departmentId']) ? $data['user_departmentId'] : null;
  $schoolyearId = !empty($data['user_schoolyearId']) ? $data['user_schoolyearId'] : null;

  $query = "INSERT INTO tbl_users (
                user_schoolId, user_lastname, user_firstname,
                user_middlename, user_suffix, phinmaed_email,
                user_email, user_contact, user_password,
                user_courseId, user_departmentId, user_schoolyearId,
                user_typeId, user_status, user_level, must_change_password
              ) VALUES (
                :schoolId, :lastname, :firstname,
                :middlename, :suffix, :phinmaed_email,
                :email, :contact, :password,
                :courseId, :departmentId, :schoolyearId,
                :typeId, :status, :level, :mustChangePassword
              )";

  $stmt = $db->prepare($query);

  $stmt->bindParam(":schoolId", $data['user_schoolId']);
  $stmt->bindParam(":lastname", $data['user_lastname']);
  $stmt->bindParam(":firstname", $data['user_firstname']);
  $stmt->bindParam(":middlename", $middlename);
  $stmt->bindParam(":suffix", $suffix);
  $stmt->bindParam(":phinmaed_email", $phinmaed_email);
  $stmt->bindParam(":email", $data['user_email']);
  $stmt->bindParam(":contact", $data['user_contact']);
  $stmt->bindParam(":password", $hashedPassword);
  $stmt->bindParam(":courseId", $courseId);
  $stmt->bindParam(":departmentId", $departmentId);
  $stmt->bindParam(":schoolyearId", $schoolyearId);
  $stmt->bindParam(":typeId", $data['user_typeId']);
  $stmt->bindParam(":status", $defaultStatus);
  $stmt->bindParam(":level", $defaultLevel);
  $stmt->bindParam(":mustChangePassword", $mustChangePassword);

  if ($stmt->execute()) {
    http_response_code(201);
    echo json_encode(["success" => true, "message" => "User created successfully. User must change password on first login."]);
  } else {
    throw new Exception("Failed to create user");
  }
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(["error" => "Database error: " . $e->getMessage()]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["error" => $e->getMessage()]);
}
