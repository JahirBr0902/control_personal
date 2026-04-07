<?php

namespace App\Models;

use App\Config\Conexion;
use PDO;

class ControlVehiculo
{
    public static function crear($data)
    {
        $db = Conexion::getConexion();
        $stmt = $db->prepare("INSERT INTO control_vehiculos 
            (vehiculo_id, personal_id, registrador_id, hora_salida, observaciones) 
            VALUES (:vehiculo_id, :personal_id, :registrador_id, :hora_salida, :observaciones)");
        return $stmt->execute([
            'vehiculo_id' => $data['vehiculo_id'],
            'personal_id' => $data['personal_id'],
            'registrador_id' => $data['registrador_id'],
            'hora_salida' => $data['hora_salida'] ?: date('Y-m-d H:i:s'),
            'observaciones' => $data['observaciones'] ?? ''
        ]);
    }

    public static function registrarRegreso($id, $hora_regreso, $observaciones = '')
    {
        $db = Conexion::getConexion();
        $stmt = $db->prepare("UPDATE control_vehiculos SET 
        hora_regreso = :hora_regreso::TIMESTAMP, 
        observaciones = CONCAT(observaciones, ' | Regreso: ', :observaciones::TEXT) 
        WHERE id = :id::INT");
        $fecha_limpia = $hora_regreso ? str_replace('T', ' ', $hora_regreso) : date('Y-m-d H:i:s');

        return $stmt->execute([
            'id' => $id,
            'hora_regreso' => $fecha_limpia,
            'observaciones' => $observaciones
        ]);
    }

    public static function getVehiculosEnRuta()
    {
        $db = Conexion::getConexion();
        $stmt = $db->query("SELECT c.*, v.placa, v.marca, v.modelo, p.nombre as empleado_nombre 
                            FROM control_vehiculos c 
                            JOIN vehiculos v ON c.vehiculo_id = v.id 
                            JOIN personal p ON c.personal_id = p.id 
                            WHERE c.hora_regreso IS NULL 
                            ORDER BY c.hora_salida ASC");
        return $stmt->fetchAll();
    }

    public static function getHistorial($filtros = [])
    {
        $db = Conexion::getConexion();
        $sql = "SELECT c.*, v.placa, v.marca, v.modelo, p.nombre as empleado_nombre, u.nombre as registrador_nombre 
                FROM control_vehiculos c 
                JOIN vehiculos v ON c.vehiculo_id = v.id 
                JOIN personal p ON c.personal_id = p.id 
                LEFT JOIN usuarios u ON c.registrador_id = u.id 
                WHERE 1=1";

        $params = [];

        if (!empty($filtros['vehiculo_id'])) {
            $sql .= " AND c.vehiculo_id = :vehiculo_id";
            $params['vehiculo_id'] = $filtros['vehiculo_id'];
        }

        if (!empty($filtros['personal_id'])) {
            $sql .= " AND c.personal_id = :personal_id";
            $params['personal_id'] = $filtros['personal_id'];
        }

        if (!empty($filtros['fecha_inicio'])) {
            $sql .= " AND c.created_at >= :fecha_inicio";
            $params['fecha_inicio'] = $filtros['fecha_inicio'] . ' 00:00:00';
        }

        if (!empty($filtros['fecha_fin'])) {
            $sql .= " AND c.created_at <= :fecha_fin";
            $params['fecha_fin'] = $filtros['fecha_fin'] . ' 23:59:59';
        }

        $sql .= " ORDER BY c.created_at DESC LIMIT 500";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
}
