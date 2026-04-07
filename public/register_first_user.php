<?php
require_once __DIR__ . '/../app/config/conexion.php';
require_once __DIR__ . '/../app/models/Usuario.php';

use App\Models\Usuario;

if (Usuario::countUsers() > 0) {
    header('Location: login.php');
    exit;
}

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre = $_POST['nombre'] ?? '';
    $usuario = $_POST['usuario'] ?? '';
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';

    if ($password !== $confirm_password) {
        $error = 'Las contraseñas no coinciden';
    } else {
        if (Usuario::create($nombre, $usuario, $password, 'admin')) {
            $success = '¡Cuenta de administrador creada con éxito!';
        } else {
            $error = 'Error al crear el usuario. Verifique los datos.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro Inicial - Control de Entrada</title>
    <link rel="stylesheet" href="assets/css/styles.css">
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body>
    <div class="auth-wrapper">
        <div class="auth-card">
            <div class="auth-header">
                <i data-lucide="user-plus"></i>
                <h2>Primer Registro</h2>
                <p>Crea la cuenta de administrador principal</p>
            </div>

            <?php if ($error): ?>
                <div class="alert alert-danger"><?php echo $error; ?></div>
            <?php endif; ?>

            <?php if ($success): ?>
                <div class="alert alert-success">
                    <p><?php echo $success; ?></p>
                    <a href="login.php" class="btn btn-primary" style="margin-top: 1rem; text-decoration: none;">
                        <span>Ir al Login</span>
                        <i data-lucide="arrow-right"></i>
                    </a>
                </div>
            <?php else: ?>
                <form method="POST">
                    <div class="form-group">
                        <label for="nombre">Nombre Completo</label>
                        <input type="text" id="nombre" name="nombre" class="form-control" required placeholder="Ej: Administrador Sistema">
                    </div>
                    <div class="form-group">
                        <label for="usuario">Nombre de Usuario</label>
                        <input type="text" id="usuario" name="usuario" class="form-control" required placeholder="Ej: admin">
                    </div>
                    <div class="form-group">
                        <label for="password">Contraseña</label>
                        <input type="password" id="password" name="password" class="form-control" required placeholder="••••••••">
                    </div>
                    <div class="form-group">
                        <label for="confirm_password">Confirmar Contraseña</label>
                        <input type="password" id="confirm_password" name="confirm_password" class="form-control" required placeholder="••••••••">
                    </div>
                    <button type="submit" class="btn btn-primary">
                        <span>Crear Cuenta</span>
                        <i data-lucide="check-circle"></i>
                    </button>
                </form>
            <?php endif; ?>
        </div>
    </div>
    <script>
        lucide.createIcons();
    </script>
</body>
</html>
