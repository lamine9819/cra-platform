"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportGenerator = exports.ReportGenerator = void 0;
const tslib_1 = require("tslib");
// utils/reportGenerator.ts
const pdfkit_1 = tslib_1.__importDefault(require("pdfkit"));
const fs = tslib_1.__importStar(require("fs"));
const docx_1 = require("docx");
const publication_service_1 = require("../services/publication.service");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class ReportGenerator {
    async generatePublicationReport(researcherId, year, format = 'pdf') {
        // Récupérer les informations du chercheur
        const researcher = await prisma.user.findUnique({
            where: { id: researcherId },
            select: {
                firstName: true,
                lastName: true,
                department: true,
                discipline: true
            }
        });
        if (!researcher) {
            throw new Error("Chercheur non trouvé");
        }
        const publications = await publication_service_1.publicationService.getResearcherPublications(researcherId, year);
        if (format === 'pdf') {
            return this.generatePDFReport(publications, year, researcher);
        }
        else {
            return this.generateWordReport(publications, year, researcher);
        }
    }
    async generatePDFReport(publications, year, researcher) {
        const doc = new pdfkit_1.default({
            margin: 50,
            size: 'A4'
        });
        const filename = `rapport_publications_${researcher.lastName}_${year}.pdf`;
        const reportsDir = './reports';
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }
        const filepath = `${reportsDir}/${filename}`;
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);
        // En-tête du rapport
        doc.fontSize(18)
            .font('Helvetica-Bold')
            .text('RAPPORT DES PUBLICATIONS SCIENTIFIQUES', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(12)
            .font('Helvetica')
            .text(`Année: ${year}`, { align: 'center' });
        doc.moveDown(0.3);
        doc.text(`Chercheur: ${researcher.firstName} ${researcher.lastName}`, { align: 'center' });
        if (researcher.department) {
            doc.text(`Département: ${researcher.department}`, { align: 'center' });
        }
        if (researcher.discipline) {
            doc.text(`Discipline: ${researcher.discipline}`, { align: 'center' });
        }
        doc.moveDown(1);
        // Ligne de séparation
        doc.moveTo(50, doc.y)
            .lineTo(545, doc.y)
            .stroke();
        doc.moveDown(1);
        // Statistiques globales
        doc.fontSize(14)
            .font('Helvetica-Bold')
            .text('STATISTIQUES GLOBALES', { underline: true });
        doc.moveDown(0.5);
        const stats = this.calculateStats(publications);
        doc.fontSize(11)
            .font('Helvetica');
        doc.text(`Nombre total de publications: ${stats.total}`, { indent: 20 });
        doc.text(`Publications internationales: ${stats.international}`, { indent: 20 });
        doc.text(`Publications nationales: ${stats.national}`, { indent: 20 });
        doc.moveDown(1);
        // Classification par type
        const grouped = this.groupByType(publications);
        Object.entries(grouped).forEach(([type, pubs]) => {
            doc.fontSize(13)
                .font('Helvetica-Bold')
                .text(this.getTypeLabel(type), { underline: true });
            doc.moveDown(0.5);
            pubs.forEach((pub, index) => {
                const authors = this.formatAuthors(pub.authors);
                const pubYear = pub.publicationDate ? new Date(pub.publicationDate).getFullYear() : year;
                doc.fontSize(10)
                    .font('Helvetica');
                let citation = `${index + 1}. ${authors} (${pubYear}). ${pub.title}. `;
                if (pub.journal) {
                    citation += `${pub.journal}`;
                    if (pub.volume)
                        citation += `, ${pub.volume}`;
                    if (pub.issue)
                        citation += `(${pub.issue})`;
                    if (pub.pages)
                        citation += `, ${pub.pages}`;
                    citation += '.';
                }
                else if (pub.publisher) {
                    citation += `${pub.publisher}.`;
                }
                if (pub.doi) {
                    citation += ` DOI: ${pub.doi}`;
                }
                doc.text(citation, {
                    align: 'justify',
                    indent: 20
                });
                doc.moveDown(0.3);
            });
            doc.moveDown(0.7);
        });
        // Pied de page
        doc.fontSize(9)
            .font('Helvetica-Oblique')
            .text(`Rapport généré le ${new Date().toLocaleDateString('fr-FR')}`, 50, doc.page.height - 50, { align: 'center' });
        doc.end();
        return new Promise((resolve) => {
            stream.on('finish', () => resolve(filename));
        });
    }
    async generateWordReport(publications, year, researcher) {
        const filename = `rapport_publications_${researcher.lastName}_${year}.docx`;
        const reportsDir = './reports';
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }
        const filepath = `${reportsDir}/${filename}`;
        // Statistiques
        const stats = this.calculateStats(publications);
        const grouped = this.groupByType(publications);
        // Construction du document
        const sections = [];
        // En-tête
        sections.push(new docx_1.Paragraph({
            text: 'RAPPORT DES PUBLICATIONS SCIENTIFIQUES',
            heading: docx_1.HeadingLevel.TITLE,
            alignment: docx_1.AlignmentType.CENTER,
            spacing: { after: 200 }
        }), new docx_1.Paragraph({
            text: `Année: ${year}`,
            alignment: docx_1.AlignmentType.CENTER
        }), new docx_1.Paragraph({
            text: `Chercheur: ${researcher.firstName} ${researcher.lastName}`,
            alignment: docx_1.AlignmentType.CENTER
        }));
        if (researcher.department) {
            sections.push(new docx_1.Paragraph({
                text: `Département: ${researcher.department}`,
                alignment: docx_1.AlignmentType.CENTER
            }));
        }
        if (researcher.discipline) {
            sections.push(new docx_1.Paragraph({
                text: `Discipline: ${researcher.discipline}`,
                alignment: docx_1.AlignmentType.CENTER,
                spacing: { after: 400 }
            }));
        }
        // Statistiques
        sections.push(new docx_1.Paragraph({
            text: 'STATISTIQUES GLOBALES',
            heading: docx_1.HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
        }), new docx_1.Paragraph({
            children: [
                new docx_1.TextRun({
                    text: `Nombre total de publications: ${stats.total}`
                })
            ],
            spacing: { after: 100 }
        }), new docx_1.Paragraph({
            children: [
                new docx_1.TextRun({
                    text: `Publications internationales: ${stats.international}`
                })
            ],
            spacing: { after: 100 }
        }), new docx_1.Paragraph({
            children: [
                new docx_1.TextRun({
                    text: `Publications nationales: ${stats.national}`
                })
            ],
            spacing: { after: 400 }
        }));
        // Publications par type
        Object.entries(grouped).forEach(([type, pubs]) => {
            sections.push(new docx_1.Paragraph({
                text: this.getTypeLabel(type),
                heading: docx_1.HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 200 }
            }));
            pubs.forEach((pub, index) => {
                const authors = this.formatAuthors(pub.authors);
                const pubYear = pub.publicationDate ? new Date(pub.publicationDate).getFullYear() : year;
                let citation = `${index + 1}. ${authors} (${pubYear}). ${pub.title}. `;
                if (pub.journal) {
                    citation += `${pub.journal}`;
                    if (pub.volume)
                        citation += `, ${pub.volume}`;
                    if (pub.issue)
                        citation += `(${pub.issue})`;
                    if (pub.pages)
                        citation += `, ${pub.pages}`;
                    citation += '.';
                }
                else if (pub.publisher) {
                    citation += `${pub.publisher}.`;
                }
                if (pub.doi) {
                    citation += ` DOI: ${pub.doi}`;
                }
                sections.push(new docx_1.Paragraph({
                    text: citation,
                    spacing: { after: 150 },
                    alignment: docx_1.AlignmentType.JUSTIFIED
                }));
            });
        });
        // Pied de page
        sections.push(new docx_1.Paragraph({
            children: [
                new docx_1.TextRun({
                    text: `Rapport généré le ${new Date().toLocaleDateString('fr-FR')}`,
                    italics: true
                })
            ],
            alignment: docx_1.AlignmentType.CENTER,
            spacing: { before: 800 }
        }));
        // Créer le document
        const doc = new docx_1.Document({
            sections: [
                {
                    properties: {},
                    children: sections
                }
            ]
        });
        // Sauvegarder
        const buffer = await docx_1.Packer.toBuffer(doc);
        fs.writeFileSync(filepath, buffer);
        return filename;
    }
    formatAuthors(authors) {
        return authors
            .sort((a, b) => a.authorOrder - b.authorOrder)
            .map(a => {
            const lastName = a.user.lastName.toUpperCase();
            const firstInitial = a.user.firstName.charAt(0);
            return `${lastName} ${firstInitial}.`;
        })
            .join(', ');
    }
    groupByType(publications) {
        return publications.reduce((acc, pub) => {
            if (!acc[pub.type])
                acc[pub.type] = [];
            acc[pub.type].push(pub);
            return acc;
        }, {});
    }
    calculateStats(publications) {
        return {
            total: publications.length,
            international: publications.filter(p => p.isInternational).length,
            national: publications.filter(p => !p.isInternational).length
        };
    }
    getTypeLabel(type) {
        const labels = {
            'ARTICLE_SCIENTIFIQUE': 'Articles scientifiques',
            'COMMUNICATION_CONFERENCE': 'Communications de conférence',
            'CHAPITRE_LIVRE': 'Chapitres de livre',
            'LIVRE': 'Livres',
            'RAPPORT_TECHNIQUE': 'Rapports techniques',
            'FICHE_TECHNIQUE': 'Fiches techniques',
            'MEMOIRE': 'Mémoires',
            'THESE': 'Thèses'
        };
        return labels[type] || type;
    }
}
exports.ReportGenerator = ReportGenerator;
exports.reportGenerator = new ReportGenerator();
//# sourceMappingURL=reportGenerator.js.map