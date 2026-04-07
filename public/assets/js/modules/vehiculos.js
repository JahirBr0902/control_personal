const VehiculosModule = {
    async render() {
        const [resVeh, resPers, resRuta] = await Promise.all([
            fetch('api.php?action=get_vehiculos'),
            fetch('api.php?action=get_personal'),
            fetch('api.php?action=get_vehiculos_en_ruta')
        ]);
        
        const vehiculos = (await resVeh.json()).data || [];
        const personal = (await resPers.json()).data || [];
        const enRuta = (await resRuta.json()).data || [];

        return `
            <div class="welcome-section">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                    <a href="#dashboard" style="color: var(--text-muted);"><i data-lucide="arrow-left"></i></a>
                    <h2 style="margin: 0;">Control de Vehículos</h2>
                </div>
                <p style="color: var(--text-muted);">Gestiona las salidas y regresos de la flota en tiempo real.</p>
            </div>

            <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; align-items: start;">
                <!-- Formulario de Salida -->
                <div class="card" style="padding: 1.5rem; border-top: 4px solid #ef4444;">
                    <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem; color: #1e293b;">
                        <i data-lucide="log-out" style="color: #ef4444;"></i> Registrar Salida
                    </h3>
                    <form id="formSalidaVehiculo">
                        <div class="form-group">
                            <label style="font-weight: 600; font-size: 0.875rem;">Vehículo</label>
                            <select id="vehiculo_id" class="form-control" required>
                                <option value="">-- Seleccione vehículo --</option>
                                ${vehiculos.map(v => `<option value="${v.id}">${v.placa} - ${v.marca} ${v.modelo}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label style="font-weight: 600; font-size: 0.875rem;">Conductor Responsable</label>
                            <select id="personal_id" class="form-control" required>
                                <option value="">-- Seleccione conductor --</option>
                                ${personal.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label style="font-weight: 600; font-size: 0.875rem;">Hora de Salida</label>
                            <input type="datetime-local" id="hora_salida" class="form-control" value="${new Date().toLocaleString('sv-SE').slice(0, 16)}">
                        </div>
                        <div class="form-group">
                            <label style="font-weight: 600; font-size: 0.875rem;">Observaciones de Salida</label>
                            <textarea id="obs_salida" class="form-control" rows="2" placeholder="Ej: Nivel de combustible, golpes, etc."></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem; justify-content: center; background: #ef4444; border-color: #ef4444;">
                            <span>Confirmar Salida</span>
                            <i data-lucide="send"></i>
                        </button>
                    </form>
                </div>

                <!-- Lista En Ruta -->
                <div class="card" style="padding: 0; overflow: hidden; border: 1px solid #e2e8f0;">
                    <div style="padding: 1.25rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 800; font-size: 0.875rem; color: #be123c; text-transform: uppercase; display: flex; align-items: center; gap: 0.5rem;">
                            <i data-lucide="map-pin"></i> Vehículos fuera del edificio (${enRuta.length})
                        </span>
                    </div>
                    <div style="max-height: 600px; overflow-y: auto;">
                        ${enRuta.length === 0 ? `
                            <div style="padding: 4rem 2rem; text-align: center; color: #94a3b8;">
                                <i data-lucide="home" style="width: 48px; height: 48px; opacity: 0.2; margin-bottom: 1rem;"></i>
                                <p style="font-weight: 500;">No hay vehículos fuera.</p>
                                <p style="font-size: 0.875rem;">Toda los vehículos se encuentra en el edificio.</p>
                            </div>
                        ` : enRuta.map(r => `
                            <div style="padding: 1.25rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; transition: background 0.2s;" onmouseover="this.style.background='#fff1f2'" onmouseout="this.style.background='transparent'">
                                <div>
                                    <div style="font-weight: 800; font-size: 1.125rem; color: #1e293b;">${r.placa}</div>
                                    <div style="font-size: 0.875rem; color: #475569;">${r.marca} ${r.modelo}</div>
                                    <div style="margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.25rem;">
                                        <div style="font-size: 0.8125rem; display: flex; align-items: center; gap: 0.4rem; color: #1e293b;">
                                            <i data-lucide="user" style="width: 14px;"></i> <strong>${r.empleado_nombre}</strong>
                                        </div>
                                        <div style="font-size: 0.75rem; display: flex; align-items: center; gap: 0.4rem; color: #ef4444; font-weight: 600;">
                                            <i data-lucide="clock" style="width: 14px;"></i> Salió: ${new Date(r.hora_salida).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                        </div>
                                    </div>
                                </div>
                                <button class="btn-regreso" data-id="${r.id}" data-placa="${r.placa}" style="background: #10b981; color: white; border: none; padding: 0.6rem 1rem; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.4rem; box-shadow: 0 2px 4px rgba(16,185,129,0.2);">
                                    <i data-lucide="home" style="width: 16px;"></i> Regreso
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        // Manejar Salida
        const form = document.getElementById('formSalidaVehiculo');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const data = {
                    action: 'registrar_entrada_personal', // Usaremos el mismo endpoint genérico o uno nuevo
                    // Reutilizamos crear de ControlVehiculo
                    action: 'registrar_salida_vehiculo_real', // Me falta este case en API
                };
                
                // Corregido: Enviar datos correctos
                const payload = {
                    action: 'registrar_control_vehiculo',
                    vehiculo_id: document.getElementById('vehiculo_id').value,
                    personal_id: document.getElementById('personal_id').value,
                    hora_salida: document.getElementById('hora_salida').value,
                    observaciones: document.getElementById('obs_salida').value
                };

                try {
                    const res = await fetch('api.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const result = await res.json();
                    if (result.success) {
                        Swal.fire('¡Vehículo fuera!', 'Salida registrada correctamente.', 'success')
                            .then(() => window.dispatchEvent(new HashChangeEvent('hashchange')));
                    } else {
                        Swal.fire('Error', result.message, 'error');
                    }
                } catch (e) {
                    Swal.fire('Error', 'No se pudo registrar la salida.', 'error');
                }
            });
        }

        // Manejar Regreso
        document.querySelectorAll('.btn-regreso').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const placa = btn.dataset.placa;

                const { value: formValues } = await Swal.fire({
                    title: `Registrar Regreso: ${placa}`,
                    html: `
                        <div style="text-align: left;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Hora de Regreso</label>
                            <input type="datetime-local" id="swal-hora-regreso" class="swal2-input" style="width: 100%; margin: 0 0 1rem 0;" value="${new Date().toLocaleString('sv-SE').slice(0, 16)}">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Observaciones de Regreso</label>
                            <textarea id="swal-obs-regreso" class="swal2-textarea" style="width: 100%; margin: 0;" placeholder="Novedades al volver..."></textarea>
                        </div>
                    `,
                    focusConfirm: false,
                    showCancelButton: true,
                    confirmButtonText: 'Confirmar Entrada',
                    confirmButtonColor: '#10b981',
                    preConfirm: () => {
                        return {
                            hora_regreso: document.getElementById('swal-hora-regreso').value,
                            observaciones: document.getElementById('swal-obs-regreso').value
                        }
                    }
                });

                if (formValues) {
                    try {
                        const res = await fetch('api.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'registrar_regreso_vehiculo', id, ...formValues })
                        });
                        const result = await res.json();
                        if (result.success) {
                            Swal.fire('¡En base!', 'Regreso registrado correctamente.', 'success')
                                .then(() => window.dispatchEvent(new HashChangeEvent('hashchange')));
                        } else {
                            Swal.fire('Error', result.message, 'error');
                        }
                    } catch (e) {
                        Swal.fire('Error', 'No se pudo registrar el regreso.', 'error');
                    }
                }
            });
        });
    }
};

export default VehiculosModule;
