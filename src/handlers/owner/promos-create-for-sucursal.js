const { getConnection } = require('../../config/database');
const { verifyRole, getUser } = require('../../middleware/auth');

exports.handler = async (event) => {
  const headers = { 'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'POST,OPTIONS' };
  if (event.httpMethod === 'OPTIONS') return { statusCode:200, headers, body:'' };

  try {
    verifyRole(event, ['dueno','administrador']);
    const submitter = getUser(event)?.email || 'dueno';

    const { id } = event.pathParameters || {}; // idSucursal
    const payload = JSON.parse(event.body || '{}');

    const conn = await getConnection();
    // sucursal + establecimiento
    const [[suc]] = await conn.query(`
      SELECT s.idSucursal, s.idEstablecimiento
      FROM Sucursal s WHERE s.idSucursal=?
    `, [id]);
    if (!suc) return { statusCode:404, headers, body: JSON.stringify({ success:false, message:'Sucursal no existe' }) };

    // regla
    const [[rule]] = await conn.query(
      `SELECT requireCouponApproval FROM ModeracionRule WHERE idEstablecimiento=?`,
      [suc.idEstablecimiento]
    );
    const needsApproval = rule ? !!rule.requireCouponApproval : true; // default: requiere

    if (needsApproval) {
      const queuePayload = { ...payload, idSucursal: suc.idSucursal, idEstablecimiento: suc.idEstablecimiento };
      await conn.query(
        `INSERT INTO ModeracionQueue(entityType,entityId,submittedBy,action,payload,status)
         VALUES('COUPON',NULL,?, 'CREATE', CAST(? AS JSON),'PENDING')`,
        [submitter, JSON.stringify(queuePayload)]
      );
      return { statusCode:200, headers, body: JSON.stringify({ success:true, moderated:true }) };
    } else {
      // crea directa en PENDING (o aprueba auto si quieres)
      const unlimited = payload.unlimited ? 1 : 0;
      const limitQty = unlimited ? null : (payload.limitQuantity ?? null);

      const [res] = await conn.query(`
        INSERT INTO Promocion(
          idEstablecimiento,titulo,descripcion,discountType,discountValue,
          limitQuantity,unlimited,validFrom,validTo,idSucursal,idCategoriaCupon,status
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,'PENDING')
      `, [
        suc.idEstablecimiento,
        payload.titulo, payload.descripcion,
        payload.discountType, Number(payload.discountValue),
        limitQty, unlimited,
        payload.validFrom || null, payload.validTo || null,
        suc.idSucursal, payload.idCategoriaCupon || null
      ]);

      // Si deseas aprobar automáticamente:
      // await conn.query(`CALL sp_set_promo_status(?, 'APPROVED', ?, ?)`, [res.insertId, submitter, 'Auto por regla']);

      return { statusCode:200, headers, body: JSON.stringify({ success:true, moderated:false, idPromocion: res.insertId }) };
    }
  } catch (err) {
    return { statusCode:400, headers, body: JSON.stringify({ success:false, message: err.message }) };
  }
};
