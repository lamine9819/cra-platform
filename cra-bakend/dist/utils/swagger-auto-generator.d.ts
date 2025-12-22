import { OpenAPIV3 } from 'openapi-types';
/**
 * Génère automatiquement la documentation OpenAPI depuis les fichiers de routes
 */
export declare class SwaggerAutoGenerator {
    private routes;
    private routesDir;
    constructor(routesDir: string);
    /**
     * Scanne tous les fichiers de routes et extrait les informations
     */
    scanRoutes(): Promise<void>;
    /**
     * Analyse un fichier de routes et extrait les routes Express
     */
    private analyzeRouteFile;
    /**
     * Génère la spécification OpenAPI complète
     */
    generateOpenAPISpec(): OpenAPIV3.Document;
    /**
     * Génère une opération OpenAPI pour une route
     */
    private generateOperation;
    /**
     * Génère les réponses pour une route
     */
    private generateResponses;
    /**
     * Génère les composants OpenAPI
     */
    private generateComponents;
    /**
     * Génère les tags depuis les modules
     */
    private generateTags;
    /**
     * Extrait les paramètres de chemin d'une route
     */
    private extractPathParams;
    /**
     * Génère un résumé pour une route
     */
    private generateSummary;
    /**
     * Capitalise la première lettre
     */
    private capitalizeFirstLetter;
    /**
     * Méthode principale pour générer la documentation
     */
    generate(): Promise<OpenAPIV3.Document>;
}
/**
 * Fonction helper pour générer la documentation Swagger automatiquement
 */
export declare function generateSwaggerDocs(routesDir: string): Promise<OpenAPIV3.Document>;
//# sourceMappingURL=swagger-auto-generator.d.ts.map