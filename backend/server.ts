import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import membersRoutes from './domain/members/member.routes.js';
import sessionsRoutes from './domain/sessions/session.routes.js';
import staffRoutes from './domain/staff/staff.routes.js';
import packageRoutes from './domain/packages/package.routes.js';
import measurementRoutes from './domain/measurements/measurement.routes.js';
import { authenticateToken } from './middleware/auth.middleware.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { getDb, schema } from './db/index.js';
import { eq } from 'drizzle-orm';
import { AppError } from './core/types/ErrorTypes.js';


// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: resolve(__dirname, '.env') });

console.log('🔍 Environment Check:');
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('__dirname:', __dirname);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database connection (singleton pattern via getDb())
try {
  getDb(); // Initialize the singleton
  console.log('✅ Database connected successfully');
} catch (error) {
  console.error('❌ Database connection failed:', error);
  process.exit(1);
}

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'MorFit Studio Suite API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Debug endpoint - database connection info
app.get('/api/debug/db', (req: Request, res: Response) => {
  res.json({
    success: true,
    database_url: process.env.DATABASE_URL,
    node_env: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/members', membersRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/measurements', measurementRoutes);

// Settings routes
app.get('/api/settings/devices', authenticateToken, async (req: Request, res: Response) => {
  // Mock devices data for now
  res.json({
    success: true,
    data: [
      { id: 'vacu-1', name: 'Vacuum Therapy 1', type: 'vacuum', status: 'active' },
      { id: 'vacu-2', name: 'Vacuum Therapy 2', type: 'vacuum', status: 'active' },
      { id: 'vacu-3', name: 'Vacuum Therapy 3', type: 'vacuum', status: 'maintenance' },
      { id: 'rf-1', name: 'RF Therapy 1', type: 'rf', status: 'active' },
      { id: 'rf-2', name: 'RF Therapy 2', type: 'rf', status: 'active' },
      { id: 'laser-1', name: 'Laser Therapy 1', type: 'laser', status: 'active' },
      { id: 'laser-2', name: 'Laser Therapy 2', type: 'laser', status: 'active' },
    ]
  });
});

// Client error reporting (no auth required for error reporting)
app.post('/api/client-errors', async (req: Request, res: Response) => {
  try {
    const { message, stack, url, userAgent, timestamp } = req.body;

    // Log client error (in production, you might want to store in database)
    console.error('Client Error:', {
      message,
      stack,
      url,
      userAgent,
      timestamp,
      userId: req.user?.id || 'anonymous'
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Client error reporting failed:', error);
    res.status(500).json({ success: false, error: 'Failed to report error' });
  }
});

// Admin password reset endpoint (development only)
if (process.env.NODE_ENV === 'development') {
  app.post('/api/admin/reset-password', async (req: Request, res: Response) => {
    try {
      const { email, newPassword } = req.body;

      if (!email || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Email and newPassword are required'
        });
      }

      // Only allow admin@morfistudio.com
      if (email !== 'admin@morfistudio.com') {
        return res.status(403).json({
          success: false,
          error: 'Only admin@morfistudio.com can be reset'
        });
      }

      // Update password to plain text for development
      await getDb().update(schema.users)
        .set({ password: newPassword })
        .where(eq(schema.users.email, email));

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({
        success: false,
        error: 'Password reset failed'
      });
    }
  });
}

// Drizzle test endpoint
app.get('/api/drizzle/members', async (req: Request, res: Response) => {
  try {
    const allMembers = await getDb().select().from(schema.members);
    res.json({
      success: true,
      data: allMembers
    });
  } catch (error) {
    console.error('Drizzle members error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch members'
    });
  }
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  
  // Handle AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
  
  // Handle generic errors
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MorFit Studio Suite API server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
