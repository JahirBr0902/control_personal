const HistorialVehiculosModule = {
    async render() {
        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 6);

        const todayStr = now.toISOString().slice(0, 10);
        const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

        const urlParams = new URLSearchParams(window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '');
        const f = {
            inicio: urlParams.get('fecha_inicio') || sevenDaysAgoStr,
            fin: urlParams.get('fecha_fin') || todayStr,
            vehiculo: urlParams.get('vehiculo_id') || '',
            personal: urlParams.get('personal_id') || ''
        };

        const resVeh = await fetch('api.php?action=get_vehiculos_admin');
        const resultVeh = await resVeh.json();
        const vehiculos = resultVeh.data || [];

        const resPers = await fetch('api.php?action=get_personal_admin');
        const resultPers = await resPers.json();
        const personal = resultPers.data || [];

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
        this.currentData = historial;
        this.currentFilters = f;

        return `
            <div class="welcome-section" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <div>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <a href="#dashboard" style="color: #64748b;"><i data-lucide="arrow-left"></i></a>
                        <h2 style="margin: 0;">Historial de Vehículos</h2>
                    </div>
                </div>
                <button class="btn" id="btn-export-veh-pdf" style="background: #10b981; color: white; padding: 0.6rem 1.2rem; border-radius: 8px; display: flex; align-items: center; gap: 0.5rem; font-weight: 600; border: none;">
                    <i data-lucide="printer" style="width: 18px;"></i> Imprimir Reporte PDF
                </button>
            </div>

            <form class="filter-bar" id="filter-form" style="display: flex; gap: 1rem; background: white; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 2rem; flex-wrap: wrap;">
                <div class="filter-item" style="display: flex; flex-direction: column; gap: 0.25rem;">
                    <label style="font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Desde</label>
                    <input type="date" id="fecha_inicio" class="form-control" value="${f.inicio}" style="width: 140px;">
                </div>
                <div class="filter-item" style="display: flex; flex-direction: column; gap: 0.25rem;">
                    <label style="font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Hasta</label>
                    <input type="date" id="fecha_fin" class="form-control" value="${f.fin}" style="width: 140px;">
                </div>
                <div class="filter-item" style="flex: 1; min-width: 150px; display: flex; flex-direction: column; gap: 0.25rem;">
                    <label style="font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Vehículo</label>
                    <select id="vehiculo_id" class="form-control">
                        <option value="">-- Todos --</option>
                        ${vehiculos.map(v => `<option value="${v.id}" ${f.vehiculo == v.id ? 'selected' : ''}>${v.placa} - ${v.marca}</option>`).join('')}
                    </select>
                </div>
                <div class="filter-item" style="flex: 1; min-width: 150px; display: flex; flex-direction: column; gap: 0.25rem;">
                    <label style="font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Conductor</label>
                    <select id="personal_id" class="form-control">
                        <option value="">-- Todos --</option>
                        ${personal.map(p => `<option value="${p.id}" ${f.personal == p.id ? 'selected' : ''}>${p.nombre}</option>`).join('')}
                    </select>
                </div>
                <button type="submit" style="padding: 0.6rem 1.25rem; background: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; align-self: flex-end; height: 38px;">Filtrar</button>
                <button type="button" id="btn-reset-filters" style="padding: 0.6rem; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; align-self: flex-end; height: 38px;"><i data-lucide="rotate-ccw" style="width: 18px;"></i></button>
            </form>

            <div class="card" style="padding: 0; overflow: hidden; border: 1px solid #e2e8f0;">
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left;">
                                <th style="padding: 1rem;">Vehículo</th>
                                <th style="padding: 1rem;">Conductor</th>
                                <th style="padding: 1rem;">Salida</th>
                                <th style="padding: 1rem;">Regreso</th>
                                <th style="padding: 1rem;">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${historial.length === 0 ? `
                                <tr><td colspan="5" style="padding: 4rem; text-align: center; color: #94a3b8;">No hay movimientos en este periodo.</td></tr>
                            ` : historial.map(r => `
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 1rem;">
                                        <div style="font-weight: 600;">${r.placa}</div>
                                        <div style="font-size: 0.75rem; color: #64748b;">${r.marca} ${r.modelo}</div>
                                    </td>
                                    <td style="padding: 1rem;">
                                        <div style="font-weight: 600;">${r.empleado_nombre}</div>
                                    </td>
                                    <td style="padding: 1rem;">
                                        <div>${new Date(r.hora_salida).toLocaleDateString()}</div>
                                        <div style="font-size: 0.75rem; color: #64748b;">${new Date(r.hora_salida).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                    </td>
                                    <td style="padding: 1rem;">
                                        ${r.hora_regreso ? `
                                            <div>${new Date(r.hora_regreso).toLocaleDateString()}</div>
                                            <div style="font-size: 0.75rem; color: #64748b;">${new Date(r.hora_regreso).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                        ` : '<span style="color: #f59e0b; font-weight: 500;">En ruta...</span>'}
                                    </td>
                                    <td style="padding: 1rem;">
                                        <span class="badge ${r.hora_regreso ? 'badge-success' : 'badge-warning'}">
                                            ${r.hora_regreso ? 'Completado' : 'En uso'}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
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

        document.getElementById('btn-export-veh-pdf').addEventListener('click', () => this.generatePDF());
    },

    generatePDF() {
        if (!this.currentData || this.currentData.length === 0) {
            Swal.fire('Atención', 'No hay datos para imprimir.', 'warning');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();

        // --- ENCABEZADO CORPORATIVO ---
        doc.setFillColor(30, 41, 59); // Color azul oscuro empresarial
        doc.rect(0, 0, pageWidth, 25, 'F');
        
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('WITMAC', 14, 17);
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('REPORTE SEMANAL DE MOVIMIENTOS VEHICULARES', pageWidth - 14, 16, { align: 'right' });

        // --- BLOQUE DE INFORMACIÓN ---
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('DETALLES DEL MOVIMIENTO', 14, 35);
        doc.setLineWidth(0.5);
        doc.line(14, 37, 80, 37);

        doc.setFont('helvetica', 'normal');
        doc.text(`Periodo del Reporte:`, 14, 45);
        doc.setFont('helvetica', 'bold');
        doc.text(`${this.currentFilters.inicio} al ${this.currentFilters.fin}`, 50, 45);
        
        doc.setFont('helvetica', 'normal');
        doc.text(`Fecha de Emisión:`, 14, 50);
        doc.text(`${new Date().toLocaleString()}`, 50, 50);

        doc.text(`Generado por:`, pageWidth - 80, 45);
        doc.text(`${document.querySelector('.user-menu span')?.innerText || 'Administrador'}`, pageWidth - 50, 45);

        // --- TABLA DE DATOS ---
        const tableBody = this.currentData.map(r => [
            r.placa + ' (' + r.marca + ')',
            r.empleado_nombre,
            new Date(r.hora_salida).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
            r.hora_regreso ? new Date(r.hora_regreso).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'EN RUTA',
            r.hora_regreso ? 'COMPLETADO' : 'EN USO',
            r.observaciones || '-'
        ]);

        doc.autoTable({
            startY: 60,
            head: [['Unidad / Placa', 'Conductor Responsable', 'Salida de Base', 'Regreso a Base', 'Estado', 'Novedades / Observaciones']],
            body: tableBody,
            theme: 'striped',
            headStyles: { 
                fillColor: [30, 41, 59], 
                textColor: [255, 255, 255],
                fontSize: 10,
                fontStyle: 'bold'
            },
            styles: { fontSize: 9, cellPadding: 3 },
            alternateRowStyles: { fillColor: [248, 250, 252] }
        });

        // --- SECCIÓN DE FIRMAS ---
        const finalY = doc.lastAutoTable.finalY + 30;
        if (finalY < doc.internal.pageSize.getHeight() - 40) {
            doc.line(40, finalY, 110, finalY);
            doc.text('Firma Encargado de Flota', 75, finalY + 5, { align: 'center' });
            
            doc.line(pageWidth - 110, finalY, pageWidth - 40, finalY);
            doc.text('Autorización de Gerencia', pageWidth - 75, finalY + 5, { align: 'center' });
        }

        // --- PIE DE PÁGINA ---
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Witmac ERP - Módulo de Logística - Página ${i} de ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
        }

        doc.save(`REPORTE_VEHICULOS_${this.currentFilters.inicio}_${this.currentFilters.fin}.pdf`);
    }
};

export default HistorialVehiculosModule;
