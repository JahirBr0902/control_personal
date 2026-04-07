const PersonalModule = {
    async render() {
        const res = await fetch('api.php?action=get_personal');
        const result = await res.json();
        const personal = result.data || [];

        const pending = personal.filter(p => !p.registro_id);
        const registered = personal.filter(p => p.registro_id);

        return `
            <div class="welcome-section">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                    <a href="#dashboard" style="color: var(--text-muted);"><i data-lucide="arrow-left"></i></a>
                    <h2 style="margin: 0;">Control de Personal Diario</h2>
                </div>
                <p style="color: var(--text-muted);">Gestiona las entradas del personal de forma manual.</p>
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
    },

    async showRegisterModal(personalId, nombre) {
        const { value: formValues } = await Swal.fire({
            title: `Registrar Entrada: ${nombre}`,
            html: `
                <div style="text-align: left; margin-top: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Protocolo de Seguridad</label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;">
                            <input type="checkbox" id="swal-consciente" checked> Consciente
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;">
                            <input type="checkbox" id="swal-limpio" checked> Limpio/Aseado
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;">
                            <input type="checkbox" id="swal-uniforme" checked> Uniforme
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; color: #e53e3e;">
                            <input type="checkbox" id="swal-sustancia"> Bajo Sustancias
                        </label>
                    </div>
                    
                    <label for="swal-observaciones" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Observaciones</label>
                    <textarea id="swal-observaciones" class="swal2-textarea" placeholder="Novedades o comentarios..." style="margin: 0; width: 100%; box-sizing: border-box;"></textarea>
                    
                    <label for="swal-hora" style="display: block; margin: 1rem 0 0.5rem; font-weight: 500;">Hora de Entrada</label>
                    <input type="datetime-local" id="swal-hora" class="swal2-input" value="${new Date().toLocaleString('sv-SE').slice(0, 16)}" style="margin: 0; width: 100%;">
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Confirmar Entrada',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#4f46e5',
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
            const data = {
                action: 'registrar_entrada_personal',
                ...formValues
            };
            
            try {
                const res = await fetch('api.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await res.json();
                if (result.success) {
                    Swal.fire('¡Registrado!', `Entrada de ${nombre} confirmada.`, 'success')
                        .then(() => {
                            // Forzar recarga de la vista
                            window.dispatchEvent(new HashChangeEvent('hashchange'));
                        });
                } else {
                    Swal.fire('Error', result.message, 'error');
                }
            } catch (e) {
                Swal.fire('Error', 'No se pudo completar el registro', 'error');
            }
        }
    }
};

export default PersonalModule;
