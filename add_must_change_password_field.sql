-- SQL File to Add must_change_password Field
-- This field tracks if a user needs to change their password on first login
-- Date: Created for Library Attendance Monitoring System

-- Add must_change_password field to tbl_users table
ALTER TABLE `tbl_users`
ADD COLUMN `must_change_password` tinyint(1) NOT NULL DEFAULT 0
AFTER `user_password`;

-- Update existing users to not require password change (they've already logged in)
-- Only new admin-created users will have this flag set to 1

