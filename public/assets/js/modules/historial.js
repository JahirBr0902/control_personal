const HistorialModule = {
    async render() {
        const today = new Date().toLocaleString('sv-SE').slice(0, 10);
        const urlParams = new URLSearchParams(window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '');
        const f = {
            inicio: urlParams.get('fecha_inicio') || today,
            fin: urlParams.get('fecha_fin') || today,
            personal: urlParams.get('personal_id') || '',
            consciente: urlParams.get('estado_consciente') === 'true',
            sustancia: urlParams.get('bajo_sustancia') === 'true',
            limpio: urlParams.get('limpio') === 'true',
            uniforme: urlParams.get('uniforme_completo') === 'true'
        };

        const resPers = await fetch('api.php?action=get_personal');
        const resultPers = await resPers.json();
        const personal = resultPers.data || [];

        const query = new URLSearchParams({
            action: 'get_historial',
            fecha_inicio: f.inicio,
            fecha_fin: f.fin,
            personal_id: f.personal,
            estado_consciente: f.consciente ? 'true' : '',
            bajo_sustancia: f.sustancia ? 'true' : '',
            limpio: f.limpio ? 'true' : '',
            uniforme_completo: f.uniforme ? 'true' : ''
        }).toString();

        const resHist = await fetch(`api.php?${query}`);
        const resultHist = await resHist.json();
        const historial = resultHist.data || [];

        return `
            <style>
                .filter-bar { display: flex; align-items: center; gap: 1rem; background: white; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 2rem; flex-wrap: wrap; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                .filter-item { display: flex; flex-direction: column; gap: 0.25rem; }
                .filter-item label { font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase; }
                .multi-select-custom { position: relative; min-width: 200px; }
                .multi-select-btn { width: 100%; padding: 0.6rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-align: left; font-size: 0.875rem; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
                .multi-select-content { display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #e2e8f0; border-radius: 8px; margin-top: 4px; z-index: 100; padding: 0.5rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
                .multi-select-custom.active .multi-select-content { display: block; }
                .check-option { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; border-radius: 6px; cursor: pointer; transition: background 0.2s; font-size: 0.875rem; }
                .check-option:hover { background: #f1f5f9; }
                .check-option input { cursor: pointer; width: 16px; height: 16px; }
                .btn-filter { padding: 0.6rem 1.25rem; background: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; height: 38px; align-self: flex-end; }
                .btn-reset { padding: 0.6rem; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; height: 38px; align-self: flex-end; }
            </style>

            <div class="welcome-section" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <div>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <a href="#dashboard" style="color: #64748b;"><i data-lucide="arrow-left"></i></a>
                        <h2 style="margin: 0;">Historial de Ingresos</h2>
                    </div>
                </div>
                <button class="btn" id="btn-export-report" style="background: #10b981; color: white; padding: 0.6rem 1.2rem; border-radius: 8px; display: flex; align-items: center; gap: 0.5rem; font-weight: 600; border: none;">
                    <i data-lucide="file-spreadsheet" style="width: 18px;"></i> Exportar Excel
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
                <div class="filter-item" style="flex: 1; min-width: 200px;">
                    <label>Empleado</label>
                    <select id="personal_id" class="form-control">
                        <option value="">-- Todos --</option>
                        ${personal.map(p => `<option value="${p.id}" ${f.personal == p.id ? 'selected' : ''}>${p.nombre}</option>`).join('')}
                    </select>
                </div>
                
                <div class="filter-item">
                    <label>Filtrar por Novedades</label>
                    <div class="multi-select-custom" id="protocol-dropdown">
                        <div class="multi-select-btn">
                            <span id="protocol-btn-text">Ver novedades...</span>
                            <i data-lucide="chevron-down" style="width: 16px;"></i>
                        </div>
                        <div class="multi-select-content">
                            <label class="check-option">
                                <input type="checkbox" id="bajo_sustancia" ${f.sustancia ? 'checked' : ''}>
                                <span>Bajo Sustancias</span>
                            </label>
                            <label class="check-option">
                                <input type="checkbox" id="estado_consciente" ${f.consciente ? 'checked' : ''}>
                                <span>Problemas Consciencia</span>
                            </label>
                            <label class="check-option">
                                <input type="checkbox" id="limpio" ${f.limpio ? 'checked' : ''}>
                                <span>No Limpio / Aseado</span>
                            </label>
                            <label class="check-option">
                                <input type="checkbox" id="uniforme_completo" ${f.uniforme ? 'checked' : ''}>
                                <span>Uniforme Incompleto</span>
                            </label>
                        </div>
                    </div>
                </div>

                <button type="submit" class="btn-filter">Filtrar</button>
                <button type="button" id="btn-reset-filters" class="btn-reset"><i data-lucide="rotate-ccw" style="width: 18px;"></i></button>
            </form>

            <div class="card" style="padding: 0; overflow: hidden; border: 1px solid #e2e8f0;">
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left;">
                                <th style="padding: 1rem;">Fecha y Hora</th>
                                <th style="padding: 1rem;">Empleado</th>
                                <th style="padding: 1rem;">Protocolo</th>
                                <th style="padding: 1rem;">Observaciones</th>
                                <th style="padding: 1rem;">Registrador</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${historial.length === 0 ? `
                                <tr><td colspan="5" style="padding: 4rem; text-align: center; color: #94a3b8;">No se encontraron registros.</td></tr>
                            ` : historial.map(r => {
                                const p = typeof r.protocolo === 'string' ? JSON.parse(r.protocolo) : r.protocolo;
                                const fecha = new Date(r.hora_llegada);
                                return `
                                    <tr style="border-bottom: 1px solid #f1f5f9;">
                                        <td style="padding: 1rem;">
                                            <div style="font-weight: 600;">${fecha.toLocaleDateString()}</div>
                                            <div style="font-size: 0.75rem; color: #64748b;">${fecha.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                        </td>
                                        <td style="padding: 1rem;">
                                            <div style="font-weight: 600;">${r.empleado_nombre}</div>
                                            <div style="font-size: 0.75rem; color: #64748b;">CC: ${r.cedula}</div>
                                        </td>
                                        <td style="padding: 1rem;">
                                            <div style="display: flex; gap: 0.3rem;">
                                                ${this.renderBadges(p)}
                                            </div>
                                        </td>
                                        <td style="padding: 1rem; font-size: 0.875rem; color: #475569; max-width: 250px;">
                                            ${p.observaciones || '<span style="color: #cbd5e1;">Sin novedades</span>'}
                                        </td>
                                        <td style="padding: 1rem; font-size: 0.875rem; color: #64748b;">
                                            ${r.registrador_nombre || 'Sistema'}
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

    renderBadges(p) {
        if (!p) return '';
        const badge = (val, label, activeColor) => `
            <span style="padding: 2px 6px; border-radius: 4px; font-size: 0.65rem; font-weight: 700; border: 1px solid ${val ? activeColor : '#dc2626'}; background: ${val ? activeColor + '15' : '#fef2f2'}; color: ${val ? activeColor : '#dc2626'};">
                ${label}
            </span>
        `;
        return `
            ${badge(p.estado_consciente, 'CO', '#059669')}
            ${badge(p.limpio, 'LI', '#4f46e5')}
            ${badge(p.uniforme_completo, 'UN', '#d97706')}
            ${p.bajo_sustancia ? `<span style="padding: 2px 6px; border-radius: 4px; font-size: 0.65rem; font-weight: 700; background: #ef4444; color: white;">BS</span>` : ''}
        `;
    },

    init() {
        const dropdown = document.getElementById('protocol-dropdown');
        if (!dropdown) return;

        const btn = dropdown.querySelector('.multi-select-btn');
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });

        document.addEventListener('click', () => dropdown.classList.remove('active'));
        dropdown.querySelector('.multi-select-content').addEventListener('click', (e) => e.stopPropagation());

        const updateText = () => {
            const checks = dropdown.querySelectorAll('input:checked');
            const text = document.getElementById('protocol-btn-text');
            text.innerText = checks.length ? `${checks.length} seleccionados` : 'Ver novedades...';
        };
        dropdown.querySelectorAll('input').forEach(i => i.addEventListener('change', updateText));
        updateText();

        document.getElementById('filter-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const params = new URLSearchParams();
            params.set('fecha_inicio', document.getElementById('fecha_inicio').value);
            params.set('fecha_fin', document.getElementById('fecha_fin').value);
            params.set('personal_id', document.getElementById('personal_id').value);
            
            if (document.getElementById('bajo_sustancia').checked) params.set('bajo_sustancia', 'true');
            if (document.getElementById('estado_consciente').checked) params.set('estado_consciente', 'true');
            if (document.getElementById('limpio').checked) params.set('limpio', 'true');
            if (document.getElementById('uniforme_completo').checked) params.set('uniforme_completo', 'true');

            window.location.hash = `#historial?${params.toString()}`;
        });

        document.getElementById('btn-reset-filters').addEventListener('click', () => {
            window.location.hash = '#historial';
        });

        document.getElementById('btn-export-report').addEventListener('click', () => {
            Swal.fire('Exportar', 'Generando reporte filtrado...', 'success');
        });
    }
};

export default HistorialModule;
