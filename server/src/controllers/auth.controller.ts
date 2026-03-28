import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { sendEmail, passwordResetEmailHtml } from '../utils/email';

const registerSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요.'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
  name: z.string().min(1, '이름을 입력해주세요.').max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function generateTokens(user: { id: string; email: string; name: string }) {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || 'refresh-secret',
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new AppError(409, 'AUTH_EMAIL_EXISTS', '이미 사용 중인 이메일입니다.');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: { email: data.email, passwordHash, name: data.name },
      select: { id: true, email: true, name: true, avatarUrl: true, createdAt: true },
    });

    const tokens = generateTokens(user);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      data: { user, accessToken: tokens.accessToken },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(400, 'VALIDATION_ERROR', '입력값이 올바르지 않습니다.',
        error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      ));
    }
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new AppError(401, 'AUTH_INVALID_CREDENTIALS', '이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, 'AUTH_INVALID_CREDENTIALS', '이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const tokens = generateTokens(user);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl },
        accessToken: tokens.accessToken,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(400, 'VALIDATION_ERROR', '입력값이 올바르지 않습니다.'));
    }
    next(error);
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie('refreshToken');
  res.json({ success: true, data: { message: '로그아웃되었습니다.' } });
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', '인증이 필요합니다.');

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, email: true, name: true, avatarUrl: true,
        bloodType: true, allergies: true,
        emergencyContactName: true, emergencyContactPhone: true,
        createdAt: true,
      },
    });

    if (!user) throw new AppError(404, 'USER_NOT_FOUND', '사용자를 찾을 수 없습니다.');

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', '인증이 필요합니다.');

    const updateSchema = z.object({
      name: z.string().min(1).max(100).optional(),
      bloodType: z.string().max(5).optional(),
      allergies: z.string().optional(),
      emergencyContactName: z.string().max(100).optional(),
      emergencyContactPhone: z.string().max(20).optional(),
    });

    const data = updateSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: {
        id: true, email: true, name: true, avatarUrl: true,
        bloodType: true, allergies: true,
        emergencyContactName: true, emergencyContactPhone: true,
      },
    });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) throw new AppError(401, 'AUTH_TOKEN_MISSING', '리프레시 토큰이 없습니다.');

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh-secret') as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true },
    });

    if (!user) throw new AppError(401, 'AUTH_INVALID_TOKEN', '유효하지 않은 토큰입니다.');

    const tokens = generateTokens(user);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, data: { accessToken: tokens.accessToken } });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', '인증이 필요합니다.');

    const schema = z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8, '새 비밀번호는 8자 이상이어야 합니다.'),
    });

    const data = schema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', '사용자를 찾을 수 없습니다.');

    const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!valid) throw new AppError(400, 'AUTH_WRONG_PASSWORD', '현재 비밀번호가 올바르지 않습니다.');

    const passwordHash = await bcrypt.hash(data.newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });

    res.json({ success: true, data: { message: '비밀번호가 변경되었습니다.' } });
  } catch (error) {
    next(error);
  }
}

export async function requestPasswordReset(req: Request, res: Response, next: NextFunction) {
  try {
    const schema = z.object({ email: z.string().email() });
    const { email } = schema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ success: true, data: { message: '이메일이 발송되었습니다.' } });
    }

    const token = jwt.sign(
      { id: user.id, purpose: 'password-reset' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    const appUrl = process.env.CLIENT_URL || 'https://tripsync-a3yw.onrender.com';
    sendEmail(
      email,
      '[TripSync] 비밀번호 재설정',
      passwordResetEmailHtml(`${appUrl}/reset-password?token=${token}`)
    );

    res.json({ success: true, data: { message: '이메일이 발송되었습니다.' } });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const schema = z.object({
      token: z.string(),
      newPassword: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
    });
    const data = schema.parse(req.body);

    const decoded = jwt.verify(data.token, process.env.JWT_SECRET || 'secret') as { id: string; purpose: string };
    if (decoded.purpose !== 'password-reset') {
      throw new AppError(400, 'INVALID_TOKEN', '유효하지 않은 토큰입니다.');
    }

    const passwordHash = await bcrypt.hash(data.newPassword, 12);
    await prisma.user.update({ where: { id: decoded.id }, data: { passwordHash } });

    res.json({ success: true, data: { message: '비밀번호가 변경되었습니다.' } });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError(400, 'INVALID_TOKEN', '만료되었거나 유효하지 않은 토큰입니다.'));
    }
    next(error);
  }
}
