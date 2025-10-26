-- DROP DATABASE IF EXISTS Cryptohorizon;
CREATE DATABASE  IF NOT EXISTS `BeneficioJoven` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `BeneficioJoven`;
-- MySQL dump 10.13  Distrib 8.0.41, for macos15 (x86_64)
--
-- Host: db-beneficio-joven.cduggeegs0kv.us-east-1.rds.amazonaws.com    Database: BeneficioJoven
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '';

--
-- Table structure for table `Administrador`
--

DROP TABLE IF EXISTS `Administrador`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Administrador` (
  `idAdministrador` int NOT NULL AUTO_INCREMENT,
  `nombreUsuario` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `masterPassword` varchar(255) NOT NULL,
  `fechaRegistro` datetime DEFAULT CURRENT_TIMESTAMP,
  `email_lc` varchar(100) GENERATED ALWAYS AS (lower(`email`)) STORED,
  PRIMARY KEY (`idAdministrador`),
  UNIQUE KEY `nombreUsuario` (`nombreUsuario`),
  UNIQUE KEY `unique_admin_email` (`email`),
  UNIQUE KEY `uniq_admin_nombreUsuario` (`nombreUsuario`),
  UNIQUE KEY `uniq_admin_email_lc` (`email_lc`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Administrador`
--

LOCK TABLES `Administrador` WRITE;
/*!40000 ALTER TABLE `Administrador` DISABLE KEYS */;
INSERT INTO `Administrador` (`idAdministrador`, `nombreUsuario`, `email`, `masterPassword`, `fechaRegistro`) VALUES (1,'admin1','admin1@temp.com','$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4H6d7oQ6QI/.8B5b2Q1QJf6Q1Q1u','2025-09-21 15:44:48'),(2,'admin2','admin2@temp.com','$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4H6d7oQ6QI/.8B5b2Q1QJf6Q1Q1u','2025-09-21 15:44:48'),(3,'admin3','admin3@temp.com','$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4H6d7oQ6QI/.8B5b2Q1QJf6Q1Q1u','2025-09-21 15:44:48'),(4,'admin4','juan579@admin.com','$2b$12$o.2t2TkbOzX5yN5t2NbxNuEwoBBgc0zR3E9eu.Eeb/jB8DmQ4fw4W','2025-10-06 20:21:21');
/*!40000 ALTER TABLE `Administrador` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `AplicacionPromocion`
--

DROP TABLE IF EXISTS `AplicacionPromocion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `AplicacionPromocion` (
  `idBeneficiario` int NOT NULL,
  `idPromocion` int NOT NULL,
  `fechaAplicacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idBeneficiario`,`idPromocion`,`fechaAplicacion`),
  KEY `idx_aplicacion_promocion_time` (`idPromocion`,`fechaAplicacion`),
  KEY `idx_ap_fechaAplicacion` (`fechaAplicacion`),
  KEY `idx_ap_ben_time` (`idBeneficiario`,`fechaAplicacion`),
  KEY `idx_ap_promo_sucursal_time` (`idPromocion`,`fechaAplicacion`),
  CONSTRAINT `AplicacionPromocion_ibfk_1` FOREIGN KEY (`idBeneficiario`) REFERENCES `Beneficiario` (`idBeneficiario`),
  CONSTRAINT `AplicacionPromocion_ibfk_2` FOREIGN KEY (`idPromocion`) REFERENCES `Promocion` (`idPromocion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AplicacionPromocion`
--

LOCK TABLES `AplicacionPromocion` WRITE;
/*!40000 ALTER TABLE `AplicacionPromocion` DISABLE KEYS */;
INSERT INTO `AplicacionPromocion` VALUES (17,1,'2025-10-22 23:22:55'),(17,1,'2025-10-22 23:37:56'),(17,1,'2025-10-22 23:40:59'),(17,1,'2025-10-22 23:41:26'),(17,1,'2025-10-22 23:42:54'),(17,1,'2025-10-23 00:17:44'),(17,1,'2025-10-23 00:18:11'),(17,1,'2025-10-23 00:21:39'),(17,1,'2025-10-23 00:33:29'),(17,1,'2025-10-23 00:33:46'),(17,1,'2025-10-23 03:07:14'),(16,1,'2025-10-23 03:18:22'),(17,1,'2025-10-23 03:43:24'),(16,1,'2025-10-23 03:49:52'),(16,1,'2025-10-23 03:57:21'),(16,1,'2025-10-23 03:57:48'),(16,1,'2025-10-23 03:58:09'),(17,10,'2025-10-23 19:00:30'),(16,14,'2025-10-23 20:11:25');
/*!40000 ALTER TABLE `AplicacionPromocion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `AuditEvents`
--

DROP TABLE IF EXISTS `AuditEvents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `AuditEvents` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `actorUser` varchar(120) DEFAULT NULL,
  `actorRole` enum('BENEFICIARIO','DUENO','ADMIN','MODERADOR','SYSTEM') NOT NULL DEFAULT 'SYSTEM',
  `action` varchar(80) NOT NULL,
  `entityType` enum('COUPON','ESTABLECIMIENTO','SUCURSAL','USUARIO','REGLA','CANJEO') NOT NULL,
  `entityId` bigint DEFAULT NULL,
  `payloadOld` json DEFAULT NULL,
  `payloadNew` json DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `ip` varchar(64) DEFAULT NULL,
  `userAgent` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_entity` (`entityType`,`entityId`),
  KEY `idx_audit_action` (`action`,`created_at`),
  KEY `idx_audit_actor` (`actorUser`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AuditEvents`
--

LOCK TABLES `AuditEvents` WRITE;
/*!40000 ALTER TABLE `AuditEvents` DISABLE KEYS */;
INSERT INTO `AuditEvents` VALUES (1,NULL,'SYSTEM','REDEMPTION.CREATE','COUPON',4,NULL,NULL,NULL,NULL,NULL,'2025-10-15 22:37:47'),(2,NULL,'SYSTEM','REDEMPTION.CREATE','COUPON',4,NULL,NULL,NULL,NULL,NULL,'2025-10-15 22:37:47'),(3,NULL,'SYSTEM','REDEMPTION.CREATE','COUPON',4,NULL,NULL,NULL,NULL,NULL,'2025-10-15 22:37:47'),(4,NULL,'SYSTEM','REDEMPTION.CREATE','COUPON',4,NULL,NULL,NULL,NULL,NULL,'2025-10-15 22:37:47'),(5,NULL,'SYSTEM','REDEMPTION.CREATE','COUPON',4,NULL,NULL,NULL,NULL,NULL,'2025-10-15 22:37:47'),(6,NULL,'SYSTEM','REDEMPTION.CREATE','COUPON',4,NULL,NULL,NULL,NULL,NULL,'2025-10-15 22:37:47'),(7,NULL,'SYSTEM','REDEMPTION.CREATE','COUPON',5,NULL,NULL,NULL,NULL,NULL,'2025-10-15 22:37:47'),(8,NULL,'SYSTEM','REDEMPTION.CREATE','COUPON',5,NULL,NULL,NULL,NULL,NULL,'2025-10-15 22:37:47'),(9,NULL,'SYSTEM','REDEMPTION.CREATE','COUPON',5,NULL,NULL,NULL,NULL,NULL,'2025-10-15 22:37:47'),(10,NULL,'SYSTEM','REDEMPTION.CREATE','COUPON',6,NULL,NULL,NULL,NULL,NULL,'2025-10-15 22:37:47'),(11,NULL,'SYSTEM','REDEMPTION.CREATE','COUPON',6,NULL,NULL,NULL,NULL,NULL,'2025-10-15 22:37:47'),(12,NULL,'SYSTEM','REDEMPTION.CREATE','COUPON',6,NULL,NULL,NULL,NULL,NULL,'2025-10-15 22:37:47'),(13,NULL,'SYSTEM','REDEMPTION.BACKFILL','COUPON',1,NULL,NULL,'Seed backfill',NULL,NULL,'2025-10-15 22:37:47'),(14,NULL,'SYSTEM','REDEMPTION.BACKFILL','COUPON',2,NULL,NULL,'Seed backfill',NULL,NULL,'2025-10-15 22:37:47'),(15,NULL,'SYSTEM','REDEMPTION.BACKFILL','COUPON',3,NULL,NULL,'Seed backfill',NULL,NULL,'2025-10-15 22:37:47'),(16,NULL,'SYSTEM','REDEMPTION.BACKFILL','COUPON',4,NULL,NULL,'Seed backfill',NULL,NULL,'2025-10-15 22:37:47'),(17,NULL,'SYSTEM','REDEMPTION.BACKFILL','COUPON',5,NULL,NULL,'Seed backfill',NULL,NULL,'2025-10-15 22:37:47'),(18,NULL,'SYSTEM','REDEMPTION.BACKFILL','COUPON',6,NULL,NULL,'Seed backfill',NULL,NULL,'2025-10-15 22:37:47'),(20,NULL,'ADMIN','CREATE','USUARIO',15,NULL,'{\"curp\": \"asdasdsadasdsa\", \"email\": \"asdsads@gmail.com\"}',NULL,NULL,NULL,'2025-10-19 00:07:05'),(21,'admin@bj.mx','ADMIN','PROMO.STATUS','COUPON',4,'{\"status\": \"APPROVED\"}','{\"status\": \"APPROVED\"}','Cumple políticas',NULL,NULL,'2025-10-21 07:01:58'),(22,NULL,'SYSTEM','REDEMPTION.DELETE','COUPON',1,NULL,NULL,NULL,NULL,NULL,'2025-10-22 22:40:09'),(23,NULL,'SYSTEM','REDEMPTION.DELETE','COUPON',2,NULL,NULL,NULL,NULL,NULL,'2025-10-22 22:40:09'),(24,NULL,'SYSTEM','REDEMPTION.DELETE','COUPON',3,NULL,NULL,NULL,NULL,NULL,'2025-10-22 22:40:09'),(25,NULL,'SYSTEM','REDEMPTION.DELETE','COUPON',4,NULL,NULL,NULL,NULL,NULL,'2025-10-22 22:40:09'),(26,NULL,'SYSTEM','REDEMPTION.DELETE','COUPON',4,NULL,NULL,NULL,NULL,NULL,'2025-10-22 22:40:09'),(27,NULL,'SYSTEM','REDEMPTION.DELETE','COUPON',6,NULL,NULL,NULL,NULL,NULL,'2025-10-22 22:40:09'),(28,NULL,'SYSTEM','REDEMPTION.DELETE','COUPON',4,NULL,NULL,NULL,NULL,NULL,'2025-10-22 22:40:09'),(29,NULL,'SYSTEM','REDEMPTION.DELETE','COUPON',5,NULL,NULL,NULL,NULL,NULL,'2025-10-22 22:40:09'),(30,NULL,'SYSTEM','REDEMPTION.DELETE','COUPON',6,NULL,NULL,NULL,NULL,NULL,'2025-10-22 22:40:09'),(31,NULL,'SYSTEM','REDEMPTION.DELETE','COUPON',4,NULL,NULL,NULL,NULL,NULL,'2025-10-22 22:40:09'),(32,NULL,'SYSTEM','REDEMPTION.DELETE','COUPON',5,NULL,NULL,NULL,NULL,NULL,'2025-10-22 22:40:09'),(33,NULL,'SYSTEM','REDEMPTION.DELETE','COUPON',6,NULL,NULL,NULL,NULL,NULL,'2025-10-22 22:40:09'),(34,NULL,'SYSTEM','REDEMPTION.DELETE','COUPON',4,NULL,NULL,NULL,NULL,NULL,'2025-10-22 22:40:09'),(35,NULL,'SYSTEM','REDEMPTION.DELETE','COUPON',5,NULL,NULL,NULL,NULL,NULL,'2025-10-22 22:40:09'),(36,NULL,'SYSTEM','REDEMPTION.DELETE','COUPON',4,NULL,NULL,NULL,NULL,NULL,'2025-10-22 22:40:09'),(37,NULL,'SYSTEM','REDEMPTION.CREATE','COUPON',1,NULL,NULL,NULL,NULL,NULL,'2025-10-22 23:22:55'),(38,NULL,'SYSTEM','REDEMPTION.CREATE','COUPON',1,NULL,NULL,NULL,NULL,NULL,'2025-10-22 23:37:56'),(39,NULL,'SYSTEM','REDEMPTION.CREATE','COUPON',1,NULL,NULL,NULL,NULL,NULL,'2025-10-22 23:40:59'),(40,NULL,'SYSTEM','REDEMPTION.CREATE','COUPON',1,NULL,NULL,NULL,NULL,NULL,'2025-10-22 23:41:26'),(41,NULL,'SYSTEM','REDEMPTION.CREATE','COUPON',1,NULL,NULL,NULL,NULL,NULL,'2025-10-22 23:42:54'),(42,NULL,'SYSTEM','REDEMPTION.CREATE','COUPON',1,NULL,NULL,NULL,NULL,NULL,'2025-10-23 00:17:44'),(43,NULL,'SYSTEM','REDEMPTION.CREATE','COUPON',1,NULL,NULL,NULL,NULL,NULL,'2025-10-23 00:18:11'),(44,NULL,'SYSTEM','REDEMPTION.CREATE','COUPON',1,NULL,NULL,NULL,NULL,NULL,'2025-10-23 00:21:39'),(45,NULL,'SYSTEM','REDEMPTION.CREATE','COUPON',1,NULL,NULL,NULL,NULL,NULL,'2025-10-23 00:33:29'),(46,NULL,'SYSTEM','REDEMPTION.CREATE','COUPON',1,NULL,NULL,NULL,NULL,NULL,'2025-10-23 00:33:46'),(47,NULL,'SYSTEM','REDEMPTION.CREATE','COUPON',1,NULL,NULL,NULL,NULL,NULL,'2025-10-23 03:07:14'),(48,NULL,'SYSTEM','REDEMPTION.CREATE','COUPON',1,NULL,NULL,NULL,NULL,NULL,'2025-10-23 03:18:22'),(49,NULL,'SYSTEM','REDEMPTION.CREATE','COUPON',1,NULL,NULL,NULL,NULL,NULL,'2025-10-23 03:43:24'),(50,NULL,'SYSTEM','REDEMPTION.CREATE','COUPON',1,NULL,NULL,NULL,NULL,NULL,'2025-10-23 03:49:52'),(51,NULL,'SYSTEM','REDEMPTION.CREATE','COUPON',1,NULL,NULL,NULL,NULL,NULL,'2025-10-23 03:57:21'),(52,NULL,'SYSTEM','REDEMPTION.CREATE','COUPON',1,NULL,NULL,NULL,NULL,NULL,'2025-10-23 03:57:48'),(53,NULL,'SYSTEM','REDEMPTION.CREATE','COUPON',1,NULL,NULL,NULL,NULL,NULL,'2025-10-23 03:58:09'),(54,NULL,'SYSTEM','REDEMPTION.CREATE','COUPON',10,NULL,NULL,NULL,NULL,NULL,'2025-10-23 19:00:30'),(55,NULL,'SYSTEM','REDEMPTION.CREATE','COUPON',14,NULL,NULL,NULL,NULL,NULL,'2025-10-23 20:11:25');
/*!40000 ALTER TABLE `AuditEvents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `AuditLog`
--

DROP TABLE IF EXISTS `AuditLog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `AuditLog` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `usuario` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accion` enum('CREATE','UPDATE','APPROVE','REJECT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `entidad` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `detalle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AuditLog`
--

LOCK TABLES `AuditLog` WRITE;
/*!40000 ALTER TABLE `AuditLog` DISABLE KEYS */;
INSERT INTO `AuditLog` VALUES (1,'2025-10-02 03:19:46','admin@bj.mx','UPDATE','Promoción #1','Estado -> ACTIVA'),(2,'2025-10-12 04:03:40','admin@bj.mx','UPDATE','Promoción #1','Estado -> ACTIVA');
/*!40000 ALTER TABLE `AuditLog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Beneficiario`
--

DROP TABLE IF EXISTS `Beneficiario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Beneficiario` (
  `idBeneficiario` int NOT NULL AUTO_INCREMENT,
  `curp` varchar(18) NOT NULL,
  `primerNombre` varchar(50) NOT NULL,
  `segundoNombre` varchar(50) DEFAULT NULL,
  `apellidoPaterno` varchar(50) NOT NULL,
  `apellidoMaterno` varchar(50) NOT NULL,
  `fechaNacimiento` date NOT NULL,
  `celular` varchar(10) NOT NULL,
  `folio` varchar(16) NOT NULL,
  `email` varchar(100) NOT NULL,
  `fechaRegistro` datetime DEFAULT CURRENT_TIMESTAMP,
  `sexo` char(1) DEFAULT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `email_lc` varchar(100) GENERATED ALWAYS AS (lower(`email`)) STORED,
  PRIMARY KEY (`idBeneficiario`),
  UNIQUE KEY `curp` (`curp`),
  UNIQUE KEY `celular` (`celular`),
  UNIQUE KEY `folio` (`folio`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `uniq_ben_email_lc` (`email_lc`),
  KEY `idx_beneficiario_fechaRegistro` (`fechaRegistro`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Beneficiario`
--

LOCK TABLES `Beneficiario` WRITE;
/*!40000 ALTER TABLE `Beneficiario` DISABLE KEYS */;
INSERT INTO `Beneficiario` (`idBeneficiario`, `curp`, `primerNombre`, `segundoNombre`, `apellidoPaterno`, `apellidoMaterno`, `fechaNacimiento`, `celular`, `folio`, `email`, `fechaRegistro`, `sexo`, `passwordHash`, `activo`) VALUES (1,'MAGL980521HDFRRN01','LUIS','ANDRÉS','GARCÍA','LÓPEZ','1998-05-21','5512345678','FOLIO0012345678','luis.garcia@email.com','2025-09-21 15:44:47','M','$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4H6d7oQ6QI/.8B5b2Q1QJf6Q1Q1u',1),(2,'ROML990315MDFMNS02','MARÍA','FERNANDA','RODRÍGUEZ','MARTÍNEZ','1999-03-15','5523456789','FOLIO0023456789','maria.rodriguez@email.com','2025-09-21 15:44:47','F','$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4H6d7oQ6QI/.8B5b2Q1QJf6Q1Q1u',1),(3,'HEGJ000710HDFRRN03','JUAN','CARLOS','HERNÁNDEZ','GÓMEZ','2000-07-10','5534567890','FOLIO0034567890','juan.hernandez@email.com','2025-09-21 15:44:47','M','$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4H6d7oQ6QI/.8B5b2Q1QJf6Q1Q1u',1),(4,'PBAD980521HDFRRN01','ADRIAN','JOSE','PROANO','BERNAL','1998-05-21','55000000','FOLIO0000000000','adrian@gmail.com','2025-09-29 23:11:07','M','1234',1),(6,'CURP1234567890ABCD','Juan','Pablo','Pérez','Gutiérrez','2000-01-01','5519187147','BJ73085694','juan579@ejemplo.com','2025-09-30 22:58:05','H','$2b$12$Uypl9K3taXs9Q0wDhq.y7OCWkfJmb/vrHVzdLJmHiqRvuTHpAg7Xi',1),(7,'MSFD023014YDFEEN03','Pablito',NULL,'Ochoa','Gutierrez','2003-02-03','5543128352','FOLIO1111212312','prueba@gmail.com','2025-10-07 19:47:49','M','85e63bcfdcfcf1a63ccef788e46665211b53eb6a1f1da18149ab69715516df06',1),(8,'CURP010101HDFABC01','ANA',NULL,'PÉREZ','MORA','2001-01-01','5511111111','BJ00000001','ana.perez+seed1@correo.com','2025-10-15 22:37:45','F','$2b$12$abcdefghijklmnopqrstuv78uv',1),(9,'CURP010102HDFABC02','MARIO',NULL,'LOPEZ','DIAZ','2001-02-02','5522222222','BJ00000002','mario.lopez+seed2@correo.com','2025-10-15 22:37:45','M','$2b$12$abcdefghijklmnopqrstuv90uv',1),(10,'CURP010103HDFABC03','SOFIA',NULL,'GOMEZ','ROSA','2001-03-03','5533333333','BJ00000003','sofia.gomez+seed3@correo.com','2025-10-15 22:37:45','F','$2b$12$abcxyzabcdefghijklmnopqr12',1),(11,'CURP010104HDFABC04','LUIS',NULL,'RAMIREZ','VEGA','2001-04-04','5544444444','BJ00000004','luis.ramirez+seed4@correo.com','2025-10-15 22:37:45','M','$2b$12$abcxyzabcdefghijklmnopqr34',1),(12,'CURP010105HDFABC05','VALERIA',NULL,'HERRERA','CRUZ','2001-05-05','5555555555','BJ00000005','valeria.herrera+seed5@correo.com','2025-10-15 22:37:45','F','$2b$12$abcxyzabcdefghijklmnopqr56',1),(14,'GOLJ950815HDFLPN01','Juan','Carlos','González','López','1995-08-15','5519523523','BJ15879857','juan.prueba@beneficiario.com','2025-10-18 19:31:19','H','$2b$12$.lA7L2F4RWsNYMARVWZb1OwL46nQREyJ7FUWdeXGNygMz6wEVDpUO',1),(15,'asdasdsadasdsa','moi','pacheco','fal','flaco','2007-02-28','dsadasdasd','BJ70977139','asdsads@gmail.com','2025-10-19 00:07:05','M','$2b$10$HnXRz6aT21k/r28ynGWPguGP8.etMNTWS9jAprdBBk.ZpPqeKYNQq',0),(16,'ISRJ950815HDFLPN01','Israel',NULL,'González','López','1995-08-15','5519523353','BJ37128101','jp.solis.g@gmail.com','2025-10-19 01:25:28','H','$2b$12$URH/Fn5NqqRr3YMdW6LN7.W54yG92RJoSNnzLNOBz3.svkYyhzsbe',1),(17,'POTL041004HDFZMSA5','Luis','David','Pozos','Tamez','2004-10-09','5562325192','BJ01010101010101','pozos@gmail.com','2025-10-21 16:19:28','H','$2b$12$URH/Fn5NqqRr3YMdW6LN7.W54yG92RJoSNnzLNOBz3.svkYyhzsbe',1),(19,'VACI041004HDFZMSA5','Luis',NULL,'Pozos','Tamez','2004-10-09','5562325193','VA01010101010101','pruebavacia@gmail.com','2025-10-21 17:26:00','H','$2b$12$URH/Fn5NqqRr3YMdW6LN7.W54yG92RJoSNnzLNOBz3.svkYyhzsbe',1);
/*!40000 ALTER TABLE `Beneficiario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Categoria`
--

DROP TABLE IF EXISTS `Categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Categoria` (
  `idCategoria` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `fechaRegistro` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idCategoria`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Categoria`
--

LOCK TABLES `Categoria` WRITE;
/*!40000 ALTER TABLE `Categoria` DISABLE KEYS */;
INSERT INTO `Categoria` VALUES (1,'Restaurantes','2025-09-21 15:44:48'),(2,'Entretenimiento','2025-09-21 15:44:48'),(3,'Servicios Educativos','2025-09-21 15:44:48'),(4,'Cafeterías','2025-10-15 04:18:21'),(5,'Deportes','2025-10-15 04:18:21'),(6,'Educación','2025-10-15 04:18:21'),(7,'Salud y Bienestar','2025-10-15 04:18:21'),(8,'Tecnología','2025-10-15 04:18:21'),(9,'Moda y Accesorios','2025-10-15 04:18:21'),(10,'Librería y Papelería','2025-10-15 04:18:21'),(11,'Gimnasios','2025-10-15 04:18:21'),(12,'Cines','2025-10-15 04:18:21'),(13,'Otros','2025-10-15 04:18:21');
/*!40000 ALTER TABLE `Categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CategoriaCupon`
--

DROP TABLE IF EXISTS `CategoriaCupon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CategoriaCupon` (
  `idCategoriaCupon` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) NOT NULL,
  PRIMARY KEY (`idCategoriaCupon`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CategoriaCupon`
--

LOCK TABLES `CategoriaCupon` WRITE;
/*!40000 ALTER TABLE `CategoriaCupon` DISABLE KEYS */;
INSERT INTO `CategoriaCupon` VALUES (8,'Belleza'),(1,'Comida'),(3,'Educación'),(2,'Entretenimiento'),(5,'Moda'),(4,'Salud'),(6,'Servicios'),(7,'Viajes');
/*!40000 ALTER TABLE `CategoriaCupon` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CategoriaEstablecimiento`
--

DROP TABLE IF EXISTS `CategoriaEstablecimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CategoriaEstablecimiento` (
  `idCategoria` int NOT NULL,
  `idEstablecimiento` int NOT NULL,
  `fechaRegistro` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idCategoria`,`idEstablecimiento`),
  KEY `idEstablecimiento` (`idEstablecimiento`),
  CONSTRAINT `CategoriaEstablecimiento_ibfk_1` FOREIGN KEY (`idCategoria`) REFERENCES `Categoria` (`idCategoria`) ON DELETE CASCADE,
  CONSTRAINT `CategoriaEstablecimiento_ibfk_2` FOREIGN KEY (`idEstablecimiento`) REFERENCES `Establecimiento` (`idEstablecimiento`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CategoriaEstablecimiento`
--

LOCK TABLES `CategoriaEstablecimiento` WRITE;
/*!40000 ALTER TABLE `CategoriaEstablecimiento` DISABLE KEYS */;
INSERT INTO `CategoriaEstablecimiento` VALUES (1,3,'2025-10-21 02:34:34'),(1,22,'2025-10-23 20:49:53'),(1,23,'2025-10-23 20:49:53'),(1,24,'2025-10-23 20:49:54'),(1,25,'2025-10-23 20:49:54'),(1,26,'2025-10-23 20:49:55'),(1,27,'2025-10-23 20:49:55'),(2,9,'2025-10-21 02:34:34'),(2,17,'2025-10-23 20:49:51'),(2,19,'2025-10-23 20:49:52'),(2,20,'2025-10-23 20:49:52'),(2,21,'2025-10-23 20:49:53'),(4,1,'2025-10-21 02:34:34'),(5,5,'2025-10-21 02:34:34'),(5,10,'2025-10-21 02:34:34'),(7,28,'2025-10-23 20:49:55'),(7,29,'2025-10-23 20:49:56'),(7,30,'2025-10-23 20:49:56'),(7,31,'2025-10-23 20:49:56'),(7,32,'2025-10-23 20:49:57'),(8,12,'2025-10-21 02:34:34'),(10,14,'2025-10-21 02:34:34'),(11,13,'2025-10-21 02:34:34'),(11,33,'2025-10-23 20:49:57'),(12,2,'2025-10-21 02:34:34'),(12,11,'2025-10-21 02:34:34');
/*!40000 ALTER TABLE `CategoriaEstablecimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Dueno`
--

DROP TABLE IF EXISTS `Dueno`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Dueno` (
  `idDueno` int NOT NULL AUTO_INCREMENT,
  `nombreUsuario` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `fechaRegistro` datetime DEFAULT CURRENT_TIMESTAMP,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `email_lc` varchar(100) GENERATED ALWAYS AS (lower(`email`)) STORED,
  PRIMARY KEY (`idDueno`),
  UNIQUE KEY `nombreUsuario` (`nombreUsuario`),
  UNIQUE KEY `unique_dueno_email` (`email`),
  UNIQUE KEY `uniq_dueno_email_lc` (`email_lc`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Dueno`
--

LOCK TABLES `Dueno` WRITE;
/*!40000 ALTER TABLE `Dueno` DISABLE KEYS */;
INSERT INTO `Dueno` (`idDueno`, `nombreUsuario`, `email`, `passwordHash`, `fechaRegistro`, `activo`) VALUES (1,'dueno1','dueno1@temp.com','$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4H6d7oQ6QI/.8B5b2Q1QJf6Q1Q1u','2025-09-21 15:44:48',1),(2,'dueno2','dueno2@temp.com','$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4H6d7oQ6QI/.8B5b2Q1QJf6Q1Q1u','2025-09-21 15:44:48',1),(3,'dueno3','dueno3@temp.com','$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4H6d7oQ6QI/.8B5b2Q1QJf6Q1Q1u','2025-09-21 15:44:48',1),(4,'Juan Pérez','juan579@dueño.com','$2b$12$wi1glmLwkiUJlRlkrGeLae7ElX3VQblXk9OrHf5Ax5FEtq7lyi.9a','2025-10-11 05:22:37',0),(5,'MoisesFalcon117','moises_falcon@comercio.com','$2b$12$WZJTw4Nap7NKGtpWvvhi1.3NYBFyBcyrAbS6clXc5nevJGKVYAHKa','2025-10-11 18:08:55',0),(6,'Moses117','moisesjrfalcon@gmail.com','$2b$12$mS89rd0IxGFjs8uk9dQ9Y.48PwZshxUklbLUoA9l7cJGFEFaN11ym','2025-10-11 23:17:00',0),(7,'Miranda Martínez Jiménez','miri123@gmail.com','$2b$12$B/CgiOdmNEhKLUqYzozWfebaOV85SxLyy9hq1Q.biUy7u0wrxau6K','2025-10-11 23:20:24',1),(8,'due_oxxo','due.oxxo@comercio.com','$2b$12$abcdefghijklmnopqrstuv12uv','2025-10-15 22:37:44',0),(9,'due_gym','due.gym@comercio.com','$2b$12$abcdefghijklmnopqrstuv34uv','2025-10-15 22:37:44',1),(10,'due_lib','due.libreria@comercio.com','$2b$12$abcdefghijklmnopqrstuv56uv','2025-10-15 22:37:44',1),(11,'sixflags','sixflagsdueno@dueno.com','$2b$12$XQlz5fYlmI4r.5LfRE4I3OO8KV.sA3Ybt8pfXF7ENuqdEYUPMCPne','2025-10-20 06:22:14',1),(12,'MoisesFalcon','a01801140@tec.mx','$2b$12$vxDxdt82ID80rLqqQ/6k9.xBQKKW70tuPpBwJhXPcgS8sjrcWHa8O','2025-10-21 08:35:44',1),(13,'duenoadrian','duenoadrian@gmail.com','$2b$12$URH/Fn5NqqRr3YMdW6LN7.W54yG92RJoSNnzLNOBz3.svkYyhzsbe','2025-10-22 16:12:46',1);
/*!40000 ALTER TABLE `Dueno` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DuenoEstablecimiento`
--

DROP TABLE IF EXISTS `DuenoEstablecimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DuenoEstablecimiento` (
  `idDueno` int NOT NULL,
  `idEstablecimiento` int NOT NULL,
  `fechaRegistro` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idDueno`,`idEstablecimiento`),
  KEY `idEstablecimiento` (`idEstablecimiento`),
  CONSTRAINT `DuenoEstablecimiento_ibfk_1` FOREIGN KEY (`idDueno`) REFERENCES `Dueno` (`idDueno`) ON DELETE CASCADE,
  CONSTRAINT `DuenoEstablecimiento_ibfk_2` FOREIGN KEY (`idEstablecimiento`) REFERENCES `Establecimiento` (`idEstablecimiento`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DuenoEstablecimiento`
--

LOCK TABLES `DuenoEstablecimiento` WRITE;
/*!40000 ALTER TABLE `DuenoEstablecimiento` DISABLE KEYS */;
INSERT INTO `DuenoEstablecimiento` VALUES (1,1,'2025-09-21 15:44:49'),(2,2,'2025-09-21 15:44:49'),(3,3,'2025-09-21 15:44:49'),(8,12,'2025-10-15 22:37:45'),(9,13,'2025-10-15 22:37:45'),(10,14,'2025-10-15 22:37:45'),(13,1,'2025-10-22 16:14:57');
/*!40000 ALTER TABLE `DuenoEstablecimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `EntityVersions`
--

DROP TABLE IF EXISTS `EntityVersions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `EntityVersions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `entityType` enum('COUPON','ESTABLECIMIENTO','SUCURSAL') NOT NULL,
  `entityId` bigint NOT NULL,
  `version` int NOT NULL,
  `snapshot` json NOT NULL,
  `changedBy` varchar(120) DEFAULT NULL,
  `changeReason` varchar(255) DEFAULT NULL,
  `valid_from` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `valid_to` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_entity_version` (`entityType`,`entityId`,`version`),
  KEY `idx_entity_current` (`entityType`,`entityId`,`valid_to`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `EntityVersions`
--

LOCK TABLES `EntityVersions` WRITE;
/*!40000 ALTER TABLE `EntityVersions` DISABLE KEYS */;
/*!40000 ALTER TABLE `EntityVersions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Establecimiento`
--

DROP TABLE IF EXISTS `Establecimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Establecimiento` (
  `idEstablecimiento` int NOT NULL AUTO_INCREMENT,
  `logoURL` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fechaRegistro` datetime DEFAULT CURRENT_TIMESTAMP,
  `nombre` varchar(100) NOT NULL DEFAULT 'Sin nombre',
  PRIMARY KEY (`idEstablecimiento`),
  UNIQUE KEY `unique_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Establecimiento`
--

LOCK TABLES `Establecimiento` WRITE;
/*!40000 ALTER TABLE `Establecimiento` DISABLE KEYS */;
INSERT INTO `Establecimiento` VALUES (1,'https://res.cloudinary.com/daxeygpic/image/upload/v1761178196/Starbucks_Corporation_Logo_2011.svg_fdesfr.png',1,'2025-09-21 15:44:48','Starbucks'),(2,'https://res.cloudinary.com/daxeygpic/image/upload/v1761178774/8706348a-a5f6-4540-8792-b08b4a800809.png',1,'2025-09-21 15:44:48','Cinemex'),(3,'https://ejemplo.com/logo3.png',1,'2025-09-21 15:44:48','Restaurante El Buen Sabor'),(5,'https://ejemplo.com/logo5.png',1,'2025-09-21 15:44:48','Nike'),(9,'https://res.cloudinary.com/daxeygpic/image/upload/v1760505620/logos/logos_1760505620722_rxzy5m.png',1,'2025-10-15 05:20:26','Six Flags'),(10,'https://res.cloudinary.com/daxeygpic/image/upload/v1760512666/logos/logos_1760512665884_42spto.jpg',1,'2025-10-15 07:17:49','Adidas'),(11,'https://res.cloudinary.com/daxeygpic/image/upload/v1760566182/logos/logos_1760566182425_8av958.jpg',1,'2025-10-15 22:09:48','Cinepolis'),(12,'https://res.cloudinary.com/daxeygpic/image/upload/v1761178603/524b12a7-400e-4be1-bc08-a450c02c212d.png',1,'2025-10-15 22:37:44','OXXO Universidad'),(13,'https://ejemplo.com/bodytech.png',1,'2025-10-15 22:37:44','BodyTech'),(14,'https://ejemplo.com/libreria.png',1,'2025-10-15 22:37:44','La Gran Librería'),(16,'https://res.cloudinary.com/daxeygpic/image/upload/v1761178196/Starbucks_Corporation_Logo_2011.svg_fdesfr.png',1,'2025-10-23 00:11:54','Sin nombre'),(17,'https://res.cloudinary.com/daxeygpic/image/upload/v1761254142/images_wv6knb.png',1,'2025-10-23 20:49:51','KINEZIS'),(19,'https://res.cloudinary.com/daxeygpic/image/upload/v1761254190/ce994c75-a596-492f-ab38-5b541ec8e0d7.png',1,'2025-10-23 20:49:52','SIX FLAGS HURRICANE HARBOR'),(20,'https://res.cloudinary.com/daxeygpic/image/upload/v1761254244/67bc277a-58ca-4b03-a487-0c883ff69de7.png',1,'2025-10-23 20:49:52','THE LIRA\'S HOUSE'),(21,'https://res.cloudinary.com/daxeygpic/image/upload/v1761254317/e776292b-d747-408c-80d0-1bd2d2a71659.png',1,'2025-10-23 20:49:53','OSITOS MEMORIALES'),(22,'https://res.cloudinary.com/daxeygpic/image/upload/v1761254343/d24d090d-4815-4e95-8a82-ba6aefc0a73b.png',1,'2025-10-23 20:49:53','EL HACENDADO'),(23,'https://res.cloudinary.com/daxeygpic/image/upload/v1761254367/bfe1fb59-5845-4529-80cd-6c52ea3e7d6f.png',1,'2025-10-23 20:49:53','PINCHE ELOTE'),(24,'https://res.cloudinary.com/daxeygpic/image/upload/v1761254397/dcbf6640-2cf3-406b-9555-97bd105fad0f.png',1,'2025-10-23 20:49:54','WAFFLES Y FRESAS \"BESC\"'),(25,'https://res.cloudinary.com/daxeygpic/image/upload/v1761254414/e19076bc-43e4-4d4c-9513-02c48ffbd1a7.png',1,'2025-10-23 20:49:54','BURGER DEALER'),(26,'https://res.cloudinary.com/daxeygpic/image/upload/v1761254490/619d744f-c0d9-46fe-b7d7-c68b4ef281ad.png',1,'2025-10-23 20:49:54','DELIT, CREPAS Y BEBIDA'),(27,'https://res.cloudinary.com/daxeygpic/image/upload/v1761254550/baf8f659-3cf3-4e28-8b69-91b2aa794382.png',1,'2025-10-23 20:49:55','MÁS FRESA'),(28,'https://res.cloudinary.com/daxeygpic/image/upload/v1761254582/56424916-4bcd-41db-af69-cab2e774251c.png',1,'2025-10-23 20:49:55','DENTA LASER'),(29,'https://res.cloudinary.com/daxeygpic/image/upload/v1761254619/4ebd100e-1c84-49c7-8f01-8bfc997c01a2.png',1,'2025-10-23 20:49:56','OCCHI CARINI'),(30,'https://res.cloudinary.com/daxeygpic/image/upload/v1761254643/c56c4c15-79f4-489c-b44f-28f210ccb292.png',1,'2025-10-23 20:49:56','PSICTEAM PSICOLOGÍA'),(31,'https://res.cloudinary.com/daxeygpic/image/upload/v1761254676/c2838402-a983-41f7-a5b8-4d0ba7531966.png',1,'2025-10-23 20:49:56','3SKEL OPTOMETRISTAS'),(32,'https://res.cloudinary.com/daxeygpic/image/upload/v1761254807/17d72fe1-c2e5-4587-ae99-6b0677384d27.png',1,'2025-10-23 20:49:56','MENTALMENTE OK'),(33,'https://res.cloudinary.com/daxeygpic/image/upload/v1761254848/3e1cec67-4e78-48af-8fd6-4381ec1e211f.png',1,'2025-10-23 20:49:57','JÖTUNHEIM');
/*!40000 ALTER TABLE `Establecimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Moderacion`
--

DROP TABLE IF EXISTS `Moderacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Moderacion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo` enum('perfil','promo','imagen','texto') COLLATE utf8mb4_unicode_ci NOT NULL,
  `idEstablecimiento` int DEFAULT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contenido` text COLLATE utf8mb4_unicode_ci,
  `url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('PENDIENTE','APROBADO','RECHAZADO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDIENTE',
  `motivo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `patch` longtext COLLATE utf8mb4_unicode_ci,
  `accion` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_moderacion_estab` (`idEstablecimiento`),
  CONSTRAINT `moderacion_ibfk_1` FOREIGN KEY (`idEstablecimiento`) REFERENCES `Establecimiento` (`idEstablecimiento`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Moderacion`
--

LOCK TABLES `Moderacion` WRITE;
/*!40000 ALTER TABLE `Moderacion` DISABLE KEYS */;
INSERT INTO `Moderacion` VALUES (1,'imagen',1,'Banner bebida caliente',NULL,'/img/placeholder.jpg','PENDIENTE',NULL,NULL,NULL,'2025-10-02 03:19:46'),(2,'texto',2,'Descripción del plan pro',NULL,NULL,'PENDIENTE',NULL,NULL,NULL,'2025-10-02 03:19:46'),(3,'imagen',1,'Banner bebida caliente',NULL,'/img/placeholder.jpg','PENDIENTE',NULL,NULL,NULL,'2025-10-12 04:03:40'),(4,'texto',2,'Descripción del plan pro',NULL,NULL,'PENDIENTE',NULL,NULL,NULL,'2025-10-12 04:03:40');
/*!40000 ALTER TABLE `Moderacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ModeracionLog`
--

DROP TABLE IF EXISTS `ModeracionLog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ModeracionLog` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `queueId` bigint NOT NULL,
  `adminUser` varchar(120) NOT NULL,
  `action` enum('APPROVED','REJECTED','COMMENTED') NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_modlog_queue` (`queueId`),
  CONSTRAINT `fk_modlog_queue` FOREIGN KEY (`queueId`) REFERENCES `ModeracionQueue` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ModeracionLog`
--

LOCK TABLES `ModeracionLog` WRITE;
/*!40000 ALTER TABLE `ModeracionLog` DISABLE KEYS */;
/*!40000 ALTER TABLE `ModeracionLog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ModeracionQueue`
--

DROP TABLE IF EXISTS `ModeracionQueue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ModeracionQueue` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `entityType` enum('COUPON','ESTABLECIMIENTO','SUCURSAL') NOT NULL,
  `entityId` bigint DEFAULT NULL,
  `submittedBy` varchar(120) NOT NULL,
  `action` enum('CREATE','UPDATE','DELETE') NOT NULL,
  `payload` json NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `reviewedBy` varchar(120) DEFAULT NULL,
  `reviewedAt` datetime DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_modq_status` (`status`),
  KEY `idx_modq_entity` (`entityType`,`entityId`),
  KEY `idx_modq_status_created` (`status`,`created_at`),
  KEY `idx_modq_reviewed_at` (`reviewedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ModeracionQueue`
--

LOCK TABLES `ModeracionQueue` WRITE;
/*!40000 ALTER TABLE `ModeracionQueue` DISABLE KEYS */;
/*!40000 ALTER TABLE `ModeracionQueue` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ModeracionRule`
--

DROP TABLE IF EXISTS `ModeracionRule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ModeracionRule` (
  `idEstablecimiento` int NOT NULL,
  `requireCouponApproval` tinyint(1) DEFAULT '1',
  `requireProfileApproval` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idEstablecimiento`),
  CONSTRAINT `fk_modrule_estab` FOREIGN KEY (`idEstablecimiento`) REFERENCES `Establecimiento` (`idEstablecimiento`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ModeracionRule`
--

LOCK TABLES `ModeracionRule` WRITE;
/*!40000 ALTER TABLE `ModeracionRule` DISABLE KEYS */;
/*!40000 ALTER TABLE `ModeracionRule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Promocion`
--

DROP TABLE IF EXISTS `Promocion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Promocion` (
  `idPromocion` int NOT NULL AUTO_INCREMENT,
  `idEstablecimiento` int NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `esVigente` tinyint(1) DEFAULT '1',
  `fechaRegistro` datetime DEFAULT CURRENT_TIMESTAMP,
  `imagenURL` text,
  `discountType` enum('PORCENTAJE','MONTO','OTRO') NOT NULL DEFAULT 'PORCENTAJE',
  `discountValue` decimal(10,2) NOT NULL DEFAULT '0.00',
  `limitQuantity` int DEFAULT NULL,
  `unlimited` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('DRAFT','PENDING','APPROVED','REJECTED','PAUSED') NOT NULL DEFAULT 'PENDING',
  `adminJustificacion` text,
  `validFrom` datetime DEFAULT NULL,
  `validTo` datetime DEFAULT NULL,
  `redeemedCount` int NOT NULL DEFAULT '0',
  `idSucursal` int DEFAULT NULL,
  `idCategoriaCupon` int DEFAULT NULL,
  PRIMARY KEY (`idPromocion`),
  KEY `idx_promocion_status` (`status`),
  KEY `idx_promocion_sucursal` (`idSucursal`),
  KEY `idx_promocion_categoriaCupon` (`idCategoriaCupon`),
  KEY `idx_promocion_validFrom` (`validFrom`),
  KEY `idx_promocion_validTo` (`validTo`),
  KEY `idx_promo_status_valids` (`status`,`validFrom`,`validTo`),
  KEY `idx_promo_cat_status_valids` (`idCategoriaCupon`,`status`,`validFrom`,`validTo`),
  KEY `idx_promo_est_status` (`idEstablecimiento`,`status`,`validFrom`,`validTo`),
  CONSTRAINT `fk_promocion_categoriaCupon` FOREIGN KEY (`idCategoriaCupon`) REFERENCES `CategoriaCupon` (`idCategoriaCupon`) ON DELETE SET NULL,
  CONSTRAINT `fk_promocion_sucursal` FOREIGN KEY (`idSucursal`) REFERENCES `Sucursal` (`idSucursal`) ON DELETE SET NULL,
  CONSTRAINT `Promocion_ibfk_1` FOREIGN KEY (`idEstablecimiento`) REFERENCES `Establecimiento` (`idEstablecimiento`) ON DELETE CASCADE,
  CONSTRAINT `chk_promo_desc` CHECK ((((`discountType` = _utf8mb4'PORCENTAJE') and (`discountValue` between 0 and 100)) or ((`discountType` = _utf8mb4'MONTO') and (`discountValue` > 0)) or ((`discountType` = _utf8mb4'OTRO') and (`discountValue` >= 0)))),
  CONSTRAINT `chk_promo_fechas` CHECK (((`validFrom` is null) or (`validTo` is null) or (`validFrom` <= `validTo`))),
  CONSTRAINT `chk_promo_limit` CHECK ((((`unlimited` = 1) and (`limitQuantity` is null)) or ((`unlimited` = 0) and (`limitQuantity` is not null) and (`limitQuantity` > 0))))
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Promocion`
--

LOCK TABLES `Promocion` WRITE;
/*!40000 ALTER TABLE `Promocion` DISABLE KEYS */;
INSERT INTO `Promocion` VALUES (1,1,'Descuento Estudiantil','20% de descuento en todos los productos al presentar credencial',0,'2025-09-21 15:44:49','https://centrosantafe.com.mx/cdn/shop/files/255.png?v=10504390230999457819','PORCENTAJE',0.00,1,0,'PAUSED',NULL,NULL,NULL,17,NULL,NULL),(2,2,'2x1 en Entradas','Dos entradas por el precio de uno los miércoles',1,'2025-09-21 15:44:49',NULL,'PORCENTAJE',0.00,1,0,'APPROVED',NULL,NULL,NULL,0,NULL,NULL),(3,3,'Clase Gratis','Una clase gratis al inscribirse en cualquier curso',1,'2025-09-21 15:44:49',NULL,'PORCENTAJE',0.00,1,0,'APPROVED',NULL,NULL,NULL,0,NULL,NULL),(4,12,'20% en snacks','Descuento en línea de caja presentando tu código BJ',1,'2025-10-15 22:37:46',NULL,'PORCENTAJE',20.00,NULL,1,'APPROVED',NULL,'2025-08-16 00:00:00','2025-12-14 00:00:00',0,6,1),(5,13,'Inscripción a $299','Promoción válida para nuevos socios',1,'2025-10-15 22:37:46',NULL,'MONTO',299.00,NULL,1,'APPROVED',NULL,'2025-07-17 00:00:00','2025-11-14 00:00:00',0,8,4),(6,14,'2x1 en cuadernos','Llévate 2 por el precio de 1, aplica en marcas participantes',1,'2025-10-15 22:37:46',NULL,'OTRO',0.00,NULL,1,'APPROVED',NULL,'2025-09-15 00:00:00','2026-01-13 00:00:00',0,9,6),(7,9,'Flash Pass','Te da un flash pass gratis',1,'2025-10-23 00:36:09',NULL,'OTRO',500.00,NULL,1,'REJECTED','falta fecha',NULL,NULL,0,NULL,NULL),(8,1,'Oferta Insana','-$400 EN TODOS LOS SOULS',0,'2025-10-23 04:53:55',NULL,'MONTO',400.00,NULL,1,'PAUSED',NULL,'0000-00-00 00:00:00','0000-00-00 00:00:00',0,NULL,NULL),(9,1,'Oferta Insana2','SOLO PROBAR FECHA',0,'2025-10-23 05:28:35',NULL,'PORCENTAJE',40.00,NULL,1,'PAUSED',NULL,'2025-10-22 00:00:00','2025-10-31 00:00:00',0,NULL,NULL),(10,1,'Descuento en Bagels','50% de descuento en un bagel diario!',1,'2025-10-23 07:17:03',NULL,'PORCENTAJE',50.00,NULL,1,'APPROVED',NULL,'2025-10-23 00:00:00','2025-11-02 00:00:00',1,NULL,NULL),(11,1,'Descuentos Tenebrosos','25% de descuento en todos los items con tematica de Halloween!',1,'2025-10-23 07:18:20',NULL,'PORCENTAJE',25.00,NULL,1,'APPROVED',NULL,'2025-10-29 00:00:00','2025-11-03 00:00:00',0,NULL,NULL),(12,1,'40% descuento en café del día ','Presentando tu tarjeta beneficio joven ',1,'2025-10-23 17:18:23',NULL,'PORCENTAJE',40.00,NULL,1,'APPROVED',NULL,'2025-10-23 00:00:00','2025-10-25 00:00:00',0,NULL,NULL),(13,1,'Combo Estudiante','Un baguette y un cafe por  solo $100!',1,'2025-10-23 18:39:58',NULL,'MONTO',100.00,NULL,1,'APPROVED',NULL,'2025-10-27 00:00:00','2025-11-02 00:00:00',0,NULL,NULL),(14,1,'Combo Atizapan','1 Bagel, 1 Cafe y una Galleta a solo $150',1,'2025-10-23 18:41:27',NULL,'MONTO',150.00,NULL,1,'APPROVED',NULL,'2025-10-26 00:00:00','2025-10-31 00:00:00',1,NULL,NULL),(15,17,'20% pagando con tarjeta','Descuento en acceso Kinezis. Aplica pagando con tarjeta.',1,'2025-10-23 20:49:52',NULL,'PORCENTAJE',20.00,NULL,1,'APPROVED',NULL,'2025-10-23 00:00:00','2026-12-31 23:59:59',0,11,2),(16,17,'25% pagando en efectivo','Descuento en acceso Kinezis. Aplica pagando en efectivo.',1,'2025-10-23 20:49:52',NULL,'PORCENTAJE',25.00,NULL,1,'APPROVED',NULL,'2025-10-23 00:00:00','2026-12-31 23:59:59',0,11,2),(17,9,'Descuentos y sorpresas por día','Beneficios variables según el día de visita al parque.',1,'2025-10-23 20:49:52',NULL,'OTRO',0.00,NULL,1,'APPROVED',NULL,'2025-10-23 00:00:00','2026-12-31 23:59:59',0,12,2),(18,19,'Descuentos y sorpresas por día','Beneficios variables según el día de visita a Hurricane Harbor.',1,'2025-10-23 20:49:52',NULL,'OTRO',0.00,NULL,1,'APPROVED',NULL,'2025-10-23 00:00:00','2026-12-31 23:59:59',0,13,2),(19,20,'5% en instrumentos > $10,000','Aplica en instrumentos con valor superior a $10,000.',1,'2025-10-23 20:49:53',NULL,'PORCENTAJE',5.00,NULL,1,'APPROVED',NULL,'2025-10-23 00:00:00','2026-12-31 23:59:59',0,14,6),(20,21,'5% en ositos','Válido presentando tu tarjeta. Citas: 5532384740.',1,'2025-10-23 20:49:53',NULL,'PORCENTAJE',5.00,NULL,1,'APPROVED',NULL,'2025-10-23 00:00:00','2026-12-31 23:59:59',0,15,6),(21,21,'Cursos y talleres con beneficio','Beneficio especial en cursos y talleres. Consulta temarios por WhatsApp.',1,'2025-10-23 20:49:53',NULL,'OTRO',0.00,NULL,1,'APPROVED',NULL,'2025-10-23 00:00:00','2026-12-31 23:59:59',0,15,6),(22,22,'10% pagando en efectivo','Aplica sobre consumo.',1,'2025-10-23 20:49:53',NULL,'PORCENTAJE',10.00,NULL,1,'APPROVED',NULL,'2025-10-23 00:00:00','2026-12-31 23:59:59',0,16,1),(23,22,'5% pagando con tarjeta de débito','Aplica sobre consumo.',1,'2025-10-23 20:49:53',NULL,'PORCENTAJE',5.00,NULL,1,'APPROVED',NULL,'2025-10-23 00:00:00','2026-12-31 23:59:59',0,16,1),(24,23,'10% efectivo (esquites)','Esquites con/sin carne. Excepto elote, lengua, tuétano y tripa.',1,'2025-10-23 20:49:54',NULL,'PORCENTAJE',10.00,NULL,1,'APPROVED',NULL,'2025-10-23 00:00:00','2026-12-31 23:59:59',0,17,1),(25,23,'5% débito (esquites)','Esquites con/sin carne. Excepto elote, lengua, tuétano y tripa.',1,'2025-10-23 20:49:54',NULL,'PORCENTAJE',5.00,NULL,1,'APPROVED',NULL,'2025-10-23 00:00:00','2026-12-31 23:59:59',0,17,1),(26,24,'5% consumo mínimo','Beneficio sobre consumo mínimo.',1,'2025-10-23 20:49:54',NULL,'PORCENTAJE',5.00,NULL,1,'APPROVED',NULL,'2025-10-23 00:00:00','2026-12-31 23:59:59',0,18,1),(27,24,'10% en consumo > $150','Aplica a partir de $150.',1,'2025-10-23 20:49:54',NULL,'PORCENTAJE',10.00,NULL,1,'APPROVED',NULL,'2025-10-23 00:00:00','2026-12-31 23:59:59',0,18,1),(28,25,'10% en el total (Jue-Dom)','Entrega a domicilio zonas aledañas. Pedido al 5511837264.',1,'2025-10-23 20:49:54',NULL,'PORCENTAJE',10.00,NULL,1,'APPROVED',NULL,'2025-10-23 00:00:00','2026-12-31 23:59:59',0,19,1),(29,26,'10% en crepas dulces','Aplica en crepas dulces.',1,'2025-10-23 20:49:55',NULL,'PORCENTAJE',10.00,NULL,1,'APPROVED',NULL,'2025-10-23 00:00:00','2026-12-31 23:59:59',0,20,1),(30,26,'2 bebidas por $99','Promoción de dos bebidas por $99.',1,'2025-10-23 20:49:55',NULL,'OTRO',0.00,NULL,1,'APPROVED',NULL,'2025-10-23 00:00:00','2026-12-31 23:59:59',0,20,1),(31,27,'5% en segunda compra','Aplica presentando historial de compra.',1,'2025-10-23 20:49:55',NULL,'PORCENTAJE',5.00,NULL,1,'APPROVED',NULL,'2025-10-23 00:00:00','2026-12-31 23:59:59',0,21,1),(32,27,'10% en tercera compra','Aplica presentando historial de compra.',1,'2025-10-23 20:49:55',NULL,'PORCENTAJE',10.00,NULL,1,'APPROVED',NULL,'2025-10-23 00:00:00','2026-12-31 23:59:59',0,21,1),(33,28,'20% en operatoria dental','Tratamientos de operatoria.',1,'2025-10-23 20:49:55',NULL,'PORCENTAJE',20.00,NULL,1,'APPROVED',NULL,'2025-10-23 00:00:00','2026-12-31 23:59:59',0,22,4),(34,28,'20% en ortodoncia','Planes de ortodoncia.',1,'2025-10-23 20:49:55',NULL,'PORCENTAJE',20.00,NULL,1,'APPROVED',NULL,'2025-10-23 00:00:00','2026-12-31 23:59:59',0,22,4),(35,29,'Paquetes de armazón + micas + Blue Ray','2º armazón + micas de regalo y 10% de descuento. Aplica hasta ±4.00 dioptrías y 2.00 astigmatismo; fuera de rango 25% off.',1,'2025-10-23 20:49:56',NULL,'OTRO',0.00,NULL,1,'APPROVED',NULL,'2025-10-23 00:00:00','2026-12-31 23:59:59',0,23,4),(36,30,'10% en primeras dos consultas','Válido para pacientes nuevos.',1,'2025-10-23 20:49:56',NULL,'PORCENTAJE',10.00,NULL,1,'APPROVED',NULL,'2025-10-23 00:00:00','2026-12-31 23:59:59',0,24,4),(37,31,'10% en lentes de línea','Aplica en modelos de línea.',1,'2025-10-23 20:49:56',NULL,'PORCENTAJE',10.00,NULL,1,'APPROVED',NULL,'2025-10-23 00:00:00','2026-12-31 23:59:59',0,25,4),(38,31,'10% en tratamientos','Tratamientos de salud visual.',1,'2025-10-23 20:49:56',NULL,'PORCENTAJE',10.00,NULL,1,'APPROVED',NULL,'2025-10-23 00:00:00','2026-12-31 23:59:59',0,25,4),(39,32,'10% en terapia online','Agendar vía WhatsApp 5537324888.',1,'2025-10-23 20:49:57',NULL,'PORCENTAJE',10.00,NULL,1,'APPROVED',NULL,'2025-10-23 00:00:00','2026-12-31 23:59:59',0,26,4),(40,33,'25% en mensualidad','Beneficio sobre mensualidad.',1,'2025-10-23 20:49:57',NULL,'PORCENTAJE',25.00,NULL,1,'APPROVED',NULL,'2025-10-23 00:00:00','2026-12-31 23:59:59',0,27,4),(41,33,'30% en inscripción','Beneficio en cuota de inscripción.',1,'2025-10-23 20:49:57',NULL,'PORCENTAJE',30.00,NULL,1,'APPROVED',NULL,'2025-10-23 00:00:00','2026-12-31 23:59:59',0,27,4),(91,1,'café del día 2x1','',1,'2025-10-23 22:03:04',NULL,'OTRO',2.00,NULL,1,'REJECTED','rechazada','2025-10-23 00:00:00','2025-10-24 00:00:00',0,NULL,NULL);
/*!40000 ALTER TABLE `Promocion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PromocionAceptacion`
--

DROP TABLE IF EXISTS `PromocionAceptacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PromocionAceptacion` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `idBeneficiario` int NOT NULL,
  `idPromocion` int NOT NULL,
  `status` enum('OPEN','REDEEMED','CANCELLED') NOT NULL DEFAULT 'OPEN',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `lastRedeemedAt` datetime DEFAULT NULL,
  `is_open` tinyint GENERATED ALWAYS AS ((`status` = _utf8mb4'OPEN')) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_one_open` (`idBeneficiario`,`idPromocion`,`is_open`),
  KEY `idx_pa_ben` (`idBeneficiario`,`created_at`),
  KEY `idx_pa_pro` (`idPromocion`,`created_at`),
  CONSTRAINT `fk_pa_ben` FOREIGN KEY (`idBeneficiario`) REFERENCES `Beneficiario` (`idBeneficiario`) ON DELETE CASCADE,
  CONSTRAINT `fk_pa_pro` FOREIGN KEY (`idPromocion`) REFERENCES `Promocion` (`idPromocion`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PromocionAceptacion`
--

LOCK TABLES `PromocionAceptacion` WRITE;
/*!40000 ALTER TABLE `PromocionAceptacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `PromocionAceptacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PromocionTag`
--

DROP TABLE IF EXISTS `PromocionTag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PromocionTag` (
  `idPromocion` int NOT NULL,
  `idTag` int NOT NULL,
  PRIMARY KEY (`idPromocion`,`idTag`),
  KEY `fk_promociontag_tag` (`idTag`),
  CONSTRAINT `fk_promociontag_promocion` FOREIGN KEY (`idPromocion`) REFERENCES `Promocion` (`idPromocion`) ON DELETE CASCADE,
  CONSTRAINT `fk_promociontag_tag` FOREIGN KEY (`idTag`) REFERENCES `Tag` (`idTag`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PromocionTag`
--

LOCK TABLES `PromocionTag` WRITE;
/*!40000 ALTER TABLE `PromocionTag` DISABLE KEYS */;
INSERT INTO `PromocionTag` VALUES (4,1),(5,3),(6,4),(4,5),(5,6);
/*!40000 ALTER TABLE `PromocionTag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Promocion__bk_before_checks`
--

DROP TABLE IF EXISTS `Promocion__bk_before_checks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Promocion__bk_before_checks` (
  `idPromocion` int NOT NULL DEFAULT '0',
  `idEstablecimiento` int NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `esVigente` tinyint(1) DEFAULT '1',
  `fechaRegistro` datetime DEFAULT CURRENT_TIMESTAMP,
  `imagenURL` text,
  `discountType` enum('PORCENTAJE','MONTO','OTRO') NOT NULL DEFAULT 'PORCENTAJE',
  `discountValue` decimal(10,2) NOT NULL DEFAULT '0.00',
  `limitQuantity` int DEFAULT NULL,
  `unlimited` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('DRAFT','PENDING','APPROVED','REJECTED','PAUSED') NOT NULL DEFAULT 'PENDING',
  `validFrom` datetime DEFAULT NULL,
  `validTo` datetime DEFAULT NULL,
  `redeemedCount` int NOT NULL DEFAULT '0',
  `idSucursal` int DEFAULT NULL,
  `idCategoriaCupon` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Promocion__bk_before_checks`
--

LOCK TABLES `Promocion__bk_before_checks` WRITE;
/*!40000 ALTER TABLE `Promocion__bk_before_checks` DISABLE KEYS */;
INSERT INTO `Promocion__bk_before_checks` VALUES (1,1,'Descuento Estudiantil','20% de descuento en todos los productos al presentar credencial',1,'2025-09-21 15:44:49',NULL,'PORCENTAJE',0.00,NULL,0,'PENDING',NULL,NULL,1,NULL,NULL),(2,2,'2x1 en Entradas','Dos entradas por el precio de uno los miércoles',1,'2025-09-21 15:44:49',NULL,'PORCENTAJE',0.00,NULL,0,'PENDING',NULL,NULL,1,NULL,NULL),(3,3,'Clase Gratis','Una clase gratis al inscribirse en cualquier curso',1,'2025-09-21 15:44:49',NULL,'PORCENTAJE',0.00,NULL,0,'PENDING',NULL,NULL,1,NULL,NULL),(4,12,'20% en snacks','Descuento en línea de caja presentando tu código BJ',1,'2025-10-15 22:37:46',NULL,'PORCENTAJE',20.00,NULL,1,'APPROVED','2025-08-16 00:00:00','2025-12-14 00:00:00',6,6,1),(5,13,'Inscripción a $299','Promoción válida para nuevos socios',1,'2025-10-15 22:37:46',NULL,'MONTO',299.00,NULL,1,'APPROVED','2025-07-17 00:00:00','2025-11-14 00:00:00',3,8,4),(6,14,'2x1 en cuadernos','Llévate 2 por el precio de 1, aplica en marcas participantes',1,'2025-10-15 22:37:46',NULL,'OTRO',0.00,NULL,1,'APPROVED','2025-09-15 00:00:00','2026-01-13 00:00:00',3,9,6);
/*!40000 ALTER TABLE `Promocion__bk_before_checks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Sucursal`
--

DROP TABLE IF EXISTS `Sucursal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Sucursal` (
  `idSucursal` int NOT NULL AUTO_INCREMENT,
  `idEstablecimiento` int NOT NULL,
  `numSucursal` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `latitud` decimal(10,8) DEFAULT NULL,
  `longitud` decimal(11,8) DEFAULT NULL,
  `horaApertura` time NOT NULL,
  `horaCierre` time NOT NULL,
  `fechaRegistro` datetime DEFAULT CURRENT_TIMESTAMP,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`idSucursal`),
  KEY `idx_sucursal_geo` (`latitud`,`longitud`),
  KEY `idx_suc_est_activo` (`idEstablecimiento`,`activo`),
  CONSTRAINT `Sucursal_ibfk_1` FOREIGN KEY (`idEstablecimiento`) REFERENCES `Establecimiento` (`idEstablecimiento`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Sucursal`
--

LOCK TABLES `Sucursal` WRITE;
/*!40000 ALTER TABLE `Sucursal` DISABLE KEYS */;
INSERT INTO `Sucursal` VALUES (1,1,'S001','Sucursal Centro','Av. Principal 123',19.43260770,-99.13320800,'09:00:00','21:00:00','2025-09-21 15:44:48',1),(2,2,'S002','Sucursal Norte','Calle Norte 456',19.44260770,-99.14320800,'10:00:00','20:00:00','2025-09-21 15:44:48',1),(3,3,'S003','Sucursal Sur','Av. Sur 789',19.42260770,-99.12320800,'08:00:00','22:00:00','2025-09-21 15:44:48',0),(4,9,'','Six Flags Ciudad de México','Carr. Picacho-Ajusco Km 1.5, Jardines del Ajusco, Tlalpan, 14219 Ciudad de México, CDMX, México',19.29557620,-99.21076730,'10:00:00','23:59:00','2025-10-15 21:45:57',1),(5,11,'','Cinepolis Luna Park','Av. del Jacal s/n, Centro Urbano, 54740 Cuautitlán Izcalli, Méx., México',19.65737060,-99.21054470,'10:00:00','22:00:00','2025-10-15 22:11:10',1),(6,12,'U001','OXXO CU','Av. Universidad 3000, CDMX',19.33250000,-99.18800000,'07:00:00','23:00:00','2025-10-15 22:37:45',1),(7,12,'U002','OXXO Copilco','Av. Copilco 120, CDMX',19.33890000,-99.17600000,'07:00:00','23:00:00','2025-10-15 22:37:45',1),(8,13,'G001','BodyTech Norte','Calle Norte 123, CDMX',19.45000000,-99.15000000,'06:00:00','22:00:00','2025-10-15 22:37:45',1),(9,14,'L001','Gran Librería Centro','Av. Juárez 45, CDMX',19.43300000,-99.14000000,'10:00:00','20:00:00','2025-10-15 22:37:45',1),(10,1,'','Starbucks TEC CEM','Av Lago de Guadalupe KM 3.5, Margarita Maza de Juárez, 52926 Cdad. López Mateos, Méx., México',19.59326250,-99.22915570,'07:00:00','22:00:00','2025-10-22 07:15:58',1),(11,17,'ATZ-1001','Punto de canje – Galerías Atizapán','Bvd. Manuel Ávila Camacho s/n, Galerías Atizapán, Cdad. López Mateos, Méx.',19.58660000,-99.24750000,'10:00:00','22:00:00','2025-10-23 20:49:51',1),(12,9,'ATZ-1002','Punto de venta autorizado – Galerías Atizapán','Galerías Atizapán, módulo de atención, Cdad. López Mateos, Méx.',19.58660000,-99.24750000,'11:00:00','20:00:00','2025-10-23 20:49:52',1),(13,19,'ATZ-1003','Punto de venta autorizado – Galerías Atizapán','Galerías Atizapán, módulo de atención, Cdad. López Mateos, Méx.',19.58660000,-99.24750000,'11:00:00','20:00:00','2025-10-23 20:49:52',1),(14,20,'ATZ-1004','Tienda San Juan Bosco','Calzada San Mateo 64, San Juan Bosco 1, Cdad. López Mateos, Méx.',19.57300000,-99.25350000,'11:00:00','19:00:00','2025-10-23 20:49:53',1),(15,21,'ATZ-1005','Atención Atizapán Centro','Zona Centro, Cdad. López Mateos, Méx. (citas al 5532384740)',19.56100000,-99.24890000,'10:00:00','18:00:00','2025-10-23 20:49:53',1),(16,22,'ATZ-1006','El HACENDADO – La Condesa','Av. Adolfo Ruiz Cortines 8, La Condesa, 52967 Cdad. López Mateos, Méx.',19.58100000,-99.24000000,'12:00:00','22:00:00','2025-10-23 20:49:53',1),(17,23,'ATZ-1007','Pinche Elote – Jardines','P.º de San Francisco 90, Jardines de Atizapán, 52978 Cdad. López Mateos, Méx.',19.58350000,-99.23670000,'16:00:00','22:30:00','2025-10-23 20:49:54',1),(18,24,'ATZ-1008','BESC – Las Águilas','Águila Real s/n, Las Águilas, 52949 Cdad. López Mateos, Méx.',19.58350000,-99.23670000,'14:00:00','21:00:00','2025-10-23 20:49:54',1),(19,25,'ATZ-1009','Operación a domicilio – Atizapán','Cobertura: Lomas de Atizapán, México Nuevo, Atizapán Centro, Las Alamedas, Jardines (pedido: 5511837264, Jue-Dom)',19.58550000,-99.25500000,'16:00:00','22:00:00','2025-10-23 20:49:54',1),(20,26,'ATZ-1010','Delit – Av. López Mateos','18 Tultitlán Sur, Av Pdte. Adolfo López Mateos, 52977 Cdad. López Mateos, Méx.',19.58100000,-99.24000000,'13:00:00','21:30:00','2025-10-23 20:49:55',1),(21,27,'ATZ-1011','Más Fresa – Lomas de Atizapán','Acolman 21, Lomas de Atizapán, 52977 Cdad. López Mateos, Méx.',19.59040000,-99.25580000,'12:00:00','21:00:00','2025-10-23 20:49:55',1),(22,28,'ATZ-1012','Denta Laser – Jardines','P.º de San Francisco, Jardines de Atizapán, 52978 Cdad. López Mateos, Méx.',19.58450000,-99.23580000,'10:00:00','19:00:00','2025-10-23 20:49:55',1),(23,29,'ATZ-1013','Occhi Carini – Lomas Lindas','Av. Océano Pacífico 181, Lomas Lindas, 52947 Cdad. López Mateos, Méx.',19.60100000,-99.25900000,'11:00:00','20:00:00','2025-10-23 20:49:56',1),(24,30,'ATZ-1014','PsicTeam – Las Alamedas','P.º de las Palomas 3 Local 19, Las Alamedas, 52970 Cdad. López Mateos, Méx.',19.58600000,-99.23450000,'10:00:00','20:00:00','2025-10-23 20:49:56',1),(25,31,'ATZ-1015','3SKEL – Las Alamedas','P.º de las Palomas 3, Las Alamedas, 52970 Cdad. López Mateos, Méx.',19.58640000,-99.23420000,'10:00:00','20:00:00','2025-10-23 20:49:56',1),(26,32,'ATZ-1016','Terapia online – Atizapán','Servicio en línea para Atizapán. Agenda: 5537324888.',19.56300000,-99.25090000,'09:00:00','21:00:00','2025-10-23 20:49:57',1),(27,33,'ATZ-1017','Jötunheim – Lomas de Monte María','C. Monte Maria 56, Lomas de Monte Maria, 52918 Cdad. López Mateos, Méx.',19.60000000,-99.23200000,'06:00:00','22:00:00','2025-10-23 20:49:57',0);
/*!40000 ALTER TABLE `Sucursal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SucursalImagen`
--

DROP TABLE IF EXISTS `SucursalImagen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SucursalImagen` (
  `idImagen` int NOT NULL AUTO_INCREMENT,
  `idSucursal` int NOT NULL,
  `urlImagen` varchar(255) NOT NULL,
  `publicId` varchar(150) NOT NULL,
  `fechaRegistro` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idImagen`),
  KEY `idSucursal` (`idSucursal`),
  CONSTRAINT `SucursalImagen_ibfk_1` FOREIGN KEY (`idSucursal`) REFERENCES `Sucursal` (`idSucursal`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SucursalImagen`
--

LOCK TABLES `SucursalImagen` WRITE;
/*!40000 ALTER TABLE `SucursalImagen` DISABLE KEYS */;
INSERT INTO `SucursalImagen` VALUES (2,4,'https://res.cloudinary.com/daxeygpic/image/upload/v1760564741/sucursales/sucursales_1760564741059_tnt3ve.jpg','sucursales/sucursales_1760564741059_tnt3ve','2025-10-15 21:45:57'),(3,4,'https://res.cloudinary.com/daxeygpic/image/upload/v1760564742/sucursales/sucursales_1760564742593_1khzer.jpg','sucursales/sucursales_1760564742593_1khzer','2025-10-15 21:45:57'),(4,4,'https://res.cloudinary.com/daxeygpic/image/upload/v1760564744/sucursales/sucursales_1760564744198_pbr02.jpg','sucursales/sucursales_1760564744198_pbr02','2025-10-15 21:45:57'),(5,4,'https://res.cloudinary.com/daxeygpic/image/upload/v1760564745/sucursales/sucursales_1760564745823_3beqn4.jpg','sucursales/sucursales_1760564745823_3beqn4','2025-10-15 21:45:57'),(6,5,'https://res.cloudinary.com/daxeygpic/image/upload/v1760566261/sucursales/sucursales_1760566261321_3vna1.jpg','sucursales/sucursales_1760566261321_3vna1','2025-10-15 22:11:11'),(7,5,'https://res.cloudinary.com/daxeygpic/image/upload/v1760566265/sucursales/sucursales_1760566265050_5utvin.jpg','sucursales/sucursales_1760566265050_5utvin','2025-10-15 22:11:11'),(8,10,'https://res.cloudinary.com/daxeygpic/image/upload/v1761117331/sucursales/sucursales_1761117331693_7gecc.png','sucursales/sucursales_1761117331693_7gecc','2025-10-22 07:15:58'),(9,10,'https://res.cloudinary.com/daxeygpic/image/upload/v1761117354/sucursales/sucursales_1761117354031_d1kg0v.png','sucursales/sucursales_1761117354031_d1kg0v','2025-10-22 07:15:58');
/*!40000 ALTER TABLE `SucursalImagen` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Tag`
--

DROP TABLE IF EXISTS `Tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Tag` (
  `idTag` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(60) NOT NULL,
  PRIMARY KEY (`idTag`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Tag`
--

LOCK TABLES `Tag` WRITE;
/*!40000 ALTER TABLE `Tag` DISABLE KEYS */;
INSERT INTO `Tag` VALUES (4,'2x1'),(1,'estudiantes'),(3,'fin_de_semana'),(2,'limitado'),(5,'nueva'),(6,'salud');
/*!40000 ALTER TABLE `Tag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `v_coupon_overview`
--

DROP TABLE IF EXISTS `v_coupon_overview`;
/*!50001 DROP VIEW IF EXISTS `v_coupon_overview`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_coupon_overview` AS SELECT 
 1 AS `idPromocion`,
 1 AS `idEstablecimiento`,
 1 AS `establecimiento`,
 1 AS `titulo`,
 1 AS `status`,
 1 AS `validFrom`,
 1 AS `validTo`,
 1 AS `discountType`,
 1 AS `discountValue`,
 1 AS `limitQuantity`,
 1 AS `unlimited`,
 1 AS `redeemedCount`,
 1 AS `idSucursal`,
 1 AS `sucursalNombre`,
 1 AS `latitud`,
 1 AS `longitud`,
 1 AS `categoriaCupon`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_geo_grid`
--

DROP TABLE IF EXISTS `v_geo_grid`;
/*!50001 DROP VIEW IF EXISTS `v_geo_grid`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_geo_grid` AS SELECT 
 1 AS `cell_lat`,
 1 AS `cell_lng`,
 1 AS `branches`,
 1 AS `coupons`,
 1 AS `redemptions`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_users`
--

DROP TABLE IF EXISTS `v_users`;
/*!50001 DROP VIEW IF EXISTS `v_users`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_users` AS SELECT 
 1 AS `id`,
 1 AS `email`,
 1 AS `displayName`,
 1 AS `role`,
 1 AS `fechaRegistro`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `v_coupon_overview`
--

/*!50001 DROP VIEW IF EXISTS `v_coupon_overview`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_coupon_overview` AS select `p`.`idPromocion` AS `idPromocion`,`e`.`idEstablecimiento` AS `idEstablecimiento`,`e`.`nombre` AS `establecimiento`,`p`.`titulo` AS `titulo`,`p`.`status` AS `status`,`p`.`validFrom` AS `validFrom`,`p`.`validTo` AS `validTo`,`p`.`discountType` AS `discountType`,`p`.`discountValue` AS `discountValue`,`p`.`limitQuantity` AS `limitQuantity`,`p`.`unlimited` AS `unlimited`,`p`.`redeemedCount` AS `redeemedCount`,`s`.`idSucursal` AS `idSucursal`,`s`.`nombre` AS `sucursalNombre`,`s`.`latitud` AS `latitud`,`s`.`longitud` AS `longitud`,`cc`.`nombre` AS `categoriaCupon` from (((`Promocion` `p` join `Establecimiento` `e` on((`e`.`idEstablecimiento` = `p`.`idEstablecimiento`))) left join `Sucursal` `s` on((`s`.`idSucursal` = `p`.`idSucursal`))) left join `CategoriaCupon` `cc` on((`cc`.`idCategoriaCupon` = `p`.`idCategoriaCupon`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_geo_grid`
--

/*!50001 DROP VIEW IF EXISTS `v_geo_grid`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_geo_grid` AS select floor((`s`.`latitud` / 0.01)) AS `cell_lat`,floor((`s`.`longitud` / 0.01)) AS `cell_lng`,count(distinct `s`.`idSucursal`) AS `branches`,count(distinct `p`.`idPromocion`) AS `coupons`,sum(`p`.`redeemedCount`) AS `redemptions` from (`Sucursal` `s` left join `Promocion` `p` on(((`p`.`idSucursal` = `s`.`idSucursal`) and (`p`.`status` = 'APPROVED')))) group by `cell_lat`,`cell_lng` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_users`
--

/*!50001 DROP VIEW IF EXISTS `v_users`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_users` AS select `Administrador`.`idAdministrador` AS `id`,`Administrador`.`email` AS `email`,`Administrador`.`nombreUsuario` AS `displayName`,'ADMIN' AS `role`,`Administrador`.`fechaRegistro` AS `fechaRegistro` from `Administrador` union all select `Dueno`.`idDueno` AS `id`,`Dueno`.`email` AS `email`,`Dueno`.`nombreUsuario` AS `displayName`,'DUENO' AS `role`,`Dueno`.`fechaRegistro` AS `fechaRegistro` from `Dueno` union all select `Beneficiario`.`idBeneficiario` AS `id`,`Beneficiario`.`email` AS `email`,`Beneficiario`.`primerNombre` AS `displayName`,'BENEFICIARIO' AS `role`,`Beneficiario`.`fechaRegistro` AS `fechaRegistro` from `Beneficiario` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-25 20:13:57
