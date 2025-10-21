const { getConnection } = require('../../config/database');
const { verifyRole, getUser } = require('../../middleware/auth');

exports.handler = async (event) => {
  const headers = { 'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'POST,OPTIONS' };
  if (event.httpMethod === 'OPTIONS') return { statusCode:200, headers, body:'' };

  try {
    verifyRole(event, ['administrador','moderador']);
    const adminUser = getUser(event)?.email || 'admin@bj.mx';
    const { queueId } = event.pathParameters || {};
    const body = JSON.parse(event.body || '{}');
    const reason = body.reason || 'Aprobado';

    const conn = await getConnection();

    const [[q]] = await conn.query(`SELECT * FROM ModeracionQueue WHERE id=? FOR UPDATE`, [queueId]);
    if (!q || q.status !== 'PENDING') return { statusCode:400, headers, body: JSON.stringify({ success:false, message:'No pendiente' }) };

    const p = JSON.parse(q.payload);
    let promoId = q.entityId || null;

    if (q.entityType === 'COUPON' && q.action === 'CREATE') {
      const unlimited = p.unlimited ? 1 : 0;
      const limitQty  = unlimited ? null : (p.limitQuantity ?? null);
      const [res] = await conn.query(`
        INSERT INTO Promocion(
          idEstablecimiento,titulo,descripcion,discountType,discountValue,
          limitQuantity,unlimited,validFrom,validTo,idSucursal,idCategoriaCupon,status
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,'PENDING')
      `, [
        p.idEstablecimiento, p.titulo, p.descripcion,
        p.discountType, Number(p.discountValue),
        limitQty, unlimited, p.validFrom || null, p.validTo || null,
        p.idSucursal, p.idCategoriaCupon || null
      ]);
      promoId = res.insertId;
      await conn.query(`UPDATE ModeracionQueue SET entityId=? WHERE id=?`, [promoId, queueId]);
      // aprobar formal
      await conn.query(`CALL sp_set_promo_status(?, 'APPROVED', ?, ?)`, [promoId, adminUser, reason]);
    }

    if (q.entityType === 'COUPON' && q.action === 'UPDATE') {
      if (!promoId) return { statusCode:400, headers, body: JSON.stringify({ success:false, message:'Sin entityId en UPDATE' }) };
      const unlimited = p.unlimited ? 1 : 0;
      const limitQty  = unlimited ? null : (p.limitQuantity ?? null);

      await conn.query(`
        UPDATE Promocion
        SET titulo=?, descripcion=?, discountType=?, discountValue=?,
            limitQuantity=?, unlimited=?, validFrom=?, validTo=?, idCategoriaCupon=?
        WHERE idPromocion=?
      `, [p.titulo,p.descripcion,p.discountType,Number(p.discountValue),
          limitQty, unlimited, p.validFrom||null, p.validTo||null, p.idCategoriaCupon||null, promoId]);
    }

    await conn.query(
      `UPDATE ModeracionQueue SET status='APPROVED', reviewedBy=?, reviewedAt=NOW(), reason=? WHERE id=?`,
      [adminUser, reason, queueId]
    );
    await conn.query(
      `INSERT INTO ModeracionLog(queueId,adminUser,action,reason) VALUES(?,?,'APPROVED',?)`,
      [queueId, adminUser, reason]
    );

    return { statusCode:200, headers, body: JSON.stringify({ success:true, idPromocion: promoId }) };
  } catch (err) {
    return { statusCode:400, headers, body: JSON.stringify({ success:false, message: err.message }) };
  }
};
