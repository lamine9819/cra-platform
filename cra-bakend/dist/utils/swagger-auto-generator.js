"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwaggerAutoGenerator = void 0;
exports.generateSwaggerDocs = generateSwaggerDocs;
const tslib_1 = require("tslib");
// src/utils/swagger-auto-generator.ts - Générateur automatique de documentation Swagger
const fs = tslib_1.__importStar(require("fs"));
const path = tslib_1.__importStar(require("path"));
/**
 * Génère automatiquement la documentation OpenAPI depuis les fichiers de routes
 */
class SwaggerAutoGenerator {
    constructor(routesDir) {
        this.routes = [];
        this.routesDir = routesDir;
    }
    /**
     * Scanne tous les fichiers de routes et extrait les informations
     */
    async scanRoutes() {
        const files = fs.readdirSync(this.routesDir)
            .filter(file => file.endsWith('.routes.ts'));
        for (const file of files) {
            const filePath = path.join(this.routesDir, file);
            const moduleName = file.replace('.routes.ts', '');
            try {
                await this.analyzeRouteFile(filePath, moduleName);
            }
            catch (error) {
                console.warn(`⚠️  Erreur lors de l'analyse de ${file}:`, error);
            }
        }
        console.log(`✅ ${this.routes.length} routes détectées automatiquement`);
    }
    /**
     * Analyse un fichier de routes et extrait les routes Express
     */
    async analyzeRouteFile(filePath, moduleName) {
        const content = fs.readFileSync(filePath, 'utf-8');
        // Regex pour détecter les routes Express
        const routeRegex = /router\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]\s*(?:,\s*([^)]+))?\)/g;
        let match;
        while ((match = routeRegex.exec(content)) !== null) {
            const [fullMatch, method, routePath, rest] = match;
            // Extraire le commentaire au-dessus de la route
            const lines = content.substring(0, match.index).split('\n');
            const commentLines = [];
            for (let i = lines.length - 1; i >= 0; i--) {
                const line = lines[i].trim();
                if (line.startsWith('//')) {
                    commentLines.unshift(line.replace('//', '').trim());
                }
                else if (line === '') {
                    continue;
                }
                else {
                    break;
                }
            }
            const comment = commentLines.join(' ');
            // Détecter les middlewares
            const middlewares = [];
            if (rest) {
                const middlewareMatches = rest.match(/authenticate|authorize|upload/g);
                if (middlewareMatches) {
                    middlewares.push(...middlewareMatches);
                }
            }
            this.routes.push({
                method: method.toLowerCase(),
                path: routePath,
                fullPath: `/api/${moduleName}${routePath}`,
                handler: rest?.trim() || '',
                middlewares,
                comment,
                module: moduleName
            });
        }
    }
    /**
     * Génère la spécification OpenAPI complète
     */
    generateOpenAPISpec() {
        const paths = {};
        // Grouper les routes par path
        const routesByPath = new Map();
        this.routes.forEach(route => {
            if (!routesByPath.has(route.fullPath)) {
                routesByPath.set(route.fullPath, []);
            }
            routesByPath.get(route.fullPath).push(route);
        });
        // Générer les paths OpenAPI
        routesByPath.forEach((routes, fullPath) => {
            const pathItem = {};
            routes.forEach(route => {
                const operation = this.generateOperation(route);
                pathItem[route.method] = operation;
            });
            paths[fullPath] = pathItem;
        });
        return {
            openapi: '3.0.0',
            info: {
                title: 'CRA Platform API - Documentation automatique',
                version: '1.0.0',
                description: `
Documentation générée automatiquement à partir des routes Express.

## Fonctionnalités
- Détection automatique de toutes les routes
- Aucun fichier supplémentaire nécessaire
- Documentation toujours synchronisée avec le code

**${this.routes.length} routes documentées automatiquement**
        `
            },
            servers: [
                {
                    url: 'http://localhost:3001',
                    description: 'Serveur de développement'
                }
            ],
            paths,
            components: this.generateComponents(),
            tags: this.generateTags()
        };
    }
    /**
     * Génère une opération OpenAPI pour une route
     */
    generateOperation(route) {
        const operation = {
            tags: [this.capitalizeFirstLetter(route.module)],
            summary: route.comment || this.generateSummary(route),
            description: `Endpoint: ${route.method.toUpperCase()} ${route.fullPath}`,
            responses: this.generateResponses(route)
        };
        // Ajouter la sécurité si authenticate est présent
        if (route.middlewares.includes('authenticate')) {
            operation.security = [{ bearerAuth: [] }];
        }
        // Ajouter les paramètres de chemin
        const pathParams = this.extractPathParams(route.path);
        if (pathParams.length > 0) {
            operation.parameters = pathParams.map(param => ({
                name: param,
                in: 'path',
                required: true,
                schema: { type: 'string' },
                description: `ID du ${param}`
            }));
        }
        // Ajouter le request body pour POST/PUT/PATCH
        if (['post', 'put', 'patch'].includes(route.method)) {
            operation.requestBody = {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            description: 'Corps de la requête (schéma à définir)'
                        }
                    }
                }
            };
        }
        return operation;
    }
    /**
     * Génère les réponses pour une route
     */
    generateResponses(route) {
        const responses = {};
        const successCode = route.method === 'post' ? '201' : '200';
        responses[successCode] = {
            description: route.method === 'delete' ? 'Suppression réussie' : 'Opération réussie',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string' },
                            data: { type: 'object' }
                        }
                    }
                }
            }
        };
        if (['post', 'put', 'patch'].includes(route.method)) {
            responses['400'] = {
                description: 'Erreur de validation',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/Error' }
                    }
                }
            };
        }
        if (route.middlewares.includes('authenticate')) {
            responses['401'] = {
                description: 'Non autorisé',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/Error' }
                    }
                }
            };
        }
        responses['500'] = {
            description: 'Erreur serveur',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/Error' }
                }
            }
        };
        return responses;
    }
    /**
     * Génère les composants OpenAPI
     */
    generateComponents() {
        return {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Token JWT d\'authentification'
                }
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' },
                        error: { type: 'string' }
                    }
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string' },
                        data: { type: 'object' }
                    }
                }
            }
        };
    }
    /**
     * Génère les tags depuis les modules
     */
    generateTags() {
        const modules = new Set(this.routes.map(r => r.module));
        return Array.from(modules).map(module => ({
            name: this.capitalizeFirstLetter(module),
            description: `Endpoints pour la gestion des ${module}`
        }));
    }
    /**
     * Extrait les paramètres de chemin d'une route
     */
    extractPathParams(path) {
        const params = [];
        const regex = /:(\w+)/g;
        let match;
        while ((match = regex.exec(path)) !== null) {
            params.push(match[1]);
        }
        return params;
    }
    /**
     * Génère un résumé pour une route
     */
    generateSummary(route) {
        const actions = {
            get: 'Récupérer',
            post: 'Créer',
            put: 'Remplacer',
            patch: 'Mettre à jour',
            delete: 'Supprimer'
        };
        if (route.path === '/' || route.path === '') {
            return route.method === 'get' ? 'Lister les éléments' : `${actions[route.method]} un élément`;
        }
        if (route.path.includes(':id')) {
            return `${actions[route.method]} un élément par ID`;
        }
        const cleanPath = route.path.replace(/^\//, '').replace(/\//g, ' ');
        return `${actions[route.method]} - ${cleanPath}`;
    }
    /**
     * Capitalise la première lettre
     */
    capitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    /**
     * Méthode principale pour générer la documentation
     */
    async generate() {
        await this.scanRoutes();
        return this.generateOpenAPISpec();
    }
}
exports.SwaggerAutoGenerator = SwaggerAutoGenerator;
/**
 * Fonction helper pour générer la documentation Swagger automatiquement
 */
async function generateSwaggerDocs(routesDir) {
    const generator = new SwaggerAutoGenerator(routesDir);
    return await generator.generate();
}
//# sourceMappingURL=swagger-auto-generator.js.map