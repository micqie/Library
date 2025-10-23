<?php
date_default_timezone_set('Asia/Manila'); // Set timezone to Philippines
session_start();

$_SESSION = array();

if (isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', time() - 3600, '/');
}

session_destroy();

header('Location: ../index.html');
exit();
