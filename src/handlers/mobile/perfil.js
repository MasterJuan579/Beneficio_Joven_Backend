require('dotenv').config();
const { getConnection } = require('../../config/database');
const { verifyRole } = require('../../middleware/auth');

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,OPTIONS'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    try {
      user = verifyRole(event, ['beneficiario', 'dueno', 'administrador']);
    } catch (e) {
      return { statusCode: 401, headers, body: JSON.stringify({ success: false, message: e.message || 'Unauthorized' }) };
    }

    const userId = user.id;
    const role = user.role;
    console.log(`Perfil solicitado por el usuario con id ${userId}, con el rol de ${role}`);

    const conn = await getConnection();
    // Devolver los detalles del perfil según el tipo de usuario autenticado
    let rows = [];
    let data = {};
    if (role === 'beneficiario') {
        [rows] = await conn.execute(`
            SELECT
                b.primerNombre, 
                b.segundoNombre, 
                b.apellidoPaterno, 
                b.apellidoMaterno, 
                b.fechaNacimiento, 
                b.celular, 
                b.folio, 
                b.email, 
                b.sexo
            FROM Beneficiario b
            WHERE b.activo = 1
            AND b.idBeneficiario = ?
        `, [userId]);
        
        data = rows.map(r => ({
            primerNombre: r.primerNombre,
            segundoNombre: r.segundoNombre,
            apellidoPaterno: r.apellidoPaterno,
            apellidoMaterno: r.apellidoMaterno,
            fechaNacimiento: r.fechaNacimiento,
            celular: r.celular,
            folio: r.folio,
            email: r.email,
            sexo: r.sexo 
        }));

    } else if (role === 'dueno') {
        [rows] = await conn.execute(`
            SELECT
                d.nombreUsuario, 
                d.email
            FROM Dueno d
            WHERE d.activo = 1
            AND d.idDueno = ?
        `, [userId]);

        data = rows.map(r => ({
            nombreUsuario: r.nombreUsuario,
            email: r.email
        }));

    } else if (role === 'administrador') {
        [rows] = await conn.execute(`
            SELECT
                a.nombreUsuario,
                a.email
            FROM Administrador a
            WHERE a.activo = 1
            AND a.idAdministrador = ?
        `, [userId]);

        data = rows.map(r => ({
            nombreUsuario: r.nombreUsuario,
            email: r.email
        }));
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, data }) };

  } catch (err) {
    console.error('perfil (mobile) error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: err.message || 'Server error' }) };
  }
};

