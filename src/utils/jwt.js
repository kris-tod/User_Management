import jwt from 'jsonwebtoken';
import { secret } from '../config/index.js';

export function createToken(data) {
  return jwt.sign(data, secret, { expiresIn: '1h' });
}

export function verifyToken(token) {
  const decodedToken = jwt.verify(token, secret);
  return decodedToken;
}

export default {
  createToken,
  verifyToken
};
