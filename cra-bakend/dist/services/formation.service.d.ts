import { CreateShortTrainingReceivedInput, CreateDiplomaticTrainingReceivedInput, CreateTrainingGivenInput, CreateSupervisionInput, ShortTrainingReceivedResponse, DiplomaticTrainingReceivedResponse, TrainingGivenResponse, SupervisionResponse, FormationReport } from '../types/formation.types';
export declare class FormationService {
    private formatPeriod;
    createShortTrainingReceived(userId: string, data: CreateShortTrainingReceivedInput): Promise<ShortTrainingReceivedResponse>;
    createDiplomaticTrainingReceived(userId: string, data: CreateDiplomaticTrainingReceivedInput): Promise<DiplomaticTrainingReceivedResponse>;
    deleteShortTrainingReceived(trainingId: string, userId: string): Promise<void>;
    deleteDiplomaticTrainingReceived(trainingId: string, userId: string): Promise<void>;
    deleteTrainingGiven(trainingId: string, userId: string): Promise<void>;
    deleteSupervision(supervisionId: string, userId: string): Promise<void>;
    createTrainingGiven(userId: string, data: CreateTrainingGivenInput): Promise<TrainingGivenResponse>;
    createSupervision(supervisorId: string, data: CreateSupervisionInput): Promise<SupervisionResponse>;
    getUserShortTrainingsReceived(userId: string): Promise<ShortTrainingReceivedResponse[]>;
    getUserDiplomaticTrainingsReceived(userId: string): Promise<DiplomaticTrainingReceivedResponse[]>;
    getUserTrainingsGiven(userId: string): Promise<TrainingGivenResponse[]>;
    getUserSupervisions(userId: string): Promise<SupervisionResponse[]>;
    getAllUsersFormationReport(): Promise<FormationReport[]>;
    updateShortTrainingReceived(trainingId: string, userId: string, data: Partial<CreateShortTrainingReceivedInput>): Promise<ShortTrainingReceivedResponse>;
    updateDiplomaticTrainingReceived(trainingId: string, userId: string, data: Partial<CreateDiplomaticTrainingReceivedInput>): Promise<DiplomaticTrainingReceivedResponse>;
    updateTrainingGiven(trainingId: string, userId: string, data: Partial<CreateTrainingGivenInput>): Promise<TrainingGivenResponse>;
    updateSupervision(supervisionId: string, userId: string, data: Partial<CreateSupervisionInput>): Promise<SupervisionResponse>;
    getUserInfo(userId: string): Promise<{
        email: string;
        firstName: string;
        lastName: string;
    }>;
}
//# sourceMappingURL=formation.service.d.ts.map