<?php
require_once __DIR__ . '/../app/helpers/auth.php';
checkAuth();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Control de Entrada - Witmac</title>
    <link rel="stylesheet" href="assets/css/styles.css">
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js"></script>
    <style>
        #main-content { min-height: calc(100vh - 160px); opacity: 1; transition: opacity 0.3s; }
        .fade-out { opacity: 0 !important; }
        .form-container { max-width: 800px; margin: 2rem auto; background: var(--card-bg); padding: 2.5rem; border-radius: var(--radius); box-shadow: var(--shadow); border: 1px solid var(--border); }
        .checkbox-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 0.5rem; }
        .checkbox-card { display: flex; align-items: center; gap: 0.75rem; padding: 1rem; background: #f8fafc; border: 1px solid var(--border); border-radius: 8px; cursor: pointer; user-select: none; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        @media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } .hide-mobile { display: none; } }
    </style>
</head>
<body>
    <nav class="navbar">
        <div class="navbar-brand">
            <i data-lucide="shield-check"></i>
            <span>Control Entrada</span>
        </div>
        <div class="user-menu">
            <span style="font-weight: 500; margin-right: 1rem;" class="hide-mobile">Hola, <?php echo $_SESSION['nombre']; ?></span>
            <a href="logout.php" class="logout-link">
                <i data-lucide="log-out" style="width: 18px; height: 18px; vertical-align: middle;"></i>
                Salir
            </a>
        </div>
    </nav>

    <main class="dashboard-container" id="main-content" style="margin-top: 1.5rem; margin-bottom: 1.5rem;">
        <div style="text-align: center; padding: 2rem;">Cargando aplicación...</div>
    </main>

    <footer style="text-align: center; padding: 1rem; color: var(--text-muted); font-size: 0.75rem; border-top: 1px solid var(--border); background: white;">
        &copy; <?php echo date('Y'); ?> Witmac • Sistema de Control Profesional
    </footer>

    <script type="module" src="assets/js/app.js"></script>
</body>
</html>
