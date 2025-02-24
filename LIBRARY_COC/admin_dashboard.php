<?php
session_start();
if (!isset($_SESSION['admin_id'])) {
    header("Location: login.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Library</title>
    <link rel="stylesheet" href="dashboard.css"> <!-- Link to your CSS -->
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script> <!-- Axios -->
    
    
</head>
<body>

    <!-- Sidebar Navigation -->
    <div class="sidebar">
        <h2>Library Admin</h2>
        <ul>
            <li><a href="admin_dashboard.php"><i class="fas fa-home"></i> Dashboard</a></li>
            <li><a href="transactions.php"><i class="fas fa-exchange-alt"></i> Transactions</a></li>
            <li><a href="index.php"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
        </ul>
    </div>

    <div class="main-content">
        <div class="top-navbar">
            <h3>Welcome, <?php echo $_SESSION['admin_username']; ?></h3>
            <div class="profile">
                <i class="fas fa-user-circle"></i>
         
            </div>
        </div>

        <div class="dashboard-content">
            <h2>Today's Student Logs</h2>

            <div class="table-container">
                <table class="table-dashboard">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>STUDENT ID</th>
                            <th>TIME IN</th>
                            <th>TIME OUT</th>
                            <th>DATE</th>
                        </tr>
                    </thead>
                    <tbody>
    <?php
        $server = "localhost";
        $username = "root";
        $password = "";
        $dbname = "librarysystem_db";

        $conn = new mysqli($server, $username, $password, $dbname);

        if ($conn->connect_error) {
            die("Connection failed: " . $conn->connect_error);
        }

        $sql = "SELECT ID, STUDENTID, TIMEIN, TIMEOUT, 
                       DATE(TIMEOUT) AS DATEOUT 
                FROM lib_logs 
                WHERE DATE(TIMEIN) = CURDATE()";

        $query = $conn->query($sql);

        while ($row = $query->fetch_assoc()) {
            echo "<tr>
                    <td>{$row['ID']}</td>
                    <td>{$row['STUDENTID']}</td>
                    <td>{$row['TIMEIN']}</td>
                    <td>" . (!empty($row['TIMEOUT']) ? $row['TIMEOUT'] : '<span class="status-inside">Still Inside</span>') . "</td>
                    <td>" . (!empty($row['TIMEOUT']) ? $row['DATEOUT'] : date('Y-m-d')) . "</td>
                </tr>";
        }
    ?>
</tbody>

                </table>
            </div>
        </div>
    </div>

    <!-- Link to scan.js -->
    <script src="js/scan.js"></script>

</body>
</html>
