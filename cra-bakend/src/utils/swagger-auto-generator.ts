// src/utils/swagger-auto-generator.ts - Générateur automatique de documentation Swagger
import * as fs from 'fs';
import * as path from 'path';
import { OpenAPIV3 } from 'openapi-types';

interface RouteInfo {
  method: string;
  path: string;
  fullPath: string;
  handler: string;
  middlewares: string[];
  comment?: string;
  module: string;
}

/**
 * Génère automatiquement la documentation OpenAPI depuis les fichiers de routes
 */
export class SwaggerAutoGenerator {
  private routes: RouteInfo[] = [];
  private routesDir: string;

  constructor(routesDir: string) {
    this.routesDir = routesDir;
  }

  /**
   * Scanne tous les fichiers de routes et extrait les informations
   */
  async scanRoutes(): Promise<void> {
    const files = fs.readdirSync(this.routesDir)
      .filter(file => file.endsWith('.routes.ts'));

    for (const file of files) {
      const filePath = path.join(this.routesDir, file);
      const moduleName = file.replace('.routes.ts', '');

      try {
        await this.analyzeRouteFile(filePath, moduleName);
      } catch (error) {
        console.warn(`⚠️  Erreur lors de l'analyse de ${file}:`, error);
      }
    }

    console.log(`✅ ${this.routes.length} routes détectées automatiquement`);
  }

  /**
   * Analyse un fichier de routes et extrait les routes Express
   */
  private async analyzeRouteFile(filePath: string, moduleName: string): Promise<void> {
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
        } else if (line === '') {
          continue;
        } else {
          break;
        }
      }

      const comment = commentLines.join(' ');

      // Détecter les middlewares
      const middlewares: string[] = [];
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
  generateOpenAPISpec(): OpenAPIV3.Document {
    const paths: OpenAPIV3.PathsObject = {};

    // Grouper les routes par path
    const routesByPath = new Map<string, RouteInfo[]>();

    this.routes.forEach(route => {
      if (!routesByPath.has(route.fullPath)) {
        routesByPath.set(route.fullPath, []);
      }
      routesByPath.get(route.fullPath)!.push(route);
    });

    // Générer les paths OpenAPI
    routesByPath.forEach((routes, fullPath) => {
      const pathItem: OpenAPIV3.PathItemObject = {};

      routes.forEach(route => {
        const operation = this.generateOperation(route);
        pathItem[route.method as keyof OpenAPIV3.PathItemObject] = operation as any;
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
  private generateOperation(route: RouteInfo): OpenAPIV3.OperationObject {
    const operation: OpenAPIV3.OperationObject = {
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
  private generateResponses(route: RouteInfo): OpenAPIV3.ResponsesObject {
    const responses: OpenAPIV3.ResponsesObject = {};

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
  private generateComponents(): OpenAPIV3.ComponentsObject {
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
  private generateTags(): OpenAPIV3.TagObject[] {
    const modules = new Set(this.routes.map(r => r.module));

    return Array.from(modules).map(module => ({
      name: this.capitalizeFirstLetter(module),
      description: `Endpoints pour la gestion des ${module}`
    }));
  }

  /**
   * Extrait les paramètres de chemin d'une route
   */
  private extractPathParams(path: string): string[] {
    const params: string[] = [];
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
  private generateSummary(route: RouteInfo): string {
    const actions: Record<string, string> = {
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
  private capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Méthode principale pour générer la documentation
   */
  async generate(): Promise<OpenAPIV3.Document> {
    await this.scanRoutes();
    return this.generateOpenAPISpec();
  }
}

/**
 * Fonction helper pour générer la documentation Swagger automatiquement
 */
export async function generateSwaggerDocs(routesDir: string): Promise<OpenAPIV3.Document> {
  const generator = new SwaggerAutoGenerator(routesDir);
  return await generator.generate();
}
