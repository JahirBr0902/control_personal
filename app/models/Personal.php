<?php
namespace App\Models;

use App\Config\Conexion;
use PDO;

class Personal {
    public static function getAll() {
        $db = Conexion::getConexion();
        $stmt = $db->query("SELECT * FROM personal ORDER BY nombre ASC");
        return $stmt->fetchAll();
    }

    public static function getAllAdmin() {
        $db = Conexion::getConexion();
        $stmt = $db->query("SELECT * FROM personal ORDER BY activo DESC, nombre ASC");
        return $stmt->fetchAll();
    }

    public static function getPersonalConEstadoHoy() {
        $db = Conexion::getConexion();
        // Usamos CAST para evitar problemas con los :: en PDO
        $stmt = $db->query("SELECT p.*, r.id as registro_id, r.hora_llegada, r.hora_salida 
                            FROM personal p 
                            LEFT JOIN registro_personal r ON p.id = r.personal_id 
                            AND CAST(r.hora_llegada AS DATE) = CURRENT_DATE 
                            WHERE p.activo = TRUE 
                            ORDER BY r.id IS NOT NULL ASC, p.nombre ASC");
        return $stmt->fetchAll();
    }

    public static function crear($nombre) {
        $db = Conexion::getConexion();
        $stmt = $db->prepare("INSERT INTO personal (nombre) VALUES (:nombre)");
        return $stmt->execute(['nombre' => $nombre]);
    }

    public static function actualizarNombre($id, $nombre) {
        $db = Conexion::getConexion();
        $stmt = $db->prepare("UPDATE personal SET nombre = :nombre WHERE id = :id");
        return $stmt->execute(['id' => $id, 'nombre' => $nombre]);
    }

    public static function toggleEstado($id) {
        $db = Conexion::getConexion();
        $stmt = $db->prepare("UPDATE personal SET activo = NOT activo WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }
}
