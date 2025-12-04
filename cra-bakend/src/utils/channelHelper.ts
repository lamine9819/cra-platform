// src/utils/channelHelper.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Ajoute automatiquement un utilisateur au canal général
 * Cette fonction est appelée après la création d'un nouvel utilisateur
 */
export async function addUserToGeneralChannel(userId: string): Promise<void> {
  try {
    // Trouver le canal général
    const generalChannel = await prisma.channel.findFirst({
      where: {
        type: 'GENERAL',
        name: 'Général'
      }
    });

    if (!generalChannel) {
      console.warn('Canal général non trouvé. Veuillez exécuter le script init-general-channel.js');
      return;
    }

    // Vérifier si l'utilisateur est déjà membre
    const existingMember = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId: generalChannel.id,
          userId: userId
        }
      }
    });

    if (existingMember) {
      // Si l'utilisateur a quitté le canal, le réactiver
      if (existingMember.leftAt) {
        await prisma.channelMember.update({
          where: { id: existingMember.id },
          data: { leftAt: null }
        });
        console.log(`Utilisateur ${userId} réactivé dans le canal général`);
      }
      return;
    }

    // Ajouter l'utilisateur au canal général
    await prisma.channelMember.create({
      data: {
        channelId: generalChannel.id,
        userId: userId,
        role: 'MEMBER'
      }
    });

    console.log(`Utilisateur ${userId} ajouté au canal général`);
  } catch (error) {
    console.error('Erreur lors de l\'ajout au canal général:', error);
    // Ne pas faire échouer la création de l'utilisateur si l'ajout au canal échoue
  }
}

/**
 * Crée le canal général s'il n'existe pas déjà
 * Retourne l'ID du canal général
 */
export async function ensureGeneralChannelExists(creatorId: string): Promise<string | null> {
  try {
    // Vérifier si le canal général existe
    let generalChannel = await prisma.channel.findFirst({
      where: {
        type: 'GENERAL',
        name: 'Général'
      }
    });

    if (generalChannel) {
      return generalChannel.id;
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
        creatorId: creatorId,
      }
    });

    // Ajouter le créateur comme membre OWNER
    await prisma.channelMember.create({
      data: {
        channelId: generalChannel.id,
        userId: creatorId,
        role: 'OWNER'
      }
    });

    console.log('Canal général créé avec succès');
    return generalChannel.id;
  } catch (error) {
    console.error('Erreur lors de la création du canal général:', error);
    return null;
  }
}
