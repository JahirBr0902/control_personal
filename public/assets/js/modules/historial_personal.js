// ============================================================
//  HistorialPersonalModule — versión corregida
//  Cambios aplicados:
//  1. parseProtocolo() centralizado con try/catch
//  2. Parámetros booleanos omitidos cuando son false (no string vacío)
//  3. Fechas con zona horaria local (no UTC)
//  4. Manejo de errores en fetch
//  5. didDrawPage redundante eliminado
//  6. Hash parsing más robusto
//  7. index sin usar eliminado del forEach de generatePDF
// ============================================================

const HistorialPersonalModule = {

    // ----------------------------------------------------------
    // Utilidad: parsea r.protocolo de forma segura desde cualquier punto
    // ----------------------------------------------------------
    parseProtocolo(raw) {
        try {
            return typeof raw === 'string' ? JSON.parse(raw) : (raw ?? {});
        } catch {
            console.warn('HistorialPersonalModule: protocolo inválido', raw);
            return {};
        }
    },

    // ----------------------------------------------------------
    // Utilidad: parsea la fecha evitando desfase UTC → hora local
    // Acepta "2025-07-10 08:30:00" o ISO strings
    // ----------------------------------------------------------
    parseLocalDate(str) {
        if (!str) return new Date();
        // Reemplaza espacio por T para ISO, pero NO agrega 'Z' (evita UTC)
        return new Date(str.replace(' ', 'T'));
    },

    // ----------------------------------------------------------
    // render()
    // ----------------------------------------------------------
    async render() {
        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 6);
        const todayStr        = now.toISOString().slice(0, 10);
        const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

        // FIX #6: parsing de hash más robusto ante múltiples '?'
        const hashStr = window.location.hash;
        const hashQuery = hashStr.includes('?')
            ? hashStr.slice(hashStr.indexOf('?') + 1)
            : '';
        const urlParams = new URLSearchParams(hashQuery);

        const f = {
            inicio:     urlParams.get('fecha_inicio') || sevenDaysAgoStr,
            fin:        urlParams.get('fecha_fin')    || todayStr,
            personal:   urlParams.get('personal_id') || '',
            consciente: urlParams.get('estado_consciente') === 'true',
            sustancia:  urlParams.get('bajo_sustancia')    === 'true',
            limpio:     urlParams.get('limpio')            === 'true',
            uniforme:   urlParams.get('uniforme_completo') === 'true',
        };

        // FIX #4 (fetch personal): manejo de error
        let personal = [];
        try {
            const resPers = await fetch('api.php?action=get_personal_admin');
            if (!resPers.ok) throw new Error(`HTTP ${resPers.status}`);
            const resultPers = await resPers.json();
            personal = resultPers.data || [];
        } catch (err) {
            console.error('Error al cargar personal:', err);
        }

        // FIX #1/#2: omitir parámetros booleanos cuando son false
        const query = new URLSearchParams({
            action:       'get_historial_personal',
            fecha_inicio: f.inicio,
            fecha_fin:    f.fin,
            personal_id:  f.personal,
        });
        if (f.consciente) query.set('estado_consciente', 'true');
        if (f.sustancia)  query.set('bajo_sustancia',    'true');
        if (f.limpio)     query.set('limpio',            'true');
        if (f.uniforme)   query.set('uniforme_completo', 'true');

        // FIX #4 (fetch historial): manejo de error
        let historial = [];
        try {
            const resHist = await fetch(`api.php?${query.toString()}`);
            if (!resHist.ok) throw new Error(`HTTP ${resHist.status}`);
            const resultHist = await resHist.json();
            historial = resultHist.data || [];
        } catch (err) {
            console.error('Error al cargar historial:', err);
        }

        // --- AGRUPAR POR EMPLEADO ---
        const grouped = {};
        historial.forEach(r => {
            if (!grouped[r.personal_id]) {
                grouped[r.personal_id] = { nombre: r.empleado_nombre, registros: [] };
            }
            grouped[r.personal_id].registros.push(r);
        });
        this.currentGrouped  = Object.values(grouped);
        this.currentFilters  = f;

        let html = `
            <style>
                .multi-select-custom { position: relative; min-width: 180px; }
                .multi-select-btn { width: 100%; padding: 0.5rem; background: white; border: 1px solid #e2e8f0; border-radius: 6px; text-align: left; font-size: 0.8rem; cursor: pointer; display: flex; justify-content: space-between; align-items: center; height: 38px; }
                .multi-select-content { display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #e2e8f0; border-radius: 8px; margin-top: 4px; z-index: 100; padding: 0.5rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
                .multi-select-custom.active .multi-select-content { display: block; }
                .check-option { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem; border-radius: 4px; cursor: pointer; font-size: 0.75rem; }
                .check-option:hover { background: #f1f5f9; }
            </style>
            <div class="welcome-section" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <div>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <a href="#dashboard" style="color: #64748b;"><i data-lucide="arrow-left"></i></a>
                        <h2 style="margin: 0;">Historial Agrupado</h2>
                    </div>
                    <p style="color: #64748b; font-size: 0.875rem;">Resumen de actividad por empleado en el periodo seleccionado.</p>
                </div>
                <button class="btn" id="btn-export-report-pdf" style="background: #10b981; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; display: flex; align-items: center; gap: 0.5rem; font-weight: 600; border: none;">
                    <i data-lucide="printer" style="width: 18px;"></i> Imprimir Reporte Agrupado
                </button>
            </div>
            <form class="filter-bar" id="filter-form" style="display: flex; gap: 0.75rem; background: white; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 2rem; flex-wrap: wrap; align-items: flex-end;">
                <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                    <label style="font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Desde</label>
                    <input type="date" id="fecha_inicio" class="form-control" value="${f.inicio}" style="width: 135px;">
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                    <label style="font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Hasta</label>
                    <input type="date" id="fecha_fin" class="form-control" value="${f.fin}" style="width: 135px;">
                </div>
                <div style="flex: 1; min-width: 150px; display: flex; flex-direction: column; gap: 0.25rem;">
                    <label style="font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Empleado</label>
                    <select id="personal_id" class="form-control">
                        <option value="">-- Todos --</option>
                        ${personal.map(p => `<option value="${p.id}" ${f.personal == p.id ? 'selected' : ''}>${p.nombre}</option>`).join('')}
                    </select>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                    <label style="font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Novedades</label>
                    <div class="multi-select-custom" id="protocol-dropdown">
                        <div class="multi-select-btn">
                            <span id="protocol-btn-text">Ver novedades...</span>
                            <i data-lucide="chevron-down" style="width: 14px;"></i>
                        </div>
                        <div class="multi-select-content">
                            <label class="check-option"><input type="checkbox" id="bajo_sustancia"     ${f.sustancia  ? 'checked' : ''}> <span>Bajo Sustancias</span></label>
                            <label class="check-option"><input type="checkbox" id="estado_consciente" ${f.consciente ? 'checked' : ''}> <span>Problemas Consciencia</span></label>
                            <label class="check-option"><input type="checkbox" id="limpio"            ${f.limpio     ? 'checked' : ''}> <span>No Limpio/Aseado</span></label>
                            <label class="check-option"><input type="checkbox" id="uniforme_completo" ${f.uniforme   ? 'checked' : ''}> <span>Unif. Incompleto</span></label>
                        </div>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary" style="height: 38px;">Filtrar</button>
                <button type="button" id="btn-reset-filters" style="padding: 0.6rem; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; height: 38px;">
                    <i data-lucide="rotate-ccw" style="width: 18px;"></i>
                </button>
            </form>
        `;

        if (this.currentGrouped.length === 0) {
            html += `<div class="card" style="text-align: center; padding: 4rem; color: #94a3b8;">No hay registros que coincidan con los filtros.</div>`;
        } else {
            this.currentGrouped.forEach(emp => {
                html += `
                    <div style="margin-bottom: 3rem;">
                        <h3 style="margin-bottom: 1rem; padding-left: 0.5rem; border-left: 4px solid #4f46e5; color: #1e293b;">${emp.nombre}</h3>
                        <div class="card" style="padding: 0; overflow: hidden; border: 1px solid #e2e8f0;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; font-size: 0.75rem;">
                                        <th style="padding: 0.75rem 1rem;">Fecha y Hora</th>
                                        <th style="padding: 0.75rem 1rem;">Protocolo / Incidencias</th>
                                        <th style="padding: 0.75rem 1rem;">Observaciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${emp.registros.map(r => {
                                        // FIX #1: parseProtocolo() centralizado con try/catch
                                        const p = this.parseProtocolo(r.protocolo);
                                        // FIX #3: fecha en hora local
                                        const fecha = this.parseLocalDate(r.hora_llegada);
                                        return `
                                            <tr>
                                                <td style="padding: 0.75rem 1rem;">
                                                    <span style="font-weight: 600;">${fecha.toLocaleDateString()}</span>
                                                    <span style="color: #64748b; margin-left: 0.5rem;">${fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </td>
                                                <td style="padding: 0.75rem 1rem;">
                                                    <div style="display: flex; gap: 0.3rem;">${this.renderBadges(p)}</div>
                                                </td>
                                                <td style="padding: 0.75rem 1rem; font-size: 0.875rem; color: #475569;">${p.observaciones || '-'}</td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            });
        }

        return html;
    },

    // ----------------------------------------------------------
    // renderBadges()
    // ----------------------------------------------------------
    renderBadges(p) {
        if (!p) return '';
        const badge = (val, label, activeColor) => `
            <span style="padding: 2px 6px; border-radius: 4px; font-size: 0.65rem; font-weight: 700;
                border: 1px solid ${val ? activeColor : '#dc2626'};
                background: ${val ? activeColor + '15' : '#fef2f2'};
                color: ${val ? activeColor : '#dc2626'};">
                ${label}
            </span>
        `;
        return `
            ${badge(p.estado_consciente,  'CO', '#059669')}
            ${badge(p.limpio,             'LI', '#4f46e5')}
            ${badge(p.uniforme_completo,  'UN', '#d97706')}
            ${p.bajo_sustancia ? `<span style="padding: 2px 6px; border-radius: 4px; font-size: 0.65rem; font-weight: 700; background: #ef4444; color: white;">BS</span>` : ''}
        `;
    },

    // ----------------------------------------------------------
    // init()
    // ----------------------------------------------------------
    init() {
        const dropdown = document.getElementById('protocol-dropdown');
        if (dropdown) {
            const btn = dropdown.querySelector('.multi-select-btn');
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('active');
            });
            document.addEventListener('click', () => dropdown.classList.remove('active'));
            dropdown.querySelector('.multi-select-content').addEventListener('click', (e) => e.stopPropagation());

            const updateText = () => {
                const checks = dropdown.querySelectorAll('input:checked');
                const text   = document.getElementById('protocol-btn-text');
                text.innerText = checks.length ? `${checks.length} seleccionados` : 'Ver novedades...';
            };
            dropdown.querySelectorAll('input').forEach(i => i.addEventListener('change', updateText));
            updateText();
        }

        document.getElementById('filter-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const params = new URLSearchParams();
            params.set('fecha_inicio', document.getElementById('fecha_inicio').value);
            params.set('fecha_fin',    document.getElementById('fecha_fin').value);
            params.set('personal_id',  document.getElementById('personal_id').value);

            // FIX #2: solo añadir si está marcado
            if (document.getElementById('bajo_sustancia').checked)     params.set('bajo_sustancia',    'true');
            if (document.getElementById('estado_consciente').checked)  params.set('estado_consciente', 'true');
            if (document.getElementById('limpio').checked)             params.set('limpio',            'true');
            if (document.getElementById('uniforme_completo').checked)  params.set('uniforme_completo', 'true');

            window.location.hash = `#historial_personal?${params.toString()}`;
        });

        document.getElementById('btn-reset-filters').addEventListener('click', () => {
            window.location.hash = '#historial_personal';
        });

        document.getElementById('btn-export-report-pdf').addEventListener('click', () => this.generatePDF());
    },

    // ----------------------------------------------------------
    // generatePDF()
    // ----------------------------------------------------------
    generatePDF() {
        if (!this.currentGrouped || this.currentGrouped.length === 0) {
            Swal.fire('Atención', 'No hay datos para imprimir.', 'warning');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc       = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        let currentY    = 25;

        // --- HEADER ---
        doc.setFillColor(30, 41, 59);
        doc.rect(0, 0, pageWidth, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('WITMAC - CONTROL SEMANAL', 14, 13);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(
            `PERIODO: ${this.currentFilters.inicio} AL ${this.currentFilters.fin}`,
            pageWidth - 14, 13, { align: 'right' }
        );

        // FIX #7: index eliminado (no se usaba)
        this.currentGrouped.forEach((emp) => {
            if (currentY > 250) { doc.addPage(); currentY = 25; }

            doc.setFillColor(241, 245, 249);
            doc.rect(14, currentY, pageWidth - 28, 8, 'F');
            doc.setTextColor(30, 41, 59);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(`EMPLEADO: ${emp.nombre}`, 18, currentY + 6);
            currentY += 10;

            const tableBody = emp.registros.map(r => {
                // FIX #1: parseProtocolo() centralizado
                const p = this.parseProtocolo(r.protocolo);
                // FIX #3: hora local
                const fecha = this.parseLocalDate(r.hora_llegada);

                const alerts = [];
                if (!p.estado_consciente) alerts.push('Inconsciente');
                if (!p.limpio)            alerts.push('No Aseado');
                if (!p.uniforme_completo) alerts.push('S/Uniforme');
                if (p.bajo_sustancia)     alerts.push('BAJO SUST.');

                return [
                    fecha.toLocaleDateString() + ' ' + fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    alerts.length ? alerts.join(', ') : 'OK',
                    p.observaciones || '-',
                ];
            });

            // FIX #5: didDrawPage eliminado (redundante con lastAutoTable.finalY)
            doc.autoTable({
                startY: currentY,
                head:   [['Fecha y Hora de Ingreso', 'Alertas de Protocolo', 'Observaciones']],
                body:   tableBody,
                theme:  'grid',
                headStyles: { fillColor: [71, 85, 105], fontSize: 8 },
                styles:     { fontSize: 8, cellPadding: 2 },
                margin:     { left: 14, right: 14 },
            });

            currentY = doc.lastAutoTable.finalY + 10;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.line(pageWidth - 80, currentY + 5, pageWidth - 14, currentY + 5);
            doc.text(`Firma de Conformidad: ${emp.nombre}`, pageWidth - 80, currentY + 9);
            currentY += 20;
        });

        // --- PIE DE PÁGINA en todas las hojas ---
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(7);
            doc.setTextColor(150);
            doc.text(
                `Witmac ERP - Generado el ${new Date().toLocaleString()} - Página ${i} de ${pageCount}`,
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        doc.save('Reporte_Asistencia_Agrupado.pdf');
    },
};

export default HistorialPersonalModule;