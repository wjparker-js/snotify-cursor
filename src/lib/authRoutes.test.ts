const request = require('supertest');
const expressTest = require('express');
const authRoutes = require('./authRoutes');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = expressTest();
app.use(expressTest.json());
app.use('/api/auth', authRoutes);

const password = 'TestPassword123!';
const uniqueEmail = `integration_${Date.now()}@example.com`;

let jwtToken;
let refreshTokenValue;
let userId;

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: uniqueEmail } });
});
afterAll(async () => {
  const user = await prisma.user.findFirst({ where: { email: uniqueEmail } });
  if (user) {
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    await prisma.blogPost.deleteMany({ where: { userId: user.id } });
    await prisma.playlist.deleteMany({ where: { userId: user.id } });
    await prisma.userTenant.deleteMany({ where: { userId: user.id } });
    await prisma.user.deleteMany({ where: { id: user.id } });
  }
});

describe('Auth API Integration', () => {
  test('registers a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: uniqueEmail, password });
    expect(res.statusCode).toBe(201);
    expect(res.body.user.email).toBe(uniqueEmail);
    userId = res.body.user.id;
  });

  test('login returns JWT and user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: uniqueEmail, password });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(uniqueEmail);
    jwtToken = res.body.token;
  });

  test('login fails with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: uniqueEmail, password: 'wrongpw' });
    expect(res.statusCode).toBe(401);
  });

  test('refresh returns new JWT and refresh token', async () => {
    // Get refresh token by logging in again
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: uniqueEmail, password });
    refreshTokenValue = loginRes.body.refreshToken || (await prisma.refreshToken.findFirst({ where: { userId } })).token;
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: refreshTokenValue });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  test('logout revokes refresh token', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .send({ refreshToken: refreshTokenValue });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/logged out/i);
  });

  test('forgot-password returns reset token', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: uniqueEmail });
    expect(res.statusCode).toBe(200);
    expect(res.body.resetToken).toBeDefined();
  });

  test('verify-email fails with invalid token', async () => {
    const res = await request(app)
      .post('/api/auth/verify-email')
      .send({ token: 'badtoken' });
    expect(res.statusCode).toBe(400);
  });

  test('GET /users/profile returns user profile', async () => {
    const res = await request(app)
      .get('/api/auth/users/profile')
      .set('Authorization', `Bearer ${jwtToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(uniqueEmail);
  });

  test('PUT /users/profile updates email', async () => {
    const newEmail = `integration_updated_${Date.now()}@example.com`;
    const res = await request(app)
      .put('/api/auth/users/profile')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ email: newEmail });
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(newEmail);
  });

  test('DELETE /users/profile deactivates account', async () => {
    const res = await request(app)
      .delete('/api/auth/users/profile')
      .set('Authorization', `Bearer ${jwtToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deactivated/i);
  });
}); 