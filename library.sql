-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 23, 2025 at 06:16 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `library`
--

-- --------------------------------------------------------

--
-- Table structure for table `lib_logs`
--

CREATE TABLE `lib_logs` (
  `log_id` int(11) NOT NULL,
  `user_schoolId` varchar(50) DEFAULT NULL,
  `time_in` time DEFAULT NULL,
  `time_out` time DEFAULT NULL,
  `log_date` date NOT NULL DEFAULT curdate()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lib_logs`
--

INSERT INTO `lib_logs` (`log_id`, `user_schoolId`, `time_in`, `time_out`, `log_date`) VALUES
(1, '12345', '04:03:45', '04:27:25', '2025-03-18'),
(2, '12345', '04:04:12', '04:27:25', '2025-03-18'),
(3, '02-2122-020202', '04:07:38', '04:27:25', '2025-03-18'),
(7, '02-2122-020202', '04:12:21', '04:27:25', '2025-03-18'),
(16, '02-2122-020202', '00:46:56', '17:57:04', '2025-03-24'),
(17, '12345', '00:52:56', '00:54:22', '2025-03-24'),
(18, '12345', '00:57:26', '17:37:17', '2025-03-24'),
(19, '12345', '17:37:22', '17:48:30', '2025-03-24'),
(20, '12345', '17:48:34', '17:49:41', '2025-03-24'),
(21, '12345', '17:49:46', '17:54:30', '2025-03-24'),
(22, '12345', '17:56:28', '17:59:41', '2025-03-24'),
(23, '02-2122-020202', '17:57:09', '18:11:16', '2025-03-24'),
(27, '12345', '18:11:01', '18:32:32', '2025-03-24'),
(28, '02-2122-020202', '18:11:21', '18:36:09', '2025-03-24'),
(34, '12345', '16:55:18', '17:06:03', '2025-03-25'),
(56, '12345', '21:35:50', '21:42:15', '2025-03-26'),
(57, '12345', '22:04:30', '22:08:18', '2025-03-26'),
(58, '12345', '22:12:16', '22:13:18', '2025-03-26'),
(59, '12345', '17:45:54', '17:47:02', '2025-03-28'),
(66, '12345', '21:09:26', '21:11:47', '2025-03-29'),
(67, '02-2122-020202', '21:11:54', '21:15:17', '2025-03-29'),
(68, '12345', '21:14:45', '21:16:41', '2025-03-29'),
(74, '02-2122-020202', '07:28:20', '07:34:04', '2025-04-02'),
(78, '02-2122-020202', '09:24:48', '09:25:50', '2025-04-02'),
(79, '02-2122-020202', '09:25:54', '09:29:52', '2025-04-02'),
(80, '02-2122-020202', '09:30:00', '09:31:16', '2025-04-02'),
(81, '02-2122-020202', '09:31:25', '19:21:03', '2025-04-02'),
(87, 'visitor2@gmail.com', '15:28:21', '15:29:33', '2025-04-02'),
(88, 'visitor2@gmail.com', '15:29:52', '15:31:02', '2025-04-02'),
(89, '02-2122-020202', '19:21:06', '19:30:10', '2025-04-02'),
(90, '02-2122-030303', '19:35:07', '19:37:17', '2025-04-02'),
(91, '02-2122-030303', '19:53:07', '20:04:54', '2025-04-02'),
(92, '02-2122-020202', '19:54:29', '19:55:55', '2025-04-02'),
(93, '02-2122-020202', '20:12:15', '20:16:23', '2025-04-02'),
(94, '02-2122-030303', '20:32:31', '20:40:23', '2025-04-02'),
(95, '02-2122-030303', '20:41:10', '20:43:37', '2025-04-02'),
(96, '02-2122-020202', '20:58:33', '22:09:25', '2025-04-02'),
(97, '02-2122-030303', '20:59:29', '21:04:20', '2025-04-02'),
(98, '02-2122-030303', '21:04:41', '21:05:54', '2025-04-02'),
(99, '02-2122-030303', '21:08:46', '21:10:11', '2025-04-02'),
(100, '02-2122-030303', '21:22:07', '21:24:40', '2025-04-02'),
(101, '02-2122-030303', '21:27:20', '21:35:59', '2025-04-02'),
(102, '02-2122-030303', '22:18:38', '22:28:41', '2025-04-02'),
(103, '02-2122-030303', '22:37:48', '22:39:02', '2025-04-02'),
(104, '02-2122-030303', '22:39:18', '22:40:18', '2025-04-02'),
(105, '02-2122-030303', '07:54:13', '07:56:56', '2025-04-03'),
(106, '02-2122-040404', '08:08:30', '08:09:40', '2025-04-03'),
(107, '02-2122-030303', '09:38:49', '09:39:53', '2025-04-03'),
(108, '02-2122-020202', '09:48:58', '10:00:54', '2025-04-03'),
(109, '02-2122-030303', '10:01:51', '11:11:27', '2025-04-03'),
(110, '02-2122-020202', '10:13:19', '10:20:07', '2025-04-03'),
(111, '02-2122-020202', '10:20:16', '10:22:13', '2025-04-03'),
(112, '54321', '10:29:33', '10:30:40', '2025-04-03'),
(113, '54321', '10:59:44', '11:00:49', '2025-04-03'),
(114, '54321', '11:05:50', '11:08:00', '2025-04-03'),
(115, '02-2122-020202', '11:05:54', '11:10:53', '2025-04-03'),
(116, '54321', '11:10:24', '11:26:47', '2025-04-03'),
(117, '02-2122-030303', '11:11:41', '11:26:52', '2025-04-03'),
(118, '54321', '11:26:57', '12:03:50', '2025-04-03'),
(119, '12345', '01:23:46', '01:53:46', '2025-04-04'),
(120, '12345', '09:45:32', '09:46:34', '2025-04-04'),
(121, '02-2122-020202', '09:46:08', '12:06:30', '2025-04-04'),
(122, '54321', '12:03:55', '12:06:30', '2025-04-04'),
(123, 'mckenzie123@gmail.com', '14:40:31', '14:41:35', '2025-04-04'),
(124, '12345', '14:43:02', '14:48:16', '2025-04-04'),
(125, '54321', '14:43:05', '14:48:16', '2025-04-04'),
(126, '02-2122-020202', '14:43:10', '14:48:16', '2025-04-04'),
(127, '02-2122-030303', '14:43:18', '14:48:16', '2025-04-04'),
(128, '12345', '14:36:14', '22:10:34', '2025-04-09'),
(129, '54321', '14:36:17', '23:59:59', '2025-04-09'),
(130, '02-2122-020202', '14:36:31', '23:59:59', '2025-04-09'),
(131, '12345', '22:10:36', '23:59:59', '2025-05-03'),
(132, 'mckenzie25@gmail.com', '20:09:08', '20:10:29', '2025-06-24'),
(133, '00-0000-00001', '04:43:35', '04:47:23', '2025-07-19'),
(134, '54321', '05:10:38', '05:13:05', '2025-07-19'),
(135, '12345', '05:10:44', '05:13:53', '2025-07-19'),
(136, '54321', '05:13:50', '05:22:21', '2025-07-19'),
(137, '54321', '05:22:24', '05:25:14', '2025-07-19'),
(138, '12345', '05:22:32', '05:25:12', '2025-07-19'),
(139, 'mckenzie25@gmail.com', '05:35:03', '05:39:53', '2025-07-19'),
(140, '54321', '05:39:37', '05:48:22', '2025-07-19'),
(141, '12345', '05:39:40', '05:48:25', '2025-07-19'),
(142, '02-2122-020202', '05:40:07', '05:48:38', '2025-07-19'),
(143, '12345', '14:55:39', '14:56:50', '2025-07-19'),
(144, '12345', '18:04:09', '18:06:43', '2025-07-19'),
(145, '12345', '18:15:24', '18:16:43', '2025-07-19'),
(146, '12345', '18:20:44', '18:22:28', '2025-07-19'),
(147, '02-2122-020202', '19:26:31', '19:31:02', '2025-10-20'),
(148, '54321', '19:30:48', '19:38:15', '2025-10-20'),
(150, '54321', '18:35:11', '18:36:16', '2025-10-23');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_courses`
--

CREATE TABLE `tbl_courses` (
  `course_id` int(11) NOT NULL,
  `course_name` varchar(255) NOT NULL,
  `course_departmentId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_courses`
--

INSERT INTO `tbl_courses` (`course_id`, `course_name`, `course_departmentId`) VALUES
(1, 'Bachelor of Science in Accountancy', 1),
(2, 'Bachelor of Science in Hospitality Management', 1),
(3, 'Bachelor of Science in Tourism Management', 1),
(4, 'Bachelor of Science in Business Administration', 1),
(5, 'Bachelor of Science in Management Accounting', 1),
(6, 'Bachelor of Elementary Education', 2),
(7, 'Bachelor of Secondary Education', 2),
(8, 'Bachelor of Science in Early Childhood Education', 2),
(9, 'Bachelor of Science in Criminology', 3),
(10, 'Bachelor of Science in Architecture', 4),
(11, 'Bachelor of Science in Computer Engineering', 4),
(12, 'Bachelor of Science in Civil Engineering', 4),
(13, 'Bachelor of Science in Electrical Engineering', 4),
(14, 'Bachelor of Science in Mechanical Engineering', 4),
(15, 'Bachelor of Science in Nursing', 5),
(16, 'Bachelor of Science in Pharmacy', 5),
(17, 'Bachelor of Science in Medical Technology', 5),
(18, 'Bachelor of Science in Psychology', 5),
(19, 'Bachelor of Science in Information Technology in Business Informatics, Computer Security, Digital Arts and Systems Development', 6);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_departments`
--

CREATE TABLE `tbl_departments` (
  `department_id` int(11) NOT NULL,
  `department_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_departments`
--

INSERT INTO `tbl_departments` (`department_id`, `department_name`) VALUES
(1, 'College of Management and Accountancy'),
(2, 'College of Education'),
(3, 'School of Criminology and Criminal Justice'),
(4, 'College of Engineering and Architecture'),
(5, 'College of Allied Health Sciences'),
(6, 'College of Information Technology');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_users`
--

CREATE TABLE `tbl_users` (
  `user_id` int(11) NOT NULL,
  `user_schoolId` varchar(50) DEFAULT NULL,
  `user_lastname` varchar(255) NOT NULL,
  `user_firstname` varchar(255) NOT NULL,
  `user_middlename` varchar(255) DEFAULT NULL,
  `user_suffix` varchar(50) DEFAULT NULL,
  `phinmaed_email` varchar(255) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `user_contact` varchar(20) NOT NULL,
  `user_password` varchar(255) NOT NULL DEFAULT 'phinma-coc',
  `user_courseId` int(11) DEFAULT NULL,
  `user_departmentId` int(11) DEFAULT NULL,
  `user_schoolyearId` int(11) DEFAULT NULL,
  `user_typeId` int(11) NOT NULL,
  `user_status` tinyint(1) NOT NULL DEFAULT 1,
  `user_level` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tbl_users`
--

INSERT INTO `tbl_users` (`user_id`, `user_schoolId`, `user_lastname`, `user_firstname`, `user_middlename`, `user_suffix`, `phinmaed_email`, `user_email`, `user_contact`, `user_password`, `user_courseId`, `user_departmentId`, `user_schoolyearId`, `user_typeId`, `user_status`, `user_level`) VALUES
(1, '02-2122-020202', 'Lago', 'Micah', 'Dusil', 'none', 'micah@phinmaed.com', 'micah@gmail.com', '0993196913', 'phinma-coc', 2, 2, 2024, 2, 1, 2),
(2, '12345', 'Doe', 'John', 'Michael', NULL, 'johndoe@phinma.edu', 'johndoe@gmail.com', '09123456789', 'password123', 1, 1, 2024, 2, 1, 1),
(3, '54321', 'Sy', 'Henry ', '', '', 'henry@phinmaed.com', 'hen@gmail.com', '0905067432', 'Password123', NULL, NULL, NULL, 2, 1, 10),
(6, '98765', 'Lago', 'Mckenzie ', 'Dusil', '', 'mckenzie@phinmaed.com', 'mckenzie@gmail.com', '213123123', 'Password123', NULL, NULL, NULL, 2, 1, 10),
(15, 'visitor2@gmail.com', 'Two', 'Visitor', 'Middle', '', 'visitor2@phinmaed.com', 'visitor2@gmail.com', 'visitor2@gmail.com', 'Password123', 10, 4, NULL, 2, 1, 10),
(16, '02-2122-030303', 'Cubillan', 'Hannah', 'Dapanas', '', 'cubillan@phinmaed.com', 'cubillan@gmail.com', '09161616161', 'Password123', 19, 6, NULL, 2, 1, 10),
(17, '02-2122-040404', 'Last', 'Student', 'Middle', '', 'student@phinmaed.com', 'student@gmail.com', '0900000005', 'Password123', 9, 3, NULL, 2, 1, 10),
(23, '00-0000-00001', 'Library', 'Admin', NULL, NULL, 'admin@phinmaed.com', 'admin@gmail.com', '09000000001', '$2y$10$/8QPM9EF0L/Sts.G6fnKpuG27LwyIUuCV3n9qClVSSbkw8j1PmbFy', NULL, NULL, NULL, 5, 1, 80),
(24, 'mckenzie123@gmail.com', 'Lago', 'Mckenzie ', '', '', '', 'mckenzie123@gmail.com', '0291290129', 'Password123', 15, 5, NULL, 2, 1, 10),
(25, 'mckenzie25@gmail.com', 'test', 'Mckenzie ', '', '', '', 'mckenzie25@gmail.com', '090909090', 'Mckenzie123', 18, 5, NULL, 2, 1, 10);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_usertype`
--

CREATE TABLE `tbl_usertype` (
  `user_typeId` int(11) NOT NULL,
  `user_type` varchar(255) NOT NULL,
  `user_defaultLevel` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_usertype`
--

INSERT INTO `tbl_usertype` (`user_typeId`, `user_type`, `user_defaultLevel`) VALUES
(1, 'Visitor', 10),
(2, 'Student', 10),
(3, 'Faculty', 10),
(4, 'Employee', 10),
(5, 'Admin-Library', 80);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `lib_logs`
--
ALTER TABLE `lib_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `fk_lib_logs_user` (`user_schoolId`);

--
-- Indexes for table `tbl_courses`
--
ALTER TABLE `tbl_courses`
  ADD PRIMARY KEY (`course_id`),
  ADD KEY `fk_course_department` (`course_departmentId`);

--
-- Indexes for table `tbl_departments`
--
ALTER TABLE `tbl_departments`
  ADD PRIMARY KEY (`department_id`);

--
-- Indexes for table `tbl_users`
--
ALTER TABLE `tbl_users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `unique_user_schoolId` (`user_schoolId`),
  ADD KEY `fk_user_course` (`user_courseId`),
  ADD KEY `fk_user_department` (`user_departmentId`),
  ADD KEY `fk_user_type` (`user_typeId`),
  ADD KEY `idx_user_schoolId` (`user_schoolId`);

--
-- Indexes for table `tbl_usertype`
--
ALTER TABLE `tbl_usertype`
  ADD PRIMARY KEY (`user_typeId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `lib_logs`
--
ALTER TABLE `lib_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=153;

--
-- AUTO_INCREMENT for table `tbl_users`
--
ALTER TABLE `tbl_users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `lib_logs`
--
ALTER TABLE `lib_logs`
  ADD CONSTRAINT `fk_lib_logs_user` FOREIGN KEY (`user_schoolId`) REFERENCES `tbl_users` (`user_schoolId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tbl_courses`
--
ALTER TABLE `tbl_courses`
  ADD CONSTRAINT `fk_course_department` FOREIGN KEY (`course_departmentId`) REFERENCES `tbl_departments` (`department_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tbl_users`
--
ALTER TABLE `tbl_users`
  ADD CONSTRAINT `fk_user_course` FOREIGN KEY (`user_courseId`) REFERENCES `tbl_courses` (`course_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_user_department` FOREIGN KEY (`user_departmentId`) REFERENCES `tbl_departments` (`department_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_user_type` FOREIGN KEY (`user_typeId`) REFERENCES `tbl_usertype` (`user_typeId`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
