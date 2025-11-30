import { comparePassword, hashPassword } from '../utils/password';
import { AppError } from '../utils/errors';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/tokens';
import { Role, User } from '../database/models';

class AuthService {
  async login(email: string, password: string) {
    const user = await User.findOne({ where: { email }, include: [{ model: Role, as: 'role' }] });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const passwordOk = await comparePassword(password, user.passwordHash);
    if (!passwordOk) {
      throw new AppError('Invalid credentials', 401);
    }

    return this.issueTokens(user);
  }

  async refresh(token: string) {
    const payload = verifyRefreshToken(token);
    const user = await User.findByPk(payload.sub, { include: [{ model: Role, as: 'role' }] });
    if (!user || !user.refreshTokenHash) {
      throw new AppError('Invalid refresh token', 401);
    }

    const valid = await comparePassword(token, user.refreshTokenHash);
    if (!valid) {
      throw new AppError('Invalid refresh token', 401);
    }

    return this.issueTokens(user);
  }

  async logout(userId: string) {
    await User.update({ refreshTokenHash: null }, { where: { id: userId } });
  }

  private async issueTokens(user: User) {
    const payload = { sub: user.id, role: await this.resolveRole(user) };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    const refreshHash = await hashPassword(refreshToken);

    await user.update({ refreshTokenHash: refreshHash, lastLoginAt: new Date() });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: payload.role
      }
    };
  }

  private async resolveRole(user: User) {
    if (user.role) return user.role.name;
    const role = await user.getRole();
    if (!role) throw new AppError('Role not found', 500);
    return role.name;
  }
}

export const authService = new AuthService();
