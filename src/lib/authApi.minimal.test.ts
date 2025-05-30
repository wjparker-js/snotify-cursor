const { getUserProfile } = require('./authApi');
const testPrisma = require('../integrations/mysql');

describe('Minimal getUserProfile test', () => {
  let user;
  beforeAll(async () => {
    user = await testPrisma.user.create({ data: { email: 'minimaltest@example.com', password: 'pw' } });
  });
  afterAll(async () => {
    await testPrisma.user.deleteMany({ where: { id: user.id } });
  });
  test('getUserProfile returns user data', async () => {
    const profile = await getUserProfile(user.id);
    expect(profile.email).toBe('minimaltest@example.com');
  });
}); 