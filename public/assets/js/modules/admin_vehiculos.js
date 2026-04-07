const AdminVehiculosModule = {
    async render() {
        const res = await fetch('api.php?action=get_vehiculos_admin');
        const result = await res.json();
        const vehiculos = result.data || [];

        return `
            <div class="welcome-section">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                    <a href="#admin" style="color: var(--text-muted);"><i data-lucide="arrow-left"></i></a>
                    <h2 style="margin: 0;">Gestión de Vehículos</h2>
                </div>
                <p style="color: var(--text-muted);">Administra la flota de vehículos autorizados en el sistema.</p>
            </div>

            <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; align-items: start;">
                <!-- Formulario -->
                <div class="card" style="padding: 1.5rem;">
                    <h3 style="margin-bottom: 1.5rem; font-size: 1.125rem;">Agregar Nuevo Vehículo</h3>
                    <form id="formAddVehiculo">
                        <div class="form-group">
                            <label for="placa">Número de Placa</label>
                            <input type="text" id="placa" name="placa" class="form-control" required placeholder="Ej: ABC-1234">
                        </div>
                        <div class="form-group">
                            <label for="marca">Marca</label>
                            <input type="text" id="marca" name="marca" class="form-control" required placeholder="Ej: Toyota">
                        </div>
                        <div class="form-group">
                            <label for="modelo">Modelo</label>
                            <input type="text" id="modelo" name="modelo" class="form-control" required placeholder="Ej: Hilux">
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem; justify-content: center;">
                            <span>Guardar Vehículo</span>
                            <i data-lucide="plus-circle" style="width: 18px;"></i>
                        </button>
                    </form>
                </div>

                <!-- Tabla de Vehículos -->
                <div class="card" style="padding: 0; overflow: hidden; border: 1px solid var(--border);">
                    <div style="padding: 1rem; background: #f8fafc; border-bottom: 1px solid var(--border); font-weight: 700; font-size: 0.875rem; color: #475569;">
                        FLOTA REGISTRADA (${vehiculos.length})
                    </div>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f1f5f9; text-align: left; font-size: 0.75rem; color: #64748b; text-transform: uppercase;">
                                    <th style="padding: 0.75rem 1rem;">Vehículo</th>
                                    <th style="padding: 0.75rem 1rem; text-align: center;">Estado</th>
                                    <th style="padding: 0.75rem 1rem; text-align: right;">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${vehiculos.length === 0 ? `
                                    <tr><td colspan="3" style="padding: 2rem; text-align: center; color: #94a3b8;">No hay vehículos registrados.</td></tr>
                                ` : vehiculos.map(v => `
                                    <tr style="border-bottom: 1px solid #f1f5f9; ${!v.activo ? 'background: #fcfcfc;' : ''}">
                                        <td style="padding: 1rem;">
                                            <div style="font-weight: 700; color: ${v.activo ? '#1e293b' : '#94a3b8'};">${v.placa}</div>
                                            <div style="font-size: 0.75rem; color: #64748b;">${v.marca} ${v.modelo}</div>
                                        </td>
                                        <td style="padding: 1rem; text-align: center;">
                                            <span style="font-size: 0.65rem; padding: 0.2rem 0.5rem; border-radius: 99px; font-weight: 700; border: 1px solid ${v.activo ? '#a7f3d0' : '#fecdd3'}; background: ${v.activo ? '#ecfdf5' : '#fef2f2'}; color: ${v.activo ? '#065f46' : '#991b1b'};">
                                                ${v.activo ? 'ACTIVO' : 'SUSPENDIDO'}
                                            </span>
                                        </td>
                                        <td style="padding: 1rem; text-align: right;">
                                            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                                                <button class="btn-edit-vehiculo" 
                                                    data-id="${v.id}" 
                                                    data-placa="${v.placa}" 
                                                    data-marca="${v.marca}" 
                                                    data-modelo="${v.modelo}" 
                                                    title="Editar Vehículo" style="padding: 0.4rem; background: white; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; color: #64748b;">
                                                    <i data-lucide="edit-2" style="width: 14px; height: 14px;"></i>
                                                </button>
                                                <button class="btn-toggle-vehiculo-status" data-id="${v.id}" data-activo="${v.activo}" title="${v.activo ? 'Suspender' : 'Activar'}" style="padding: 0.4rem; background: white; border: 1px solid ${v.activo ? '#fecdd3' : '#a7f3d0'}; border-radius: 6px; cursor: pointer; color: ${v.activo ? '#e11d48' : '#059669'};">
                                                    <i data-lucide="${v.activo ? 'user-x' : 'user-check'}" style="width: 14px; height: 14px;"></i>
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
        const form = document.getElementById('formAddVehiculo');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const data = {
                    action: 'add_vehiculo',
                    placa: document.getElementById('placa').value,
                    marca: document.getElementById('marca').value,
                    modelo: document.getElementById('modelo').value
                };
                try {
                    const res = await fetch('api.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    const result = await res.json();
                    if (result.success) {
                        Swal.fire('¡Éxito!', 'Vehículo agregado correctamente', 'success')
                            .then(() => window.dispatchEvent(new HashChangeEvent('hashchange')));
                    } else {
                        Swal.fire('Error', result.message, 'error');
                    }
                } catch (e) {
                    Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
                }
            });
        }

        // Editar Vehículo
        document.querySelectorAll('.btn-edit-vehiculo').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const placaActual = btn.dataset.placa;
                const marcaActual = btn.dataset.marca;
                const modeloActual = btn.dataset.modelo;

                const { value: formValues } = await Swal.fire({
                    title: 'Editar Vehículo',
                    html: `
                        <input id="swal-placa" class="swal2-input" placeholder="Placa" value="${placaActual}">
                        <input id="swal-marca" class="swal2-input" placeholder="Marca" value="${marcaActual}">
                        <input id="swal-modelo" class="swal2-input" placeholder="Modelo" value="${modeloActual}">
                    `,
                    focusConfirm: false,
                    showCancelButton: true,
                    confirmButtonText: 'Actualizar',
                    confirmButtonColor: '#4f46e5',
                    preConfirm: () => {
                        return {
                            placa: document.getElementById('swal-placa').value,
                            marca: document.getElementById('swal-marca').value,
                            modelo: document.getElementById('swal-modelo').value
                        }
                    }
                });

                if (formValues) {
                    const res = await fetch('api.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'edit_vehiculo', id, ...formValues })
                    });
                    const result = await res.json();
                    if (result.success) {
                        Swal.fire('¡Actualizado!', 'El vehículo ha sido modificado.', 'success')
                            .then(() => window.dispatchEvent(new HashChangeEvent('hashchange')));
                    } else {
                        Swal.fire('Error', result.message, 'error');
                    }
                }
            });
        });

        // Cambiar Estado
        document.querySelectorAll('.btn-toggle-vehiculo-status').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const activo = btn.dataset.activo === 'true';

                const confirm = await Swal.fire({
                    title: activo ? '¿Suspender Vehículo?' : '¿Activar Vehículo?',
                    text: activo ? 'El vehículo ya no podrá ser asignado a registros.' : 'El vehículo volverá a estar disponible.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: activo ? 'Sí, suspender' : 'Sí, activar',
                    confirmButtonColor: activo ? '#e11d48' : '#059669'
                });

                if (confirm.isConfirmed) {
                    const res = await fetch('api.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'toggle_status_vehiculo', id })
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

export default AdminVehiculosModule;
