const HistorialVehiculosModule = {
    async render() {
        const today = new Date().toLocaleString('sv-SE').slice(0, 10);
        const urlParams = new URLSearchParams(window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '');
        const f = {
            inicio: urlParams.get('fecha_inicio') || today,
            fin: urlParams.get('fecha_fin') || today,
            vehiculo: urlParams.get('vehiculo_id') || '',
            personal: urlParams.get('personal_id') || ''
        };

        const [resVeh, resPers] = await Promise.all([
            fetch('api.php?action=get_vehiculos_admin'),
            fetch('api.php?action=get_personal_admin')
        ]);
        const vehiculos = (await resVeh.json()).data || [];
        const personal = (await resPers.json()).data || [];

        const query = new URLSearchParams({
            action: 'get_historial_vehiculos',
            fecha_inicio: f.inicio,
            fecha_fin: f.fin,
            vehiculo_id: f.vehiculo,
            personal_id: f.personal
        }).toString();

        const resHist = await fetch(`api.php?${query}`);
        const resultHist = await resHist.json();
        const historial = resultHist.data || [];

        return `
            <style>
                .filter-bar { display: flex; align-items: center; gap: 1rem; background: white; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 2rem; flex-wrap: wrap; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                .filter-item { display: flex; flex-direction: column; gap: 0.25rem; }
                .filter-item label { font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase; }
                .btn-filter { padding: 0.6rem 1.25rem; background: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; height: 38px; align-self: flex-end; }
                .btn-reset { padding: 0.6rem; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; height: 38px; align-self: flex-end; }
            </style>

            <div class="welcome-section" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <div>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <a href="#dashboard" style="color: #64748b;"><i data-lucide="arrow-left"></i></a>
                        <h2 style="margin: 0;">Historial Vehículos</h2>
                    </div>
                </div>
                <button class="btn" id="btn-export-veh" style="background: #10b981; color: white; padding: 0.6rem 1.2rem; border-radius: 8px; display: flex; align-items: center; gap: 0.5rem; font-weight: 600; border: none;">
                    <i data-lucide="file-spreadsheet" style="width: 18px;"></i> Exportar Vehículos
                </button>
            </div>

            <form class="filter-bar" id="filter-form">
                <div class="filter-item">
                    <label>Desde</label>
                    <input type="date" id="fecha_inicio" class="form-control" value="${f.inicio}" style="width: 140px;">
                </div>
                <div class="filter-item">
                    <label>Hasta</label>
                    <input type="date" id="fecha_fin" class="form-control" value="${f.fin}" style="width: 140px;">
                </div>
                <div class="filter-item" style="flex: 1; min-width: 150px;">
                    <label>Vehículo</label>
                    <select id="vehiculo_id" class="form-control">
                        <option value="">-- Todos --</option>
                        ${vehiculos.map(v => `<option value="${v.id}" ${f.vehiculo == v.id ? 'selected' : ''}>${v.placa} (${v.marca})</option>`).join('')}
                    </select>
                </div>
                <div class="filter-item" style="flex: 1; min-width: 150px;">
                    <label>Conductor</label>
                    <select id="personal_id" class="form-control">
                        <option value="">-- Todos --</option>
                        ${personal.map(p => `<option value="${p.id}" ${f.personal == p.id ? 'selected' : ''}>${p.nombre}</option>`).join('')}
                    </select>
                </div>

                <button type="submit" class="btn-filter">Filtrar</button>
                <button type="button" id="btn-reset-filters" class="btn-reset"><i data-lucide="rotate-ccw" style="width: 18px;"></i></button>
            </form>

            <div class="card" style="padding: 0; overflow: hidden; border: 1px solid #e2e8f0;">
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left;">
                                <th style="padding: 1rem;">Fecha</th>
                                <th style="padding: 1rem;">Vehículo</th>
                                <th style="padding: 1rem;">Conductor</th>
                                <th style="padding: 1rem;">Horas (Salida / Regreso)</th>
                                <th style="padding: 1rem;">Observaciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${historial.length === 0 ? `
                                <tr><td colspan="5" style="padding: 4rem; text-align: center; color: #94a3b8;">No se encontraron movimientos.</td></tr>
                            ` : historial.map(r => {
                                const obsLimpia = r.observaciones ? r.observaciones.replace(/^ \| Regreso: $/, '').trim() : '';
                                return `
                                    <tr style="border-bottom: 1px solid #f1f5f9;">
                                        <td style="padding: 1rem;">
                                            <div style="font-weight: 600;">${new Date(r.hora_salida).toLocaleDateString()}</div>
                                        </td>
                                        <td style="padding: 1rem;">
                                            <div style="font-weight: 700; color: #1e293b;">${r.placa}</div>
                                            <div style="font-size: 0.75rem; color: #64748b;">${r.marca} ${r.modelo}</div>
                                        </td>
                                        <td style="padding: 1rem;">
                                            <div style="font-weight: 600;">${r.empleado_nombre}</div>
                                        </td>
                                        <td style="padding: 1rem;">
                                            <div style="display: flex; gap: 1rem; font-size: 0.875rem;">
                                                <div title="Hora Salida">
                                                    <span style="color: #ef4444; font-size: 0.7rem; display: block; font-weight: 700;">SALIDA</span>
                                                    ${r.hora_salida ? new Date(r.hora_salida).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                                                </div>
                                                <div title="Hora Regreso">
                                                    <span style="color: #10b981; font-size: 0.7rem; display: block; font-weight: 700;">REGRESO</span>
                                                    ${r.hora_regreso ? new Date(r.hora_regreso).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '<span style="color: #ef4444; font-weight: 700;">EN RUTA</span>'}
                                                </div>
                                            </div>
                                        </td>
                                        <td style="padding: 1rem; font-size: 0.875rem; color: #475569; max-width: 250px;">
                                            ${obsLimpia || '<span style="color: #cbd5e1;">Sin observaciones</span>'}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    init() {
        document.getElementById('filter-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const params = new URLSearchParams();
            params.set('fecha_inicio', document.getElementById('fecha_inicio').value);
            params.set('fecha_fin', document.getElementById('fecha_fin').value);
            params.set('vehiculo_id', document.getElementById('vehiculo_id').value);
            params.set('personal_id', document.getElementById('personal_id').value);
            window.location.hash = `#historial_vehiculos?${params.toString()}`;
        });

        document.getElementById('btn-reset-filters').addEventListener('click', () => {
            window.location.hash = '#historial_vehiculos';
        });

        document.getElementById('btn-export-veh').addEventListener('click', () => {
            Swal.fire('Exportar', 'Generando reporte de flota...', 'success');
        });
    }
};

export default HistorialVehiculosModule;
