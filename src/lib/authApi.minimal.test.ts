import { getUserProfile } from './authApi.js';
import prisma from '../integrations/mysql.js';

describe('Minimal getUserProfile test', () => {
  let user;
  beforeAll(async () => {
    user = await prisma.user.create({ data: { email: 'minimaltest@example.com', password: 'pw' } });
  });
  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: user.id } });
  });
  test('getUserProfile returns user data', async () => {
    const profile = await getUserProfile(user.id);
    expect(profile.email).toBe('minimaltest@example.com');
  });
}); 