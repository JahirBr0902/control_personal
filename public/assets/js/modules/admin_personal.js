const AdminPersonalModule = {
    async render() {
        const res = await fetch('api.php?action=get_personal_admin');
        const result = await res.json();
        const personal = result.data || [];

        return `
            <div class="welcome-section">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                    <a href="#admin" style="color: var(--text-muted);"><i data-lucide="arrow-left"></i></a>
                    <h2 style="margin: 0;">Gestión de Empleados</h2>
                </div>
                <p style="color: var(--text-muted);">Administra la lista de personal autorizado para el sistema.</p>
            </div>

            <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; align-items: start;">
                <!-- Formulario -->
                <div class="card" style="padding: 1.5rem;">
                    <h3 style="margin-bottom: 1.5rem; font-size: 1.125rem;">Agregar Nuevo Empleado</h3>
                    <form id="formAddPersonal">
                        <div class="form-group">
                            <label for="nombre">Nombre Completo</label>
                            <input type="text" id="nombre" name="nombre" class="form-control" required placeholder="Ej: Juan Pérez">
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem; justify-content: center;">
                            <span>Guardar Empleado</span>
                            <i data-lucide="plus-circle" style="width: 18px;"></i>
                        </button>
                    </form>
                </div>

                <!-- Tabla de Empleados -->
                <div class="card" style="padding: 0; overflow: hidden; border: 1px solid var(--border);">
                    <div style="padding: 1rem; background: #f8fafc; border-bottom: 1px solid var(--border); font-weight: 700; font-size: 0.875rem; color: #475569;">
                        PERSONAL REGISTRADO (${personal.length})
                    </div>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f1f5f9; text-align: left; font-size: 0.75rem; color: #64748b; text-transform: uppercase;">
                                    <th style="padding: 0.75rem 1rem;">Empleado</th>
                                    <th style="padding: 0.75rem 1rem; text-align: center;">Estado</th>
                                    <th style="padding: 0.75rem 1rem; text-align: right;">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${personal.length === 0 ? `
                                    <tr><td colspan="3" style="padding: 2rem; text-align: center; color: #94a3b8;">No hay empleados registrados.</td></tr>
                                ` : personal.map(p => `
                                    <tr style="border-bottom: 1px solid #f1f5f9; ${!p.activo ? 'background: #fcfcfc;' : ''}">
                                        <td style="padding: 1rem;">
                                            <div style="font-weight: 600; color: ${p.activo ? '#1e293b' : '#94a3b8'};">${p.nombre}</div>
                                        </td>
                                        <td style="padding: 1rem; text-align: center;">
                                            <span style="font-size: 0.65rem; padding: 0.2rem 0.5rem; border-radius: 99px; font-weight: 700; border: 1px solid ${p.activo ? '#a7f3d0' : '#fecdd3'}; background: ${p.activo ? '#ecfdf5' : '#fef2f2'}; color: ${p.activo ? '#065f46' : '#991b1b'};">
                                                ${p.activo ? 'ACTIVO' : 'SUSPENDIDO'}
                                            </span>
                                        </td>
                                        <td style="padding: 1rem; text-align: right;">
                                            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                                                <button class="btn-edit-name" data-id="${p.id}" data-nombre="${p.nombre}" title="Editar Nombre" style="padding: 0.4rem; background: white; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; color: #64748b;">
                                                    <i data-lucide="edit-2" style="width: 14px; height: 14px;"></i>
                                                </button>
                                                <button class="btn-toggle-status" data-id="${p.id}" data-activo="${p.activo}" title="${p.activo ? 'Suspender' : 'Activar'}" style="padding: 0.4rem; background: white; border: 1px solid ${p.activo ? '#fecdd3' : '#a7f3d0'}; border-radius: 6px; cursor: pointer; color: ${p.activo ? '#e11d48' : '#059669'};">
                                                    <i data-lucide="${p.activo ? 'user-x' : 'user-check'}" style="width: 14px; height: 14px;"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        // Formulario Agregar
        const form = document.getElementById('formAddPersonal');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const data = {
                    action: 'add_personal',
                    nombre: document.getElementById('nombre').value
                };
                try {
                    const res = await fetch('api.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    const result = await res.json();
                    if (result.success) {
                        Swal.fire('¡Éxito!', 'Empleado agregado correctamente', 'success')
                            .then(() => window.dispatchEvent(new HashChangeEvent('hashchange')));
                    } else {
                        Swal.fire('Error', result.message, 'error');
                    }
                } catch (e) {
                    Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
                }
            });
        }

        // Editar Nombre
        document.querySelectorAll('.btn-edit-name').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const nombreActual = btn.dataset.nombre;

                const { value: nuevoNombre } = await Swal.fire({
                    title: 'Editar Nombre',
                    input: 'text',
                    inputValue: nombreActual,
                    showCancelButton: true,
                    confirmButtonText: 'Actualizar',
                    confirmButtonColor: '#4f46e5',
                    inputValidator: (value) => {
                        if (!value) return '¡El nombre es obligatorio!';
                    }
                });

                if (nuevoNombre && nuevoNombre !== nombreActual) {
                    const res = await fetch('api.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'edit_personal', id, nombre: nuevoNombre })
                    });
                    const result = await res.json();
                    if (result.success) {
                        Swal.fire('¡Actualizado!', 'El nombre ha sido modificado.', 'success')
                            .then(() => window.dispatchEvent(new HashChangeEvent('hashchange')));
                    }
                }
            });
        });

        // Cambiar Estado (Activar/Suspender)
        document.querySelectorAll('.btn-toggle-status').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const activo = btn.dataset.activo === 'true';

                const confirm = await Swal.fire({
                    title: activo ? '¿Suspender Empleado?' : '¿Activar Empleado?',
                    text: activo ? 'El empleado ya no aparecerá en la lista de entradas diarias.' : 'El empleado volverá a aparecer en la lista de entradas.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: activo ? 'Sí, suspender' : 'Sí, activar',
                    confirmButtonColor: activo ? '#e11d48' : '#059669'
                });

                if (confirm.isConfirmed) {
                    const res = await fetch('api.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'toggle_status_personal', id })
                    });
                    const result = await res.json();
                    if (result.success) {
                        Swal.fire('¡Listo!', result.message, 'success')
                            .then(() => window.dispatchEvent(new HashChangeEvent('hashchange')));
                    }
                }
            });
        });
    }
};

export default AdminPersonalModule;
