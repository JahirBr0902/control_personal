<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/RegistroPersonal.php';
require_once __DIR__ . '/../models/ControlVehiculo.php';
require_once __DIR__ . '/../models/Personal.php';
require_once __DIR__ . '/../models/Vehiculo.php';

use App\Models\RegistroPersonal;
use App\Models\ControlVehiculo;
use App\Models\Personal;
use App\Models\Vehiculo;

if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? $_GET['action'] ?? $_POST['action'] ?? '';

try {
    switch ($action) {
        case 'get_personal':
            echo json_encode(['success' => true, 'data' => Personal::getPersonalConEstadoHoy()]);
            break;

        case 'get_personal_admin':
            echo json_encode(['success' => true, 'data' => Personal::getAllAdmin()]);
            break;

        case 'add_personal':
            echo json_encode(['success' => Personal::crear($input['nombre']), 'message' => 'Operación realizada']);
            break;

        case 'edit_personal':
            echo json_encode(['success' => Personal::actualizarNombre($input['id'], $input['nombre']), 'message' => 'Actualizado']);
            break;

        case 'toggle_status_personal':
            echo json_encode(['success' => Personal::toggleEstado($input['id']), 'message' => 'Estado cambiado']);
            break;

        case 'get_vehiculos':
            echo json_encode(['success' => true, 'data' => Vehiculo::getAll()]);
            break;

        case 'get_vehiculos_admin':
            echo json_encode(['success' => true, 'data' => Vehiculo::getAllAdmin()]);
            break;

        case 'add_vehiculo':
            echo json_encode(['success' => Vehiculo::crear($input['placa'], $input['marca'], $input['modelo']), 'message' => 'Vehículo guardado']);
            break;

        case 'edit_vehiculo':
            echo json_encode(['success' => Vehiculo::actualizar($input['id'], $input['placa'], $input['marca'], $input['modelo']), 'message' => 'Actualizado']);
            break;

        case 'toggle_status_vehiculo':
            echo json_encode(['success' => Vehiculo::toggleEstado($input['id']), 'message' => 'Estado cambiado']);
            break;

        case 'get_historial_personal':
            $filtros = [
                'personal_id' => $_GET['personal_id'] ?? null,
                'fecha_inicio' => $_GET['fecha_inicio'] ?? null,
                'fecha_fin' => $_GET['fecha_fin'] ?? null,
                'estado_consciente' => $_GET['estado_consciente'] ?? null,
                'bajo_sustancia' => $_GET['bajo_sustancia'] ?? null,
                'limpio' => $_GET['limpio'] ?? null,
                'uniforme_completo' => $_GET['uniforme_completo'] ?? null
            ];
            echo json_encode(['success' => true, 'data' => RegistroPersonal::getHistorial($filtros)]);
            break;

        case 'get_historial_vehiculos':
            $filtros = [
                'vehiculo_id' => $_GET['vehiculo_id'] ?? null,
                'personal_id' => $_GET['personal_id'] ?? null,
                'fecha_inicio' => $_GET['fecha_inicio'] ?? null,
                'fecha_fin' => $_GET['fecha_fin'] ?? null
            ];
            echo json_encode(['success' => true, 'data' => ControlVehiculo::getHistorial($filtros)]);
            break;

        case 'registrar_entrada_personal':
            $protocolo = [
                'estado_consciente' => $input['estado_consciente'] ?? true,
                'bajo_sustancia' => $input['bajo_sustancia'] ?? false,
                'limpio' => $input['limpio'] ?? true,
                'uniforme_completo' => $input['uniforme_completo'] ?? true,
                'observaciones' => $input['observaciones'] ?? ''
            ];
            $data = [
                'personal_id' => $input['personal_id'],
                'registrador_id' => $_SESSION['user_id'],
                'protocolo' => $protocolo,
                'hora_llegada' => $input['hora_llegada'] ?: date('Y-m-d H:i:s')
            ];
            echo json_encode(['success' => RegistroPersonal::crear($data), 'message' => 'Registro guardado']);
            break;

        case 'get_vehiculos_en_ruta':
            echo json_encode(['success' => true, 'data' => ControlVehiculo::getVehiculosEnRuta()]);
            break;

        case 'registrar_regreso_vehiculo':
            echo json_encode(['success' => ControlVehiculo::registrarRegreso($input['id'], $input['hora_regreso'], $input['observaciones'] ?? ''), 'message' => 'Regreso registrado']);
            break;

        case 'registrar_control_vehiculo':
            $data = [
                'vehiculo_id' => $input['vehiculo_id'],
                'personal_id' => $input['personal_id'],
                'registrador_id' => $_SESSION['user_id'],
                'hora_salida' => $input['hora_salida'] ?: date('Y-m-d H:i:s'),
                'observaciones' => $input['observaciones'] ?? ''
            ];
            echo json_encode(['success' => ControlVehiculo::crear($data), 'message' => 'Salida registrada']);
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Acción no válida: ' . $action]);
            break;
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
