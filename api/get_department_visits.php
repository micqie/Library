<?php
header('Content-Type: application/json');
require_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Get date filters from request
    $startDate = isset($_GET['start_date']) && !empty($_GET['start_date']) ? $_GET['start_date'] : null;
    $endDate = isset($_GET['end_date']) && !empty($_GET['end_date']) ? $_GET['end_date'] : null;

    // Base query
    $query = "
        SELECT 
            d.department_name,
            COALESCE(COUNT(l.log_id), 0) as visit_count,
            (
                SELECT COUNT(DISTINCT u2.user_schoolId)
                FROM tbl_users u2
                JOIN lib_logs l2 ON u2.user_schoolId = l2.user_schoolId
                WHERE u2.user_departmentId = d.department_id
            ) as unique_visitors,
            GROUP_CONCAT(DISTINCT CONCAT(l.log_date, ' ', l.time_in) ORDER BY l.log_date DESC, l.time_in DESC) as visit_dates
        FROM tbl_departments d
        LEFT JOIN tbl_users u ON d.department_id = u.user_departmentId
        LEFT JOIN lib_logs l ON u.user_schoolId = l.user_schoolId
    ";

    // Add date filters if provided
    if ($startDate || $endDate) {
        $query .= " WHERE 1=1";
        if ($startDate) {
            $query .= " AND DATE(l.log_date) >= :start_date";
        }
        if ($endDate) {
            $query .= " AND DATE(l.log_date) <= :end_date";
        }
    }

    // Complete the query
    $query .= " GROUP BY d.department_name ORDER BY visit_count DESC, department_name ASC";

    $stmt = $db->prepare($query);

    // Bind parameters if any
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
    // During development, show the actual error
    error_log("Department visits error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to fetch department visits',
        'message' => $e->getMessage(), // Show actual error during development
        'query' => $query // Show the query for debugging
    ]);
}
