# Beneficio Joven - Backend API

Backend serverless para la plataforma Beneficio Joven, construido con Node.js, AWS Lambda y Serverless Framework.

## 📋 Tabla de Contenidos

- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Tabla de Endpoints](#tabla-de-endpoints)
- [Documentación de Endpoints](#documentación-de-endpoints)
- [Seguridad Implementada](#seguridad-implementada)
- [Setup y Configuración](#setup-y-configuración)
- [Deploy a AWS](#deploy-a-aws)
- [Variables de Entorno](#variables-de-entorno)

---

## Arquitectura del Sistema

### Stack Tecnológico

- **Runtime**: Node.js 18.x
- **Framework**: Serverless Framework 4.x
- **Base de Datos**: Amazon Aurora MySQL (RDS) - `us-east-2`
- **Almacenamiento de Imágenes**: Cloudinary
- **Servicios AWS**:
  - AWS Lambda (funciones serverless)
  - API Gateway (endpoints REST)
  - CloudWatch (logs y monitoreo)
  - IAM (gestión de permisos)

### Diagrama de Arquitectura
```
Cliente (Android/React/Web)
        ↓
   API Gateway (us-east-2)
        ↓
    Lambda Functions
        ├─→ Aurora RDS MySQL
        └─→ Cloudinary (imágenes)
```

### Flujo de Autenticación

1. Usuario envía credenciales (email/password)
2. API Gateway enruta a Lambda
3. Lambda valida datos con Joi
4. Rate limiting verifica intentos
5. bcrypt compara hash de contraseña
6. JWT token generado y retornado (expira en 24h)
7. Cliente usa token en requests subsecuentes
8. Middleware `verifyRole` valida permisos por rol

---

## Estructura del Proyecto
```
Beneficio_Joven_Backend/
├── src/
│   ├── config/
│   │   ├── database.js                      # Configuración de conexión a RDS
│   │   └── security.js                      # Constantes de seguridad
│   ├── middleware/
│   │   └── auth.js                          # Middleware de autenticación JWT y roles
│   ├── handlers/
│   │   ├── auth/
│   │   │   ├── login.js                     # Login de usuarios
│   │   │   ├── register-beneficiario.js     # Registro de beneficiarios
│   │   │   ├── register-dueno.js            # Registro de dueños
│   │   │   └── register-admin.js            # Registro de administradores
│   │   ├── admin/
│   │   │   ├── dashboard-stats.js           # Estadísticas del dashboard
│   │   │   ├── list-duenos.js               # Listar dueños
│   │   │   ├── list-sucursales.js           # Listar sucursales
│   │   │   ├── create-establecimiento.js    # Crear establecimiento
│   │   │   ├── create-sucursal.js           # Crear sucursal
│   │   │   ├── toggle-dueno-status.js       # Activar/Desactivar dueño
│   │   │   ├── update-dueno.js              # Actualizar dueño
│   │   │   ├── toggle-establecimiento-status.js  # Activar/Desactivar sucursal
│   │   │   └── admin-reports.js             # Reportes admin
│   │   ├── common/
│   │   │   ├── list-categorias.js           # Listar categorías
│   │   │   ├── list-establecimientos.js     # Listar establecimientos
│   │   │   └── update-establecimiento.js    # Actualizar establecimiento
│   │   ├── upload/
│   │   │   └── upload-image.js              # Subir imágenes a Cloudinary
│   │   └── test.js                          # Endpoint de prueba
│   └── utils/
│       └── rateLimit.js                     # Control de rate limiting
├── scripts/
│   └── test-connection.js                    # Script de prueba de BD
├── .env                                      # Variables de entorno (NO subir a Git)
├── .gitignore
├── package.json
├── serverless.yml                            # Configuración de Serverless Framework
└── README.md
```

---

## Tabla de Endpoints

### Base URL
```
https://fgdmbhrw5b.execute-api.us-east-2.amazonaws.com/dev
```

### 📊 Resumen de Endpoints

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| **GET** | `/test` | Prueba de conexión | ❌ No | Público |
| **POST** | `/auth/login` | Login de usuario | ❌ No | Público |
| **POST** | `/auth/register/beneficiario` | Registro de beneficiario | ❌ No | Público |
| **POST** | `/auth/register/dueno` | Registro de dueño | ✅ Sí | Admin |
| **POST** | `/auth/register/admin` | Registro de administrador | ✅ Sí | Admin |
| **GET** | `/admin/dashboard/stats` | Estadísticas del dashboard | ✅ Sí | Admin |
| **GET** | `/admin/duenos` | Listar dueños | ✅ Sí | Admin |
| **PUT** | `/admin/duenos/{id}` | Actualizar dueño | ✅ Sí | Admin |
| **PATCH** | `/admin/duenos/{id}/toggle-status` | Activar/Desactivar dueño | ✅ Sí | Admin |
| **GET** | `/admin/get/sucursales` | Listar sucursales | ✅ Sí | Admin |
| **POST** | `/admin/post/sucursales` | Crear sucursal | ✅ Sí | Admin |
| **PATCH** | `/admin/sucursales/{id}/toggle-status` | Activar/Desactivar sucursal | ✅ Sí | Admin |
| **GET** | `/admin/establecimiento` | Listar establecimientos (admin) | ✅ Sí | Admin |
| **POST** | `/admin/establecimiento` | Crear establecimiento | ✅ Sí | Admin |
| **GET** | `/admin/reports` | Reportes administrativos | ✅ Sí | Admin |
| **GET** | `/common/categorias` | Listar categorías | ✅ Sí | Todos |
| **PUT** | `/common/establecimiento/{id}` | Actualizar establecimiento | ✅ Sí | Admin, Dueño |
| **POST** | `/upload-image` | Subir imagen a Cloudinary | ✅ Sí | Admin, Dueño, Beneficiario |

---

## Documentación de Endpoints

### 🔐 Autenticación

#### POST /auth/login
Autentica un usuario (beneficiario, dueño o administrador).

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "ContraSegura123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "role": "beneficiario"
  }
}
```

---

#### POST /auth/register/beneficiario
Registra un nuevo beneficiario.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "nombreUsuario": "juanito123",
  "password": "ContraSegura123",
  "primerNombre": "Juan",
  "segundoNombre": "Pablo",
  "apellidoPaterno": "González",
  "apellidoMaterno": "López",
  "curp": "GOLJ000101HDFLPN01",
  "fechaNacimiento": "2000-01-01",
  "celular": "5512345678",
  "sexo": "H"
}
```

---

#### POST /auth/register/dueno
Registra un nuevo dueño de establecimiento.

**Headers:** `Authorization: Bearer {admin-token}`

**Request Body:**
```json
{
  "email": "dueno@comercio.com",
  "nombreUsuario": "dueno_comercio",
  "password": "ContraSegura1",
  "primerNombre": "Carlos",
  "apellidoPaterno": "Ramírez",
  "celular": "5587654321"
}
```

---

#### POST /auth/register/admin
Registra un nuevo administrador.

**Headers:** `Authorization: Bearer {admin-token}`

**Request Body:**
```json
{
  "email": "admin@beneficiojoven.com",
  "nombreUsuario": "admin_principal",
  "password": "AdminSeguro123",
  "adminMasterKey": "DGjvwC6zgIaOA4xnrmbd0VGbNuDoJnzLhwO69gyNMxMhgS3tFK"
}
```

---

### 📊 Admin - Dashboard

#### GET /admin/dashboard/stats
Obtiene estadísticas generales del sistema.

**Headers:** `Authorization: Bearer {admin-token}`

**Response (200):** Estadísticas de beneficiarios, dueños, sucursales y establecimientos.

---

#### GET /admin/reports
Genera reportes administrativos.

**Headers:** `Authorization: Bearer {admin-token}`

---

### 👥 Admin - Gestión de Dueños

#### GET /admin/duenos
Lista todos los dueños registrados.

**Headers:** `Authorization: Bearer {admin-token}`

---

#### PUT /admin/duenos/{id}
Actualiza información de un dueño.

**Headers:** `Authorization: Bearer {admin-token}`

---

#### PATCH /admin/duenos/{id}/toggle-status
Activa o desactiva un dueño.

**Headers:** `Authorization: Bearer {admin-token}`

---

### 🏢 Admin - Gestión de Establecimientos

#### GET /admin/establecimiento
Lista todos los establecimientos (vista admin).

**Headers:** `Authorization: Bearer {admin-token}`

---

#### POST /admin/establecimiento
Crea un nuevo establecimiento.

**Headers:** `Authorization: Bearer {admin-token}`

**Request Body:**
```json
{
  "nombre": "Burger King",
  "logoURL": "https://res.cloudinary.com/daxeygpic/image/upload/...",
  "categorias": [1, 2]
}
```

---

### 🏪 Admin - Gestión de Sucursales

#### GET /admin/get/sucursales
Lista todas las sucursales.

**Headers:** `Authorization: Bearer {admin-token}`

---

#### POST /admin/post/sucursales
Crea una nueva sucursal.

**Headers:** `Authorization: Bearer {admin-token}`

**Request Body:**
```json
{
  "idEstablecimiento": 1,
  "nombre": "Starbucks Lindavista",
  "direccion": "Av. Insurgentes Norte 1234, Lindavista, CDMX",
  "latitud": 19.4885,
  "longitud": -99.1273,
  "horaApertura": "08:00",
  "horaCierre": "22:00"
}
```

**Nota:** El `numSucursal` se genera automáticamente (S001, S002, S003...).

---

#### PATCH /admin/sucursales/{id}/toggle-status
Activa o desactiva una sucursal.

**Headers:** `Authorization: Bearer {admin-token}`

---

### 🌐 Common - Endpoints Compartidos

#### GET /common/categorias
Lista todas las categorías disponibles.

**Headers:** `Authorization: Bearer {token}`

**Roles permitidos:** beneficiario, dueno, administrador

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "idCategoria": 1, "nombreCategoria": "Cafeterías" },
    { "idCategoria": 2, "nombreCategoria": "Restaurantes" },
    { "idCategoria": 3, "nombreCategoria": "Gimnasios" }
  ]
}
```

---

#### PUT /common/establecimiento/{id}
Actualiza un establecimiento existente.

**Headers:** `Authorization: Bearer {token}`

**Roles permitidos:** administrador, dueno

---

### 📤 Upload de Imágenes

#### POST /upload-image
Sube una imagen a Cloudinary.

**Headers:** `Authorization: Bearer {token}`

**Roles permitidos:** administrador, dueno, beneficiario

**Request Body:**
```json
{
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA...",
  "folder": "logos"
}
```

**Carpetas permitidas:**
- `logos` (admin, dueno) - Logos de establecimientos (5MB max)
- `productos` (admin, dueno) - Imágenes de productos (3MB max)
- `beneficiarios` (admin, beneficiario) - Fotos de perfil (2MB max)
- `sucursales` (admin, dueno) - Fotos de sucursales (5MB max)
- `promociones` (admin, dueno) - Banners promocionales (3MB max)

**Response (200):**
```json
{
  "success": true,
  "logoURL": "https://res.cloudinary.com/daxeygpic/image/upload/v123/logos/abc.png",
  "publicId": "logos/abc123",
  "folder": "logos"
}
```

---

### 🧪 Testing

#### GET /test
Verifica conexión a base de datos.

**Response (200):**
```json
{
  "success": true,
  "message": "API funcionando correctamente"
}
```

---

## Seguridad Implementada

### 1. Validación de Datos (Joi)
- Validación de tipos de datos
- Validación de formatos (email, CURP, teléfono)
- Prevención de SQL injection

### 2. Rate Limiting
- Máximo 5 intentos de login por IP
- Bloqueo de 15 minutos después de exceder límite
- Protección contra ataques de fuerza bruta

### 3. Hashing de Contraseñas (bcrypt)
- 12 rounds de hashing
- Contraseñas nunca almacenadas en texto plano
- Comparación segura con timing attack prevention

### 4. JWT Tokens
- Tokens firmados con HS256
- Expiración de 24 horas
- Payload incluye: id, email, role

### 5. Control de Acceso por Roles
- `beneficiario` - Acceso a endpoints públicos y perfil
- `dueno` - Gestión de sus establecimientos y sucursales
- `administrador` - Acceso completo al sistema

### 6. CORS
- Habilitado para todos los orígenes (desarrollo)
- Configurar dominios específicos en producción

### 7. Validación de Imágenes
- Formatos permitidos: PNG, JPG, JPEG, GIF, WEBP
- Tamaños máximos por tipo de carpeta
- Optimización automática con Cloudinary

---

## Setup y Configuración

### Prerequisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- Cuenta de AWS
- Cuenta de Cloudinary

### Instalación

#### 1. Clonar el repositorio
```bash
git clone https://github.com/MasterJuan579/Beneficio_Joven_Backend.git
cd Beneficio_Joven_Backend
```

#### 2. Instalar dependencias
```bash
npm install
npm install -g serverless
```

#### 3. Configurar credenciales de AWS

**Windows (PowerShell):**
```powershell
mkdir $HOME\.aws -Force
@"
[default]
aws_access_key_id = XXXXXXXXXXXXXXXXXXXX
aws_secret_access_key = XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
region = us-east-2
"@ | Out-File -FilePath $HOME\.aws\credentials -Encoding ASCII
```

**Mac/Linux:**
```bash
mkdir -p ~/.aws
cat > ~/.aws/credentials << 'EOF'
[default]
aws_access_key_id = AKIAZ773METU7WGLT55H
aws_secret_access_key = 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
region = us-east-2
EOF
```

**Verificar:**
```bash
cat $HOME\.aws\credentials
```

#### 4. Crear archivo `.env`

En la raíz del proyecto:
```env
# Base de Datos RDS
DB_HOST=beneficio-joven-db.c3r6kmmav76y.us-east-2.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=BeneficioJoven2024
DB_NAME=BeneficioJoven

# JWT Secret
JWT_SECRET=mi-super-secreto-jwt-key-2024-beneficio-joven

# Admin Master Key
ADMIN_MASTER_KEY=DGjvwC6zgIaOA4xnrmbd0VGbNuDoJnzLhwO69gyNMxMhgS3tFK

# Cloudinary
CLOUDINARY_CLOUD_NAME=XXXXXXXX
CLOUDINARY_API_KEY=XXXXXXXXXXXXX
CLOUDINARY_API_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

⚠️ **IMPORTANTE:** El archivo `.env` NO debe subirse a Git (ya está en `.gitignore`)

---

## Deploy a AWS

### Deploy completo
```bash
serverless deploy
```

**Tiempo estimado:** 2-5 minutos

**Salida esperada:**
```
✔ Service deployed to stack beneficio-joven-api-dev

endpoints:
  GET - https://fgdmbhrw5b.execute-api.us-east-2.amazonaws.com/dev/test
  POST - https://fgdmbhrw5b.execute-api.us-east-2.amazonaws.com/dev/auth/login
  ...

functions:
  test: beneficio-joven-api-dev-test
  login: beneficio-joven-api-dev-login
  ...
```

### Ver información del deployment
```bash
serverless info
```

### Ver logs en tiempo real
```bash
# Logs de una función específica
serverless logs -f login -t

# Ver en AWS Console
# CloudWatch → Log Groups → /aws/lambda/beneficio-joven-api-dev-{function}
```

### Deploy de función individual (más rápido)
```bash
serverless deploy function -f login
```

### Probar localmente
```bash
serverless offline
```

Servidor local: `http://localhost:3000`

### Eliminar deployment
```bash
serverless remove
```

---

## Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DB_HOST` | Host de la base de datos RDS | `beneficio-joven-db.c3r6kmmav76y.us-east-2.rds.amazonaws.com` |
| `DB_USER` | Usuario de la base de datos | `admin` |
| `DB_PASSWORD` | Contraseña de la base de datos | `XXXXXXXXXXX` |
| `DB_NAME` | Nombre de la base de datos | `BeneficioJoven` |
| `JWT_SECRET` | Secreto para firmar tokens JWT | (string aleatorio largo) |
| `ADMIN_MASTER_KEY` | Llave maestra para crear admins | (string secreto) |
| `CLOUDINARY_CLOUD_NAME` | Nombre del cloud de Cloudinary | `daxeygpic` |
| `CLOUDINARY_API_KEY` | API Key de Cloudinary | `646259726368626` |
| `CLOUDINARY_API_SECRET` | API Secret de Cloudinary | (secreto de Cloudinary) |

---

## Dependencias

### Producción
```json
{
  "bcryptjs": "^2.4.3",
  "cloudinary": "^2.0.0",
  "dotenv": "^16.0.0",
  "joi": "^17.0.0",
  "jsonwebtoken": "^9.0.0",
  "mysql2": "^3.0.0"
}
```

### Desarrollo
```json
{
  "serverless": "^4.0.0",
  "serverless-offline": "^13.0.0"
}
```


---

## Licencia

ISC

---

**Proyecto desarrollado por el equipo de Beneficio Joven** 🚀