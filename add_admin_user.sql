-- Simple SQL to Add Another Admin User
-- Just update the values and run this SQL command

INSERT INTO `tbl_users` (
    `user_schoolId`,
    `user_lastname`,
    `user_firstname`,
    `user_middlename`,
    `user_suffix`,
    `phinmaed_email`,
    `user_email`,
    `user_contact`,
    `user_password`,
    `user_courseId`,
    `user_departmentId`,
    `user_schoolyearId`,
    `user_typeId`,
    `user_status`,
    `user_level`
) VALUES (
    '00-0000-00002',                    -- School ID / Username (change this)
    'Admin',                            -- Last Name (change this)
    'New',                              -- First Name (change this)
    NULL,                               -- Middle Name
    NULL,                               -- Suffix
    'newadmin@phinmaed.com',            -- PHINMAED Email (change this)
    'newadmin@gmail.com',               -- Personal Email (change this)
    '09000000002',                      -- Contact Number (change this)
    '$2y$10$/8QPM9EF0L/Sts.G6fnKpuG27LwyIUuCV3n9qClVSSbkw8j1PmbFy',  -- Password: admin123 (hashed)
    NULL,                               -- Course ID
    NULL,                               -- Department ID
    NULL,                               -- School Year
    5,                                  -- User Type ID (5 = Admin-Library)
    1,                                  -- Status (1 = Active)
    80                                  -- User Level (80 = Admin)
);

-- The password hash above is for: admin123
-- To use a different password, you'll need to hash it first
-- Or you can login and change it after creating the user
