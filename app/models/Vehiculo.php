<?php
namespace App\Models;

use App\Config\Conexion;
use PDO;

class Vehiculo {
    public static function getAll() {
        $db = Conexion::getConexion();
        $stmt = $db->query("SELECT * FROM vehiculos WHERE activo = TRUE ORDER BY placa ASC");
        return $stmt->fetchAll();
    }

    public static function getAllAdmin() {
        $db = Conexion::getConexion();
        $stmt = $db->query("SELECT * FROM vehiculos ORDER BY activo DESC, placa ASC");
        return $stmt->fetchAll();
    }

    public static function crear($placa, $marca, $modelo) {
        $db = Conexion::getConexion();
        $stmt = $db->prepare("INSERT INTO vehiculos (placa, marca, modelo) VALUES (:placa, :marca, :modelo)");
        return $stmt->execute([
            'placa' => $placa,
            'marca' => $marca,
            'modelo' => $modelo
        ]);
    }

    public static function actualizar($id, $placa, $marca, $modelo) {
        $db = Conexion::getConexion();
        $stmt = $db->prepare("UPDATE vehiculos SET placa = :placa, marca = :marca, modelo = :modelo WHERE id = :id");
        return $stmt->execute([
            'id' => $id,
            'placa' => $placa,
            'marca' => $marca,
            'modelo' => $modelo
        ]);
    }

    public static function toggleEstado($id) {
        $db = Conexion::getConexion();
        $stmt = $db->prepare("UPDATE vehiculos SET activo = NOT activo WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }
}
