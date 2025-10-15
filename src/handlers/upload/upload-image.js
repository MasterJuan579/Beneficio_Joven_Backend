require('dotenv').config();
const { verifyRole } = require('../../middleware/auth');
const cloudinary = require('cloudinary').v2;
const Joi = require('joi');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Definir carpetas permitidas
const ALLOWED_FOLDERS = {
  'logos': {
    roles: ['administrador', 'dueno'],
    maxSize: 5000000, // 5MB
    description: 'Logos de establecimientos'
  },
  'productos': {
    roles: ['administrador', 'dueno'],
    maxSize: 3000000, // 3MB
    description: 'Imágenes de productos'
  },
  'beneficiarios': {
    roles: ['administrador', 'beneficiario'],
    maxSize: 2000000, // 2MB
    description: 'Fotos de perfil de beneficiarios'
  },
  'sucursales': {
    roles: ['administrador', 'dueno'],
    maxSize: 5000000, // 5MB
    description: 'Fotos de sucursales'
  },
  'promociones': {
    roles: ['administrador', 'dueno'],
    maxSize: 3000000, // 3MB
    description: 'Banners de promociones'
  }
};

const uploadSchema = Joi.object({
  image: Joi.string().required().messages({
    'string.empty': 'La imagen es requerida',
    'any.required': 'La imagen es requerida'
  }),
  folder: Joi.string().valid(...Object.keys(ALLOWED_FOLDERS)).required().messages({
    'any.only': `La carpeta debe ser una de: ${Object.keys(ALLOWED_FOLDERS).join(', ')}`,
    'any.required': 'La carpeta es requerida'
  })
});

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Verificar autenticación (cualquier rol)
    const user = verifyRole(event, ['administrador', 'dueno', 'beneficiario']);
    
    console.log(`Usuario ${user.id} (${user.role}) solicita subir imagen`);

    // Parsear y validar el body
    const body = JSON.parse(event.body);
    const { error, value } = uploadSchema.validate(body);
    
    if (error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Datos inválidos',
          errors: error.details.map(d => d.message)
        })
      };
    }

    const { image, folder } = value;

    // Verificar que el usuario tenga permiso para subir a esta carpeta
    const folderConfig = ALLOWED_FOLDERS[folder];
    if (!folderConfig.roles.includes(user.role)) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({
          success: false,
          message: `No tienes permiso para subir imágenes a la carpeta "${folder}"`
        })
      };
    }

    // Validar formato base64
    const base64Pattern = /^data:image\/(png|jpg|jpeg|gif|webp);base64,/;
    if (!base64Pattern.test(image)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Formato de imagen inválido. Debe ser PNG, JPG, JPEG, GIF o WEBP en base64'
        })
      };
    }

    // Validar tamaño aproximado (base64 es ~33% más grande que el archivo original)
    const base64Length = image.length - image.indexOf(',') - 1;
    const sizeInBytes = (base64Length * 3) / 4;
    
    if (sizeInBytes > folderConfig.maxSize) {
      const maxSizeMB = (folderConfig.maxSize / 1000000).toFixed(1);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: `La imagen es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`
        })
      };
    }
    
    console.log(`Subiendo imagen a carpeta: ${folder} (${folderConfig.description})`);

    // Subir imagen a Cloudinary
    const uploadResult = await cloudinary.uploader.upload(image, {
      folder: folder,
      resource_type: 'image',
      allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto' }
      ],
      // Generar nombre único
      public_id: `${folder}_${Date.now()}_${Math.random().toString(36).substring(7)}`
    });

    console.log(`Imagen subida exitosamente: ${uploadResult.secure_url}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        logoURL: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        folder: folder
      })
    };

  } catch (error) {
    console.error('Error al subir imagen:', error);

    if (error.message.includes('Token') || error.message.includes('Acceso denegado')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: error.message
        })
      };
    }

    if (error.http_code) {
      return {
        statusCode: error.http_code,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Error al subir imagen',
          error: error.message
        })
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Error al subir imagen',
        error: error.message
      })
    };
  }
};