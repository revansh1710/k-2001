// src/policies/is-authenticated.js
'use strict';

const jsonwt = require('jsonwebtoken');
const { errors } = require('@strapi/utils');
const { UnauthorizedError } = errors;

module.exports = async (policyContext, _config, { strapi }) => {
  const ctx = policyContext;

  const authHeader = ctx.request?.header?.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) throw new UnauthorizedError('No token provided');

  try {
    const decoded = jsonwt.verify(token, process.env.JWT_SECRET);
    const user = await strapi.db.query('api::user.user').findOne({ where: { id: decoded.id } });
    if (!user) throw new UnauthorizedError('Invalid token or user not found');

    ctx.state.user = user;           // ✅ important
    return true;                     // ✅ must return true
  } catch {
    throw new UnauthorizedError('Invalid token or user not found');
  }
};
