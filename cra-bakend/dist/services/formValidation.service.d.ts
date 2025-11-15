import { FormField, FormSchema, FormValidationResult, FieldValidationResult } from '../types/form.types';
export declare class FormValidationService {
    /**
     * Valide une réponse complète de formulaire
     */
    static validateFormResponse(formSchema: FormSchema, responseData: Record<string, any>): FormValidationResult;
    /**
     * Valide un champ individuel
     */
    static validateField(field: FormField, value: any): FieldValidationResult;
    /**
     * Validation par type de champ
     */
    private static validateByType;
    /**
     * Validation des contraintes personnalisées
     */
    private static validateConstraints;
    /**
     * Validations spécifiques par type
     */
    private static validateEmail;
    private static validateNumber;
    private static validateDate;
    private static validateTime;
    private static validateSelection;
    private static validateCheckbox;
    private static validateFile;
    private static validateText;
    /**
     * Validation des règles métier
     */
    private static validateBusinessRules;
    /**
     * Méthodes utilitaires
     */
    private static isEmpty;
    private static getDefaultValue;
    private static sanitizeValue;
    /**
     * Valide la structure d'un schéma de formulaire
     */
    static validateFormSchema(schema: any): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * Valide la structure d'un champ de formulaire
     */
    private static validateFieldSchema;
}
//# sourceMappingURL=formValidation.service.d.ts.map