<?php
require_once __DIR__ . '/../app/helpers/auth.php';
require_once __DIR__ . '/../app/config/conexion.php';
require_once __DIR__ . '/../app/models/Usuario.php';

use App\Models\Usuario;

if (isLoggedIn()) {
    header('Location: index.php');
    exit;
}

if (Usuario::countUsers() == 0) {
    header('Location: register_first_user.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = $_POST['usuario'] ?? '';
    $pass = $_POST['password'] ?? '';
    
    $userData = Usuario::login($user, $pass);
    if ($userData) {
        login($userData);
        header('Location: index.php');
        exit;
    } else {
        $error = 'Usuario o contraseña incorrectos';
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Control de Entrada</title>
    <link rel="stylesheet" href="assets/css/styles.css">
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body>
    <div class="auth-wrapper">
        <div class="auth-card">
            <div class="auth-header">
                <i data-lucide="shield-check"></i>
                <h2>Control de Entrada</h2>
                <p>Ingresa tus credenciales</p>
            </div>

            <?php if ($error): ?>
                <div class="alert alert-danger"><?php echo $error; ?></div>
            <?php endif; ?>

            <form method="POST">
                <div class="form-group">
                    <label for="usuario">Usuario</label>
                    <input type="text" id="usuario" name="usuario" class="form-control" required autofocus placeholder="Nombre de usuario">
                </div>
                <div class="form-group">
                    <label for="password">Contraseña</label>
                    <input type="password" id="password" name="password" class="form-control" required placeholder="••••••••">
                </div>
                <button type="submit" class="btn btn-primary">
                    <span>Iniciar Sesión</span>
                    <i data-lucide="log-in" style="width: 18px; height: 18px;"></i>
                </button>
            </form>
        </div>
    </div>
    <script>
        lucide.createIcons();
    </script>
</body>
</html>
