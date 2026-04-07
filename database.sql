-- Script de creación de base de datos para Control de Entrada
-- PostgreSQL

-- Tabla de usuarios del sistema (quienes registran)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'registrador', -- 'admin', 'registrador'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de personal (empleados que entran)
CREATE TABLE IF NOT EXISTS personal (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    cedula VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de vehículos
CREATE TABLE IF NOT EXISTS vehiculos (
    id SERIAL PRIMARY KEY,
    placa VARCHAR(20) UNIQUE NOT NULL,
    marca VARCHAR(50),
    modelo VARCHAR(50),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de registros de entrada de personal
CREATE TABLE IF NOT EXISTS registro_personal (
    id SERIAL PRIMARY KEY,
    personal_id INTEGER REFERENCES personal(id),
    registrador_id INTEGER REFERENCES usuarios(id),
    protocolo JSONB DEFAULT '{}',
    hora_llegada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de control de vehículos
CREATE TABLE IF NOT EXISTS control_vehiculos (
    id SERIAL PRIMARY KEY,
    vehiculo_id INTEGER REFERENCES vehiculos(id),
    personal_id INTEGER REFERENCES personal(id),
    registrador_id INTEGER REFERENCES usuarios(id),
    hora_toma TIMESTAMP,
    hora_salida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hora_regreso TIMESTAMP,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
