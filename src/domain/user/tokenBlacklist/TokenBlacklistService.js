import { TokenBlacklistRepository } from './TokenBlacklistRepository.js';

class TokenBlacklistService {
  constructor(logger) {
    this.tokenRepo = new TokenBlacklistRepository();
    this.logger = logger;
  }

  async addToken(token) {
    return this.tokenRepo.create({ token });
  }

  async find(token) {
    return this.tokenRepo.getOne(token);
  }
}

export default TokenBlacklistService;
