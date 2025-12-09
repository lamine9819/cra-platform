// src/app.ts - Configuration complète de l'application CRA Platform
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';

// Import des routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import projectRoutes from './routes/project.routes';
import activityRoutes from './routes/activity.routes';
import conventionRoutes from './routes/convention.routes';
import eventRoutes from './routes/event.routes';
import KnowledgeTransferRoutes from './routes/knowledgeTransfer.routes';
import publicationRoutes from './routes/publication.routes';
import planningRoutes from './routes/strategic-planning.routes';
import documentRoutes from './routes/document.routes';
import formRoutes from './routes/form.routes';
import commentRoutes from './routes/comment.routes';
import notificationRoutes from './routes/notification.routes';
import dashboardRoutes from './routes/dashboard.routes';
import auditRoutes from './routes/audit.routes';
import reportRoutes from './routes/report.routes';
import adminDashboardRoutes from './routes/admin/dashboard.admin.routes';
import partnerRoutes from './routes/partner.routes';
import auditLogRoutes from './routes/auditLog.routes';
import trainingRoutes from './routes/training.routes';
import supervisionRoutes from './routes/supervision.routes';
import chatRoutes from './routes/chat.routes';

// Import des middlewares
import { errorHandler } from './middlewares/errorHandler';
import { auditSystemError } from './middlewares/auditMiddleware';
import { auditLogMiddleware, auditErrorMiddleware } from './middleware/auditLog.middleware';
// Sérialisation de BinInt
import { setupBigIntSerialization } from './utils/bigint';
import { appendFile } from 'fs';
setupBigIntSerialization();
// Variables d'environnement
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const app = express();

// =============================================
// CONFIGURATION MIDDLEWARES DE SÉCURITÉ
// =============================================

// Trust proxy (pour déploiement derrière un reverse proxy)
app.set('trust proxy', 1);

// Helmet pour la sécurité HTTP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http://localhost:5173", "http://127.0.0.1:5173"],
      connectSrc: ["'self'", "ws:", "wss:"],
      frameAncestors: ["'self'", "http://localhost:5173", "http://127.0.0.1:5173"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false, // Permettre le chargement des images depuis le frontend
  frameguard: {
    action: 'sameorigin'
  }
}));

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origine (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
}));

// Middleware pour servir les fichiers statiques (photos)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Augmenter les limites pour les uploads base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting général
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 100 : 1000, // limite par IP
  message: {
    success: false,
    message: 'Trop de requêtes depuis cette IP, réessayez plus tard.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Fonction skip corrigée pour éviter les conflits path-to-regexp
  skip: (req) => {
    const path = req.path;
    return path === '/health' || 
           path === '/api/auth/refresh' ||
           path.startsWith('/uploads/') ||
           path.startsWith('/public/');
  }
});

app.use(limiter);

// Rate limiting spécial pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives max par IP
  message: {
    success: false,
    message: 'Trop de tentatives de connexion, réessayez plus tard.',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true,
});

// =============================================
// CONFIGURATION MIDDLEWARES GÉNÉRAUX
// =============================================

// Compression des réponses
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024, // Compresser seulement les réponses > 1KB
  level: 6 // Niveau de compression (1-9)
}));

// Parsing avec validation
app.use(express.json({ 
  limit: '50mb',
  verify: (_req, _res, buf) => {
    // Validation basique du JSON
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      throw new Error('JSON invalide');
    }
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '50mb',
  parameterLimit: 1000
}));

// Cookie parser
app.use(cookieParser());

// Logging HTTP
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400 // Log seulement les erreurs en production
  }));
}

// =============================================
// AUDIT LOG MIDDLEWARE (capture automatique)
// =============================================

// Middleware d'audit log automatique - capturer toutes les actions
app.use(auditLogMiddleware);

// =============================================
// CONFIGURATION POUR LES FICHIERS STATIQUES
// =============================================

// Servir les fichiers uploadés (avec sécurité renforcée)
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '1d',
  index: false, // Désactiver l'index des dossiers
  setHeaders: (res, filePath) => {
    // Sécurité pour les fichiers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    
    // Types de fichiers autorisés
    const allowedExtensions = ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg', '.gif', '.txt', '.csv'];
    const ext = path.extname(filePath).toLowerCase();
    
    if (!allowedExtensions.includes(ext)) {
      res.status(403).end('Type de fichier non autorisé');
      return;
    }
    
    // Content-Type approprié
    const mimeTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.txt': 'text/plain',
      '.csv': 'text/csv'
    };
    
    if (mimeTypes[ext]) {
      res.setHeader('Content-Type', mimeTypes[ext]);
    }
  }
}));

// Servir les fichiers publics
app.use('/public', express.static(path.join(__dirname, '../public'), {
  maxAge: '7d',
  index: false
}));

// =============================================
// CONFIGURATION DES HEADERS DE SÉCURITÉ
// =============================================

app.use((req, res, next) => {
  // Headers de sécurité additionnels
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  
  // Cache control pour les APIs
  if (req.method === 'GET' && req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  // Headers pour les WebSockets
  if (req.path.startsWith('/socket.io')) {
    res.setHeader('Access-Control-Allow-Origin', FRONTEND_URL);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  next();
});

// =============================================
// HEALTH CHECK ET MONITORING
// =============================================

// Health check simple
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
    }
  });
});

// Health check détaillé
app.get('/health/detailed', async (req, res) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    // Test de connexion à la base de données
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbResponseTime = Date.now() - startTime;
    await prisma.$disconnect();
    
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: 'OK',
          responseTime: `${dbResponseTime}ms`
        },
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
          usage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100) + '%'
        },
        uptime: Math.round(process.uptime()) + ' seconds',
        environment: NODE_ENV,
        nodeVersion: process.version,
        platform: process.platform
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
      details: NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// Metrics endpoint (compatible Prometheus)
app.get('/metrics', (req, res) => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  res.setHeader('Content-Type', 'text/plain');
  res.send(`
# HELP nodejs_memory_usage_bytes Memory usage in bytes
# TYPE nodejs_memory_usage_bytes gauge
nodejs_memory_usage_heap_used ${memUsage.heapUsed}
nodejs_memory_usage_heap_total ${memUsage.heapTotal}
nodejs_memory_usage_external ${memUsage.external}
nodejs_memory_usage_rss ${memUsage.rss}

# HELP nodejs_uptime_seconds Process uptime in seconds
# TYPE nodejs_uptime_seconds counter
nodejs_uptime_seconds ${process.uptime()}

# HELP nodejs_cpu_usage_microseconds CPU usage in microseconds
# TYPE nodejs_cpu_usage_microseconds counter
nodejs_cpu_usage_user_microseconds ${cpuUsage.user}
nodejs_cpu_usage_system_microseconds ${cpuUsage.system}
  `.trim());
});

// =============================================
// ROUTES API PRINCIPALES
// =============================================

// API de base avec informations complètes
app.get('/api', (_req, res) => {
  res.json({
    message: 'CRA Platform API',
    version: '1.0.0',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    status: 'operational',
    features: {
      websocket: true,
      authentication: true,
      fileUpload: true,
      realTimeNotifications: true,
      auditTrail: true,
      rateLimit: true
    },
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      projects: '/api/projects',
      activities: '/api/activities',
      partners: '/api/partners',
      publications: '/api/publications',
      conventions: '/api/conventions',
      knowledgeTransfers: '/api/knowledge-transfers',
      strategicPlanning: '/api/strategic-planning',
      events: '/api/events',
      tasks: '/api/tasks',
      documents: '/api/documents',
      forms: '/api/forms',
      seminars: '/api/seminars',
      comments: '/api/comments',
      notifications: '/api/notifications',
      dashboard: '/api/dashboard',
      adminDashboard: '/api/admin/dashboard',
      audit: '/api/audit',
      reports: '/api/reports',
      trainings: '/api/trainings',
      supervisions: '/api/supervisions'
    },
    documentation: {
      health: '/health',
      detailedHealth: '/health/detailed',
      metrics: '/metrics'
    }
  });
});

// Routes avec rate limiting spécial pour l'auth
app.use('/api/auth', authLimiter, authRoutes);

// Routes principales
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/publications', publicationRoutes);
app.use('/api/conventions', conventionRoutes);
app.use('/api/knowledge-transfers', KnowledgeTransferRoutes);
app.use('/api/strategic-planning', planningRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/supervisions', supervisionRoutes);

// =============================================
// GESTION DES ERREURS ET 404
// =============================================

// Route 404 pour les APIs
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route API non trouvée',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    suggestion: 'Consultez /api pour voir les endpoints disponibles'
  });
});

// Route 404 générale
app.use('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({
      success: false,
      message: 'Endpoint non trouvé'
    });
  } else {
    res.status(404).json({
      message: 'Page non trouvée',
      suggestion: 'Utilisez /api pour accéder à l\'API',
      availableEndpoints: [
        '/api',
        '/health',
        '/metrics'
      ]
    });
  }
});


// =============================================
// MIDDLEWARES DE GESTION D'ERREURS
// =============================================

// Audit des erreurs système (DOIT être avant le gestionnaire d'erreurs global)
app.use(auditSystemError);

// Middleware d'audit pour les erreurs
app.use(auditErrorMiddleware);

// Gestionnaire d'erreurs global (DOIT être en dernier)
app.use(errorHandler);

// =============================================
// GESTION PROPRE DE L'ARRÊT
// =============================================

// Gestion des signaux système
process.on('SIGTERM', () => {
  console.log('🛑 Signal SIGTERM reçu, préparation de l\'arrêt...');
});

process.on('SIGINT', () => {
  console.log('🛑 Signal SIGINT reçu, préparation de l\'arrêt...');
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('❌ Erreur non capturée:', error);
  // Ne pas quitter immédiatement en production
  if (NODE_ENV !== 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée non gérée:', reason);
  console.error('Promise:', promise);
  // Ne pas quitter immédiatement en production
  if (NODE_ENV !== 'production') {
    process.exit(1);
  }
});

console.log('✅ Application CRA configurée avec succès');

export default app;