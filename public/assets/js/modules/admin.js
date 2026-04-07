const AdminModule = {
    async render() {
        return `
            <div class="welcome-section">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                    <a href="#dashboard" style="color: var(--text-muted);"><i data-lucide="arrow-left"></i></a>
                    <h2 style="margin: 0;">Panel Administrativo</h2>
                </div>
                <p style="color: var(--text-muted);">Gestiona los recursos base del sistema.</p>
            </div>

            <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
                <div class="card" onclick="window.location.hash='#admin_personal'">
                    <div class="card-icon" style="background: rgba(79, 70, 229, 0.1); color: var(--primary);">
                        <i data-lucide="user-plus"></i>
                    </div>
                    <h3>Empleados</h3>
                    <p>Agregar, editar o dar de baja personal de la empresa.</p>
                </div>

                <div class="card" onclick="window.location.hash='#admin_vehiculos'">
                    <div class="card-icon" style="background: rgba(34, 197, 94, 0.1); color: var(--success);">
                        <i data-lucide="truck"></i>
                    </div>
                    <h3>Vehículos</h3>
                    <p>Registrar nuevas placas, marcas y modelos de flota.</p>
                </div>
            </div>
        `;
    },
    init() {
        // Nada especial aquí por ahora
    }
};

export default AdminModule;
