import { hashPassword } from '../utils/password';
import { AppError } from '../utils/errors';
import { Role, User } from '../database/models';

class UserService {
  list() {
    return User.findAll({ include: [{ model: Role, as: 'role' }] });
  }

  async create(payload: { email: string; password: string; roleId: string }) {
    const exists = await User.findOne({ where: { email: payload.email } });
    if (exists) {
      throw new AppError('User already exists', 409);
    }

    const passwordHash = await hashPassword(payload.password);
    return User.create({ email: payload.email, passwordHash, roleId: payload.roleId });
  }
}

export const userService = new UserService();
