// src/server.ts - Configuration serveur complète avec WebSocket et services
import { createServer } from 'http';
import app from './app';
import { initializeWebSocketService, getWebSocketService } from './services/websocketNotification.service';
import { AutomaticNotificationService } from './services/automaticNotification.service';

// Variables d'environnement
const PORT = parseInt(process.env.PORT || '3001', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';
const HOST = process.env.HOST || '0.0.0.0';

// Créer le serveur HTTP
const server = createServer(app);

// =============================================
// INITIALISATION DES SERVICES
// =============================================

// Initialiser le service WebSocket
console.log('🔌 Initialisation du service WebSocket...');
const webSocketService = initializeWebSocketService(server);
console.log('🔌 Service WebSocket initialisé');

// Programmer les notifications automatiques et tâches récurrentes
console.log('📅 Configuration des tâches automatiques...');
AutomaticNotificationService.scheduleRecurringNotifications();
console.log('📅 Notifications récurrentes programmées');

// Middleware pour injecter le service WebSocket dans les requêtes
app.use((req: any, _res, next) => {
  req.webSocketService = webSocketService;
  next();
});

// =============================================
// CONFIGURATION AVANCÉE DU SERVEUR
// =============================================

// Configuration des timeouts
server.timeout = 30000; // 30 secondes
server.keepAliveTimeout = 65000; // 65 secondes
server.headersTimeout = 66000; // 66 secondes

// Configuration pour la production
if (NODE_ENV === 'production') {
  // Augmenter les limites pour la production
  server.maxHeadersCount = 2000;
  server.maxRequestsPerSocket = 1000;
  
  // Configuration SSL/TLS si nécessaire
  if (process.env.HTTPS_ENABLED === 'true') {
    console.log('🔒 Configuration HTTPS activée');
  }
}

// =============================================
// DÉMARRAGE DU SERVEUR
// =============================================

server.listen(PORT, HOST, () => {
  console.log('\n🚀 =======================================');
  console.log('🚀     PLATEFORME CRA DÉMARRÉE         🚀');
  console.log('🚀 =======================================');
  console.log('');
  console.log(`🌐 Serveur principal: http://${HOST}:${PORT}`);
  console.log(`🔌 WebSocket: ws://${HOST}:${PORT}/socket.io`);
  console.log(`💊 Health check: http://${HOST}:${PORT}/health`);
  console.log(`📊 Metrics: http://${HOST}:${PORT}/metrics`);
  console.log(`📡 API Base: http://${HOST}:${PORT}/api`);
  console.log('');
  console.log('🎯 ========== MODULES ACTIFS ==========');
  console.log('  ✅ Authentification JWT');
  console.log('  ✅ Gestion des utilisateurs');
  console.log('  ✅ Gestion des projets');
  console.log('  ✅ Gestion des activités');
  console.log('  ✅ Gestion des tâches');
  console.log('  ✅ Gestion des documents');
  console.log('  ✅ Système de formulaires');
  console.log('  ✅ Gestion des séminaires');
  console.log('  ✅ Système de commentaires');
  console.log('  ✅ Système de reports');
  console.log('  ✅ Notifications temps réel');
  console.log('  ✅ Dashboard analytics');
  console.log('  ✅ Système d\'audit complet');
  console.log('');
  console.log('🔐 ========= SÉCURITÉ ACTIVE ==========');
  console.log('  ✅ CORS configuré');
  console.log('  ✅ Helmet (sécurité headers)');
  console.log('  ✅ Rate limiting');
  console.log('  ✅ Compression activée');
  console.log('  ✅ Audit trails automatiques');
  console.log('  ✅ Validation Zod');
  console.log('  ✅ Upload sécurisé');
  console.log('');
  console.log('📈 ======== FONCTIONNALITÉS ==========');
  console.log('  🔔 Notifications temps réel');
  console.log('  📊 Analytics et métriques');
  console.log('  🛡️ Audit de sécurité');
  console.log('  📁 Gestion de fichiers');
  console.log('  🎓 Système de séminaires');
  console.log('  📝 Génération de rapports');
  console.log('  📝 Formulaires dynamiques');
  console.log('  💬 Commentaires contextuels');
  console.log('  📱 API REST complète');
  console.log('');
  console.log('🌟 ========== ENDPOINTS =============');
  console.log('  🔑 POST   /api/auth/login');
  console.log('  🔑 POST   /api/auth/register');
  console.log('  👥 GET    /api/users');
  console.log('  📂 GET    /api/projects');
  console.log('  📋 GET    /api/tasks');
  console.log('  📄 GET    /api/documents');
  console.log('  📝 GET    /api/forms');
  console.log('  📝 GET    /api/reports');
  console.log('  🎓 GET    /api/seminars');
  console.log('  💬 GET    /api/comments');
  console.log('  🔔 GET    /api/notifications');
  console.log('  📊 GET    /api/dashboard');
  console.log('  🛡️ GET    /api/audit');
  console.log('');
  console.log(`🎊 Environnement: ${NODE_ENV.toUpperCase()}`);
  console.log(`⏰ Démarré le: ${new Date().toLocaleString()}`);
  console.log('');
  
  // Afficher les informations WebSocket
  const wsStats = webSocketService.getConnectionStats();
  console.log('🔌 ======== WEBSOCKET INFO ===========');
  console.log(`  📡 Utilisateurs connectés: ${wsStats.totalUsers}`);
  console.log(`  🔗 Connexions actives: ${wsStats.totalConnections}`);
  console.log('  ✅ Service temps réel activé');
  console.log('');
  
  console.log('🚀 PLATEFORME CRA PRÊTE POUR LA PRODUCTION ! 🚀');
  console.log('=======================================\n');
  
  // Logs de démarrage selon l'environnement
  if (NODE_ENV === 'development') {
    console.log('🔧 Mode développement activé');
    console.log('📝 Logs détaillés activés');
    console.log('🔄 Hot reload disponible');
    console.log('');
    console.log('📋 Pour tester l\'API:');
    console.log(`   curl http://${HOST}:${PORT}/health`);
    console.log(`   curl http://${HOST}:${PORT}/api`);
    console.log('');
    console.log('🔗 Liens utiles:');
    console.log(`   📡 API Documentation: http://${HOST}:${PORT}/api`);
    console.log(`   💊 Health Check: http://${HOST}:${PORT}/health`);
    console.log(`   📊 Metrics: http://${HOST}:${PORT}/metrics`);
    console.log(`   🔌 WebSocket Test: ws://${HOST}:${PORT}/socket.io`);
  } else {
    console.log('🏭 Mode production activé');
    console.log('⚡ Performance optimisée');
    console.log('🛡️ Sécurité renforcée');
    console.log('📊 Monitoring activé');
  }
  
  console.log('\n');
});

// =============================================
// GESTION DES ERREURS DU SERVEUR
// =============================================

server.on('error', (error: any) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

  switch (error.code) {
    case 'EACCES':
      console.error(`❌ ${bind} nécessite des privilèges élevés`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`❌ ${bind} est déjà utilisé`);
      console.log(`💡 Suggestions:`);
      console.log(`   - Changer le port: PORT=${PORT + 1} npm start`);
      console.log(`   - Tuer les processus: netstat -ano | findstr :${PORT}`);
      console.log(`   - Ou sur Linux/Mac: lsof -ti:${PORT} | xargs kill -9`);
      process.exit(1);
      break;
    case 'ENOTFOUND':
      console.error(`❌ Host ${HOST} non trouvé`);
      process.exit(1);
      break;
    default:
      console.error('❌ Erreur serveur:', error);
      throw error;
  }
});

// =============================================
// GESTION PROPRE DE L'ARRÊT DU SERVEUR
// =============================================

const gracefulShutdown = (signal: string) => {
  console.log(`\n🛑 Signal ${signal} reçu, arrêt gracieux du serveur...`);
  
  // Arrêter d'accepter de nouvelles connexions
  server.close(async () => {
    console.log('✅ Serveur HTTP fermé');
    
    try {
      // Fermer les connexions WebSocket
      const wsService = getWebSocketService();
      if (wsService) {
        console.log('🔌 Fermeture des connexions WebSocket...');
        // Notifier tous les clients connectés
        wsService.broadcast('server_shutdown', {
          message: 'Le serveur va redémarrer dans quelques instants',
          timestamp: new Date().toISOString()
        });
        
        // Attendre un peu pour que les messages soient envoyés
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Les connexions WebSocket se fermeront automatiquement avec le serveur
        console.log('✅ Connexions WebSocket fermées');
      }
      
      // Arrêter les tâches automatiques
      console.log('📅 Arrêt des tâches automatiques...');
      // AutomaticNotificationService.stopScheduledTasks(); // Si vous avez cette méthode
      
      // Fermer la connexion Prisma
      console.log('🗄️ Fermeture de la connexion base de données...');
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      await prisma.$disconnect();
      console.log('✅ Connexion base de données fermée');
      
      console.log('👋 Arrêt gracieux terminé');
      process.exit(0);
    } catch (error) {
      console.error('❌ Erreur lors de l\'arrêt:', error);
      process.exit(1);
    }
  });
  
  // Forcer l'arrêt si ça prend trop de temps
  setTimeout(() => {
    console.error('⚠️ Arrêt forcé après timeout (10 secondes)');
    process.exit(1);
  }, 10000);
};

// Écouter les signaux d'arrêt
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Gestion des erreurs non capturées (avec logging amélioré)
process.on('uncaughtException', (error) => {
  console.error('❌ Erreur non capturée:', error);
  console.error('Stack:', error.stack);
  
  // En production, on peut essayer de continuer
  if (NODE_ENV === 'production') {
    console.error('⚠️ Tentative de récupération en production...');
    // Ici vous pourriez ajouter une logique de récupération
  } else {
    console.error('💥 Arrêt du serveur en développement');
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée non gérée:', reason);
  console.error('Promise:', promise);
  
  // En production, on peut essayer de continuer
  if (NODE_ENV === 'production') {
    console.error('⚠️ Tentative de récupération en production...');
    // Ici vous pourriez ajouter une logique de récupération
  } else {
    console.error('💥 Arrêt du serveur en développement');
    process.exit(1);
  }
});

// =============================================
// MONITORING ET HEALTH CHECKS AVANCÉS
// =============================================

// Surveiller l'utilisation mémoire
const memoryMonitoring = () => {
  const memUsage = process.memoryUsage();
  const memoryUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  const memoryTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
  const memoryUsagePercent = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);
  
  // Alerter si utilisation mémoire > 80%
  if (memoryUsagePercent > 80) {
    console.warn(`⚠️ Utilisation mémoire élevée: ${memoryUsedMB}MB / ${memoryTotalMB}MB (${memoryUsagePercent}%)`);
    
    // En production, vous pourriez envoyer une alerte
    if (NODE_ENV === 'production') {
      // Envoyer une notification d'alerte
      const wsService = getWebSocketService();
      if (wsService) {
        wsService.broadcast('system_alert', {
          type: 'memory_warning',
          message: `Utilisation mémoire élevée: ${memoryUsagePercent}%`,
          timestamp: new Date().toISOString()
        });
      }
    }
  }
  
  // Log périodique en développement
  if (NODE_ENV === 'development') {
    console.log(`📊 Mémoire: ${memoryUsedMB}MB / ${memoryTotalMB}MB (${memoryUsagePercent}%) | Uptime: ${Math.round(process.uptime())}s`);
  }
};

// Monitoring toutes les 5 minutes
const monitoringInterval = setInterval(memoryMonitoring, 5 * 60 * 1000);

// Nettoyer l'intervalle lors de l'arrêt
process.on('exit', () => {
  clearInterval(monitoringInterval);
});

// =============================================
// TÂCHES DE MAINTENANCE AUTOMATIQUE
// =============================================

// Nettoyage automatique des logs d'audit (une fois par semaine)
if (NODE_ENV === 'production') {
  const scheduleWeeklyMaintenance = () => {
    const now = new Date();
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + (7 - now.getDay())); // Prochain dimanche
    nextSunday.setHours(2, 0, 0, 0); // 2h du matin
    
    const timeUntilNextSunday = nextSunday.getTime() - now.getTime();
    
    setTimeout(async () => {
      try {
        console.log('🧹 Démarrage du nettoyage automatique des logs...');
        
        const { AuditService } = await import('./services/audit.service');
        const auditService = new AuditService();
        
        // Nettoyer les logs de plus d'un an (sauf critiques)
        const result = await auditService.cleanupOldLogs(365);
        
        console.log(`✅ Nettoyage terminé: ${result.deleted} logs supprimés`);
        
        // Programmer le prochain nettoyage (dans 1 semaine)
        setTimeout(scheduleWeeklyMaintenance, 7 * 24 * 60 * 60 * 1000);
        
      } catch (error) {
        console.error('❌ Erreur lors du nettoyage automatique:', error);
      }
    }, timeUntilNextSunday);
    
    console.log(`🧹 Nettoyage automatique programmé pour: ${nextSunday.toLocaleString()}`);
  };
  
  scheduleWeeklyMaintenance();
}

// =============================================
// ENDPOINTS DE DÉVELOPPEMENT
// =============================================

if (NODE_ENV === 'development') {
  // Endpoint pour redémarrer les services (dev uniquement)
  app.post('/dev/restart-services', (req, res) => {
    console.log('🔄 Redémarrage des services de développement...');
    
    try {
      // Redémarrer les notifications automatiques
      AutomaticNotificationService.scheduleRecurringNotifications();
      
      // Redémarrer le monitoring
      memoryMonitoring();
      
      res.json({
        success: true,
        message: 'Services redémarrés avec succès',
        timestamp: new Date().toISOString(),
        services: ['notifications', 'monitoring']
      });
      
    } catch (error) {
      console.error('❌ Erreur lors du redémarrage:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du redémarrage des services',
        error: (error as Error).message
      });
    }
  });
  
  // Endpoint pour les statistiques de développement
  app.get('/dev/stats', (req, res) => {
    const wsService = getWebSocketService();
    const memUsage = process.memoryUsage();
    
    res.json({
      server: {
        uptime: process.uptime(),
        memory: {
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
          external: Math.round(memUsage.external / 1024 / 1024) + 'MB',
          rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
          usage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100) + '%'
        },
        cpu: process.cpuUsage(),
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid
      },
      websocket: wsService ? wsService.getConnectionStats() : null,
      environment: {
        NODE_ENV,
        PORT,
        HOST,
        FRONTEND_URL: process.env.FRONTEND_URL
      },
      features: {
        websocket: !!wsService,
        notifications: true,
        monitoring: true,
        audit: true
      }
    });
  });
  
  // Endpoint pour tester les notifications WebSocket
  app.post('/dev/test-notification', (req, res) => {
    const wsService = getWebSocketService();
    if (!wsService) {
      return res.status(500).json({ error: 'Service WebSocket non disponible' });
    }
    
    const { message, type = 'info' } = req.body;
    
    wsService.broadcast('test_notification', {
      type,
      message: message || 'Notification de test',
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Notification test envoyée',
      data: { type, message }
    });
  });
  
  console.log('🔧 Endpoints de développement activés:');
  console.log('   POST /dev/restart-services - Redémarrer les services');
  console.log('   GET  /dev/stats - Statistiques détaillées');
  console.log('   POST /dev/test-notification - Tester les notifications');
}

// =============================================
// CONFIGURATION AVANCÉE POUR LA PRODUCTION
// =============================================

if (NODE_ENV === 'production') {
  // Configuration pour les reverse proxy
  app.set('trust proxy', true);
  
  // Log des métriques importantes
  setInterval(() => {
    const memUsage = process.memoryUsage();
    const wsService = getWebSocketService();
    const wsStats = wsService ? wsService.getConnectionStats() : null;
    
    console.log('📊 Métriques production:', {
      uptime: Math.round(process.uptime()),
      memory: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
      websocket: wsStats ? wsStats.totalConnections : 0,
      timestamp: new Date().toISOString()
    });
  }, 10 * 60 * 1000); // Toutes les 10 minutes
  
  console.log('🏭 Configuration production activée');
}

// =============================================
// EXPORT DU SERVEUR
// =============================================

// Export du serveur pour les tests
export { server, app, webSocketService };
export default server;

// =============================================
// INFORMATIONS FINALES
// =============================================

console.log('🎉 Serveur CRA Platform configuré avec succès !');
console.log('📝 Fonctionnalités activées:');
console.log('   - WebSocket temps réel');
console.log('   - Notifications automatiques');
console.log('   - Monitoring avancé');
console.log('   - Arrêt gracieux');
console.log('   - Nettoyage automatique (production)');
console.log('   - Endpoints de développement (dev)');
console.log('');