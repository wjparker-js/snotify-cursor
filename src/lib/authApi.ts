import prisma from '../integrations/mysql.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';
const REFRESH_TOKEN_EXPIRES_IN_DAYS = 30;

export function validateRegistration(data: any) {
  if (!data.email || !data.password) {
    return 'Email and password are required';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return 'Invalid email format';
  }
  if (data.password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  return null;
}

export function validateLogin(data: any) {
  if (!data.email || !data.password) {
    return 'Email and password are required';
  }
  return null;
}

export async function registerUser(email: string, password: string) {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('User already exists');
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { 
      email, 
      password: passwordHash,
      createdAt: new Date(),
      updatedAt: new Date()
    },
  });
  return { id: user.id, email: user.email };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Invalid email or password');
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }
  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return { token, user: { id: user.id, email: user.email } };
}

export function verifyJWT(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
}

export async function createRefreshToken(userId: number) {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000);
  await prisma.refreshtoken.create({
    data: { 
      token, 
      userId, 
      expiresAt,
      createdAt: new Date()
    },
  });
  return token;
}

export async function verifyRefreshToken(token: string) {
  const record = await prisma.refreshtoken.findUnique({ where: { token } });
  if (!record || record.revoked || record.expiresAt < new Date()) {
    throw new Error('Invalid or expired refresh token');
  }
  return record.userId;
}

export async function revokeRefreshToken(token: string) {
  await prisma.refreshtoken.updateMany({ where: { token }, data: { revoked: true } });
}

export async function refreshToken(oldToken: string) {
  const userId = await verifyRefreshToken(oldToken);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  await revokeRefreshToken(oldToken);
  const newToken = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const newRefreshToken = await createRefreshToken(user.id);
  return { token: newToken, refreshToken: newRefreshToken, user: { id: user.id, email: user.email } };
}

export async function logoutUser(refreshTokenValue: string) {
  await revokeRefreshToken(refreshTokenValue);
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found');
  const token = uuidv4();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
  await prisma.user.update({
    where: { id: user.id },
    data: { resetPasswordToken: token, resetPasswordExpires: expires },
  });
  return { resetToken: token, expires };
}

export async function verifyEmail(token: string) {
  const user = await prisma.user.findFirst({ where: { emailVerificationToken: token } });
  if (!user) throw new Error('Invalid or expired verification token');
  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, emailVerificationToken: null },
  });
  return { message: 'Email verified' };
}

export async function getUserProfile(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      bio: true,
      preferences: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true
    },
  });
  if (!user) throw new Error('User not found');
  return user;
}

export async function updateUserProfile(userId: number, data: any) {
  const allowedFields = ['email', 'name', 'avatar', 'bio', 'preferences'];
  const updateData: any = {};
  for (const key of allowedFields) {
    if (data[key] !== undefined) updateData[key] = data[key];
  }
  if (Object.keys(updateData).length === 0) throw new Error('No valid fields to update');
  
  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      bio: true,
      preferences: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true
    },
  });
  return user;
}

export async function deactivateUser(userId: number) {
  // Soft delete: set email to null and deactivate account
  const user = await prisma.user.update({
    where: { id: userId },
    data: { email: null },
    select: { id: true },
  });
  return { message: 'Account deactivated' };
}

export async function getUserTenants(userId: number) {
  const userTenants = await prisma.usertenant.findMany({
    where: { userId },
    include: { tenant: true },
  });
  return userTenants.map(ut => ({ id: ut.tenant.id, name: ut.tenant.name, role: ut.role }));
}

export async function switchUserTenant(userId: number, tenantId: number) {
  // Check if user belongs to tenant
  const userTenant = await prisma.usertenant.findFirst({ where: { userId, tenantId } });
  if (!userTenant) throw new Error('User does not belong to this tenant');
  await prisma.user.update({ where: { id: userId }, data: { currentTenantId: tenantId } });
  return { message: 'Tenant switched', tenantId };
} 