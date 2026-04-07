import PersonalModule from './modules/personal.js';
import VehiculosModule from './modules/vehiculos.js';
import AdminModule from './modules/admin.js';
import AdminPersonalModule from './modules/admin_personal.js';
import AdminVehiculosModule from './modules/admin_vehiculos.js';
import HistorialPersonalModule from './modules/historial_personal.js';
import HistorialVehiculosModule from './modules/historial_vehiculos.js';

const App = {
    main: null,
    apiBase: 'api.php',

    init() {
        this.main = document.getElementById('main-content');
        window.addEventListener('hashchange', () => this.route());
        this.route();
    },

    async route() {
        const fullHash = window.location.hash || '#dashboard';
        const hash = fullHash.split('?')[0]; 
        this.main.classList.add('fade-out');
        
        setTimeout(async () => {
            if (hash === '#dashboard') {
                this.renderDashboard();
            } else if (hash === '#personal') {
                this.main.innerHTML = await PersonalModule.render();
                PersonalModule.init();
            } else if (hash === '#vehiculos') {
                this.main.innerHTML = await VehiculosModule.render();
                VehiculosModule.init();
            } else if (hash === '#admin') {
                this.main.innerHTML = await AdminModule.render();
                AdminModule.init();
            } else if (hash === '#admin_personal') {
                this.main.innerHTML = await AdminPersonalModule.render();
                AdminPersonalModule.init();
            } else if (hash === '#admin_vehiculos') {
                this.main.innerHTML = await AdminVehiculosModule.render();
                AdminVehiculosModule.init();
            } else if (hash === '#historial_personal') {
                this.main.innerHTML = await HistorialPersonalModule.render();
                HistorialPersonalModule.init();
            } else if (hash === '#historial_vehiculos') {
                this.main.innerHTML = await HistorialVehiculosModule.render();
                HistorialVehiculosModule.init();
            } else {
                this.main.innerHTML = '<h2>404 - Vista no encontrada</h2>';
            }
            this.main.classList.remove('fade-out');
            lucide.createIcons();
        }, 300);
    },

    renderDashboard() {
        this.main.innerHTML = `
            <div class="welcome-section">
                <h2>Panel de Control</h2>
                <p style="color: var(--text-muted);">Bienvenido al sistema de gestión de acceso y vehículos.</p>
            </div>
            <div class="grid">
                <a href="#personal" class="card" style="border-color: #4f46e5; background: #f5f3ff;">
                    <div class="card-icon" style="color: #4f46e5; background: rgba(79, 70, 229, 0.1);"><i data-lucide="users"></i></div>
                    <h3>Control de Personal</h3>
                    <p>Registrar ingresos y verificar protocolos de seguridad diaria.</p>
                </a>
                <a href="#vehiculos" class="card">
                    <div class="card-icon"><i data-lucide="truck"></i></div>
                    <h3>Control Vehículos</h3>
                    <p>Asignación de personal a vehículos y registro de tiempos.</p>
                </a>
                <a href="#historial_personal" class="card">
                    <div class="card-icon" style="color: #10b981; background: rgba(16, 185, 129, 0.1);"><i data-lucide="clipboard-list"></i></div>
                    <h3>Historial Entradas</h3>
                    <p>Consulta registros de protocolos y entradas del personal.</p>
                </a>
                <a href="#historial_vehiculos" class="card">
                    <div class="card-icon" style="color: #f59e0b; background: rgba(245, 158, 11, 0.1);"><i data-lucide="map-pin"></i></div>
                    <h3>Historial Carros</h3>
                    <p>Consulta el historial de movimientos y uso de vehículos.</p>
                </a>
                <a href="#admin" class="card">
                    <div class="card-icon"><i data-lucide="settings"></i></div>
                    <h3>Configuración</h3>
                    <p>Gestionar empleados, vehículos y usuarios del sistema.</p>
                </a>
            </div>
        `;
    },

    async submitForm(data, successMessage) {
        try {
            const res = await fetch(this.apiBase, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (result.success) {
                Swal.fire({
                    title: '¡Éxito!',
                    text: successMessage,
                    icon: 'success',
                    confirmButtonColor: '#4f46e5'
                }).then(() => {
                    const hash = window.location.hash;
                    if (hash.startsWith('#admin_')) {
                        window.location.hash = '#admin';
                    } else {
                        window.location.hash = '#dashboard';
                    }
                });
            } else {
                Swal.fire('Error', result.message || 'Ocurrió un error', 'error');
            }
        } catch (e) {
            Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
        }
    }
};

window.App = App;
document.addEventListener('DOMContentLoaded', () => App.init());
