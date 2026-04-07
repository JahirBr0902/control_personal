<?php
namespace App\Models;

use App\Config\Conexion;
use PDO;

class Usuario {
    public static function login($usuario, $password) {
        $db = Conexion::getConexion();
        $stmt = $db->prepare("SELECT * FROM usuarios WHERE usuario = :usuario");
        $stmt->execute(['usuario' => $usuario]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            unset($user['password']); // No devolver el hash
            return $user;
        }
        return false;
    }

    public static function getById($id) {
        $db = Conexion::getConexion();
        $stmt = $db->prepare("SELECT id, nombre, usuario, rol FROM usuarios WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    public static function countUsers() {
        $db = Conexion::getConexion();
        $stmt = $db->query("SELECT COUNT(*) as total FROM usuarios");
        $result = $stmt->fetch();
        return $result['total'];
    }

    public static function create($nombre, $usuario, $password, $rol = 'registrador') {
        $db = Conexion::getConexion();
        $stmt = $db->prepare("INSERT INTO usuarios (nombre, usuario, password, rol) VALUES (:nombre, :usuario, :password, :rol)");
        return $stmt->execute([
            'nombre' => $nombre,
            'usuario' => $usuario,
            'password' => password_hash($password, PASSWORD_DEFAULT),
            'rol' => $rol
        ]);
    }
}
