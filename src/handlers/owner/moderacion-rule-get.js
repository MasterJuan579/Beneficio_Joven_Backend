const { getConnection } = require('../../config/database');
const { verifyRole } = require('../../middleware/auth');

exports.handler = async (event) => {
  const headers = { 'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'GET,OPTIONS' };
  if (event.httpMethod === 'OPTIONS') return { statusCode:200, headers, body:'' };

  try {
    verifyRole(event, ['dueno','administrador']);
    const { id } = event.pathParameters || {}; // idEstablecimiento

    const conn = await getConnection();
    const [[row]] = await conn.query(
      `SELECT idEstablecimiento, requireCouponApproval, requireProfileApproval
       FROM ModeracionRule WHERE idEstablecimiento=?`, [id]
    );
    // default si no existe
    const rule = row || { idEstablecimiento: Number(id), requireCouponApproval: 1, requireProfileApproval: 1 };
    return { statusCode:200, headers, body: JSON.stringify({ success:true, data: rule }) };
  } catch (err) {
    return { statusCode:400, headers, body: JSON.stringify({ success:false, message: err.message }) };
  }
};
