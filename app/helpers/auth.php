<?php
session_start();

function checkAuth() {
    if (!isset($_SESSION['user_id'])) {
        // Redirigir al login si no hay sesión
        header('Location: login.php');
        exit;
    }
}

function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

function login($user) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['nombre'] = $user['nombre'];
    $_SESSION['usuario'] = $user['usuario'];
    $_SESSION['rol'] = $user['rol'];
}

function logout() {
    session_destroy();
    header('Location: login.php');
    exit;
}
