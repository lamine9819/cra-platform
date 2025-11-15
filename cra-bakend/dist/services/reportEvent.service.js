"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportEventService = void 0;
const tslib_1 = require("tslib");
const pdfkit_1 = tslib_1.__importDefault(require("pdfkit"));
const docx_1 = require("docx");
const client_1 = require("@prisma/client");
const fs = tslib_1.__importStar(require("fs"));
const path = tslib_1.__importStar(require("path"));
const prisma = new client_1.PrismaClient();
class ReportEventService {
    /**
     * Générer un rapport d'événements
     */
    async generateEventReport(userId, userRole, filters) {
        // Vérifier que l'utilisateur est coordinateur
        if (userRole !== client_1.UserRole.COORDONATEUR_PROJET && userRole !== client_1.UserRole.ADMINISTRATEUR) {
            throw new Error('Vous n\'avez pas les permissions pour générer des rapports');
        }
        // Récupérer les événements selon les filtres
        const whereClause = {};
        if (filters.creatorId)
            whereClause.creatorId = filters.creatorId;
        if (filters.type)
            whereClause.type = filters.type;
        if (filters.startDate || filters.endDate) {
            whereClause.startDate = {};
            if (filters.startDate) {
                whereClause.startDate.gte = filters.startDate;
            }
            if (filters.endDate) {
                whereClause.startDate.lte = filters.endDate;
            }
        }
        const events = await prisma.calendarEvent.findMany({
            where: whereClause,
            include: {
                creator: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        discipline: true
                    }
                },
                station: {
                    select: {
                        name: true,
                        location: true
                    }
                },
                project: {
                    select: {
                        code: true,
                        title: true
                    }
                },
                activity: {
                    select: {
                        code: true,
                        title: true,
                        type: true
                    }
                },
                documents: {
                    select: {
                        title: true,
                        type: true,
                        createdAt: true
                    }
                }
            },
            orderBy: {
                startDate: 'asc'
            }
        });
        // Générer le rapport selon le format demandé
        if (filters.format === 'pdf') {
            return await this.generatePDFReport(events, filters);
        }
        else {
            return await this.generateDOCXReport(events, filters);
        }
    }
    /**
     * Générer un rapport PDF
     */
    async generatePDFReport(events, filters) {
        const dateStr = new Date().toLocaleDateString('fr-FR').replace(/\//g, '-');
        const filename = `Rapport_Evenements_${dateStr}.pdf`;
        const reportsDir = path.join(process.cwd(), 'uploads', 'reports');
        // Créer le dossier s'il n'existe pas
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }
        const filepath = path.join(reportsDir, filename);
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ margin: 50, size: 'A4' });
            const stream = fs.createWriteStream(filepath);
            doc.pipe(stream);
            // En-tête
            doc.fontSize(20).font('Helvetica-Bold').text('RAPPORT DES ÉVÉNEMENTS', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).font('Helvetica');
            doc.text(`Date de génération: ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });
            doc.moveDown();
            // Filtres appliqués
            doc.fontSize(14).font('Helvetica-Bold').text('Filtres appliqués:', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica');
            if (filters.startDate) {
                doc.text(`Période: du ${filters.startDate.toLocaleDateString('fr-FR')} ${filters.endDate ? 'au ' + filters.endDate.toLocaleDateString('fr-FR') : ''}`);
            }
            if (filters.type) {
                doc.text(`Type: ${filters.type}`);
            }
            doc.moveDown();
            // Statistiques
            doc.fontSize(14).font('Helvetica-Bold').text('Statistiques globales:', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica');
            doc.text(`Nombre total d'événements: ${events.length}`);
            // Groupement par type
            const eventsByType = events.reduce((acc, event) => {
                acc[event.type] = (acc[event.type] || 0) + 1;
                return acc;
            }, {});
            doc.text('Répartition par type:');
            Object.entries(eventsByType).forEach(([type, count]) => {
                doc.text(`  - ${type}: ${count}`, { indent: 20 });
            });
            doc.moveDown(1.5);
            // Liste des événements
            doc.fontSize(14).font('Helvetica-Bold').text('Liste des événements:', { underline: true });
            doc.moveDown();
            events.forEach((event, index) => {
                // Nouvelle page si nécessaire
                if (doc.y > 700) {
                    doc.addPage();
                }
                doc.fontSize(12).font('Helvetica-Bold').text(`${index + 1}. ${event.title}`, { continued: false });
                doc.fontSize(10).font('Helvetica');
                doc.text(`Type: ${event.type}`, { indent: 20 });
                doc.text(`Statut: ${event.status}`, { indent: 20 });
                doc.text(`Date: ${new Date(event.startDate).toLocaleDateString('fr-FR')}${event.endDate ? ' - ' + new Date(event.endDate).toLocaleDateString('fr-FR') : ''}`, { indent: 20 });
                if (event.location) {
                    doc.text(`Lieu: ${event.location}`, { indent: 20 });
                }
                if (event.station) {
                    doc.text(`Station: ${event.station.name} (${event.station.location})`, { indent: 20 });
                }
                doc.text(`Organisateur: ${event.creator.firstName} ${event.creator.lastName}`, { indent: 20 });
                if (event.creator.discipline) {
                    doc.text(`Discipline: ${event.creator.discipline}`, { indent: 20 });
                }
                if (event.description) {
                    doc.text(`Description: ${event.description}`, { indent: 20 });
                }
                if (event.project) {
                    doc.text(`Projet lié: ${event.project.code} - ${event.project.title}`, { indent: 20 });
                }
                if (event.activity) {
                    doc.text(`Activité liée: ${event.activity.code || ''} ${event.activity.title}`, { indent: 20 });
                }
                if (event.documents.length > 0) {
                    doc.text(`Documents (${event.documents.length}):`, { indent: 20 });
                    event.documents.forEach((docItem) => {
                        doc.text(`  • ${docItem.title} (${docItem.type})`, { indent: 40 });
                    });
                }
                doc.moveDown();
                // Ligne de séparation
                if (index < events.length - 1) {
                    doc.strokeColor('#cccccc').lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
                    doc.moveDown(0.5);
                }
            });
            // Pied de page sur chaque page
            const pages = doc.bufferedPageRange();
            for (let i = 0; i < pages.count; i++) {
                doc.switchToPage(i);
                doc.fontSize(8).text(`Page ${i + 1} sur ${pages.count}`, 50, doc.page.height - 50, { align: 'center' });
            }
            doc.end();
            stream.on('finish', () => {
                resolve({ filepath, filename });
            });
            stream.on('error', (error) => {
                reject(error);
            });
        });
    }
    /**
     * Générer un rapport DOCX
     */
    async generateDOCXReport(events, filters) {
        const dateStr = new Date().toLocaleDateString('fr-FR').replace(/\//g, '-');
        const filename = `Rapport_Evenements_${dateStr}.docx`;
        const reportsDir = path.join(process.cwd(), 'uploads', 'reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }
        const filepath = path.join(reportsDir, filename);
        // Créer le document
        const sections = [];
        // En-tête
        const headerParagraphs = [
            new docx_1.Paragraph({
                text: 'RAPPORT DES ÉVÉNEMENTS',
                heading: 'Heading1',
                alignment: docx_1.AlignmentType.CENTER,
                spacing: { after: 200 }
            }),
            new docx_1.Paragraph({
                text: `Date de génération: ${new Date().toLocaleDateString('fr-FR')}`,
                alignment: docx_1.AlignmentType.CENTER,
                spacing: { after: 400 }
            })
        ];
        // Filtres
        const filterParagraphs = [
            new docx_1.Paragraph({
                text: 'Filtres appliqués',
                heading: 'Heading2',
                spacing: { before: 200, after: 100 }
            })
        ];
        if (filters.startDate) {
            filterParagraphs.push(new docx_1.Paragraph({
                text: `Période: du ${filters.startDate.toLocaleDateString('fr-FR')} ${filters.endDate ? 'au ' + filters.endDate.toLocaleDateString('fr-FR') : ''}`,
                spacing: { after: 100 }
            }));
        }
        if (filters.type) {
            filterParagraphs.push(new docx_1.Paragraph({
                text: `Type: ${filters.type}`,
                spacing: { after: 100 }
            }));
        }
        // Statistiques
        const statsParagraphs = [
            new docx_1.Paragraph({
                text: 'Statistiques globales',
                heading: 'Heading2',
                spacing: { before: 400, after: 200 }
            }),
            new docx_1.Paragraph({
                text: `Nombre total d'événements: ${events.length}`,
                spacing: { after: 100 }
            })
        ];
        // Groupement par type
        const eventsByType = events.reduce((acc, event) => {
            acc[event.type] = (acc[event.type] || 0) + 1;
            return acc;
        }, {});
        statsParagraphs.push(new docx_1.Paragraph({
            text: 'Répartition par type:',
            spacing: { after: 100 }
        }));
        Object.entries(eventsByType).forEach(([type, count]) => {
            statsParagraphs.push(new docx_1.Paragraph({
                text: `  • ${type}: ${count}`,
                spacing: { after: 50 }
            }));
        });
        // Liste des événements
        const eventsParagraphs = [
            new docx_1.Paragraph({
                text: 'Liste des événements',
                heading: 'Heading2',
                spacing: { before: 400, after: 200 }
            })
        ];
        events.forEach((event, index) => {
            eventsParagraphs.push(new docx_1.Paragraph({
                children: [
                    new docx_1.TextRun({
                        text: `${index + 1}. ${event.title}`,
                        bold: true,
                        size: 24
                    })
                ],
                spacing: { before: 200, after: 100 }
            }), new docx_1.Paragraph({
                text: `Type: ${event.type}`,
                spacing: { after: 50 }
            }), new docx_1.Paragraph({
                text: `Statut: ${event.status}`,
                spacing: { after: 50 }
            }), new docx_1.Paragraph({
                text: `Date: ${new Date(event.startDate).toLocaleDateString('fr-FR')}${event.endDate ? ' - ' + new Date(event.endDate).toLocaleDateString('fr-FR') : ''}`,
                spacing: { after: 50 }
            }));
            if (event.location) {
                eventsParagraphs.push(new docx_1.Paragraph({
                    text: `Lieu: ${event.location}`,
                    spacing: { after: 50 }
                }));
            }
            if (event.station) {
                eventsParagraphs.push(new docx_1.Paragraph({
                    text: `Station: ${event.station.name} (${event.station.location})`,
                    spacing: { after: 50 }
                }));
            }
            eventsParagraphs.push(new docx_1.Paragraph({
                text: `Organisateur: ${event.creator.firstName} ${event.creator.lastName}`,
                spacing: { after: 50 }
            }));
            if (event.creator.discipline) {
                eventsParagraphs.push(new docx_1.Paragraph({
                    text: `Discipline: ${event.creator.discipline}`,
                    spacing: { after: 50 }
                }));
            }
            if (event.description) {
                eventsParagraphs.push(new docx_1.Paragraph({
                    text: `Description: ${event.description}`,
                    spacing: { after: 50 }
                }));
            }
            if (event.project) {
                eventsParagraphs.push(new docx_1.Paragraph({
                    text: `Projet lié: ${event.project.code} - ${event.project.title}`,
                    spacing: { after: 50 }
                }));
            }
            if (event.activity) {
                eventsParagraphs.push(new docx_1.Paragraph({
                    text: `Activité liée: ${event.activity.code || ''} ${event.activity.title}`,
                    spacing: { after: 50 }
                }));
            }
            if (event.documents.length > 0) {
                eventsParagraphs.push(new docx_1.Paragraph({
                    text: `Documents (${event.documents.length}):`,
                    spacing: { after: 50 }
                }));
                event.documents.forEach((doc) => {
                    eventsParagraphs.push(new docx_1.Paragraph({
                        text: `  • ${doc.title} (${doc.type})`,
                        spacing: { after: 50 }
                    }));
                });
            }
        });
        // Créer le document final
        const doc = new docx_1.Document({
            sections: [
                {
                    children: [
                        ...headerParagraphs,
                        ...filterParagraphs,
                        ...statsParagraphs,
                        ...eventsParagraphs
                    ]
                }
            ]
        });
        // Générer le buffer et sauvegarder
        const buffer = await docx_1.Packer.toBuffer(doc);
        fs.writeFileSync(filepath, buffer);
        return { filepath, filename };
    }
}
exports.ReportEventService = ReportEventService;
exports.default = new ReportEventService();
//# sourceMappingURL=reportEvent.service.js.map