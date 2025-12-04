// Script pour initialiser le canal général unique
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initGeneralChannel() {
  try {
    console.log('🔍 Vérification du canal général...');

    // Vérifier si un canal général existe déjà
    let generalChannel = await prisma.channel.findFirst({
      where: {
        type: 'GENERAL',
        name: 'Général'
      }
    });

    if (generalChannel) {
      console.log('✅ Le canal général existe déjà');
      console.log(`   - ID: ${generalChannel.id}`);
      console.log(`   - Nom: ${generalChannel.name}`);
    } else {
      console.log('📝 Création du canal général...');

      // Récupérer un administrateur pour créer le canal
      const admin = await prisma.user.findFirst({
        where: {
          role: 'ADMINISTRATEUR'
        }
      });

      if (!admin) {
        console.log('❌ Aucun administrateur trouvé. Veuillez créer un utilisateur administrateur d\'abord.');
        return;
      }

      // Créer le canal général
      generalChannel = await prisma.channel.create({
        data: {
          name: 'Général',
          description: 'Espace de discussion général pour toute l\'équipe du CRA',
          type: 'GENERAL',
          isPrivate: false,
          icon: '💬',
          color: '#3B82F6',
          creatorId: admin.id,
        }
      });

      console.log('✅ Canal général créé avec succès');
      console.log(`   - ID: ${generalChannel.id}`);
      console.log(`   - Créateur: ${admin.firstName} ${admin.lastName}`);

      // Ajouter le créateur comme membre OWNER
      await prisma.channelMember.create({
        data: {
          channelId: generalChannel.id,
          userId: admin.id,
          role: 'OWNER',
        }
      });

      console.log('✅ Créateur ajouté comme propriétaire');
    }

    // S'assurer que tous les utilisateurs sont membres du canal général
    console.log('\n👥 Ajout automatique de tous les utilisateurs...');

    const allUsers = await prisma.user.findMany({
      select: { id: true, firstName: true, lastName: true }
    });

    const existingMembers = await prisma.channelMember.findMany({
      where: { channelId: generalChannel.id },
      select: { userId: true }
    });

    const existingMemberIds = new Set(existingMembers.map(m => m.userId));
    const usersToAdd = allUsers.filter(u => !existingMemberIds.has(u.id));

    if (usersToAdd.length > 0) {
      await prisma.channelMember.createMany({
        data: usersToAdd.map(user => ({
          channelId: generalChannel.id,
          userId: user.id,
          role: 'MEMBER'
        })),
        skipDuplicates: true
      });

      console.log(`✅ ${usersToAdd.length} nouveau(x) utilisateur(s) ajouté(s) au canal général`);
    } else {
      console.log('✅ Tous les utilisateurs sont déjà membres du canal général');
    }

    const totalMembers = await prisma.channelMember.count({
      where: { channelId: generalChannel.id, leftAt: null }
    });

    console.log(`\n🎉 Canal général prêt avec ${totalMembers} membre(s)`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

initGeneralChannel();
