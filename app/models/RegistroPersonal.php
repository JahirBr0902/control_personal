<?php
namespace App\Models;

use App\Config\Conexion;
use PDO;

class RegistroPersonal {
    public static function crear($data) {
        $db = Conexion::getConexion();
        $stmt = $db->prepare("INSERT INTO registro_personal 
            (personal_id, registrador_id, protocolo, hora_llegada) 
            VALUES (:personal_id, :registrador_id, :protocolo, :hora_llegada)");
        
        if (is_array($data['protocolo'])) {
            $data['protocolo'] = json_encode($data['protocolo']);
        }

        return $stmt->execute([
            'personal_id' => $data['personal_id'],
            'registrador_id' => $data['registrador_id'],
            'protocolo' => $data['protocolo'],
            'hora_llegada' => $data['hora_llegada']
        ]);
    }

    public static function getHistorial($filtros = []) {
        $db = Conexion::getConexion();
        $sql = "SELECT r.*, p.nombre as empleado_nombre, p.cedula, u.nombre as registrador_nombre 
                FROM registro_personal r 
                JOIN personal p ON r.personal_id = p.id 
                LEFT JOIN usuarios u ON r.registrador_id = u.id 
                WHERE 1=1";
        
        $params = [];

        if (!empty($filtros['personal_id'])) {
            $sql .= " AND r.personal_id = :personal_id";
            $params['personal_id'] = $filtros['personal_id'];
        }

        if (!empty($filtros['fecha_inicio'])) {
            $sql .= " AND r.hora_llegada >= :fecha_inicio";
            $params['fecha_inicio'] = $filtros['fecha_inicio'] . ' 00:00:00';
        }

        if (!empty($filtros['fecha_fin'])) {
            $sql .= " AND r.hora_llegada <= :fecha_fin";
            $params['fecha_fin'] = $filtros['fecha_fin'] . ' 23:59:59';
        }

        $campos_protocolo = [
            'estado_consciente' => 'false',
            'bajo_sustancia' => 'true',
            'limpio' => 'false',
            'uniforme_completo' => 'false'
        ];

        $protocol_conditions = [];
        foreach ($campos_protocolo as $campo => $valor_falla) {
            if (isset($filtros[$campo]) && $filtros[$campo] === 'true') {
                $protocol_conditions[] = "r.protocolo->>'$campo' = '$valor_falla'";
            }
        }

        if (!empty($protocol_conditions)) {
            $sql .= " AND (" . implode(" OR ", $protocol_conditions) . ")";
        }

        $sql .= " ORDER BY r.hora_llegada DESC LIMIT 500";
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
}
