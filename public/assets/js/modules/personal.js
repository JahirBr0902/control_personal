const PersonalModule = {
    async render() {
        const res = await fetch('api.php?action=get_personal');
        const result = await res.json();
        const personal = result.data || [];

        const pending = personal.filter(p => !p.registro_id);
        const registered = personal.filter(p => p.registro_id);

        return `
            <div class="welcome-section" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                        <a href="#dashboard" style="color: var(--text-muted);"><i data-lucide="arrow-left"></i></a>
                        <h2 style="margin: 0;">Control de Personal Diario</h2>
                    </div>
                    <p style="color: var(--text-muted);">Gestiona las entradas del personal de forma manual.</p>
                </div>
                <div style="display: flex; gap: 0.75rem;">
                    ${pending.length > 0 ? `
                        <button class="btn" id="btn-bulk-register" style="background: #4f46e5; color: white; display: flex; align-items: center; gap: 0.5rem; font-weight: 600; padding: 0.75rem 1.25rem; border-radius: 8px; border: none; cursor: pointer;">
                            <i data-lucide="users" style="width: 18px;"></i> Registro Masivo
                        </button>
                    ` : ''}
                    ${registered.length > 0 ? `
                        <button class="btn" id="btn-print-signatures" style="background: #10b981; color: white; display: flex; align-items: center; gap: 0.5rem; font-weight: 600; padding: 0.75rem 1.25rem; border-radius: 8px; border: none; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);">
                            <i data-lucide="printer" style="width: 18px;"></i> Imprimir Hoja de Firmas
                        </button>
                    ` : ''}
                </div>
            </div>

            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                <div class="card" style="padding: 1.5rem; text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700;">${personal.length}</div>
                    <div style="color: var(--text-muted); font-size: 0.875rem;">Total Personal</div>
                </div>
                <div class="card" style="padding: 1.5rem; text-align: center; border-left: 4px solid #f59e0b;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: #f59e0b;">${pending.length}</div>
                    <div style="color: var(--text-muted); font-size: 0.875rem;">Pendientes</div>
                </div>
                <div class="card" style="padding: 1.5rem; text-align: center; border-left: 4px solid #10b981;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: #10b981;">${registered.length}</div>
                    <div style="color: var(--text-muted); font-size: 0.875rem;">Registrados</div>
                </div>
            </div>

            <h3 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                <i data-lucide="clock" style="color: #f59e0b; width: 20px;"></i> Personal Pendiente
            </h3>
            <div class="grid" id="pending-list">
                ${pending.length ? pending.map(p => this.renderCard(p, false)).join('') : '<p style="grid-column: 1/-1; text-align: center; padding: 2rem; background: var(--card-bg); border-radius: var(--radius); color: var(--text-muted); border: 1px dashed var(--border);">No hay personal pendiente para hoy.</p>'}
            </div>

            <h3 style="margin: 2.5rem 0 1rem; display: flex; align-items: center; gap: 0.5rem;">
                <i data-lucide="check-circle" style="color: #10b981; width: 20px;"></i> Ya Ingresaron
            </h3>
            <div class="grid" id="registered-list">
                ${registered.length ? registered.map(p => this.renderCard(p, true)).join('') : '<p style="grid-column: 1/-1; text-align: center; padding: 2rem; background: var(--card-bg); border-radius: var(--radius); color: var(--text-muted); border: 1px dashed var(--border);">Nadie ha registrado entrada aún.</p>'}
            </div>
        `;
    },

    renderCard(p, isRegistered) {
        return `
            <div class="card employee-card ${isRegistered ? 'registered' : 'pending'}" style="transition: transform 0.2s; ${isRegistered ? 'opacity: 0.8;' : ''}">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <div class="card-icon" style="margin: 0; background: ${isRegistered ? 'rgba(16, 185, 129, 0.1)' : 'rgba(79, 70, 229, 0.1)'}; color: ${isRegistered ? '#10b981' : '#4f46e5'};">
                        <i data-lucide="user"></i>
                    </div>
                    <span style="font-size: 0.75rem; padding: 0.25rem 0.625rem; border-radius: 99px; font-weight: 500; background: ${isRegistered ? '#ecfdf5' : '#fffbeb'}; color: ${isRegistered ? '#065f46' : '#92400e'}; border: 1px solid ${isRegistered ? '#a7f3d0' : '#fef3c7'};">
                        ${isRegistered ? 'Registrado' : 'Pendiente'}
                    </span>
                </div>
                <h3 style="margin: 0 0 0.25rem 0; font-size: 1.125rem;">${p.nombre}</h3>
                
                ${isRegistered ? `
                    <div style="padding-top: 1rem; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 0.5rem; color: #10b981; font-weight: 500; font-size: 0.875rem;">
                        <i data-lucide="check-circle" style="width: 16px; height: 16px;"></i>
                        Entrada: ${new Date(p.hora_llegada).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                ` : `
                    <button class="btn btn-primary btn-sm btn-block btn-open-register" data-id="${p.id}" data-nombre="${p.nombre}" style="width: 100%;">
                        Registrar Entrada
                    </button>
                `}
            </div>
        `;
    },

    init() {
        document.querySelectorAll('.btn-open-register').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const nombre = btn.dataset.nombre;
                this.showRegisterModal(id, nombre);
            });
        });

        const printBtn = document.getElementById('btn-print-signatures');
        if (printBtn) {
            printBtn.addEventListener('click', () => this.generatePDF());
        }

        const bulkBtn = document.getElementById('btn-bulk-register');
        if (bulkBtn) {
            bulkBtn.addEventListener('click', () => this.showBulkRegisterModal());
        }
    },

    async showBulkRegisterModal() {
        const res = await fetch('api.php?action=get_personal');
        const result = await res.json();
        const pending = (result.data || []).filter(p => !p.registro_id);

        if (pending.length === 0) {
            Swal.fire('Atención', 'No hay personal pendiente para registrar.', 'info');
            return;
        }

        const now = new Date().toLocaleString('sv-SE').slice(0, 16);

        const { value: formValues } = await Swal.fire({
            title: 'Lista de Asistencia Rápida',
            width: '1000px',
            html: `
                <div style="text-align: left; margin-top: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; padding: 0 0.5rem;">
                        <span style="font-size: 0.875rem; color: #64748b;">Marca los que ingresaron. Los desmarcados se guardarán como falla en protocolo.</span>
                        <button type="button" id="btn-master-toggle" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; cursor: pointer;">Seleccionar Todos</button>
                    </div>
                    <div style="overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                            <thead>
                                <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; text-align: left;">
                                    <th style="padding: 0.75rem; width: 40px; text-align: center;">In</th>
                                    <th style="padding: 0.75rem;">Nombre del Personal</th>
                                    <th style="padding: 0.75rem; width: 160px;">Hora Entrada</th>
                                    <th style="padding: 0.75rem; width: 140px; text-align: center;">Protocolo (C|L|U|S)</th>
                                    <th style="padding: 0.75rem;">Observaciones</th>
                                </tr>
                            </thead>
                            <tbody id="bulk-table-body">
                                ${pending.map(p => `
                                    <tr style="border-bottom: 1px solid #f1f5f9;" class="bulk-row" data-id="${p.id}">
                                        <td style="padding: 0.5rem; text-align: center;">
                                            <input type="checkbox" class="row-check" style="width: 18px; height: 18px; cursor: pointer;">
                                        </td>
                                        <td style="padding: 0.5rem; font-weight: 600; color: #1e293b;">${p.nombre}</td>
                                        <td style="padding: 0.5rem;">
                                            <input type="datetime-local" class="row-time" value="${now}" style="width: 100%; padding: 0.25rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.75rem;">
                                        </td>
                                        <td style="padding: 0.5rem; text-align: center;">
                                            <div style="display: flex; gap: 0.4rem; justify-content: center;">
                                                <input type="checkbox" class="row-consciente" checked title="Consciente">
                                                <input type="checkbox" class="row-limpio" checked title="Limpio">
                                                <input type="checkbox" class="row-uniforme" checked title="Uniforme">
                                                <input type="checkbox" class="row-sustancia" title="Bajo Sustancia">
                                            </div>
                                        </td>
                                        <td style="padding: 0.5rem;">
                                            <input type="text" class="row-obs" placeholder="Novedad..." style="width: 100%; padding: 0.25rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.75rem;">
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `,
            didOpen: () => {
                const btn = document.getElementById('btn-master-toggle');
                btn.onclick = () => {
                    const checks = document.querySelectorAll('.row-check');
                    const allChecked = Array.from(checks).every(c => c.checked);
                    checks.forEach(c => c.checked = !allChecked);
                    btn.innerText = !allChecked ? 'Desmarcar Todos' : 'Seleccionar Todos';
                };
            },
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Registrar Seleccionados',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#4f46e5',
            preConfirm: () => {
                const rows = document.querySelectorAll('.bulk-row');
                const registros = [];
                rows.forEach(row => {
                    const check = row.querySelector('.row-check');
                    if (check.checked) {
                        registros.push({
                            personal_id: row.dataset.id,
                            hora_llegada: row.querySelector('.row-time').value,
                            estado_consciente: row.querySelector('.row-consciente').checked,
                            limpio: row.querySelector('.row-limpio').checked,
                            uniforme_completo: row.querySelector('.row-uniforme').checked,
                            bajo_sustancia: row.querySelector('.row-sustancia').checked,
                            observaciones: row.querySelector('.row-obs').value
                        });
                    }
                });
                
                if (registros.length === 0) {
                    Swal.showValidationMessage('Debes marcar al menos una persona que haya ingresado');
                    return false;
                }
                return { registros };
            }
        });

        if (formValues) {
            try {
                Swal.fire({ title: 'Guardando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                const res = await fetch('api.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'registrar_entrada_multiple', ...formValues })
                });
                const result = await res.json();
                if (result.success) {
                    Swal.fire('¡Éxito!', 'Registros de asistencia guardados.', 'success')
                        .then(() => window.dispatchEvent(new HashChangeEvent('hashchange')));
                } else {
                    Swal.fire('Error', result.message, 'error');
                }
            } catch (e) {
                Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
            }
        }
    },

    async generatePDF() {
        const res = await fetch('api.php?action=get_personal');
        const result = await res.json();
        const personal = (result.data || []).filter(p => p.registro_id);

        if (personal.length === 0) {
            Swal.fire('Atención', 'No hay personal registrado hoy para imprimir.', 'warning');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const today = new Date().toLocaleDateString();

        // Header Corporativo
        doc.setFillColor(30, 41, 59);
        doc.rect(0, 0, pageWidth, 25, 'F');
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('WITMAC', 14, 17);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('HOJA DE FIRMAS - INGRESO DIARIO', pageWidth - 14, 16, { align: 'right' });

        doc.setTextColor(40, 40, 40);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('CONTROL DE ACCESO Y SEGURIDAD', 14, 35);
        doc.setLineWidth(0.5);
        doc.line(14, 37, 85, 37);

        doc.setFont('helvetica', 'normal');
        doc.text(`Fecha: ${today}`, 14, 45);
        doc.text(`Generado por: ${document.querySelector('.user-menu span')?.innerText || 'Administrador'}`, 14, 50);

        const tableData = personal.map(p => {
            const hora = new Date(p.hora_llegada).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            let pcol = {};
            try {
                pcol = typeof p.protocolo === 'string' ? JSON.parse(p.protocolo) : (p.protocolo || {});
            } catch (e) { console.error("Error parsing protocolo", e); }
            
            let desc = [];
            desc.push(pcol.estado_consciente ? 'Consciente' : 'NO CONSCIENTE');
            desc.push(pcol.limpio ? 'Aseado' : 'NO LIMPIO');
            desc.push(pcol.uniforme_completo ? 'Uniforme Ok' : 'UNIFORME INC.');
            if (pcol.bajo_sustancia) desc.push('¡BAJO SUSTANCIA!');
            
            const obs = pcol.observaciones ? `\nObs: ${pcol.observaciones}` : '';

            return [p.nombre, hora, desc.join(' | ') + obs, ''];
        });

        doc.autoTable({
            startY: 60,
            head: [['Nombre del Empleado', 'Hora', 'Protocolo / Alertas', 'Firma']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59], textColor: 255 },
            columnStyles: { 0: { cellWidth: 55 }, 1: { cellWidth: 20, halign: 'center' }, 2: { cellWidth: 70 }, 3: { cellWidth: 40, minCellHeight: 18 } },
            styles: { fontSize: 8, valign: 'middle' }
        });

        const finalY = doc.lastAutoTable.finalY + 20;
        if (finalY < 270) {
            doc.line(pageWidth/2 - 30, finalY, pageWidth/2 + 30, finalY);
            doc.text('Firma Responsable', pageWidth/2, finalY + 5, { align: 'center' });
        }

        doc.save(`Hoja_Firmas_${new Date().toISOString().split('T')[0]}.pdf`);
    },

    async showRegisterModal(personalId, nombre) {
        const { value: formValues } = await Swal.fire({
            title: `Registrar Entrada: ${nombre}`,
            html: `
                <div style="text-align: left; margin-top: 1rem;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;"><input type="checkbox" id="swal-consciente" checked> Consciente</label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;"><input type="checkbox" id="swal-limpio" checked> Limpio/Aseado</label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;"><input type="checkbox" id="swal-uniforme" checked> Uniforme</label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; color: #e53e3e;"><input type="checkbox" id="swal-sustancia"> Bajo Sustancias</label>
                    </div>
                    <textarea id="swal-observaciones" class="swal2-textarea" placeholder="Novedades..." style="margin: 0; width: 100%; box-sizing: border-box;"></textarea>
                    <input type="datetime-local" id="swal-hora" class="swal2-input" value="${new Date().toLocaleString('sv-SE').slice(0, 16)}" style="margin: 1rem 0 0; width: 100%;">
                </div>
            `,
            preConfirm: () => {
                return {
                    personal_id: personalId,
                    estado_consciente: document.getElementById('swal-consciente').checked,
                    limpio: document.getElementById('swal-limpio').checked,
                    uniforme_completo: document.getElementById('swal-uniforme').checked,
                    bajo_sustancia: document.getElementById('swal-sustancia').checked,
                    observaciones: document.getElementById('swal-observaciones').value,
                    hora_llegada: document.getElementById('swal-hora').value
                }
            }
        });

        if (formValues) {
            const res = await fetch('api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'registrar_entrada_personal', ...formValues })
            });
            const result = await res.json();
            if (result.success) {
                Swal.fire('Éxito', 'Entrada registrada', 'success').then(() => window.dispatchEvent(new HashChangeEvent('hashchange')));
            }
        }
    }
};

export default PersonalModule;
