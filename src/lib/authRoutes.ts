import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { 
  verifyJWT, 
  refreshToken, 
  logoutUser, 
  forgotPassword, 
  verifyEmail, 
  getUserProfile, 
  updateUserProfile, 
  deactivateUser, 
  getUserTenants, 
  switchUserTenant 
} from './authApi.js';

interface AuthenticatedRequest extends Request {
  user?: any;
}

const router = express.Router();
const prisma = new PrismaClient();



// Simple validation functions
function validateRegistration(data: any) {
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

function validateLogin(data: any) {
  if (!data.email || !data.password) {
    return 'Email and password are required';
  }
  return null;
}

// Register endpoint
router.post('/register', async (req: Request, res: Response) => {
  try {
    const validationError = validateRegistration(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        preferences: user.preferences,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const validationError = validateLogin(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        preferences: user.preferences,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken: oldToken } = req.body;
    if (!oldToken) {
      res.status(400).json({ error: 'Refresh token is required' });
      return;
    }
    const result = await refreshToken(oldToken);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      res.status(400).json({ error: 'Refresh token is required' });
      return;
    }
    await logoutUser(token);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }
    const result = await forgotPassword(email);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ error: 'Verification token is required' });
      return;
    }
    const result = await verifyEmail(token);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }
  try {
    const payload = verifyJWT(auth.split(' ')[1]);
    req.user = payload;
    next();
  } catch (err: any) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

router.get('/users/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await getUserProfile(req.user?.userId);
    res.status(200).json(user);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.put('/users/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await updateUserProfile(req.user?.userId, req.body);
    res.status(200).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/users/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await deactivateUser(req.user?.userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/users/tenants', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenants = await getUserTenants(req.user?.userId);
    res.status(200).json(tenants);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/users/switch-tenant', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { tenantId } = req.body;
    if (!tenantId) {
      res.status(400).json({ error: 'tenantId is required' });
      return;
    }
    const result = await switchUserTenant(req.user?.userId, tenantId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Auth server is running' });
});

export default router; 