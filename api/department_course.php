<?php
/**
 * Unified endpoint for department & course operations.
 * Supports:
 *   GET  -> returns departments and courses
 *   POST -> action = add_department | add_course | update_department_status
 */
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");

include_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

function ensureCourseStatusColumn(PDO $db)
{
    try {
        $db->query("SELECT course_status FROM tbl_courses LIMIT 1");
    } catch (PDOException $e) {
        $db->exec("ALTER TABLE tbl_courses ADD COLUMN course_status TINYINT(1) NOT NULL DEFAULT 1");
    }
}

function fetchDepartmentsAndCourses(PDO $db)
{
    $deptStmt = $db->prepare("SELECT * FROM tbl_departments ORDER BY department_name");
    $deptStmt->execute();
    $departments = $deptStmt->fetchAll(PDO::FETCH_ASSOC);

    $courseStmt = $db->prepare("SELECT course_id, course_name, course_departmentId, course_status FROM tbl_courses ORDER BY course_name");
    $courseStmt->execute();
    $courses = $courseStmt->fetchAll(PDO::FETCH_ASSOC);

    return [$departments, $courses];
}

try {
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        ensureCourseStatusColumn($db);
        [$departments, $courses] = fetchDepartmentsAndCourses($db);
        echo json_encode([
            "departments" => $departments,
            "courses" => $courses
        ]);
        exit;
    }

    if ($method !== 'POST') {
        http_response_code(405);
        echo json_encode(["success" => false, "error" => "Method not allowed"]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true) ?? [];
    $action = $data['action'] ?? null;

    if (!$action) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Action is required"]);
        exit;
    }

    ensureCourseStatusColumn($db);

    switch ($action) {
        case 'add_department':
            if (empty($data['department_name'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "Department name is required"]);
                exit;
            }
            $department_name = trim($data['department_name']);

            $checkStmt = $db->prepare("SELECT COUNT(*) FROM tbl_departments WHERE department_name = ?");
            $checkStmt->execute([$department_name]);
            if ($checkStmt->fetchColumn() > 0) {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "Department already exists"]);
                exit;
            }

            $insert = $db->prepare("INSERT INTO tbl_departments (department_name, department_status) VALUES (:name, 1)");
            $insert->bindParam(':name', $department_name);
            if ($insert->execute()) {
                http_response_code(201);
                echo json_encode([
                    "success" => true,
                    "message" => "Department added successfully",
                    "department_id" => $db->lastInsertId(),
                    "department_name" => $department_name
                ]);
            } else {
                throw new Exception("Failed to add department");
            }
            break;

        case 'add_course':
            if (empty($data['course_name'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "Course name is required"]);
                exit;
            }
            if (empty($data['course_departmentId'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "Department is required for course"]);
                exit;
            }
            $course_name = trim($data['course_name']);
            $course_departmentId = (int) $data['course_departmentId'];

            $deptStmt = $db->prepare("SELECT department_id FROM tbl_departments WHERE department_id = ?");
            $deptStmt->execute([$course_departmentId]);
            if ($deptStmt->fetchColumn() == 0) {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "Invalid department selected"]);
                exit;
            }

            $checkStmt = $db->prepare("SELECT COUNT(*) FROM tbl_courses WHERE course_name = ? AND course_departmentId = ?");
            $checkStmt->execute([$course_name, $course_departmentId]);
            if ($checkStmt->fetchColumn() > 0) {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "Course already exists in this department"]);
                exit;
            }

            $insert = $db->prepare("INSERT INTO tbl_courses (course_name, course_departmentId, course_status) VALUES (:name, :dept, 1)");
            $insert->bindParam(':name', $course_name);
            $insert->bindParam(':dept', $course_departmentId);
            if ($insert->execute()) {
                http_response_code(201);
                echo json_encode([
                    "success" => true,
                    "message" => "Course added successfully",
                    "course_id" => $db->lastInsertId(),
                    "course_name" => $course_name,
                    "course_departmentId" => $course_departmentId,
                    "course_status" => 1
                ]);
            } else {
                throw new Exception("Failed to add course");
            }
            break;

        case 'update_department_status':
            if (empty($data['department_id'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "Department ID is required"]);
                exit;
            }
            $department_id = (int) $data['department_id'];
            $requestedStatus = isset($data['status']) ? strtolower(trim($data['status'])) : 'inactive';
            $status = $requestedStatus === 'active' ? 1 : 0;

            $checkStmt = $db->prepare("SELECT department_id FROM tbl_departments WHERE department_id = ?");
            $checkStmt->execute([$department_id]);
            if ($checkStmt->fetchColumn() == 0) {
                http_response_code(404);
                echo json_encode(["success" => false, "error" => "Department not found"]);
                exit;
            }

            $update = $db->prepare("UPDATE tbl_departments SET department_status = :status WHERE department_id = :id");
            $update->bindParam(':status', $status, PDO::PARAM_INT);
            $update->bindParam(':id', $department_id, PDO::PARAM_INT);

            if ($update->execute()) {
                http_response_code(200);
                echo json_encode([
                    "success" => true,
                    "message" => $status === 1 ? "Department activated successfully" : "Department marked inactive successfully",
                    "department_id" => $department_id,
                    "status" => $status
                ]);
            } else {
                throw new Exception("Failed to update department status");
            }
            break;

        case 'update_course_status':
            if (empty($data['course_id'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "Course ID is required"]);
                exit;
            }
            $course_id = (int) $data['course_id'];
            $requestedStatus = isset($data['status']) ? strtolower(trim($data['status'])) : 'inactive';
            $status = $requestedStatus === 'active' ? 1 : 0;

            $checkStmt = $db->prepare("SELECT course_id FROM tbl_courses WHERE course_id = ?");
            $checkStmt->execute([$course_id]);
            if ($checkStmt->fetchColumn() == 0) {
                http_response_code(404);
                echo json_encode(["success" => false, "error" => "Course not found"]);
                exit;
            }

            $update = $db->prepare("UPDATE tbl_courses SET course_status = :status WHERE course_id = :id");
            $update->bindParam(':status', $status, PDO::PARAM_INT);
            $update->bindParam(':id', $course_id, PDO::PARAM_INT);

            if ($update->execute()) {
                http_response_code(200);
                echo json_encode([
                    "success" => true,
                    "message" => $status === 1 ? "Course activated successfully" : "Course marked inactive successfully",
                    "course_id" => $course_id,
                    "status" => $status
                ]);
            } else {
                throw new Exception("Failed to update course status");
            }
            break;

        default:
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Unsupported action"]);
            break;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Database error: " . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
