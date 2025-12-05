/**
 * Ajoute automatiquement un utilisateur au canal général
 * Cette fonction est appelée après la création d'un nouvel utilisateur
 */
export declare function addUserToGeneralChannel(userId: string): Promise<void>;
/**
 * Crée le canal général s'il n'existe pas déjà
 * Retourne l'ID du canal général
 */
export declare function ensureGeneralChannelExists(creatorId: string): Promise<string | null>;
//# sourceMappingURL=channelHelper.d.ts.map