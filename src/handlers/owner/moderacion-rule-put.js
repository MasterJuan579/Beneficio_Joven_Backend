const { getConnection } = require('../../config/database');
const { verifyRole } = require('../../middleware/auth');

exports.handler = async (event) => {
  const headers = { 'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'PUT,OPTIONS' };
  if (event.httpMethod === 'OPTIONS') return { statusCode:200, headers, body:'' };

  try {
    verifyRole(event, ['dueno','administrador']);
    const { id } = event.pathParameters || {}; // idEstablecimiento
    const body = JSON.parse(event.body || '{}');

    const conn = await getConnection();
    // UPSERT simple
    await conn.query(`
      INSERT INTO ModeracionRule(idEstablecimiento, requireCouponApproval, requireProfileApproval)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        requireCouponApproval=VALUES(requireCouponApproval),
        requireProfileApproval=VALUES(requireProfileApproval)
    `, [id, body.requireCouponApproval ? 1 : 0, body.requireProfileApproval ? 1 : 0]);

    return { statusCode:200, headers, body: JSON.stringify({ success:true }) };
  } catch (err) {
    return { statusCode:400, headers, body: JSON.stringify({ success:false, message: err.message }) };
  }
};
