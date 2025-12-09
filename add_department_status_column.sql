-- SQL File to Add department_status Column
-- This column tracks if a department is active or archived
-- Date: Created for Library Attendance Monitoring System

-- Add department_status field to tbl_departments table if it doesn't exist
ALTER TABLE `tbl_departments`
ADD COLUMN IF NOT EXISTS `department_status` TINYINT(1) NOT NULL DEFAULT 1
AFTER `department_name`;

-- Set all existing departments to active (1)
UPDATE `tbl_departments` SET `department_status` = 1 WHERE `department_status` IS NULL;

