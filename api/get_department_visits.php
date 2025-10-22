<?php
header('Content-Type: application/json');
require_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $startDate = isset($_GET['start_date']) && !empty($_GET['start_date']) ? $_GET['start_date'] : null;
    $endDate = isset($_GET['end_date']) && !empty($_GET['end_date']) ? $_GET['end_date'] : null;

$query = "
    SELECT 
        d.department_name,
        COUNT(l.log_id) as visit_count,
        COUNT(DISTINCT l.user_schoolId) as unique_visitors,
        GROUP_CONCAT(DISTINCT CONCAT(u.user_firstname, ' ', u.user_lastname, ' (', u.user_schoolId, ')') SEPARATOR '|') as visitor_list
    FROM tbl_departments d
    LEFT JOIN tbl_users u ON d.department_id = u.user_departmentId
    LEFT JOIN lib_logs l ON u.user_schoolId = l.user_schoolId
";

   if ($startDate || $endDate) {
    $query .= " WHERE 1=1";
    if ($startDate) {
        $query .= " AND DATE(l.log_date) >= :start_date";
    }
    if ($endDate) {
        $query .= " AND DATE(l.log_date) <= :end_date";
    }
}
$query .= " GROUP BY d.department_name ORDER BY visit_count DESC, department_name ASC";
    $stmt = $db->prepare($query);

    if ($startDate) {
        $stmt->bindParam(':start_date', $startDate);
    }
    if ($endDate) {
        $stmt->bindParam(':end_date', $endDate);
    }

    $stmt->execute();
    $visits = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($visits)) {
        echo json_encode([]);
    } else {
        echo json_encode($visits);
    }
} catch (Exception $e) {
    error_log("Department visits error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to fetch department visits',
        'message' => $e->getMessage(),
        'query' => $query
    ]);
}
