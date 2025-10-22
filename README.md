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
- **Base de Datos**: Amazon Aurora MySQL (RDS) - `us-east-1`
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
6. JWT token generado y retornado (expira en 30 minutos)
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
│   │   │   ├── list-categorias.js           # Listar categorías (admin)
│   │   │   ├── create-establecimiento.js    # Crear establecimiento
│   │   │   ├── create-sucursal.js           # Crear sucursal
│   │   │   ├── create-beneficiario.js       # Crear beneficiario
│   │   │   ├── toggle-dueno-status.js       # Activar/Desactivar dueño
│   │   │   ├── toggle-beneficiario-status.js # Activar/Desactivar beneficiario
│   │   │   ├── update-dueno.js              # Actualizar dueño
│   │   │   ├── update-sucursal.js           # Actualizar sucursal
│   │   │   ├── toggle-establecimiento-status.js  # Activar/Desactivar sucursal
│   │   │   ├── import-beneficiarios.js      # Importación masiva de beneficiarios
│   │   │   ├── admin-reports.js             # Reportes admin avanzados
│   │   │   ├── admin-auditoria.js           # Sistema de auditoría
│   │   │   ├── admin-beneficiarios.js       # Gestión de beneficiarios
│   │   │   ├── admin-moderacion.js          # Sistema de moderación
│   │   │   └── admin-promociones.js         # Gestión de promociones
│   │   ├── common/
│   │   │   ├── list-categorias.js           # Listar categorías (todos)
│   │   │   ├── list-establecimientos.js     # Listar establecimientos
│   │   │   ├── list-sucursales.js           # Listar sucursales
│   │   │   ├── get-sucursal-by-id.js        # Obtener sucursal por ID
│   │   │   └── update-establecimiento.js    # Actualizar establecimiento
│   │   ├── mobile/
│   │   │   ├── list-categorias.js           # Listar categorías (app móvil)
│   │   │   ├── list-establecimientos.js     # Listar establecimientos (app móvil)
│   │   │   └── ubicacion-sucursal.js        # Obtener ubicación de sucursales
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
| **GET** | `/common/get/sucursales` | Listar sucursales | ✅ Sí | Admin, Dueño |
| **POST** | `/admin/post/sucursales` | Crear sucursal | ✅ Sí | Admin, Dueño |
| **PATCH** | `/admin/sucursales/{id}/toggle-status` | Activar/Desactivar sucursal | ✅ Sí | Admin |
| **GET** | `/admin/establecimiento` | Listar establecimientos | ✅ Sí | Admin, Dueño, Beneficiario |
| **POST** | `/admin/establecimiento` | Crear establecimiento | ✅ Sí | Admin |
| **GET** | `/admin/reports` | Reportes administrativos | ✅ Sí | Admin |
| **GET** | `/common/categorias` | Listar categorías | ✅ Sí | Todos |
| **GET** | `/mobile/categorias` | Listar categorías (app móvil) | ✅ Sí | Beneficiario, Dueño, Admin |
| **GET** | `/mobile/establecimientos` | Listar establecimientos (app móvil) | ✅ Sí | Beneficiario, Dueño, Admin |
| **GET** | `/mobile/ubicacion-sucursal` | Ubicación de sucursales | ✅ Sí | Beneficiario, Dueño, Admin |
| **PUT** | `/common/establecimiento/{id}` | Actualizar establecimiento | ✅ Sí | Admin, Dueño |
| **POST** | `/upload-image` | Subir imagen a Cloudinary | ✅ Sí | Admin, Dueño, Beneficiario |
| **POST** | `/admin/create-beneficiario` | Crear beneficiario (admin) | ✅ Sí | Admin |
| **POST** | `/admin/import-beneficiarios` | Importación masiva de beneficiarios | ✅ Sí | Admin |
| **GET** | `/admin/beneficiarios` | Listar beneficiarios | ✅ Sí | Admin |
| **PATCH** | `/admin/beneficiarios/{id}/toggle-status` | Activar/Desactivar beneficiario | ✅ Sí | Admin |
| **GET** | `/admin/auditoria` | Ver eventos de auditoría | ✅ Sí | Admin, Moderador |
| **GET** | `/admin/moderacion/queue` | Ver cola de moderación | ✅ Sí | Admin, Moderador |
| **GET** | `/admin/moderacion/rules` | Ver reglas de moderación | ✅ Sí | Admin, Moderador |
| **GET** | `/admin/promociones` | Listar promociones | ✅ Sí | Admin, Moderador |

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
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "role": "beneficiario",
    "nombre": "Juan González",
    "folio": "BJ12345678"
  }
}
```

**Notas:**
- El token expira en 30 minutos
- Rate limiting: 20 intentos por IP cada 15 minutos
- Los usuarios inactivos no pueden iniciar sesión

---

#### POST /auth/register/beneficiario
Registra un nuevo beneficiario.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
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

**Validaciones:**
- Password: mínimo 8 caracteres, debe contener mayúsculas, minúsculas y números
- CURP: exactamente 18 caracteres
- Celular: exactamente 10 dígitos
- Sexo: 'H' o 'M'

---

#### POST /auth/register/dueno
Registra un nuevo dueño de establecimiento.

**Headers:** `Authorization: Bearer {admin-token}`

**Request Body:**
```json
{
  "email": "dueno@comercio.com",
  "nombreUsuario": "dueno_comercio",
  "password": "ContraSegura1"
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
  "masterKey": "DGjvwC6zgIaOA4xnrmbd0VGbNuDoJnzLhwO69gyNMxMhgS3tFK"
}
```

---

### 📊 Admin - Dashboard

#### GET /admin/dashboard/stats
Obtiene estadísticas generales del sistema.

**Headers:** `Authorization: Bearer {admin-token}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "beneficiariosRegistrados": 150,
    "comerciosAfiliados": 25,
    "descuentosDadosAlta": 45
  }
}
```

---

#### GET /admin/reports
Genera reportes administrativos completos con KPIs, series temporales y análisis.

**Headers:** `Authorization: Bearer {admin-token}`

**Query Parameters:**
- `from` (opcional): Fecha inicio YYYY-MM-DD
- `to` (opcional): Fecha fin YYYY-MM-DD
- `debug=1` (opcional): Incluir información de debug

**Response (200):**
```json
{
  "success": true,
  "data": {
    "kpis": {
      "beneficiarios": { "total": 150, "nuevos30d": 20 },
      "comercios": { "total": 25, "activos": 22, "inactivos": 3 },
      "promociones": { "total": 45, "aprobadas": 40, "vigentes": 30 },
      "slaModeracion": { "sla_media_min": 15.5, "pendientes": 5 }
    },
    "series": {
      "aplicacionesPorMes": [...],
      "topEstablecimientos": [...],
      "embudoConversion": [...],
      "geoCobertura": [...]
    },
    "auditoria": [...],
    "filters": { "from": "2025-01-01", "to": "2025-12-31" }
  }
}
```

---

### 👥 Admin - Gestión de Beneficiarios

#### GET /admin/beneficiarios
Lista beneficiarios con filtros avanzados.

**Headers:** `Authorization: Bearer {admin-token}`

**Query Parameters:**
- `query`: Búsqueda por nombre, email, CURP o folio
- `showInactive`: '1' o 'true' para incluir inactivos
- `limit`: Máximo 500 (default: 200)
- `offset`: Paginación (default: 0)
- `sort`: 'fechaRegistro', 'primerNombre', 'email', etc.
- `dir`: 'asc' o 'desc' (default: 'desc')

---

#### POST /admin/create-beneficiario
Crea un nuevo beneficiario desde el panel admin.

**Headers:** `Authorization: Bearer {admin-token}`

**Request Body:**
```json
{
  "primerNombre": "María",
  "segundoNombre": "Elena",
  "apellidoPaterno": "Rodríguez",
  "apellidoMaterno": "Pérez",
  "curp": "ROPM950515MDFDRR01",
  "email": "maria@ejemplo.com",
  "celular": "5512345678",
  "fechaNacimiento": "1995-05-15",
  "sexo": "M",
  "folio": "BJ12345678",
  "password": "TempPass123"
}
```

---

#### POST /admin/import-beneficiarios
Importación masiva de beneficiarios desde CSV/Excel.

**Headers:** `Authorization: Bearer {admin-token}`

**Request Body:**
```json
{
  "rows": [
    {
      "primerNombre": "Juan",
      "apellidoPaterno": "García",
      "apellidoMaterno": "López",
      "curp": "GALJ000101HDFLPN01",
      "email": "juan@ejemplo.com",
      "celular": "5512345678",
      "fechaNacimiento": "2000-01-01",
      "sexo": "H"
    }
  ],
  "commit": false
}
```

**Notas:**
- `commit: false` hace un preview sin insertar
- `commit: true` ejecuta la importación
- Detecta duplicados por email, CURP y folio

---

### 👥 Admin - Gestión de Dueños

#### GET /admin/duenos
Lista todos los dueños registrados con la cantidad de establecimientos.

**Headers:** `Authorization: Bearer {admin-token}`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "idDueno": 1,
      "email": "dueno@comercio.com",
      "nombreUsuario": "dueno_comercio",
      "fechaRegistro": "2025-01-15T10:30:00.000Z",
      "activo": true,
      "cantidadEstablecimientos": 3
    }
  ],
  "total": 10
}
```

---

#### PUT /admin/duenos/{id}
Actualiza información de un dueño.

**Headers:** `Authorization: Bearer {admin-token}`

**Request Body:**
```json
{
  "email": "nuevo@email.com",
  "nombreUsuario": "nuevo_usuario"
}
```

---

#### PATCH /admin/duenos/{id}/toggle-status
Activa o desactiva un dueño.

**Headers:** `Authorization: Bearer {admin-token}`

**Response (200):**
```json
{
  "success": true,
  "message": "Estado actualizado correctamente",
  "data": {
    "idDueno": 1,
    "activo": false
  }
}
```

---

### 🏢 Admin - Gestión de Establecimientos

#### GET /admin/establecimiento
Lista todos los establecimientos (vista admin).

**Headers:** `Authorization: Bearer {admin-token}`

**Response (200):**
```json
{
  "success": true,
  "message": "Establecimientos obtenidos correctamente",
  "total": 25,
  "data": [
    {
      "idEstablecimiento": 1,
      "nombreEstablecimiento": "Burger King",
      "categoria": "Restaurantes, Comida Rápida",
      "logoURL": "https://res.cloudinary.com/...",
      "activo": true,
      "idDueno": 5,
      "nombreDueno": "dueno_comercio",
      "correoDueno": "dueno@comercio.com",
      "fechaRegistro": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

---

#### POST /admin/establecimiento
Crea un nuevo establecimiento y lo asigna a un dueño.

**Headers:** `Authorization: Bearer {admin-token}`

**Request Body:**
```json
{
  "nombre": "Burger King",
  "logoURL": "https://res.cloudinary.com/daxeygpic/image/upload/...",
  "idCategoria": 2,
  "idDueno": 5
}
```

**Validaciones:**
- Verifica que el establecimiento no exista previamente
- Valida que la categoría exista
- Verifica que el dueño exista y esté activo
- Crea automáticamente la relación en `DuenoEstablecimiento`

---

### 🏪 Admin - Gestión de Sucursales

#### GET /common/get/sucursales
Lista todas las sucursales con imágenes.

**Headers:** `Authorization: Bearer {admin-token}` o `Bearer {dueno-token}`

**Response (200):**
```json
{
  "success": true,
  "message": "Sucursales obtenidas correctamente",
  "total": 50,
  "data": [
    {
      "idSucursal": 1,
      "nombreSucursal": "Starbucks Lindavista",
      "direccion": "Av. Insurgentes Norte 1234",
      "latitud": 19.4885,
      "longitud": -99.1273,
      "horaApertura": "08:00",
      "horaCierre": "22:00",
      "activo": true,
      "fechaRegistro": "2025-01-15T10:30:00.000Z",
      "idEstablecimiento": 1,
      "nombreEstablecimiento": "Starbucks",
      "categoria": "Cafeterías",
      "imagenes": [
        "https://res.cloudinary.com/...",
        "https://res.cloudinary.com/..."
      ]
    }
  ]
}
```

---

#### POST /admin/post/sucursales
Crea una nueva sucursal con hasta 5 imágenes.

**Headers:** `Authorization: Bearer {admin-token}` o `Bearer {dueno-token}`

**Request Body:**
```json
{
  "idEstablecimiento": 1,
  "nombre": "Starbucks Lindavista",
  "direccion": "Av. Insurgentes Norte 1234, Lindavista, CDMX",
  "latitud": 19.4885,
  "longitud": -99.1273,
  "horaApertura": "08:00",
  "horaCierre": "22:00",
  "imagenes": [
    {
      "url": "https://res.cloudinary.com/...",
      "publicId": "sucursales/abc123"
    }
  ]
}
```

**Validaciones:**
- Máximo 5 imágenes
- Horarios válidos (HH:mm)
- Los dueños solo pueden crear sucursales de sus establecimientos

---

#### GET /common/sucursal/{id}
Obtiene detalles completos de una sucursal específica.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "idSucursal": 1,
    "nombreSucursal": "Starbucks Lindavista",
    "direccion": "Av. Insurgentes Norte 1234",
    "latitud": 19.4885,
    "longitud": -99.1273,
    "horaApertura": "08:00",
    "horaCierre": "22:00",
    "activo": true,
    "nombreEstablecimiento": "Starbucks",
    "categoria": "Cafeterías",
    "imagenes": [
      {
        "idImagen": 1,
        "url": "https://res.cloudinary.com/...",
        "publicId": "sucursales/abc123",
        "fechaRegistro": "2025-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

#### PUT /admin/sucursales/{id}
Actualiza información de una sucursal incluyendo imágenes.

**Headers:** `Authorization: Bearer {admin-token}` o `Bearer {dueno-token}`

**Request Body:**
```json
{
  "nombre": "Starbucks Insurgentes (Actualizado)",
  "direccion": "Nueva dirección",
  "latitud": 19.4900,
  "longitud": -99.1280,
  "horaApertura": "07:00",
  "horaCierre": "23:00",
  "imagenes": [
    {
      "url": "https://res.cloudinary.com/...",
      "publicId": "sucursales/new123"
    }
  ]
}
```

**Notas:**
- Actualiza selectivamente solo los campos enviados
- Gestión inteligente de imágenes: elimina las no incluidas, conserva las existentes, añade nuevas
- Elimina imágenes antiguas de Cloudinary automáticamente

---

#### PATCH /admin/sucursales/{id}/toggle-status
Activa o desactiva una sucursal.

**Headers:** `Authorization: Bearer {admin-token}`

---

### 🔍 Admin - Sistema de Auditoría

#### GET /admin/auditoria
Obtiene eventos de auditoría del sistema.

**Headers:** `Authorization: Bearer {admin-token}`

**Query Parameters:**
- `limit`: Máximo 500 (default: 100)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "actorUser": "admin@ejemplo.com",
      "actorRole": "ADMIN",
      "action": "CREATE",
      "entityType": "USUARIO",
      "entityId": 123,
      "created_at": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### 🛡️ Admin - Sistema de Moderación

#### GET /admin/moderacion/queue
Ver cola de moderación de contenido.

**Headers:** `Authorization: Bearer {admin-token}` o `Bearer {moderador-token}`

**Query Parameters:**
- `status`: 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'

---

#### GET /admin/moderacion/rules
Ver reglas de moderación por establecimiento.

**Headers:** `Authorization: Bearer {admin-token}` o `Bearer {moderador-token}`

---

### 🎫 Admin - Gestión de Promociones

#### GET /admin/promociones
Lista promociones con filtros avanzados.

**Headers:** `Authorization: Bearer {admin-token}` o `Bearer {moderador-token}`

**Query Parameters:**
- `status`: 'DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PAUSED'
- `idEstablecimiento`: Filtrar por establecimiento
- `idSucursal`: Filtrar por sucursal
- `idCategoriaCupon`: Filtrar por categoría de cupón
- `from`: Fecha inicio (YYYY-MM-DD)
- `to`: Fecha fin (YYYY-MM-DD)
- `page`: Número de página (default: 1)
- `pageSize`: Elementos por página (max: 100, default: 24)

**Response (200):**
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "pageSize": 24,
    "total": 150,
    "filters": {
      "status": "APPROVED",
      "from": "2025-01-01",
      "to": "2025-12-31"
    }
  }
}
```

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

**Request Body:**
```json
{
  "nombre": "Nuevo Nombre",
  "logoURL": "https://res.cloudinary.com/...",
  "categorias": [1, 2, 3]
}
```

---

### 📱 Mobile - Endpoints para App Móvil

#### GET /mobile/categorias
Lista categorías optimizado para app móvil.

**Headers:** `Authorization: Bearer {token}`

**Roles permitidos:** beneficiario, dueno, administrador

---

#### GET /mobile/establecimientos
Lista establecimientos con filtros y paginación para app móvil.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `q`: Búsqueda por nombre
- `categoryIds`: IDs de categorías separados por coma (ej: "1,2,3")
- `page`: Número de página (default: 1)
- `pageSize`: Elementos por página (max: 100, default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "idEstablecimiento": 1,
      "nombre": "Starbucks",
      "logoURL": "https://res.cloudinary.com/...",
      "categorias": ["Cafeterías", "Bebidas"]
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 50
  }
}
```

---

#### GET /mobile/ubicacion-sucursal
Obtiene ubicación de todas las sucursales activas.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "idSucursal": 1,
      "nombre": "Starbucks Lindavista",
      "latitud": 19.4885,
      "longitud": -99.1273,
      "horaApertura": "08:00",
      "horaCierre": "22:00"
    }
  ]
}
```

---

### 📤 Upload de Imágenes

#### POST /upload-image
Sube una imagen a Cloudinary con validaciones por rol y carpeta.

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

| Carpeta | Roles | Tamaño Máximo | Uso |
|---------|-------|---------------|-----|
| `logos` | admin, dueno | 5MB | Logos de establecimientos |
| `productos` | admin, dueno | 3MB | Imágenes de productos |
| `beneficiarios` | admin, beneficiario | 2MB | Fotos de perfil |
| `sucursales` | admin, dueno | 5MB | Fotos de sucursales |
| `promociones` | admin, dueno | 3MB | Banners promocionales |

**Response (200):**
```json
{
  "success": true,
  "logoURL": "https://res.cloudinary.com/daxeygpic/image/upload/v123/logos/abc.png",
  "publicId": "logos/abc123",
  "folder": "logos"
}
```

**Validaciones:**
- Formatos permitidos: PNG, JPG, JPEG, GIF, WEBP
- Imagen en formato base64
- Tamaño según carpeta
- Optimización automática (max 1200x1200px, quality auto)

---

### 🧪 Testing

#### GET /test
Verifica conexión a base de datos y estructura de tablas.

**Response (200):**
```json
{
  "success": true,
  "message": "Conexión exitosa a BD",
  "details": {
    "connected": true,
    "tablesCount": 15,
    "emailColumnExists": true
  }
}
```

---

## Seguridad Implementada

### 1. Validación de Datos (Joi)
- Validación de tipos de datos
- Validación de formatos (email, CURP, teléfono)
- Prevención de SQL injection
- Validación de longitudes y patrones

### 2. Rate Limiting
- Máximo 20 intentos de login por IP
- Bloqueo de 15 minutos después de exceder límite
- Protección contra ataques de fuerza bruta
- Almacenamiento en memoria (Map)

### 3. Hashing de Contraseñas (bcrypt)
- 12 rounds de hashing
- Contraseñas nunca almacenadas en texto plano
- Comparación segura con timing attack prevention
- Validación de complejidad (mayúsculas, minúsculas, números)

### 4. JWT Tokens
- Tokens firmados con HS256
- Expiración de 30 minutos
- Payload incluye: id, email, role, folio (opcional)
- Middleware de verificación en cada request protegido

### 5. Control de Acceso por Roles
- `beneficiario` - Acceso a endpoints públicos, perfil y promociones
- `dueno` - Gestión de sus establecimientos, sucursales y promociones
- `administrador` - Acceso completo al sistema
- `moderador` - Acceso a sistema de moderación y reportes

### 6. CORS
- Habilitado para todos los orígenes (desarrollo)
- Headers permitidos: Content-Type, Authorization
- Métodos permitidos: GET, POST, PUT, PATCH, DELETE, OPTIONS

### 7. Validación de Imágenes
- Formatos permitidos: PNG, JPG, JPEG, GIF, WEBP
- Tamaños máximos por tipo de carpeta
- Optimización automática con Cloudinary
- Validación de roles por carpeta

### 8. Auditoría
- Sistema de registro de eventos (AuditEvents)
- Tracking de acciones críticas (CREATE, UPDATE, DELETE)
- Información del actor (usuario y rol)

---

## Setup y Configuración

### Prerequisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- Cuenta de AWS con permisos de Lambda, API Gateway y RDS
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

**macOS/Linux:**
```bash
mkdir -p ~/.aws
cat > ~/.aws/credentials << EOF
[default]
aws_access_key_id = XXXXXXXXXXXXXXXXXXXX
aws_secret_access_key = XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
region = us-east-2
EOF
```

**Verificar:**
```bash
cat ~/.aws/credentials
```

#### 4. Crear archivo `.env`

En la raíz del proyecto:
```env
# Base de Datos RDS (us-east-1)
DB_HOST=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DB_USER=xxxxxxxx
DB_PASSWORD=xxxxxxxxxxxxxxxxxxx
DB_NAME=xxxxxxxxxxxxxxxxxxxxxxxxx

# JWT Secret
JWT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Admin Master Key (para crear administradores)
ADMIN_MASTER_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=XXXXXXXX
CLOUDINARY_API_KEY=XXXXXXXXXXXXX
CLOUDINARY_API_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# CORS (opcional)
CORS_ORIGIN=*
```

⚠️ **IMPORTANTE:** El archivo `.env` NO debe subirse a Git (ya está en `.gitignore`)

#### 5. Probar conexión a base de datos
```bash
npm run test-db
```

---

## Deploy a AWS

### Deploy completo
```bash
serverless deploy
```

**Tiempo estimado:** 2-5 minutos

**Salida esperada:**
```
✔ Service deployed to stack beneficio-joven-api-dev (45s)

endpoints:
  GET - https://fgdmbhrw5b.execute-api.us-east-2.amazonaws.com/dev/test
  POST - https://fgdmbhrw5b.execute-api.us-east-2.amazonaws.com/dev/auth/login
  GET - https://fgdmbhrw5b.execute-api.us-east-2.amazonaws.com/dev/admin/dashboard/stats
  ...

functions:
  test: beneficio-joven-api-dev-test (2.1 kB)
  login: beneficio-joven-api-dev-login (3.5 kB)
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
npm start
# o
serverless offline
```

Servidor local: `http://localhost:3000`

### Eliminar deployment
```bash
serverless remove
```

⚠️ **Advertencia:** Esto eliminará todos los recursos de AWS creados por Serverless Framework

---

## Variables de Entorno

| Variable | Descripción | Requerida | Ejemplo |
|----------|-------------|-----------|---------|
| `DB_HOST` | Host de la base de datos RDS | ✅ | `db-beneficio-joven.cduggeegs0kv.us-east-1.rds.amazonaws.com` |
| `DB_USER` | Usuario de la base de datos | ✅ | `admin` |
| `DB_PASSWORD` | Contraseña de la base de datos | ✅ | `XXXXXXXXXXX` |
| `DB_NAME` | Nombre de la base de datos | ✅ | `BeneficioJoven` |
| `JWT_SECRET` | Secreto para firmar tokens JWT | ✅ | (string aleatorio largo) |
| `ADMIN_MASTER_KEY` | Llave maestra para crear admins | ✅ | (string secreto) |
| `CLOUDINARY_CLOUD_NAME` | Nombre del cloud de Cloudinary | ✅ | `daxeygpic` |
| `CLOUDINARY_API_KEY` | API Key de Cloudinary | ✅ | `646259726368626` |
| `CLOUDINARY_API_SECRET` | API Secret de Cloudinary | ✅ | (secreto de Cloudinary) |
| `CORS_ORIGIN` | Origen permitido para CORS | ❌ | `*` (default) |

---

## Dependencias

### Producción
```json
{
  "bcryptjs": "^3.0.2",
  "cloudinary": "^2.7.0",
  "dotenv": "^17.2.3",
  "joi": "^18.0.1",
  "jsonwebtoken": "^9.0.2",
  "mysql2": "^3.15.1",
  "uuid": "^13.0.0"
}
```

### Desarrollo
```json
{
  "serverless-offline": "^14.4.0"
}
```

---

## Scripts Disponibles

```json
{
  "start": "serverless offline",
  "test-db": "node scripts/test-connection.js"
}
```

**Uso:**
```bash
# Iniciar servidor local
npm start

# Probar conexión a base de datos
npm run test-db
```

---

## Estructura de Base de Datos

### Tablas Principales

- `Beneficiario` - Usuarios beneficiarios
- `Dueno` - Dueños de establecimientos
- `Administrador` - Administradores del sistema
- `Establecimiento` - Establecimientos afiliados
- `Sucursal` - Sucursales de establecimientos
- `Categoria` - Categorías de establecimientos
- `CategoriaEstablecimiento` - Relación muchos a muchos
- `DuenoEstablecimiento` - Relación muchos a muchos
- `Promocion` - Promociones y descuentos
- `AplicacionPromocion` - Registro de uso de promociones
- `SucursalImagen` - Imágenes de sucursales
- `AuditEvents` - Eventos de auditoría
- `ModeracionQueue` - Cola de moderación
- `ModeracionRule` - Reglas de moderación
- `CategoriaCupon` - Categorías de cupones

---

## Características Avanzadas

### 📊 Sistema de Reportes
- KPIs en tiempo real
- Series temporales (aplicaciones por mes, crecimiento, etc.)
- Top establecimientos y categorías
- Análisis de uso por hora y día de semana
- Embudo de conversión
- Trending de SLA de moderación
- Cobertura geográfica (geo grid)

### 🔍 Sistema de Auditoría
- Registro automático de acciones críticas
- Información del actor (usuario y rol)
- Timestamp de eventos
- Payload de cambios (JSON)

### 🛡️ Sistema de Moderación
- Cola de contenido pendiente
- Reglas por establecimiento
- Aprobación de cupones y perfiles
- SLA tracking

### 📱 Optimización Móvil
- Endpoints específicos para app Android
- Paginación eficiente
- Filtros optimizados
- Respuestas ligeras

### 🖼️ Gestión de Imágenes
- Upload múltiple (hasta 5 por sucursal)
- Optimización automática
- Eliminación inteligente (Cloudinary + BD)
- Validación por rol y carpeta

---

## Licencia

ISC

---

## Contacto

**Proyecto desarrollado por el equipo de Beneficio Joven** 🚀

Para reportar bugs o solicitar features, por favor abre un issue en GitHub:
https://github.com/MasterJuan579/Beneficio_Joven_Backend/issues

---

## Changelog

### v1.0.0 (2025-10-21)
- ✅ Sistema completo de autenticación JWT
- ✅ CRUD completo de beneficiarios, dueños y establecimientos
- ✅ Sistema de gestión de sucursales con múltiples imágenes
- ✅ Sistema de reportes avanzados con KPIs
- ✅ Sistema de auditoría
- ✅ Sistema de moderación
- ✅ Endpoints optimizados para app móvil
- ✅ Gestión de imágenes con Cloudinary
- ✅ Rate limiting
- ✅ Validación de datos con Joi
- ✅ Documentación completa