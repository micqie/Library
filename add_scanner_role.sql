-- SQL File to Add Scanner-Only User Role
-- This file adds a new user role specifically for scanner functionality only
-- Date: Created for Library Attendance Monitoring System

-- --------------------------------------------------------
-- Add new user type for Scanner role
-- This role allows users to handle scanner functionality only
-- user_typeId: 6 (next available ID after existing types)
-- user_type: 'Scanner' - indicates scanner-only access
-- user_defaultLevel: 30 - between regular users (10) and admin (80)
-- --------------------------------------------------------

INSERT INTO `tbl_usertype` (`user_typeId`, `user_type`, `user_defaultLevel`)
VALUES (6, 'Scanner', 30)
ON DUPLICATE KEY UPDATE
    `user_type` = 'Scanner',
    `user_defaultLevel` = 30;
