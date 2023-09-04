import { TokenBlacklist } from '../models/db.js';

class TokenBlacklistService {
  static addToken(token) {
    return TokenBlacklist.create({ token });
  }

  static find(token) {
    return TokenBlacklist.findOne({ where: { token } });
  }
}

export default TokenBlacklistService;
