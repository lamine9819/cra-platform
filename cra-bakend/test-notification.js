// test-notification.js - Script pour tester la création de notifications
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testNotification() {
  try {
    console.log('🔍 Test du système de notifications...\n');

    // 1. Trouver deux utilisateurs pour tester
    const users = await prisma.user.findMany({
      take: 2,
      where: { isActive: true }
    });

    if (users.length < 2) {
      console.error('❌ Pas assez d\'utilisateurs actifs dans la base de données');
      return;
    }

    const sender = users[0];
    const receiver = users[1];

    console.log(`👤 Expéditeur: ${sender.firstName} ${sender.lastName} (${sender.email})`);
    console.log(`👤 Destinataire: ${receiver.firstName} ${receiver.lastName} (${receiver.email})\n`);

    // 2. Créer une notification de test
    console.log('📝 Création d\'une notification de test...');
    const notification = await prisma.notification.create({
      data: {
        receiverId: receiver.id,
        senderId: sender.id,
        title: 'Test de notification',
        message: `Ceci est un test de notification envoyé par ${sender.firstName} ${sender.lastName}`,
        type: 'SYSTEM',
        actionUrl: '/chercheur/dashboard',
        isRead: false
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    console.log('✅ Notification créée avec succès!');
    console.log(`   ID: ${notification.id}`);
    console.log(`   Titre: ${notification.title}`);
    console.log(`   Message: ${notification.message}`);
    console.log(`   Type: ${notification.type}`);
    console.log(`   Date: ${notification.createdAt}\n`);

    // 3. Vérifier le compteur de notifications non lues
    const unreadCount = await prisma.notification.count({
      where: {
        receiverId: receiver.id,
        isRead: false
      }
    });

    console.log(`📊 Nombre de notifications non lues pour ${receiver.firstName}: ${unreadCount}\n`);

    // 4. Lister toutes les notifications du destinataire
    const allNotifications = await prisma.notification.findMany({
      where: { receiverId: receiver.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        sender: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    console.log(`📋 Dernières notifications pour ${receiver.firstName}:`);
    allNotifications.forEach((notif, index) => {
      console.log(`   ${index + 1}. [${notif.isRead ? '✓' : '○'}] ${notif.title}`);
      console.log(`      De: ${notif.sender ? notif.sender.firstName + ' ' + notif.sender.lastName : 'Système'}`);
      console.log(`      ${notif.message}`);
      console.log(`      Date: ${notif.createdAt.toLocaleString('fr-FR')}\n`);
    });

    console.log('✅ Test terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNotification();
