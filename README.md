<artifact identifier="readme-beneficio-joven" type="text/markdown" title="README.md - Beneficio Joven Backend">
# Beneficio Joven - Backend API

Backend serverless para la plataforma Beneficio Joven, construido con Node.js, AWS Lambda y Serverless Framework.

## Arquitectura del Sistema

### Stack Tecnológico

- **Runtime**: Node.js 18.x
- **Framework**: Serverless Framework 4.x
- **Base de Datos**: Amazon Aurora MySQL (RDS)
- **Servicios AWS**:
  - AWS Lambda (funciones serverless)
  - API Gateway (endpoints REST)
  - CloudWatch (logs y monitoreo)
  - IAM (gestión de permisos)

### Diagrama de Arquitectura

```
Cliente (Android/React)
        ↓
   API Gateway
        ↓
    Lambda Functions
        ↓
   Aurora RDS MySQL
```

### Flujo de Autenticación

1. Usuario envía credenciales (email/password)
2. API Gateway enruta a Lambda
3. Lambda valida datos con Joi
4. Rate limiting verifica intentos
5. bcrypt compara hash de contraseña
6. JWT token generado y retornado
7. Cliente usa token en requests subsecuentes

## Estructura del Proyecto

```
Beneficio_Joven_Backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Configuración de conexión a RDS
│   │   └── security.js          # Constantes de seguridad
│   ├── handlers/
│   │   ├── auth/
│   │   │   ├── login.js         # Endpoint de login
│   │   │   └── register.js      # Endpoint de registro
│   │   └── test.js              # Endpoint de prueba
│   └── utils/
│       └── rateLimit.js         # Control de rate limiting
├── scripts/
│   └── test-connection.js       # Script de prueba de BD
├── .env                         # Variables de entorno (NO subir a Git)
├── .gitignore
├── package.json
├── serverless.yml               # Configuración de Serverless Framework
└── README.md
```

## Endpoints Disponibles

### Base URL
```
https://{api-id}.execute-api.us-east-1.amazonaws.com/dev
```

### POST /auth/register
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
  "curp": "CURP1234567890ABCD",
  "fechaNacimiento": "2000-01-01",
  "celular": "5512345678",
  "sexo": "H"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "folio": "BJ12345678"
}
```

### POST /auth/login
Autentica un beneficiario.

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
    "nombre": "Juan González",
    "email": "usuario@ejemplo.com",
    "folio": "BJ12345678"
  }
}
```

### GET /test
Verifica conexión a base de datos.

**Response (200):**
```json
{
  "success": true,
  "message": "Conexión exitosa a BD",
  "details": {
    "connected": true,
    "tablesCount": 10,
    "emailColumnExists": true
  }
}
```

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
- Expiración de 30 minutos
- Payload incluye: id, email, role

### 5. CORS
- Habilitado para todos los orígenes (desarrollo)
- Configurar dominios específicos en producción

## Setup y Configuración

### Prerequisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- Cuenta de AWS
- AWS CLI configurado

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/MasterJuan579/Beneficio_Joven_Backend.git
cd Beneficio_Joven_Backend
```

2. **Instalar dependencias**
```bash
npm install
npm install -g serverless
```
2.1 **Agregar Credenciales AWS**

```bash
mkdir $HOME\.aws -Force
@"
[default]
aws_access_key_id = xxxxxxxxxxxxxxxxxxxx
aws_secret_access_key = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
region = us-east-2
"@ | Out-File -FilePath $HOME\.aws\credentials -Encoding ASCII a
```

3. **Configurar variables de entorno**

Crear archivo `.env` en la raíz:
```env
DB_HOST=tu-aurora-endpoint.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=tu-password
DB_NAME=BeneficioJoven
JWT_SECRET=tu-secreto-jwt-super-seguro
```

**Endpoints locales:**
- GET http://localhost:3000/dev/test
- POST http://localhost:3000/dev/auth/login
- POST http://localhost:3000/dev/auth/register

### Deploy a AWS

```bash
serverless deploy
```

**Salida esperada:**
```
✔ Service deployed to stack beneficio-joven-api-dev
endpoints:
  POST - https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/auth/login
  POST - https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/auth/register
  GET - https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/test
```

### Ver Logs

```bash
# Logs en tiempo real
serverless logs -f register --tail

# Logs de función específica
serverless logs -f login

# Ver en AWS Console
AWS Console → CloudWatch → Log Groups → /aws/lambda/beneficio-joven-api-dev-{function}
```

### Eliminar Deploy

```bash
serverless remove
```

## Scripts Disponibles

```json
{
  "start": "serverless offline",
  "test-db": "node scripts/test-connection.js"
}
```

- `npm start` - Inicia servidor local
- `npm run test-db` - Prueba conexión a base de datos

## Configuración de AWS

### IAM Permissions Necesarios

El usuario IAM debe tener:
- `PowerUserAccess` o `AdministratorAccess`
- `IAMFullAccess` (para crear roles de Lambda)

### Security Group de RDS

Para que Lambda se conecte a Aurora:

1. AWS Console → EC2 → Security Groups
2. Seleccionar SG de Aurora
3. Inbound Rules → Add Rule:
   - Type: MySQL/Aurora
   - Port: 3306
   - Source: 0.0.0.0/0 (desarrollo) o IP específica (producción)

### Base de Datos

La tabla `Beneficiario` debe tener:
```sql
ALTER TABLE Beneficiario 
ADD COLUMN email VARCHAR(100) UNIQUE,
ADD COLUMN passwordHash VARCHAR(255);
```

## Dependencias

### Producción
```json
{
  "bcryptjs": "^3.0.2",
  "dotenv": "^17.2.2",
  "joi": "^18.0.1",
  "jsonwebtoken": "^9.0.2",
  "mysql2": "^3.15.1"
}
```

### Desarrollo
```json
{
  "serverless-offline": "^14.4.0"
}
```

## Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| DB_HOST | Endpoint de Aurora RDS | xxx.rds.amazonaws.com |
| DB_USER | Usuario de BD | admin |
| DB_PASSWORD | Contraseña de BD | ********** |
| DB_NAME | Nombre de BD | BeneficioJoven |
| JWT_SECRET | Secreto para firmar JWT | random-256-bit-string |

## Troubleshooting

### Error: "Cannot find module 'mysql2'"
```bash
npm install
serverless deploy
```

### Error: 502 Bad Gateway
- Verificar Security Group de RDS permite puerto 3306
- Verificar variables de entorno en `.env`
- Ver logs: `serverless logs -f {function} --tail`

### Error: "Missing Authentication Token"
- Verificar que la URL sea correcta
- Verificar que el endpoint existe en `serverless.yml`
- Ejecutar `serverless info` para ver URLs actuales

### Error de conexión a BD
```bash
# Probar conexión local
npm run test-db

# Ver logs de Lambda
serverless logs -f test --tail
```



## Licencia

ISC
</artifact>