"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormationReportService = void 0;
class FormationReportService {
    /**
     * Génère le contenu HTML pour un rapport de formation
     */
    generateHTMLContent(report) {
        const { user, shortTrainingsReceived, diplomaticTrainingsReceived, trainingsGiven, supervisions } = report;
        const totalTrainingsReceived = (shortTrainingsReceived?.length || 0) + (diplomaticTrainingsReceived?.length || 0);
        return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rapport de Formation - ${user.firstName} ${user.lastName}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
                line-height: 1.6;
                color: #333;
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #0066cc;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #0066cc;
                margin: 0;
            }
            .user-info {
                background-color: #f5f5f5;
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 30px;
            }
            .section {
                margin-bottom: 40px;
            }
            .section-title {
                background-color: #0066cc;
                color: white;
                padding: 10px 15px;
                margin: 0 0 20px 0;
                border-radius: 5px;
                font-size: 18px;
                font-weight: bold;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
                vertical-align: top;
            }
            th {
                background-color: #f2f2f2;
                font-weight: bold;
            }
            tr:nth-child(even) {
                background-color: #f9f9f9;
            }
            .date {
                white-space: nowrap;
            }
            .no-data {
                text-align: center;
                color: #666;
                font-style: italic;
                padding: 20px;
            }
            .summary {
                background-color: #e8f4f8;
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 30px;
            }
            .summary-item {
                display: inline-block;
                margin-right: 30px;
                font-weight: bold;
            }
            @media print {
                body {
                    margin: 0;
                }
                .section {
                    page-break-inside: avoid;
                }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>RAPPORT DE FORMATION ET ENCADREMENT</h1>
            <p>Centre de Recherche Agricole (CRA)</p>
        </div>

        <div class="user-info">
            <h2>Informations du Chercheur</h2>
            <p><strong>Nom:</strong> ${user.firstName} ${user.lastName}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Date de génération:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>

        <div class="summary">
            <h2>Résumé</h2>
            <div class="summary-item">Formations courtes reçues: ${shortTrainingsReceived?.length || 0}</div>
            <div class="summary-item">Formations diplômantes reçues: ${diplomaticTrainingsReceived?.length || 0}</div>
            <div class="summary-item">Formations dispensées: ${trainingsGiven?.length || 0}</div>
            <div class="summary-item">Encadrements: ${supervisions?.length || 0}</div>
        </div>

        ${this.generateShortTrainingsReceivedSection(shortTrainingsReceived || [])}
        ${this.generateDiplomaticTrainingsReceivedSection(diplomaticTrainingsReceived || [])}
        ${this.generateTrainingsGivenSection(trainingsGiven || [])}
        ${this.generateSupervisionsSection(supervisions || [])}

        <div style="margin-top: 50px; text-align: center; color: #666; font-size: 12px;">
            <p>Rapport généré automatiquement le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
        </div>
    </body>
    </html>
    `;
    }
    /**
     * Génère la section des formations courtes reçues (nouveau format)
     */
    generateShortTrainingsReceivedSection(trainings) {
        if (trainings.length === 0) {
            return `
        <div class="section">
            <h2 class="section-title">Tableau : Formations de courtes durées reçues par les agents</h2>
            <div class="no-data">Aucune formation courte enregistrée</div>
        </div>
      `;
        }
        const rows = trainings.map(training => `
      <tr>
        <td>${training.title}</td>
        <td>${training.objectives.join('; ')}</td>
        <td>${training.period || 'Non spécifiée'}</td>
        <td>${training.location}</td>
        <td>${training.beneficiaries.length > 0 ? training.beneficiaries.join(', ') : 'Agent connecté'}</td>
      </tr>
    `).join('');
        return `
      <div class="section">
          <h2 class="section-title">Tableau 11: Formations de courtes durées reçues par les agents</h2>
          <table>
              <thead>
                  <tr>
                      <th>Intitulé de la formation</th>
                      <th>Objectifs de la formation</th>
                      <th>Période ou durée</th>
                      <th>Lieu</th>
                      <th>Chercheurs bénéficiaires</th>
                  </tr>
              </thead>
              <tbody>
                  ${rows}
              </tbody>
          </table>
      </div>
    `;
    }
    /**
     * Génère la section des formations diplômantes reçues (format existant)
     */
    generateDiplomaticTrainingsReceivedSection(trainings) {
        if (trainings.length === 0) {
            return `
        <div class="section">
            <h2 class="section-title">c. Formations diplômantes reçues par les agents</h2>
            <div class="no-data">Aucune formation diplômante enregistrée</div>
        </div>
      `;
        }
        const rows = trainings.map(training => `
      <tr>
        <td>${training.studentName}</td>
        <td>${training.level}</td>
        <td>${training.specialty}</td>
        <td>${training.university}</td>
        <td class="date">${training.period}</td>
        <td>${training.diplomaObtained === 'OUI' ? 'Oui' : training.diplomaObtained === 'EN_COURS' ? 'Non (en cours)' : 'Non'}</td>
      </tr>
    `).join('');
        return `
      <div class="section">
          <h2 class="section-title">c. Formations diplômantes reçues par les agents</h2>
          <table>
              <thead>
                  <tr>
                      <th>Prénom et nom</th>
                      <th>Niveau</th>
                      <th>Spécialité</th>
                      <th>Universités / Écoles</th>
                      <th>Période</th>
                      <th>Obtention du diplôme (Oui/Non)</th>
                  </tr>
              </thead>
              <tbody>
                  ${rows}
              </tbody>
          </table>
      </div>
    `;
    }
    /**
     * Génère la section des formations dispensées
     */
    generateTrainingsGivenSection(trainings) {
        if (trainings.length === 0) {
            return `
        <div class="section">
            <h2 class="section-title">b. Enseignements dispensés dans les universités et grandes écoles</h2>
            <div class="no-data">Aucune formation dispensée enregistrée</div>
        </div>
      `;
        }
        const rows = trainings.map(training => `
      <tr>
        <td>${training.title}</td>
        <td>${this.getTrainingTypeLabel(training.type)}</td>
        <td>${training.institution}</td>
        <td>${training.department || '-'}</td>
        <td>${training.duration || '-'} heures</td>
        <td>1</td>
      </tr>
    `).join('');
        return `
      <div class="section">
          <h2 class="section-title">b. Enseignements dispensés dans les universités et grandes écoles</h2>
          <table>
              <thead>
                  <tr>
                      <th>Intitulé cours</th>
                      <th>Niveau</th>
                      <th>Université, Institut ou École</th>
                      <th>Département ou Faculté</th>
                      <th>Volume horaire (en heures)</th>
                      <th>Chercheurs concernés</th>
                  </tr>
              </thead>
              <tbody>
                  ${rows}
              </tbody>
          </table>
      </div>
    `;
    }
    /**
     * Génère la section des encadrements
     */
    generateSupervisionsSection(supervisions) {
        if (supervisions.length === 0) {
            return `
        <div class="section">
            <h2 class="section-title">Tableau 8: Encadrements</h2>
            <div class="no-data">Aucun encadrement enregistré</div>
        </div>
      `;
        }
        const rows = supervisions.map(supervision => `
      <tr>
        <td>${supervision.studentName}</td>
        <td>${supervision.title}</td>
        <td>${supervision.specialty}</td>
        <td>${supervision.type}</td>
        <td>${supervision.university}</td>
        <td class="date">${new Date(supervision.startDate).getFullYear()} - ${supervision.endDate ? new Date(supervision.endDate).getFullYear() : 'En cours'}</td>
        <td class="date">${supervision.expectedDefenseDate ? new Date(supervision.expectedDefenseDate).toLocaleDateString('fr-FR') : 'À définir'}</td>
        <td>Dr. ${supervision.studentName}</td>
        <td>${supervision.status === 'SOUTENU' ? 'OUI' : 'NON'}</td>
      </tr>
    `).join('');
        return `
      <div class="section">
          <h2 class="section-title">Tableau 8: Encadrements</h2>
          <table>
              <thead>
                  <tr>
                      <th>Nom prénom</th>
                      <th>Sujet</th>
                      <th>Spécialité</th>
                      <th>Niveau</th>
                      <th>Université/École</th>
                      <th>Période</th>
                      <th>Date prévue de soutenance</th>
                      <th>Encadreurs</th>
                      <th>Soutenu (Oui/Non)</th>
                  </tr>
              </thead>
              <tbody>
                  ${rows}
              </tbody>
          </table>
      </div>
    `;
    }
    /**
     * Convertit le type de formation en libellé français
     */
    getTrainingTypeLabel(type) {
        const typeLabels = {
            'FORMATION_COURTE': 'Formation courte',
            'FORMATION_DIPLOMANTE': 'Formation diplômante',
            'STAGE_ADAPTATION': 'Stage d\'adaptation',
            'STAGE_RECHERCHE': 'Stage de recherche',
            'ATELIER_TECHNIQUE': 'Atelier technique',
            'SEMINAIRE_FORMATION': 'Séminaire de formation',
            'MASTER': 'Master',
            'DOCTORAT': 'Doctorat',
            'LICENCE': 'Licence',
            'INGENIEUR': 'Ingénieur'
        };
        return typeLabels[type] || type;
    }
    /**
     * Génère un rapport global pour tous les utilisateurs
     */
    generateGlobalHTMLContent(reports) {
        const totalShortTrainings = reports.reduce((sum, report) => sum + (report.shortTrainingsReceived?.length || 0), 0);
        const totalDiplomaticTrainings = reports.reduce((sum, report) => sum + (report.diplomaticTrainingsReceived?.length || 0), 0);
        const totalTrainingsGiven = reports.reduce((sum, report) => sum + (report.trainingsGiven?.length || 0), 0);
        const totalSupervisions = reports.reduce((sum, report) => sum + (report.supervisions?.length || 0), 0);
        let content = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rapport Global de Formation</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
                line-height: 1.6;
                color: #333;
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #0066cc;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #0066cc;
                margin: 0;
            }
            .summary {
                background-color: #e8f4f8;
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 30px;
                text-align: center;
            }
            .summary-item {
                display: inline-block;
                margin: 0 30px;
                font-weight: bold;
                font-size: 18px;
            }
            .user-section {
                margin-bottom: 50px;
                border: 1px solid #ddd;
                border-radius: 5px;
                padding: 20px;
                page-break-inside: avoid;
            }
            .user-header {
                background-color: #f5f5f5;
                margin: -20px -20px 20px -20px;
                padding: 15px 20px;
                border-radius: 5px 5px 0 0;
                border-bottom: 1px solid #ddd;
            }
            .user-name {
                font-size: 18px;
                font-weight: bold;
                color: #0066cc;
            }
            .section-title {
                background-color: #0066cc;
                color: white;
                padding: 8px 15px;
                margin: 20px 0 15px 0;
                border-radius: 3px;
                font-size: 14px;
                font-weight: bold;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 15px;
                font-size: 12px;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
                vertical-align: top;
            }
            th {
                background-color: #f2f2f2;
                font-weight: bold;
            }
            tr:nth-child(even) {
                background-color: #f9f9f9;
            }
            .no-data {
                text-align: center;
                color: #666;
                font-style: italic;
                padding: 15px;
            }
            @media print {
                .user-section {
                    page-break-inside: avoid;
                }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>RAPPORT GLOBAL DE FORMATION ET ENCADREMENT</h1>
            <p>Centre de Recherche Agricole (CRA)</p>
            <p>Date de génération: ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>

        <div class="summary">
            <h2>Résumé Global</h2>
            <div class="summary-item">Chercheurs: ${reports.length}</div>
            <div class="summary-item">Formations courtes: ${totalShortTrainings}</div>
            <div class="summary-item">Formations diplômantes: ${totalDiplomaticTrainings}</div>
            <div class="summary-item">Formations dispensées: ${totalTrainingsGiven}</div>
            <div class="summary-item">Encadrements: ${totalSupervisions}</div>
        </div>
    `;
        // Ajouter chaque rapport utilisateur
        reports.forEach(report => {
            content += `
        <div class="user-section">
            <div class="user-header">
                <div class="user-name">${report.user.firstName} ${report.user.lastName}</div>
                <div style="font-size: 14px; color: #666;">${report.user.email}</div>
            </div>
            
            ${this.generateShortTrainingsReceivedSection(report.shortTrainingsReceived || [])}
            ${this.generateDiplomaticTrainingsReceivedSection(report.diplomaticTrainingsReceived || [])}
            ${this.generateTrainingsGivenSection(report.trainingsGiven || [])}
            ${this.generateSupervisionsSection(report.supervisions || [])}
        </div>
      `;
        });
        content += `
        <div style="margin-top: 50px; text-align: center; color: #666; font-size: 12px;">
            <p>Rapport généré automatiquement le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
        </div>
    </body>
    </html>
    `;
        return content;
    }
    /**
     * Génère le nom de fichier basé sur les données
     */
    generateFilename(report, format) {
        const timestamp = new Date().toISOString().split('T')[0];
        if (Array.isArray(report)) {
            return `rapport-formation-global-${timestamp}.${format}`;
        }
        else {
            const userName = `${report.user.lastName}-${report.user.firstName}`.toLowerCase().replace(/\s+/g, '-');
            return `rapport-formation-${userName}-${timestamp}.${format}`;
        }
    }
}
exports.FormationReportService = FormationReportService;
//# sourceMappingURL=formation-report.service.js.map