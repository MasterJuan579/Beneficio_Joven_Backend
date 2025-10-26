-- DROP DATABASE IF EXISTS Cryptohorizon;
CREATE DATABASE BeneficioJoven;
USE BeneficioJoven;

CREATE TABLE Beneficiario (
    idBeneficiario INT AUTO_INCREMENT PRIMARY KEY,
    curp VARCHAR(18) UNIQUE NOT NULL,
    primerNombre VARCHAR(50) NOT NULL,
    segundoNombre VARCHAR(50),
    apellidoPaterno VARCHAR(50) NOT NULL,
    apellidoMaterno VARCHAR(50) NOT NULL,
    fechaNacimiento DATE NOT NULL,
    celular VARCHAR(10) UNIQUE NOT NULL,
    folio VARCHAR(16) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    fechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP,
    sexo CHAR(1),
    passwordHash VARCHAR(255) NOT NULL
);

CREATE TABLE Categoria (
	idCategoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    fechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Establecimiento (
	idEstablecimiento INT AUTO_INCREMENT PRIMARY KEY,
    logoURL VARCHAR(255),
    fechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Sucursal (
	idSucursal INT AUTO_INCREMENT PRIMARY KEY,
    idEstablecimiento INT NOT NULL,
    numSucursal VARCHAR(20) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    latitud DECIMAL(10,8),
    longitud DECIMAL(11,8),
    horaApertura TIME NOT NULL,
    horaCierre TIME NOT NULL,
    fechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idEstablecimiento) REFERENCES Establecimiento(idEstablecimiento) ON DELETE CASCADE
);

CREATE TABLE Promocion (
	idPromocion INT AUTO_INCREMENT PRIMARY KEY,
    idEstablecimiento INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    esVigente BOOLEAN DEFAULT TRUE,
    fechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idEstablecimiento) REFERENCES Establecimiento(idEstablecimiento) ON DELETE CASCADE
);

CREATE TABLE Dueno(
	idDueno INT AUTO_INCREMENT PRIMARY KEY,
    nombreUsuario VARCHAR(50) UNIQUE NOT NULL,
    passwordHash VARCHAR(255) NOT NULL,
    fechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Administrador (
	idAdministrador INT AUTO_INCREMENT PRIMARY KEY,
    nombreUsuario VARCHAR(50) UNIQUE NOT NULL,
    masterPassword VARCHAR(255) NOT NULL,
    fechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE CategoriaEstablecimiento (
	idCategoria INT NOT NULL,
    idEstablecimiento INT NOT NULL,
    fechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (idCategoria, idEstablecimiento),
    FOREIGN KEY (idCategoria) REFERENCES Categoria(idCategoria) ON DELETE CASCADE,
    FOREIGN KEY (idEstablecimiento) REFERENCES Establecimiento(idEstablecimiento) ON DELETE CASCADE
);

CREATE TABLE DuenoEstablecimiento (
	idDueno INT NOT NULL,
    idEstablecimiento INT NOT NULL,
    fechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (idDueno, idEstablecimiento),
    FOREIGN KEY (idDueno) REFERENCES Dueno(idDueno) ON DELETE CASCADE,
    FOREIGN KEY (idEstablecimiento) REFERENCES Establecimiento(idEstablecimiento) ON DELETE CASCADE
);

CREATE TABLE AplicacionPromocion (
	idBeneficiario INT NOT NULL,
    idPromocion INT NOT NULL,
    idSucursal INT NOT NULL,
    fechaAplicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (idBeneficiario, idPromocion, idSucursal, fechaAplicacion),
    FOREIGN KEY (idBeneficiario) REFERENCES Beneficiario(idBeneficiario),
    FOREIGN KEY (idPromocion) REFERENCES Promocion(idPromocion),
    FOREIGN KEY (idSucursal) REFERENCES Sucursal(idSucursal)
);
