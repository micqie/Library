-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 17, 2025 at 09:37 PM
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
-- Table structure for table `lib_courses`
--

CREATE TABLE `lib_courses` (
  `course_id` int(11) NOT NULL,
  `course_name` varchar(255) NOT NULL,
  `course_departmentId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lib_courses`
--

INSERT INTO `lib_courses` (`course_id`, `course_name`, `course_departmentId`) VALUES
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
-- Table structure for table `lib_departments`
--

CREATE TABLE `lib_departments` (
  `department_id` int(11) NOT NULL,
  `department_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lib_departments`
--

INSERT INTO `lib_departments` (`department_id`, `department_name`) VALUES
(1, 'College of Management and Accountancy'),
(2, 'College of Education'),
(3, 'School of Criminology and Criminal Justice'),
(4, 'College of Engineering and Architecture'),
(5, 'College of Allied Health Sciences'),
(6, 'College of Information Technology');

-- --------------------------------------------------------

--
-- Table structure for table `lib_logs`
--

CREATE TABLE `lib_logs` (
  `log_id` int(11) NOT NULL,
  `user_schoolId` varchar(50) DEFAULT NULL,
  `time_in` time NOT NULL,
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
(4, '02-2122-020202', '04:09:59', '04:27:25', '2025-03-18'),
(5, '12345', '04:10:21', '04:27:25', '2025-03-18'),
(6, '12345', '04:12:03', '04:27:25', '2025-03-18'),
(7, '02-2122-020202', '04:12:21', '04:27:25', '2025-03-18');

-- --------------------------------------------------------

--
-- Table structure for table `lib_users`
--

CREATE TABLE `lib_users` (
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
-- Dumping data for table `lib_users`
--

INSERT INTO `lib_users` (`user_id`, `user_schoolId`, `user_lastname`, `user_firstname`, `user_middlename`, `user_suffix`, `phinmaed_email`, `user_email`, `user_contact`, `user_password`, `user_courseId`, `user_departmentId`, `user_schoolyearId`, `user_typeId`, `user_status`, `user_level`) VALUES
(1, '02-2122-020202', 'Lago', 'Micah', 'Dusil', 'none', 'micah@phinmaed.com', 'micah@gmail.com', '0909009', 'phinma-coc', 1, 2, 2024, 2, 1, 2),
(2, '12345', 'Doe', 'John', 'Michael', NULL, 'johndoe@phinma.edu', 'johndoe@gmail.com', '09123456789', 'password123', 1, 1, 2024, 2, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `lib_usertype`
--

CREATE TABLE `lib_usertype` (
  `user_typeId` int(11) NOT NULL,
  `user_type` varchar(255) NOT NULL,
  `user_defaultLevel` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lib_usertype`
--

INSERT INTO `lib_usertype` (`user_typeId`, `user_type`, `user_defaultLevel`) VALUES
(1, 'Visitor', 10),
(2, 'Student', 10),
(3, 'Faculty', 10),
(4, 'Employee', 10);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `lib_courses`
--
ALTER TABLE `lib_courses`
  ADD PRIMARY KEY (`course_id`),
  ADD KEY `fk_course_department` (`course_departmentId`);

--
-- Indexes for table `lib_departments`
--
ALTER TABLE `lib_departments`
  ADD PRIMARY KEY (`department_id`);

--
-- Indexes for table `lib_logs`
--
ALTER TABLE `lib_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `fk_lib_logs_user` (`user_schoolId`);

--
-- Indexes for table `lib_users`
--
ALTER TABLE `lib_users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `unique_user_schoolId` (`user_schoolId`),
  ADD KEY `fk_user_course` (`user_courseId`),
  ADD KEY `fk_user_department` (`user_departmentId`),
  ADD KEY `fk_user_type` (`user_typeId`),
  ADD KEY `idx_user_schoolId` (`user_schoolId`);

--
-- Indexes for table `lib_usertype`
--
ALTER TABLE `lib_usertype`
  ADD PRIMARY KEY (`user_typeId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `lib_logs`
--
ALTER TABLE `lib_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `lib_users`
--
ALTER TABLE `lib_users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `lib_courses`
--
ALTER TABLE `lib_courses`
  ADD CONSTRAINT `fk_course_department` FOREIGN KEY (`course_departmentId`) REFERENCES `lib_departments` (`department_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `lib_logs`
--
ALTER TABLE `lib_logs`
  ADD CONSTRAINT `fk_lib_logs_user` FOREIGN KEY (`user_schoolId`) REFERENCES `lib_users` (`user_schoolId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `lib_users`
--
ALTER TABLE `lib_users`
  ADD CONSTRAINT `fk_user_course` FOREIGN KEY (`user_courseId`) REFERENCES `lib_courses` (`course_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_user_department` FOREIGN KEY (`user_departmentId`) REFERENCES `lib_departments` (`department_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_user_type` FOREIGN KEY (`user_typeId`) REFERENCES `lib_usertype` (`user_typeId`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

