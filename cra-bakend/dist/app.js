"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// src/app.ts - Configuration complète de l'application CRA Platform
const express_1 = tslib_1.__importDefault(require("express"));
const cors_1 = tslib_1.__importDefault(require("cors"));
const helmet_1 = tslib_1.__importDefault(require("helmet"));
const express_rate_limit_1 = tslib_1.__importDefault(require("express-rate-limit"));
const compression_1 = tslib_1.__importDefault(require("compression"));
const morgan_1 = tslib_1.__importDefault(require("morgan"));
const cookie_parser_1 = tslib_1.__importDefault(require("cookie-parser"));
const path_1 = tslib_1.__importDefault(require("path"));
// Import des routes
const auth_routes_1 = tslib_1.__importDefault(require("./routes/auth.routes"));
const user_routes_1 = tslib_1.__importDefault(require("./routes/user.routes"));
const project_routes_1 = tslib_1.__importDefault(require("./routes/project.routes"));
const activity_routes_1 = tslib_1.__importDefault(require("./routes/activity.routes"));
const form_routes_1 = tslib_1.__importDefault(require("./routes/form.routes"));
const convention_routes_1 = tslib_1.__importDefault(require("./routes/convention.routes"));
const event_routes_1 = tslib_1.__importDefault(require("./routes/event.routes"));
const knowledgeTransfer_routes_1 = tslib_1.__importDefault(require("./routes/knowledgeTransfer.routes"));
const publication_routes_1 = tslib_1.__importDefault(require("./routes/publication.routes"));
const strategic_planning_routes_1 = tslib_1.__importDefault(require("./routes/strategic-planning.routes"));
const document_routes_1 = tslib_1.__importDefault(require("./routes/document.routes"));
const form_routes_2 = tslib_1.__importDefault(require("./routes/form.routes"));
const comment_routes_1 = tslib_1.__importDefault(require("./routes/comment.routes"));
const notification_routes_1 = tslib_1.__importDefault(require("./routes/notification.routes"));
const dashboard_routes_1 = tslib_1.__importDefault(require("./routes/dashboard.routes"));
const audit_routes_1 = tslib_1.__importDefault(require("./routes/audit.routes"));
const report_routes_1 = tslib_1.__importDefault(require("./routes/report.routes"));
const dashboard_admin_routes_1 = tslib_1.__importDefault(require("./routes/admin/dashboard.admin.routes"));
const partner_routes_1 = tslib_1.__importDefault(require("./routes/partner.routes"));
const auditLog_routes_1 = tslib_1.__importDefault(require("./routes/auditLog.routes"));
const training_routes_1 = tslib_1.__importDefault(require("./routes/training.routes"));
const supervision_routes_1 = tslib_1.__importDefault(require("./routes/supervision.routes"));
// Import des middlewares
const errorHandler_1 = require("./middlewares/errorHandler");
const auditMiddleware_1 = require("./middlewares/auditMiddleware");
const auditLog_middleware_1 = require("./middleware/auditLog.middleware");
// Sérialisation de BinInt
const bigint_1 = require("./utils/bigint");
(0, bigint_1.setupBigIntSerialization)();
// Variables d'environnement
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const app = (0, express_1.default)();
// =============================================
// CONFIGURATION MIDDLEWARES DE SÉCURITÉ
// =============================================
// Trust proxy (pour déploiement derrière un reverse proxy)
app.set('trust proxy', 1);
// Helmet pour la sécurité HTTP
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "ws:", "wss:"],
            frameAncestors: ["'self'", "http://localhost:5173", "http://127.0.0.1:5173"],
        },
    },
    crossOriginEmbedderPolicy: false,
    frameguard: {
        action: 'sameorigin'
    }
}));
// CORS configuration
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Autoriser les requêtes sans origine (mobile apps, Postman, etc.)
        if (!origin)
            return callback(null, true);
        const allowedOrigins = [
            FRONTEND_URL,
            'http://localhost:5173',
            'http://localhost:5173',
            'http://127.0.0.1:5173'
        ];
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Non autorisé par CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count']
}));
// Middleware pour servir les fichiers statiques (photos)
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Augmenter les limites pour les uploads base64
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// Rate limiting général
const limiter = (0, express_rate_limit_1.default)({
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
const authLimiter = (0, express_rate_limit_1.default)({
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
app.use((0, compression_1.default)({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression_1.default.filter(req, res);
    },
    threshold: 1024, // Compresser seulement les réponses > 1KB
    level: 6 // Niveau de compression (1-9)
}));
// Parsing avec validation
app.use(express_1.default.json({
    limit: '50mb',
    verify: (_req, _res, buf) => {
        // Validation basique du JSON
        try {
            JSON.parse(buf.toString());
        }
        catch (e) {
            throw new Error('JSON invalide');
        }
    }
}));
app.use(express_1.default.urlencoded({
    extended: true,
    limit: '50mb',
    parameterLimit: 1000
}));
// Cookie parser
app.use((0, cookie_parser_1.default)());
// Logging HTTP
if (NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined', {
        skip: (req, res) => res.statusCode < 400 // Log seulement les erreurs en production
    }));
}
// =============================================
// AUDIT LOG MIDDLEWARE (capture automatique)
// =============================================
// Middleware d'audit log automatique - capturer toutes les actions
app.use(auditLog_middleware_1.auditLogMiddleware);
// =============================================
// CONFIGURATION POUR LES FICHIERS STATIQUES
// =============================================
// Servir les fichiers uploadés (avec sécurité renforcée)
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads'), {
    maxAge: '1d',
    index: false, // Désactiver l'index des dossiers
    setHeaders: (res, filePath) => {
        // Sécurité pour les fichiers
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        // Types de fichiers autorisés
        const allowedExtensions = ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg', '.gif', '.txt', '.csv'];
        const ext = path_1.default.extname(filePath).toLowerCase();
        if (!allowedExtensions.includes(ext)) {
            res.status(403).end('Type de fichier non autorisé');
            return;
        }
        // Content-Type approprié
        const mimeTypes = {
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
app.use('/public', express_1.default.static(path_1.default.join(__dirname, '../public'), {
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
        const { PrismaClient } = await Promise.resolve().then(() => tslib_1.__importStar(require('@prisma/client')));
        const prisma = new PrismaClient();
        // Test de connexion à la base de données
        const startTime = Date.now();
        await prisma.$queryRaw `SELECT 1`;
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
    }
    catch (error) {
        res.status(503).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            error: 'Database connection failed',
            details: NODE_ENV === 'development' ? error.message : undefined
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
            formes: '/api/formes',
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
app.use('/api/auth', authLimiter, auth_routes_1.default);
// Routes principales
app.use('/api/users', user_routes_1.default);
app.use('/api/projects', project_routes_1.default);
app.use('/api/activities', activity_routes_1.default);
app.use('/api/formes', form_routes_1.default);
app.use('/api/publications', publication_routes_1.default);
app.use('/api/conventions', convention_routes_1.default);
app.use('/api/knowledge-transfers', knowledgeTransfer_routes_1.default);
app.use('/api/strategic-planning', strategic_planning_routes_1.default);
app.use('/api/documents', document_routes_1.default);
app.use('/api/events', event_routes_1.default);
app.use('/api/forms', form_routes_2.default);
app.use('/api/comments', comment_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/admin/dashboard', dashboard_admin_routes_1.default);
app.use('/api/audit', audit_routes_1.default);
app.use('/api/reports', report_routes_1.default);
app.use('/api/partners', partner_routes_1.default);
app.use('/api/audit-logs', auditLog_routes_1.default);
app.use('/api/trainings', training_routes_1.default);
app.use('/api/supervisions', supervision_routes_1.default);
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
    }
    else {
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
app.use(auditMiddleware_1.auditSystemError);
// Middleware d'audit pour les erreurs
app.use(auditLog_middleware_1.auditErrorMiddleware);
// Gestionnaire d'erreurs global (DOIT être en dernier)
app.use(errorHandler_1.errorHandler);
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
exports.default = app;
//# sourceMappingURL=app.js.map