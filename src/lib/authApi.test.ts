const authApi = require('./authApi');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

const { refreshToken, createRefreshToken, logoutUser, forgotPassword, verifyEmail, getUserProfile, updateUserProfile, deactivateUser, getUserTenants, switchUserTenant } = authApi;
const prismaClient = prisma;
const jwtLib = jwt;

describe('Auth API - Full Logic Coverage', () => {
  let user;
  let password = 'TestPassword123!';
  let refreshTokenValue;
  let tenant;
  let mainEmail = `fulltest_${Date.now()}@example.com`;

  beforeAll(async () => {
    try {
      const reg = await authApi.registerUser(mainEmail, password);
      user = await prisma.user.findUnique({ where: { id: reg.id } });
    } catch (e) {
      user = await prisma.user.findUnique({ where: { email: mainEmail } });
    }
    tenant = await prisma.tenant.create({ data: { name: 'FullTestOrg' } });
    await prisma.userTenant.create({ data: { userId: user.id, tenantId: tenant.id, role: 'admin' } });
  });

  afterAll(async () => {
    if (user && user.id) {
      await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
      await prisma.blogPost.deleteMany({ where: { userId: user.id } });
      await prisma.playlist.deleteMany({ where: { userId: user.id } });
      await prisma.userTenant.deleteMany({ where: { userId: user.id } });
      await prisma.user.deleteMany({ where: { id: user.id } });
    }
    if (tenant && tenant.id) {
      await prisma.tenant.deleteMany({ where: { id: tenant.id } });
    }
  });

  test('registerUser throws if user exists', async () => {
    await expect(authApi.registerUser(user.email, 'pw')).rejects.toThrow('User already exists');
  });

  test('loginUser throws on bad credentials', async () => {
    await expect(authApi.loginUser('notfound@example.com', 'pw')).rejects.toThrow('Invalid email or password');
    await expect(authApi.loginUser(user.email, 'wrongpw')).rejects.toThrow('Invalid email or password');
  });

  test('loginUser returns token and user', async () => {
    const result = await authApi.loginUser(user.email, password);
    expect(result).toHaveProperty('token');
    expect(result.user.email).toBe(user.email);
  });

  test('refreshToken and logoutUser', async () => {
    refreshTokenValue = await authApi.createRefreshToken(user.id);
    const refreshed = await authApi.refreshToken(refreshTokenValue);
    expect(refreshed).toHaveProperty('token');
    expect(refreshed).toHaveProperty('refreshToken');
    await authApi.logoutUser(refreshed.refreshToken);
    await expect(authApi.refreshToken(refreshed.refreshToken)).rejects.toThrow('Invalid or expired refresh token');
  });

  test('forgotPassword and verifyEmail', async () => {
    const { resetToken } = await authApi.forgotPassword(user.email);
    const updated = await prisma.user.findUnique({ where: { id: user.id } });
    expect(updated.resetPasswordToken).toBe(resetToken);
    await prisma.user.update({ where: { id: user.id }, data: { emailVerificationToken: 'verify-token' } });
    const verifyResult = await authApi.verifyEmail('verify-token');
    expect(verifyResult).toHaveProperty('message');
    const verified = await prisma.user.findUnique({ where: { id: user.id } });
    expect(verified.emailVerified).toBe(true);
  });

  test('getUserProfile, updateUserProfile, deactivateUser', async () => {
    const profile = await authApi.getUserProfile(user.id);
    expect(profile.email).toBe(user.email);
    // Use a unique email for update
    const updated = await authApi.updateUserProfile(user.id, { email: 'updated_' + Date.now() + '@example.com' });
    expect(updated.email).toMatch(/updated_.*@example.com/);
    const deactivated = await authApi.deactivateUser(user.id);
    expect(deactivated).toHaveProperty('message');
    const after = await prisma.user.findUnique({ where: { id: user.id } });
    expect(after.email).toBeNull();
  });

  test('getUserTenants and switchUserTenant', async () => {
    // Use unique emails for each test user
    const uniqueEmail = 'tenantfulltest_' + Date.now() + '@example.com';
    const reg = await authApi.registerUser(uniqueEmail, password);
    const u = await prisma.user.findUnique({ where: { id: reg.id } });
    const t = await prisma.tenant.create({ data: { name: 'TenantFullTestOrg_' + Date.now() } });
    await prisma.userTenant.create({ data: { userId: u.id, tenantId: t.id, role: 'member' } });
    const tenants = await authApi.getUserTenants(u.id);
    expect(tenants.length).toBeGreaterThan(0);
    expect(tenants[0]).toHaveProperty('name');
    const result = await authApi.switchUserTenant(u.id, t.id);
    expect(result).toHaveProperty('tenantId', t.id);
    const updated = await prisma.user.findUnique({ where: { id: u.id } });
    expect(updated.currentTenantId).toBe(t.id);
    await prisma.refreshToken.deleteMany({ where: { userId: u.id } });
    await prisma.blogPost.deleteMany({ where: { userId: u.id } });
    await prisma.playlist.deleteMany({ where: { userId: u.id } });
    await prisma.userTenant.deleteMany({ where: { userId: u.id } });
    await prisma.tenant.deleteMany({ where: { id: t.id } });
    await prisma.user.deleteMany({ where: { id: u.id } });
  });

  test('verifyJWT throws on invalid token', () => {
    expect(() => authApi.verifyJWT('bad.token.here')).toThrow('Invalid or expired token');
  });
}); 