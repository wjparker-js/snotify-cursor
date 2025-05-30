const express = require('express');
const { registerUser, loginUser, refreshToken, logoutUser, forgotPassword, verifyEmail, getUserProfile, updateUserProfile, deactivateUser, getUserTenants, switchUserTenant, createRefreshToken } = require('./authApi');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await registerUser(email, password);
    res.status(201).json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const result = await loginUser(email, password);
    const refreshTokenValue = await createRefreshToken(result.user.id);
    res.status(200).json({ ...result, refreshToken: refreshTokenValue });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken: oldToken } = req.body;
    if (!oldToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }
    const result = await refreshToken(oldToken);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }
    await logoutUser(token);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const result = await forgotPassword(email);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }
    const result = await verifyEmail(token);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  try {
    const payload = require('./authApi').verifyJWT(auth.split(' ')[1]);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

router.get('/users/profile', requireAuth, async (req, res) => {
  try {
    const user = await getUserProfile(req.user.userId);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.put('/users/profile', requireAuth, async (req, res) => {
  try {
    const user = await updateUserProfile(req.user.userId, req.body);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/users/profile', requireAuth, async (req, res) => {
  try {
    const result = await deactivateUser(req.user.userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/users/tenants', requireAuth, async (req, res) => {
  try {
    const tenants = await getUserTenants(req.user.userId);
    res.status(200).json(tenants);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/users/switch-tenant', requireAuth, async (req, res) => {
  try {
    const { tenantId } = req.body;
    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }
    const result = await switchUserTenant(req.user.userId, tenantId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 