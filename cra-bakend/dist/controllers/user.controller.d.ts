import { Request, Response, NextFunction } from 'express';
export declare class UserController {
    /**
     * Créer un utilisateur avec profil individuel si nécessaire
     */
    createUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Mettre à jour un utilisateur
     */
    updateUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Mettre à jour le profil individuel d'un chercheur
     */
    updateIndividualProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Créer ou mettre à jour l'allocation de temps pour une année
     */
    updateTimeAllocation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Valider un profil individuel ou une année spécifique
     */
    validateIndividualProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Télécharger la fiche individuelle d'un chercheur
     */
    downloadIndividualProfile: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Télécharger sa propre fiche individuelle
     */
    downloadMyIndividualProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Supprimer un utilisateur
     */
    deleteUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Associer un superviseur
     */
    assignSupervisor: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Activer un utilisateur
     */
    activateUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Désactiver un utilisateur
     */
    deactivateUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Lister tous les utilisateurs avec filtres CRA
     */
    listUsers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Lister les utilisateurs supervisés
     */
    getSupervisedUsers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Obtenir un utilisateur par ID
     */
    getUserById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Obtenir les statistiques d'un utilisateur
     */
    getUserStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Obtenir les chercheurs par thème de recherche
     */
    getResearchersByTheme: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Obtenir les coordonateurs de projet actifs
     */
    getProjectCoordinators: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Obtenir le profil complet de l'utilisateur connecté
     */
    getMyProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Mettre à jour son propre profil
     */
    updateMyProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Mettre à jour son propre profil individuel
     */
    updateMyIndividualProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=user.controller.d.ts.map