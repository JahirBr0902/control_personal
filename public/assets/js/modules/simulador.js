const SimuladorModule = {
    async render() {
        return `
            <div class="welcome-section">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                    <a href="#dashboard" style="color: var(--text-muted);"><i data-lucide="arrow-left"></i></a>
                    <h2 style="margin: 0;">Simulador de Lector de Huellas</h2>
                </div>
                <p style="color: var(--text-muted);">Usa esta herramienta para probar el registro automático de entradas y salidas.</p>
            </div>

            <div class="form-container" style="max-width: 500px; text-align: center;">
                <div style="margin-bottom: 2rem; padding: 2rem; background: #f8fafc; border: 2px dashed var(--border); border-radius: 50%; width: 150px; height: 150px; margin: 0 auto 2rem; display: flex; align-items: center; justify-content: center; color: var(--primary);">
                    <i data-lucide="fingerprint" style="width: 80px; height: 80px;"></i>
                </div>
                
                <form id="formSimularHuella">
                    <div class="form-group">
                        <label for="huella_id_sim">Ingrese ID de Huella (o Cédula)</label>
                        <input type="text" id="huella_id_sim" name="huella_id_sim" class="form-control" required placeholder="Ej: 12345678" style="text-align: center; font-size: 1.5rem; letter-spacing: 2px;">
                    </div>
                    <button type="submit" class="btn btn-primary">
                        <span>Simular Lectura</span>
                        <i data-lucide="zap"></i>
                    </button>
                </form>

                <div id="resultadoSimulacion" style="margin-top: 2rem; display: none;">
                    <div class="alert" id="alertaSimulacion"></div>
                </div>
            </div>
        `;
    },

    init() {
        const form = document.getElementById('formSimularHuella');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const huellaId = document.getElementById('huella_id_sim').value;
            const container = document.getElementById('resultadoSimulacion');
            const alerta = document.getElementById('alertaSimulacion');

            try {
                const res = await fetch('api.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'registrar_huella',
                        huella_id: huellaId
                    })
                });
                const result = await res.json();

                container.style.display = 'block';
                if (result.success) {
                    const tipo = result.type === 'entrada' ? 'ENTRADA' : 'SALIDA';
                    const color = result.type === 'entrada' ? 'alert-success' : 'alert-danger';
                    alerta.className = `alert ${color}`;
                    alerta.innerHTML = `<strong>¡${tipo} REGISTRADA!</strong><br>Empleado: ${result.nombre}<br>Hora: ${new Date().toLocaleTimeString()}`;
                    
                    // Si es entrada, avisar que requiere revisión
                    if (result.type === 'entrada') {
                        alerta.innerHTML += '<br><small>Recuerde completar la revisión en el panel de pendientes.</small>';
                    }
                } else {
                    alerta.className = 'alert alert-danger';
                    alerta.textContent = result.message || 'Error al procesar la huella';
                }
                
                // Limpiar input
                document.getElementById('huella_id_sim').value = '';
                document.getElementById('huella_id_sim').focus();

            } catch (err) {
                console.error(err);
                Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
            }
        });
    }
};

export default SimuladorModule;
