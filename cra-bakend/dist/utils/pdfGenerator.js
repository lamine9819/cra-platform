"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePDF = generatePDF;
const tslib_1 = require("tslib");
const pdfkit_1 = tslib_1.__importDefault(require("pdfkit"));
async function generatePDF(data) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new pdfkit_1.default({
                size: 'A4',
                margins: { top: 50, bottom: 50, left: 50, right: 50 }
            });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            // Titre principal - Utilise le lifecycleStatus pour déterminer le type de fiche
            const titreMapping = {
                'NOUVELLE': 'FICHE D\'ACTIVITÉ NOUVELLE',
                'RECONDUITE': 'FICHE D\'ACTIVITÉ RECONDUITE',
                'CLOTUREE': 'FICHE D\'ACTIVITÉ CLÔTURÉE'
            };
            doc.fontSize(16)
                .font('Helvetica-Bold')
                .text(titreMapping[data.lifecycleStatus] || 'FICHE D\'ACTIVITÉ', { align: 'center' });
            doc.moveDown();
            // Section 1: Informations générales
            addSection(doc, 'Informations générales');
            addField(doc, 'CODE ACTIVITE', data.codeActivite);
            addField(doc, 'CENTRE', data.centre);
            addField(doc, 'DOMAINE D\'ACTIVITE', data.domaineActivite);
            addField(doc, 'CODE CENTRE', data.codeCentre);
            addField(doc, 'TYPE DE RECHERCHE', data.typeRecherche);
            addField(doc, 'DATE DEBUT', data.dateDebut);
            addField(doc, 'DATE FIN', data.dateFin);
            addField(doc, 'Région d\'intervention', data.regionIntervention);
            doc.moveDown();
            // Section 2: Cadrage stratégique
            addSection(doc, 'Cadrage stratégique');
            addField(doc, 'PLAN STRATEGIQUE', data.planStrategique);
            addField(doc, 'AXE', data.axe);
            addField(doc, 'SOUS-AXE', data.sousAxe);
            addField(doc, 'PROGRAMME', data.programme);
            addField(doc, 'THEME', data.theme);
            doc.moveDown();
            // Section 3: Activité
            addSection(doc, 'Description de l\'activité');
            addField(doc, 'TITRE DE L\'ACTIVITE', data.titreActivite);
            addField(doc, 'RESPONSABLE DE L\'ACTIVITE', data.responsableActivite);
            addField(doc, 'GRADE', data.grade);
            addField(doc, 'DISCIPLINE', data.discipline);
            doc.moveDown();
            // Section spécifique selon le lifecycleStatus
            if (data.lifecycleStatus === 'RECONDUITE' || data.lifecycleStatus === 'CLOTUREE') {
                // Pour activité reconduite ou clôturée
                addSection(doc, 'APPLICATION DES RECOMMANDATIONS DU CST');
                if (data.contraintes) {
                    doc.fontSize(10).text('CONTRAINTES :', { continued: false });
                    doc.fontSize(9).text(data.contraintes, { align: 'justify' });
                    doc.moveDown(0.5);
                }
                if (data.resultatsObtenus) {
                    doc.fontSize(10).text('RESULTATS OBTENUS :', { continued: false });
                    doc.fontSize(9).text(data.resultatsObtenus, { align: 'justify' });
                    doc.moveDown(0.5);
                }
            }
            else {
                // Pour nouvelle activité
                if (data.justificatifs) {
                    addSection(doc, 'JUSTIFICATIFS');
                    doc.fontSize(9).text(data.justificatifs, { align: 'justify' });
                    doc.moveDown();
                }
            }
            // Section 4: Objectifs
            addSection(doc, 'OBJECTIFS');
            doc.fontSize(9).text(data.objectifs, { align: 'justify' });
            doc.moveDown();
            // Section 5: Méthodologie
            if (data.methodologie) {
                addSection(doc, 'METHODOLOGIE');
                doc.fontSize(9).text(data.methodologie, { align: 'justify' });
                doc.moveDown();
            }
            // Section 6: Mode de transfert
            if (data.modeTransfertAcquis) {
                addSection(doc, 'MODE DE TRANSFERT DES ACQUIS');
                doc.fontSize(9).text(data.modeTransfertAcquis);
                doc.moveDown();
            }
            // Section 7: Équipe de recherche
            if (data.equipeRecherche.length > 0) {
                doc.addPage();
                addSection(doc, 'EQUIPE DE RECHERCHE');
                // En-tête du tableau
                const tableTop = doc.y;
                const colWidths = [120, 80, 100, 80, 100, 60];
                const headers = ['Chercheur', 'Grade', 'Discipline', 'Institution', 'Laboratoire', 'Temps %'];
                drawTableHeader(doc, headers, colWidths, tableTop);
                // Lignes du tableau
                let currentY = tableTop + 20;
                data.equipeRecherche.forEach((membre) => {
                    if (currentY > 700) {
                        doc.addPage();
                        currentY = 50;
                        drawTableHeader(doc, headers, colWidths, currentY);
                        currentY += 20;
                    }
                    drawTableRow(doc, [
                        membre.chercheur,
                        membre.grade,
                        membre.discipline,
                        membre.institution,
                        membre.laboratoire,
                        membre.tempsEnPourcent.toString()
                    ], colWidths, currentY);
                    currentY += 20;
                });
                doc.y = currentY + 10;
                doc.moveDown();
            }
            // Section 8: Institutions partenaires
            if (data.institutionsPartenaires.length > 0) {
                addSection(doc, 'INSTITUTIONS PARTENAIRES');
                const tableTop = doc.y;
                const colWidths = [350, 190];
                const headers = ['Institution partenaire', 'Budget alloué en F.CFA'];
                drawTableHeader(doc, headers, colWidths, tableTop);
                let currentY = tableTop + 20;
                data.institutionsPartenaires.forEach((inst) => {
                    if (currentY > 700) {
                        doc.addPage();
                        currentY = 50;
                        drawTableHeader(doc, headers, colWidths, currentY);
                        currentY += 20;
                    }
                    drawTableRow(doc, [
                        inst.institution,
                        inst.budgetAlloue.toLocaleString('fr-FR')
                    ], colWidths, currentY);
                    currentY += 20;
                });
                doc.y = currentY + 10;
                doc.moveDown();
            }
            // Section 9: Ressources financières
            if (data.ressourcesFinancieres.length > 0) {
                addSection(doc, 'RESSOURCES FINANCIERES');
                const tableTop = doc.y;
                const colWidths = [270, 270];
                const headers = ['Bailleur de fonds', 'Montant financement en F.CFA'];
                drawTableHeader(doc, headers, colWidths, tableTop);
                let currentY = tableTop + 20;
                data.ressourcesFinancieres.forEach((res) => {
                    if (currentY > 700) {
                        doc.addPage();
                        currentY = 50;
                        drawTableHeader(doc, headers, colWidths, currentY);
                        currentY += 20;
                    }
                    drawTableRow(doc, [
                        res.bailleurFonds,
                        res.montantFinancement.toLocaleString('fr-FR')
                    ], colWidths, currentY);
                    currentY += 20;
                });
                doc.y = currentY + 10;
                doc.moveDown();
            }
            // Budget total
            if (data.budgetTotalAnnee) {
                doc.fontSize(11)
                    .font('Helvetica-Bold')
                    .text(`BUDGET TOTAL ANNEE ${new Date().getFullYear()} : ${data.budgetTotalAnnee.toLocaleString('fr-FR')}`, { align: 'left' });
            }
            doc.end();
        }
        catch (error) {
            reject(error);
        }
    });
}
// Fonctions utilitaires pour le PDF
function addSection(doc, title) {
    doc.fontSize(12)
        .font('Helvetica-Bold')
        .text(title, { underline: true });
    doc.moveDown(0.5);
}
function addField(doc, label, value) {
    if (!value)
        return;
    doc.fontSize(10).font('Helvetica-Bold').text(label + ' :', { continued: true });
    doc.fontSize(9).font('Helvetica').text(' ' + value);
    doc.moveDown(0.3);
}
function drawTableHeader(doc, headers, colWidths, y) {
    let x = 50;
    doc.fontSize(9).font('Helvetica-Bold');
    headers.forEach((header, i) => {
        doc.rect(x, y, colWidths[i], 20).fillAndStroke('#CCCCCC', '#000000');
        doc.fillColor('#000000').text(header, x + 5, y + 5, {
            width: colWidths[i] - 10,
            align: 'left'
        });
        x += colWidths[i];
    });
}
function drawTableRow(doc, values, colWidths, y) {
    let x = 50;
    doc.fontSize(8).font('Helvetica');
    values.forEach((value, i) => {
        doc.rect(x, y, colWidths[i], 20).stroke('#000000');
        doc.text(value, x + 5, y + 5, {
            width: colWidths[i] - 10,
            align: 'left'
        });
        x += colWidths[i];
    });
}
//# sourceMappingURL=pdfGenerator.js.map