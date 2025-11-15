"use strict";
// src/services/document-generator.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentGeneratorService = exports.DocumentGeneratorService = void 0;
const tslib_1 = require("tslib");
const pdfkit_1 = tslib_1.__importDefault(require("pdfkit"));
const docx_1 = require("docx");
const fs = tslib_1.__importStar(require("fs"));
const path = tslib_1.__importStar(require("path"));
const reports_types_1 = require("../types/reports.types");
const report_service_1 = require("./report.service");
const quarter_service_1 = require("./quarter.service");
class DocumentGeneratorService {
    constructor() {
        this.uploadsDir = path.join(process.cwd(), 'uploads', 'reports');
        this.ensureUploadsDirExists();
    }
    ensureUploadsDirExists() {
        if (!fs.existsSync(this.uploadsDir)) {
            fs.mkdirSync(this.uploadsDir, { recursive: true });
        }
    }
    // ============================================
    // RAPPORTS TRIMESTRIELS - ACTIVITÉS
    // ============================================
    /**
     * Génère un rapport trimestriel d'activités au format PDF
     */
    async generateActivitiesPDF(activities, filters) {
        const period = quarter_service_1.quarterService.getReportPeriod(filters);
        const filename = `rapport_activites_${period.label.replace(/\s/g, '_')}_${Date.now()}.pdf`;
        const filepath = path.join(this.uploadsDir, filename);
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ margin: 50, size: 'A4' });
            const writeStream = fs.createWriteStream(filepath);
            doc.pipe(writeStream);
            // En-tête avec mention du trimestre
            doc
                .fontSize(20)
                .font('Helvetica-Bold')
                .text('Rapport d\'Activités', { align: 'center' });
            doc
                .fontSize(14)
                .font('Helvetica')
                .text(period.label, { align: 'center' });
            doc.moveDown(2);
            // Tableau
            const tableTop = doc.y;
            const col1X = 50;
            const col2X = 300;
            const col3X = 480;
            const rowHeight = 60;
            // En-têtes de colonnes
            doc
                .fontSize(12)
                .font('Helvetica-Bold')
                .rect(col1X, tableTop, 250, 30)
                .stroke()
                .text('Intitulé activité', col1X + 5, tableTop + 10, { width: 240 });
            doc
                .rect(col2X, tableTop, 180, 30)
                .stroke()
                .text("Responsables d'activités", col2X + 5, tableTop + 10, { width: 170 });
            doc
                .rect(col3X, tableTop, 70, 30)
                .stroke()
                .text('Situation Activité', col3X + 5, tableTop + 10, { width: 60 });
            // Données
            let currentY = tableTop + 30;
            doc.font('Helvetica').fontSize(10);
            activities.forEach((activity, index) => {
                // Vérifier si on a besoin d'une nouvelle page
                if (currentY > 700) {
                    doc.addPage();
                    currentY = 50;
                    // Répéter les en-têtes
                    doc.fontSize(12).font('Helvetica-Bold');
                    doc.rect(col1X, currentY, 250, 30).stroke();
                    doc.text('Intitulé activité', col1X + 5, currentY + 10, { width: 240 });
                    doc.rect(col2X, currentY, 180, 30).stroke();
                    doc.text("Responsables d'activités", col2X + 5, currentY + 10, { width: 170 });
                    doc.rect(col3X, currentY, 70, 30).stroke();
                    doc.text('Situation Activité', col3X + 5, currentY + 10, { width: 60 });
                    currentY += 30;
                    doc.font('Helvetica').fontSize(10);
                }
                const rowY = currentY;
                // Colonne 1 - Intitulé
                doc
                    .rect(col1X, rowY, 250, rowHeight)
                    .stroke()
                    .text(activity.intitule, col1X + 5, rowY + 10, {
                    width: 240,
                    height: rowHeight - 20
                });
                // Colonne 2 - Responsables
                const responsablesText = activity.responsables.join('\n');
                doc
                    .rect(col2X, rowY, 180, rowHeight)
                    .stroke()
                    .text(responsablesText, col2X + 5, rowY + 10, {
                    width: 170,
                    height: rowHeight - 20
                });
                // Colonne 3 - Situation
                doc
                    .rect(col3X, rowY, 70, rowHeight)
                    .stroke()
                    .text(activity.situation, col3X + 5, rowY + 10, {
                    width: 60,
                    align: 'center'
                });
                currentY += rowHeight;
            });
            // Pied de page
            doc.moveDown(2);
            doc
                .fontSize(10)
                .font('Helvetica-Bold')
                .text(`Total activités: ${activities.length}`, 50, currentY + 20);
            doc
                .fontSize(10)
                .font('Helvetica')
                .text(`Rapport généré le ${new Date().toLocaleDateString('fr-FR')}`, 50, doc.page.height - 50, { align: 'center' });
            doc.end();
            writeStream.on('finish', () => resolve(filepath));
            writeStream.on('error', reject);
        });
    }
    /**
     * Génère un rapport trimestriel d'activités au format WORD
     */
    async generateActivitiesWORD(activities, filters) {
        const period = quarter_service_1.quarterService.getReportPeriod(filters);
        const filename = `rapport_activites_${period.label.replace(/\s/g, '_')}_${Date.now()}.docx`;
        const filepath = path.join(this.uploadsDir, filename);
        // Créer les lignes du tableau
        const tableRows = [
            // En-tête
            new docx_1.TableRow({
                children: [
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                text: 'Intitulé activité',
                                heading: docx_1.HeadingLevel.HEADING_2,
                                alignment: docx_1.AlignmentType.CENTER
                            })
                        ],
                        width: { size: 40, type: docx_1.WidthType.PERCENTAGE }
                    }),
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                text: "Responsables d'activités",
                                heading: docx_1.HeadingLevel.HEADING_2,
                                alignment: docx_1.AlignmentType.CENTER
                            })
                        ],
                        width: { size: 35, type: docx_1.WidthType.PERCENTAGE }
                    }),
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                text: 'Situation Activité',
                                heading: docx_1.HeadingLevel.HEADING_2,
                                alignment: docx_1.AlignmentType.CENTER
                            })
                        ],
                        width: { size: 25, type: docx_1.WidthType.PERCENTAGE }
                    })
                ]
            }),
            // Données
            ...activities.map(activity => new docx_1.TableRow({
                children: [
                    new docx_1.TableCell({
                        children: [new docx_1.Paragraph(activity.intitule)]
                    }),
                    new docx_1.TableCell({
                        children: activity.responsables.map(resp => new docx_1.Paragraph(resp))
                    }),
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                text: activity.situation,
                                alignment: docx_1.AlignmentType.CENTER
                            })
                        ]
                    })
                ]
            }))
        ];
        // Créer le document
        const doc = new docx_1.Document({
            sections: [
                {
                    children: [
                        new docx_1.Paragraph({
                            text: "Rapport d'Activités",
                            heading: docx_1.HeadingLevel.HEADING_1,
                            alignment: docx_1.AlignmentType.CENTER,
                            spacing: { after: 200 }
                        }),
                        new docx_1.Paragraph({
                            text: period.label,
                            alignment: docx_1.AlignmentType.CENTER,
                            spacing: { after: 400 }
                        }),
                        new docx_1.Table({
                            rows: tableRows,
                            width: { size: 100, type: docx_1.WidthType.PERCENTAGE }
                        }),
                        new docx_1.Paragraph({
                            spacing: { before: 400 },
                            children: [
                                new docx_1.TextRun({
                                    text: `Total activités: ${activities.length}`,
                                    bold: true
                                })
                            ]
                        }),
                        new docx_1.Paragraph({
                            text: `Rapport généré le ${new Date().toLocaleDateString('fr-FR')}`,
                            spacing: { before: 400 },
                            alignment: docx_1.AlignmentType.CENTER
                        })
                    ]
                }
            ]
        });
        // Sauvegarder le fichier
        const buffer = await docx_1.Packer.toBuffer(doc);
        fs.writeFileSync(filepath, buffer);
        return filepath;
    }
    // ============================================
    // RAPPORTS TRIMESTRIELS - CONVENTIONS
    // ============================================
    /**
     * Génère un rapport trimestriel de conventions au format PDF
     */
    async generateConventionsPDF(conventions, filters) {
        const period = quarter_service_1.quarterService.getReportPeriod(filters);
        const filename = `rapport_conventions_${period.label.replace(/\s/g, '_')}_${Date.now()}.pdf`;
        const filepath = path.join(this.uploadsDir, filename);
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({
                margin: 50,
                size: 'A4',
                layout: 'landscape'
            });
            const writeStream = fs.createWriteStream(filepath);
            doc.pipe(writeStream);
            // En-tête
            doc
                .fontSize(18)
                .font('Helvetica-Bold')
                .text('Rapport des Conventions', { align: 'center' });
            doc
                .fontSize(14)
                .font('Helvetica')
                .text(period.label, { align: 'center' });
            doc.moveDown(2);
            // Configuration du tableau
            const tableTop = doc.y;
            const margins = {
                col1: 50,
                col2: 200,
                col3: 280,
                col4: 380,
                col5: 500,
                col6: 620
            };
            const rowHeight = 50;
            // En-têtes
            doc.fontSize(10).font('Helvetica-Bold');
            const headers = [
                { x: margins.col1, text: 'Intitulé', width: 140 },
                { x: margins.col2, text: 'Date début', width: 70 },
                { x: margins.col3, text: 'Date fin', width: 90 },
                { x: margins.col4, text: 'Financement global', width: 110 },
                { x: margins.col5, text: 'Financement mobilisé', width: 110 },
                { x: margins.col6, text: 'Bailleurs', width: 130 }
            ];
            headers.forEach(header => {
                doc
                    .rect(header.x, tableTop, header.width, 30)
                    .stroke()
                    .text(header.text, header.x + 5, tableTop + 10, {
                    width: header.width - 10
                });
            });
            // Données
            let currentY = tableTop + 30;
            doc.font('Helvetica').fontSize(9);
            conventions.forEach((conv, index) => {
                if (currentY > 500) {
                    doc.addPage();
                    currentY = 50;
                    // Répéter les en-têtes
                    doc.fontSize(10).font('Helvetica-Bold');
                    headers.forEach(header => {
                        doc.rect(header.x, currentY, header.width, 30).stroke();
                        doc.text(header.text, header.x + 5, currentY + 10, { width: header.width - 10 });
                    });
                    currentY += 30;
                    doc.font('Helvetica').fontSize(9);
                }
                const rowY = currentY;
                // Intitulé
                doc
                    .rect(margins.col1, rowY, 140, rowHeight)
                    .stroke()
                    .text(conv.intitule, margins.col1 + 5, rowY + 10, {
                    width: 130,
                    height: rowHeight - 20
                });
                // Date début
                doc
                    .rect(margins.col2, rowY, 70, rowHeight)
                    .stroke()
                    .text(report_service_1.reportService.formatDate(conv.dateDebut), margins.col2 + 5, rowY + 10, { width: 60, align: 'center' });
                // Date fin
                doc
                    .rect(margins.col3, rowY, 90, rowHeight)
                    .stroke()
                    .text(report_service_1.reportService.formatDate(conv.dateFin), margins.col3 + 5, rowY + 10, { width: 80, align: 'center' });
                // Financement global
                doc
                    .rect(margins.col4, rowY, 110, rowHeight)
                    .stroke()
                    .text(report_service_1.reportService.formatCurrency(conv.financementGlobal), margins.col4 + 5, rowY + 10, { width: 100, align: 'right' });
                // Financement mobilisé
                doc
                    .rect(margins.col5, rowY, 110, rowHeight)
                    .stroke()
                    .text(report_service_1.reportService.formatCurrency(conv.financementMobilise), margins.col5 + 5, rowY + 10, { width: 100, align: 'right' });
                // Bailleurs
                doc
                    .rect(margins.col6, rowY, 130, rowHeight)
                    .stroke()
                    .text(conv.bailleurs.join(', '), margins.col6 + 5, rowY + 10, {
                    width: 120,
                    height: rowHeight - 20
                });
                currentY += rowHeight;
            });
            // Pied de page
            doc
                .fontSize(10)
                .font('Helvetica')
                .text(`Rapport généré le ${new Date().toLocaleDateString('fr-FR')}`, 50, doc.page.height - 50, { align: 'center' });
            doc.end();
            writeStream.on('finish', () => resolve(filepath));
            writeStream.on('error', reject);
        });
    }
    /**
     * Génère un rapport trimestriel de conventions au format WORD
     */
    async generateConventionsWORD(conventions, filters) {
        const period = quarter_service_1.quarterService.getReportPeriod(filters);
        const filename = `rapport_conventions_${period.label.replace(/\s/g, '_')}_${Date.now()}.docx`;
        const filepath = path.join(this.uploadsDir, filename);
        const tableRows = [
            // En-tête
            new docx_1.TableRow({
                children: [
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                text: 'Intitulé',
                                heading: docx_1.HeadingLevel.HEADING_2,
                                alignment: docx_1.AlignmentType.CENTER
                            })
                        ]
                    }),
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                text: 'Date début',
                                heading: docx_1.HeadingLevel.HEADING_2,
                                alignment: docx_1.AlignmentType.CENTER
                            })
                        ]
                    }),
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                text: 'Date fin',
                                heading: docx_1.HeadingLevel.HEADING_2,
                                alignment: docx_1.AlignmentType.CENTER
                            })
                        ]
                    }),
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                text: 'Financement global',
                                heading: docx_1.HeadingLevel.HEADING_2,
                                alignment: docx_1.AlignmentType.CENTER
                            })
                        ]
                    }),
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                text: 'Financement mobilisé',
                                heading: docx_1.HeadingLevel.HEADING_2,
                                alignment: docx_1.AlignmentType.CENTER
                            })
                        ]
                    }),
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                text: 'Bailleurs',
                                heading: docx_1.HeadingLevel.HEADING_2,
                                alignment: docx_1.AlignmentType.CENTER
                            })
                        ]
                    })
                ]
            }),
            // Données
            ...conventions.map(conv => new docx_1.TableRow({
                children: [
                    new docx_1.TableCell({
                        children: [new docx_1.Paragraph(conv.intitule)]
                    }),
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                text: report_service_1.reportService.formatDate(conv.dateDebut),
                                alignment: docx_1.AlignmentType.CENTER
                            })
                        ]
                    }),
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                text: report_service_1.reportService.formatDate(conv.dateFin),
                                alignment: docx_1.AlignmentType.CENTER
                            })
                        ]
                    }),
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                text: report_service_1.reportService.formatCurrency(conv.financementGlobal),
                                alignment: docx_1.AlignmentType.RIGHT
                            })
                        ]
                    }),
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                text: report_service_1.reportService.formatCurrency(conv.financementMobilise),
                                alignment: docx_1.AlignmentType.RIGHT
                            })
                        ]
                    }),
                    new docx_1.TableCell({
                        children: [new docx_1.Paragraph(conv.bailleurs.join(', '))]
                    })
                ]
            }))
        ];
        const doc = new docx_1.Document({
            sections: [
                {
                    properties: {
                        page: {
                            size: {
                                orientation: 'landscape'
                            }
                        }
                    },
                    children: [
                        new docx_1.Paragraph({
                            text: 'Rapport des Conventions',
                            heading: docx_1.HeadingLevel.HEADING_1,
                            alignment: docx_1.AlignmentType.CENTER,
                            spacing: { after: 200 }
                        }),
                        new docx_1.Paragraph({
                            text: period.label,
                            alignment: docx_1.AlignmentType.CENTER,
                            spacing: { after: 400 }
                        }),
                        new docx_1.Table({
                            rows: tableRows,
                            width: { size: 100, type: docx_1.WidthType.PERCENTAGE }
                        }),
                        new docx_1.Paragraph({
                            text: `Rapport généré le ${new Date().toLocaleDateString('fr-FR')}`,
                            spacing: { before: 400 },
                            alignment: docx_1.AlignmentType.CENTER
                        })
                    ]
                }
            ]
        });
        const buffer = await docx_1.Packer.toBuffer(doc);
        fs.writeFileSync(filepath, buffer);
        return filepath;
    }
    // ============================================
    // RAPPORTS TRIMESTRIELS - TRANSFERTS
    // ============================================
    /**
     * Génère un rapport trimestriel de transferts au format PDF
     */
    async generateKnowledgeTransfersPDF(transfers, filters) {
        const period = quarter_service_1.quarterService.getReportPeriod(filters);
        const filename = `rapport_transferts_${period.label.replace(/\s/g, '_')}_${Date.now()}.pdf`;
        const filepath = path.join(this.uploadsDir, filename);
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({
                margin: 50,
                size: 'A4',
                layout: 'landscape'
            });
            const writeStream = fs.createWriteStream(filepath);
            doc.pipe(writeStream);
            // En-tête
            doc
                .fontSize(18)
                .font('Helvetica-Bold')
                .text('Rapport des Transferts de Connaissances', { align: 'center' });
            doc
                .fontSize(14)
                .font('Helvetica')
                .text(period.label, { align: 'center' });
            doc.moveDown(2);
            // Configuration du tableau
            const tableTop = doc.y;
            const margins = {
                col1: 50,
                col2: 180,
                col3: 320,
                col4: 520,
                col5: 680
            };
            const rowHeight = 60;
            // En-têtes
            doc.fontSize(10).font('Helvetica-Bold');
            const headers = [
                { x: margins.col1, text: 'Intitulé', width: 120 },
                { x: margins.col2, text: 'Date de disponibilité', width: 130 },
                { x: margins.col3, text: 'Description', width: 190 },
                { x: margins.col4, text: 'Impact potentiel', width: 150 },
                { x: margins.col5, text: 'Cibles', width: 130 }
            ];
            headers.forEach(header => {
                doc
                    .rect(header.x, tableTop, header.width, 30)
                    .stroke()
                    .text(header.text, header.x + 5, tableTop + 10, {
                    width: header.width - 10
                });
            });
            // Données
            let currentY = tableTop + 30;
            doc.font('Helvetica').fontSize(9);
            transfers.forEach((transfer, index) => {
                if (currentY > 500) {
                    doc.addPage();
                    currentY = 50;
                    // Répéter les en-têtes
                    doc.fontSize(10).font('Helvetica-Bold');
                    headers.forEach(header => {
                        doc.rect(header.x, currentY, header.width, 30).stroke();
                        doc.text(header.text, header.x + 5, currentY + 10, { width: header.width - 10 });
                    });
                    currentY += 30;
                    doc.font('Helvetica').fontSize(9);
                }
                const rowY = currentY;
                // Intitulé
                doc
                    .rect(margins.col1, rowY, 120, rowHeight)
                    .stroke()
                    .text(transfer.intitule, margins.col1 + 5, rowY + 10, {
                    width: 110,
                    height: rowHeight - 20
                });
                // Date de disponibilité
                doc
                    .rect(margins.col2, rowY, 130, rowHeight)
                    .stroke()
                    .text(report_service_1.reportService.formatDate(transfer.dateDisponibilite), margins.col2 + 5, rowY + 10, { width: 120, align: 'center' });
                // Description
                doc
                    .rect(margins.col3, rowY, 190, rowHeight)
                    .stroke()
                    .text(transfer.description, margins.col3 + 5, rowY + 10, {
                    width: 180,
                    height: rowHeight - 20
                });
                // Impact potentiel
                doc
                    .rect(margins.col4, rowY, 150, rowHeight)
                    .stroke()
                    .text(transfer.impactPotentiel, margins.col4 + 5, rowY + 10, {
                    width: 140,
                    height: rowHeight - 20
                });
                // Cibles
                doc
                    .rect(margins.col5, rowY, 130, rowHeight)
                    .stroke()
                    .text(transfer.cibles.join(', '), margins.col5 + 5, rowY + 10, {
                    width: 120,
                    height: rowHeight - 20
                });
                currentY += rowHeight;
            });
            // Pied de page
            doc
                .fontSize(10)
                .font('Helvetica')
                .text(`Rapport généré le ${new Date().toLocaleDateString('fr-FR')}`, 50, doc.page.height - 50, { align: 'center' });
            doc.end();
            writeStream.on('finish', () => resolve(filepath));
            writeStream.on('error', reject);
        });
    }
    /**
     * Génère un rapport trimestriel de transferts au format WORD
     */
    async generateKnowledgeTransfersWORD(transfers, filters) {
        const period = quarter_service_1.quarterService.getReportPeriod(filters);
        const filename = `rapport_transferts_${period.label.replace(/\s/g, '_')}_${Date.now()}.docx`;
        const filepath = path.join(this.uploadsDir, filename);
        const tableRows = [
            // En-tête
            new docx_1.TableRow({
                tableHeader: true,
                children: [
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                text: 'Intitulé',
                                heading: docx_1.HeadingLevel.HEADING_2,
                                alignment: docx_1.AlignmentType.CENTER
                            })
                        ]
                    }),
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                text: 'Date de disponibilité',
                                heading: docx_1.HeadingLevel.HEADING_2,
                                alignment: docx_1.AlignmentType.CENTER
                            })
                        ]
                    }),
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                text: 'Description',
                                heading: docx_1.HeadingLevel.HEADING_2,
                                alignment: docx_1.AlignmentType.CENTER
                            })
                        ]
                    }),
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                text: 'Impact potentiel',
                                heading: docx_1.HeadingLevel.HEADING_2,
                                alignment: docx_1.AlignmentType.CENTER
                            })
                        ]
                    }),
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                text: 'Cibles',
                                heading: docx_1.HeadingLevel.HEADING_2,
                                alignment: docx_1.AlignmentType.CENTER
                            })
                        ]
                    })
                ]
            }),
            // Données
            ...transfers.map(transfer => new docx_1.TableRow({
                children: [
                    new docx_1.TableCell({
                        children: [new docx_1.Paragraph(transfer.intitule)]
                    }),
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                text: report_service_1.reportService.formatDate(transfer.dateDisponibilite),
                                alignment: docx_1.AlignmentType.CENTER
                            })
                        ]
                    }),
                    new docx_1.TableCell({
                        children: [new docx_1.Paragraph(transfer.description)]
                    }),
                    new docx_1.TableCell({
                        children: [new docx_1.Paragraph(transfer.impactPotentiel)]
                    }),
                    new docx_1.TableCell({
                        children: [new docx_1.Paragraph(transfer.cibles.join(', '))]
                    })
                ]
            }))
        ];
        const doc = new docx_1.Document({
            sections: [
                {
                    properties: {
                        page: {
                            size: {
                                orientation: 'landscape'
                            }
                        }
                    },
                    children: [
                        new docx_1.Paragraph({
                            text: 'Rapport des Transferts de Connaissances',
                            heading: docx_1.HeadingLevel.HEADING_1,
                            alignment: docx_1.AlignmentType.CENTER,
                            spacing: { after: 200 }
                        }),
                        new docx_1.Paragraph({
                            text: period.label,
                            alignment: docx_1.AlignmentType.CENTER,
                            spacing: { after: 400 }
                        }),
                        new docx_1.Table({
                            rows: tableRows,
                            width: { size: 100, type: docx_1.WidthType.PERCENTAGE }
                        }),
                        new docx_1.Paragraph({
                            text: `Rapport généré le ${new Date().toLocaleDateString('fr-FR')}`,
                            spacing: { before: 400 },
                            alignment: docx_1.AlignmentType.CENTER
                        })
                    ]
                }
            ]
        });
        const buffer = await docx_1.Packer.toBuffer(doc);
        fs.writeFileSync(filepath, buffer);
        return filepath;
    }
    // ============================================
    // RAPPORTS ANNUELS - MÉTHODES UTILITAIRES
    // ============================================
    /**
     * Génère une page de couverture pour les rapports annuels
     */
    generateCoverPage(doc, title, year) {
        doc
            .fontSize(28)
            .font('Helvetica-Bold')
            .text(title, 50, 250, { align: 'center' });
        doc
            .fontSize(20)
            .font('Helvetica')
            .text(`Année ${year}`, 50, 300, { align: 'center' });
        doc
            .fontSize(12)
            .font('Helvetica')
            .text('Centre de Recherche Agricole', 50, doc.page.height - 100, { align: 'center' });
        doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, 50, doc.page.height - 80, { align: 'center' });
    }
    /**
     * Génère une page de synthèse annuelle
     */
    generateAnnualSummaryPage(doc, statistics, year) {
        doc
            .fontSize(20)
            .font('Helvetica-Bold')
            .text('Synthèse Annuelle', 50, 50);
        doc.moveDown(2);
        // Statistiques globales
        doc.fontSize(14).font('Helvetica-Bold').text('Vue d\'ensemble', 50, doc.y);
        doc.moveDown(1);
        const startY = doc.y;
        doc.fontSize(11).font('Helvetica');
        // Colonne 1
        doc.text(`Total des activités: ${statistics.annual.activities.total}`, 50, startY);
        doc.text(`Nouvelles activités: ${statistics.annual.activities.new}`, 50, startY + 20);
        doc.text(`Activités reconduites: ${statistics.annual.activities.reconducted}`, 50, startY + 40);
        doc.text(`Activités clôturées: ${statistics.annual.activities.closed}`, 50, startY + 60);
        // Colonne 2
        doc.text(`Total conventions: ${statistics.annual.conventions.total}`, 300, startY);
        doc.text(`Total transferts: ${statistics.annual.transfers.total}`, 300, startY + 20);
        doc.text(`Budget mobilisé: ${report_service_1.reportService.formatCurrency(statistics.annual.budget.totalMobilized)}`, 300, startY + 40);
        doc.moveDown(4);
        // Tableau récapitulatif par trimestre
        doc.fontSize(14).font('Helvetica-Bold').text('Évolution Trimestrielle', 50, doc.y);
        doc.moveDown(1);
        const tableTop = doc.y;
        const rowHeight = 30;
        const col1X = 50;
        const col2X = 150;
        const col3X = 250;
        const col4X = 350;
        const col5X = 450;
        // En-têtes
        doc.fontSize(10).font('Helvetica-Bold');
        ['Trimestre', 'Activités', 'Nouvelles', 'Reconduites', 'Clôturées'].forEach((header, i) => {
            const x = [col1X, col2X, col3X, col4X, col5X][i];
            doc.rect(x, tableTop, 100, rowHeight).stroke();
            doc.text(header, x + 5, tableTop + 10, { width: 90 });
        });
        // Données par trimestre
        let currentY = tableTop + rowHeight;
        doc.font('Helvetica').fontSize(9);
        [reports_types_1.Quarter.Q1, reports_types_1.Quarter.Q2, reports_types_1.Quarter.Q3, reports_types_1.Quarter.Q4].forEach((quarter) => {
            const quarterStats = statistics.byQuarter[quarter];
            const quarterLabel = `T${quarter}`;
            doc.rect(col1X, currentY, 100, rowHeight).stroke();
            doc.text(quarterLabel, col1X + 5, currentY + 10);
            doc.rect(col2X, currentY, 100, rowHeight).stroke();
            doc.text(quarterStats.activities.total.toString(), col2X + 5, currentY + 10, {
                align: 'center',
                width: 90
            });
            doc.rect(col3X, currentY, 100, rowHeight).stroke();
            doc.text(quarterStats.activities.new.toString(), col3X + 5, currentY + 10, {
                align: 'center',
                width: 90
            });
            doc.rect(col4X, currentY, 100, rowHeight).stroke();
            doc.text(quarterStats.activities.reconducted.toString(), col4X + 5, currentY + 10, {
                align: 'center',
                width: 90
            });
            doc.rect(col5X, currentY, 100, rowHeight).stroke();
            doc.text(quarterStats.activities.closed.toString(), col5X + 5, currentY + 10, {
                align: 'center',
                width: 90
            });
            currentY += rowHeight;
        });
        // Graphique simple (barres ASCII)
        doc.moveDown(3);
        doc.fontSize(14).font('Helvetica-Bold').text('Répartition des Activités', 50, doc.y);
        doc.moveDown(1);
        doc.fontSize(10).font('Helvetica');
        const maxActivities = Math.max(...Object.values(statistics.byQuarter).map((q) => q.activities.total));
        [reports_types_1.Quarter.Q1, reports_types_1.Quarter.Q2, reports_types_1.Quarter.Q3, reports_types_1.Quarter.Q4].forEach((quarter) => {
            const quarterStats = statistics.byQuarter[quarter];
            const barWidth = (quarterStats.activities.total / maxActivities) * 400;
            doc.text(`T${quarter}:`, 50, doc.y);
            doc.rect(100, doc.y - 5, barWidth, 15).fill('#4A90E2');
            doc.fillColor('#000000');
            doc.text(quarterStats.activities.total.toString(), 110 + barWidth, doc.y - 15);
            doc.moveDown(1.5);
        });
    }
    /**
     * Génère une page pour un trimestre spécifique
     */
    generateQuarterActivitiesPage(doc, activities, quarter, year) {
        const quarterLabel = quarter_service_1.quarterService.formatQuarterLabel(year, quarter);
        doc
            .fontSize(18)
            .font('Helvetica-Bold')
            .text(quarterLabel, 50, 50);
        doc.moveDown(2);
        // Tableau des activités
        const tableTop = doc.y;
        const col1X = 50;
        const col2X = 280;
        const col3X = 450;
        const rowHeight = 50;
        // En-têtes
        doc.fontSize(11).font('Helvetica-Bold');
        doc.rect(col1X, tableTop, 230, 30).stroke();
        doc.text('Intitulé activité', col1X + 5, tableTop + 10, { width: 220 });
        doc.rect(col2X, tableTop, 170, 30).stroke();
        doc.text("Responsables d'activités", col2X + 5, tableTop + 10, { width: 160 });
        doc.rect(col3X, tableTop, 90, 30).stroke();
        doc.text('Situation', col3X + 5, tableTop + 10, { width: 80 });
        // Données
        let currentY = tableTop + 30;
        doc.font('Helvetica').fontSize(9);
        activities.forEach((activity, index) => {
            // Vérifier si on a besoin d'une nouvelle page
            if (currentY > 700) {
                doc.addPage();
                currentY = 50;
                // Répéter les en-têtes sur la nouvelle page
                doc.fontSize(11).font('Helvetica-Bold');
                doc.rect(col1X, currentY, 230, 30).stroke();
                doc.text('Intitulé activité', col1X + 5, currentY + 10, { width: 220 });
                doc.rect(col2X, currentY, 170, 30).stroke();
                doc.text("Responsables d'activités", col2X + 5, currentY + 10, { width: 160 });
                doc.rect(col3X, currentY, 90, 30).stroke();
                doc.text('Situation', col3X + 5, currentY + 10, { width: 80 });
                currentY += 30;
                doc.font('Helvetica').fontSize(9);
            }
            const rowY = currentY;
            // Intitulé
            doc.rect(col1X, rowY, 230, rowHeight).stroke();
            doc.text(activity.intitule, col1X + 5, rowY + 10, {
                width: 220,
                height: rowHeight - 20,
                ellipsis: true
            });
            // Responsables
            doc.rect(col2X, rowY, 170, rowHeight).stroke();
            const responsablesText = activity.responsables.slice(0, 2).join(', ');
            doc.text(activity.responsables.length > 2
                ? `${responsablesText}... (+${activity.responsables.length - 2})`
                : responsablesText, col2X + 5, rowY + 10, { width: 160, height: rowHeight - 20 });
            // Situation
            doc.rect(col3X, rowY, 90, rowHeight).stroke();
            doc.text(activity.situation, col3X + 5, rowY + 20, {
                width: 80,
                align: 'center'
            });
            currentY += rowHeight;
        });
        // Statistiques du trimestre
        doc.moveDown(2);
        doc.fontSize(11).font('Helvetica-Bold');
        doc.text(`Total: ${activities.length} activités`, 50, currentY + 20);
    }
    /**
     * Génère une page de conclusion
     */
    generateConclusionPage(doc, statistics, year) {
        doc.fontSize(18).font('Helvetica-Bold').text('Conclusion', 50, 50);
        doc.moveDown(2);
        doc.fontSize(11).font('Helvetica');
        // Faits saillants
        doc.font('Helvetica-Bold').text('Faits Saillants de l\'Année', 50, doc.y);
        doc.moveDown(1);
        doc.font('Helvetica');
        const highlights = [
            `${statistics.annual.activities.total} activités menées au total`,
            `${statistics.annual.activities.new} nouvelles activités lancées`,
            `${statistics.annual.activities.reconducted} activités reconduites`,
            `${statistics.annual.conventions.total} conventions actives`,
            `${statistics.annual.transfers.total} transferts de connaissances réalisés`,
            `${report_service_1.reportService.formatCurrency(statistics.annual.budget.totalMobilized)} de budget mobilisé`
        ];
        highlights.forEach((highlight) => {
            doc.text(`• ${highlight}`, 70, doc.y, { indent: 20 });
            doc.moveDown(0.5);
        });
        doc.moveDown(2);
        // Tendances
        doc.font('Helvetica-Bold').text('Tendances Observées', 50, doc.y);
        doc.moveDown(1);
        doc.font('Helvetica');
        // Calcul de la tendance
        const q1 = statistics.byQuarter[reports_types_1.Quarter.Q1].activities.total;
        const q4 = statistics.byQuarter[reports_types_1.Quarter.Q4].activities.total;
        const trend = q4 > q1 ? 'hausse' : q4 < q1 ? 'baisse' : 'stabilité';
        const trendPercent = q1 > 0 ? (((q4 - q1) / q1) * 100).toFixed(1) : 0;
        doc.text(`Une tendance à la ${trend} a été observée entre le premier et le dernier trimestre (${trendPercent}%).`, 70, doc.y);
        doc.moveDown(1);
        // Trimestre le plus actif
        const mostActiveQuarter = Object.entries(statistics.byQuarter).reduce((max, [q, stats]) => stats.activities.total > max.stats.activities.total ? { quarter: q, stats } : max, { quarter: reports_types_1.Quarter.Q1, stats: statistics.byQuarter[reports_types_1.Quarter.Q1] });
        doc.text(`Le T${mostActiveQuarter.quarter} a été le trimestre le plus actif avec ${mostActiveQuarter.stats.activities.total} activités.`, 70, doc.y);
        // Pied de page
        doc
            .fontSize(10)
            .font('Helvetica-Oblique')
            .text('Document confidentiel - Usage interne uniquement', 50, doc.page.height - 50, { align: 'center' });
    }
    // ============================================
    // RAPPORTS ANNUELS - ACTIVITÉS
    // ============================================
    /**
     * Génère un rapport annuel d'activités au format PDF
     */
    async generateAnnualActivitiesPDF(activitiesByQuarter, year, statistics) {
        const filename = `rapport_annuel_activites_${year}_${Date.now()}.pdf`;
        const filepath = path.join(this.uploadsDir, filename);
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ margin: 50, size: 'A4' });
            const writeStream = fs.createWriteStream(filepath);
            doc.pipe(writeStream);
            // Page de garde
            this.generateCoverPage(doc, 'Rapport Annuel des Activités', year);
            // Page de synthèse
            doc.addPage();
            this.generateAnnualSummaryPage(doc, statistics, year);
            // Générer une page par trimestre
            [reports_types_1.Quarter.Q1, reports_types_1.Quarter.Q2, reports_types_1.Quarter.Q3, reports_types_1.Quarter.Q4].forEach((quarter) => {
                const activities = activitiesByQuarter.get(quarter) || [];
                if (activities.length > 0) {
                    doc.addPage();
                    this.generateQuarterActivitiesPage(doc, activities, quarter, year);
                }
            });
            // Page de conclusion
            doc.addPage();
            this.generateConclusionPage(doc, statistics, year);
            doc.end();
            writeStream.on('finish', () => resolve(filepath));
            writeStream.on('error', reject);
        });
    }
    /**
     * Génère un rapport annuel d'activités au format WORD
     */
    async generateAnnualActivitiesWORD(activitiesByQuarter, year, statistics) {
        const filename = `rapport_annuel_activites_${year}_${Date.now()}.docx`;
        const filepath = path.join(this.uploadsDir, filename);
        const sections = [];
        // Page de garde
        sections.push({
            children: [
                new docx_1.Paragraph({
                    text: 'Rapport Annuel des Activités',
                    heading: docx_1.HeadingLevel.HEADING_1,
                    alignment: docx_1.AlignmentType.CENTER,
                    spacing: { before: 5000, after: 1000 }
                }),
                new docx_1.Paragraph({
                    text: `Année ${year}`,
                    heading: docx_1.HeadingLevel.HEADING_2,
                    alignment: docx_1.AlignmentType.CENTER,
                    spacing: { after: 3000 }
                }),
                new docx_1.Paragraph({
                    text: 'Centre de Recherche Agricole',
                    alignment: docx_1.AlignmentType.CENTER,
                    spacing: { after: 500 }
                }),
                new docx_1.Paragraph({
                    text: `Document généré le ${new Date().toLocaleDateString('fr-FR')}`,
                    alignment: docx_1.AlignmentType.CENTER
                }),
                new docx_1.Paragraph({
                    children: [new docx_1.PageBreak()]
                })
            ]
        });
        // Page de synthèse
        sections.push({
            children: [
                new docx_1.Paragraph({
                    text: 'Synthèse Annuelle',
                    heading: docx_1.HeadingLevel.HEADING_1,
                    spacing: { after: 400 }
                }),
                new docx_1.Paragraph({
                    text: 'Vue d\'ensemble',
                    heading: docx_1.HeadingLevel.HEADING_2,
                    spacing: { before: 400, after: 200 }
                }),
                new docx_1.Paragraph({
                    text: `Total des activités: ${statistics.annual.activities.total}`,
                    spacing: { after: 100 }
                }),
                new docx_1.Paragraph({
                    text: `Nouvelles activités: ${statistics.annual.activities.new}`,
                    spacing: { after: 100 }
                }),
                new docx_1.Paragraph({
                    text: `Activités reconduites: ${statistics.annual.activities.reconducted}`,
                    spacing: { after: 100 }
                }),
                new docx_1.Paragraph({
                    text: `Activités clôturées: ${statistics.annual.activities.closed}`,
                    spacing: { after: 100 }
                }),
                new docx_1.Paragraph({
                    text: `Total conventions: ${statistics.annual.conventions.total}`,
                    spacing: { after: 100 }
                }),
                new docx_1.Paragraph({
                    text: `Total transferts: ${statistics.annual.transfers.total}`,
                    spacing: { after: 100 }
                }),
                new docx_1.Paragraph({
                    text: `Budget mobilisé: ${report_service_1.reportService.formatCurrency(statistics.annual.budget.totalMobilized)}`,
                    spacing: { after: 400 }
                }),
                this.createQuarterlySummaryTable(statistics),
                new docx_1.Paragraph({
                    children: [new docx_1.PageBreak()]
                })
            ]
        });
        // Pages par trimestre
        [reports_types_1.Quarter.Q1, reports_types_1.Quarter.Q2, reports_types_1.Quarter.Q3, reports_types_1.Quarter.Q4].forEach((quarter) => {
            const activities = activitiesByQuarter.get(quarter) || [];
            if (activities.length > 0) {
                sections.push({
                    children: [
                        new docx_1.Paragraph({
                            text: quarter_service_1.quarterService.formatQuarterLabel(year, quarter),
                            heading: docx_1.HeadingLevel.HEADING_1,
                            spacing: { after: 400 }
                        }),
                        this.createActivitiesTable(activities),
                        new docx_1.Paragraph({
                            spacing: { before: 400 },
                            children: [
                                new docx_1.TextRun({
                                    text: `Total: ${activities.length} activités`,
                                    bold: true
                                })
                            ]
                        }),
                        new docx_1.Paragraph({
                            children: [new docx_1.PageBreak()]
                        })
                    ]
                });
            }
        });
        // Page de conclusion
        sections.push({
            children: [
                new docx_1.Paragraph({
                    text: 'Conclusion',
                    heading: docx_1.HeadingLevel.HEADING_1,
                    spacing: { after: 400 }
                }),
                new docx_1.Paragraph({
                    text: 'Faits Saillants de l\'Année',
                    heading: docx_1.HeadingLevel.HEADING_2,
                    spacing: { after: 200 }
                }),
                ...this.createHighlightsParagraphs(statistics),
                new docx_1.Paragraph({
                    text: 'Tendances Observées',
                    heading: docx_1.HeadingLevel.HEADING_2,
                    spacing: { before: 400, after: 200 }
                }),
                ...this.createTrendsParagraphs(statistics)
            ]
        });
        const doc = new docx_1.Document({
            sections: sections
        });
        const buffer = await docx_1.Packer.toBuffer(doc);
        fs.writeFileSync(filepath, buffer);
        return filepath;
    }
    /**
     * Crée un tableau récapitulatif trimestriel pour Word
     */
    createQuarterlySummaryTable(statistics) {
        const rows = [
            new docx_1.TableRow({
                tableHeader: true,
                children: [
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                children: [new docx_1.TextRun({ text: 'Trimestre', bold: true })]
                            })
                        ],
                        shading: { fill: 'CCCCCC' }
                    }),
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                children: [new docx_1.TextRun({ text: 'Activités', bold: true })]
                            })
                        ],
                        shading: { fill: 'CCCCCC' }
                    }),
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                children: [new docx_1.TextRun({ text: 'Nouvelles', bold: true })]
                            })
                        ],
                        shading: { fill: 'CCCCCC' }
                    }),
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                children: [new docx_1.TextRun({ text: 'Reconduites', bold: true })]
                            })
                        ],
                        shading: { fill: 'CCCCCC' }
                    }),
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                children: [new docx_1.TextRun({ text: 'Clôturées', bold: true })]
                            })
                        ],
                        shading: { fill: 'CCCCCC' }
                    })
                ]
            })
        ];
        [reports_types_1.Quarter.Q1, reports_types_1.Quarter.Q2, reports_types_1.Quarter.Q3, reports_types_1.Quarter.Q4].forEach((quarter) => {
            const quarterStats = statistics.byQuarter[quarter];
            rows.push(new docx_1.TableRow({
                children: [
                    new docx_1.TableCell({
                        children: [new docx_1.Paragraph(`T${quarter}`)]
                    }),
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                text: quarterStats.activities.total.toString(),
                                alignment: docx_1.AlignmentType.CENTER
                            })
                        ]
                    }),
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                text: quarterStats.activities.new.toString(),
                                alignment: docx_1.AlignmentType.CENTER
                            })
                        ]
                    }),
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                text: quarterStats.activities.reconducted.toString(),
                                alignment: docx_1.AlignmentType.CENTER
                            })
                        ]
                    }),
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                text: quarterStats.activities.closed.toString(),
                                alignment: docx_1.AlignmentType.CENTER
                            })
                        ]
                    })
                ]
            }));
        });
        return new docx_1.Table({
            rows: rows,
            width: { size: 100, type: docx_1.WidthType.PERCENTAGE }
        });
    }
    /**
     * Crée un tableau d'activités pour Word
     */
    createActivitiesTable(activities) {
        const rows = [
            new docx_1.TableRow({
                tableHeader: true,
                children: [
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                children: [
                                    new docx_1.TextRun({ text: 'Intitulé activité', bold: true })
                                ]
                            })
                        ],
                        width: { size: 40, type: docx_1.WidthType.PERCENTAGE },
                        shading: { fill: 'CCCCCC' }
                    }),
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                children: [
                                    new docx_1.TextRun({ text: "Responsables d'activités", bold: true })
                                ]
                            })
                        ],
                        width: { size: 35, type: docx_1.WidthType.PERCENTAGE },
                        shading: { fill: 'CCCCCC' }
                    }),
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                children: [
                                    new docx_1.TextRun({ text: 'Situation', bold: true })
                                ]
                            })
                        ],
                        width: { size: 25, type: docx_1.WidthType.PERCENTAGE },
                        shading: { fill: 'CCCCCC' }
                    })
                ]
            })
        ];
        activities.forEach((activity) => {
            rows.push(new docx_1.TableRow({
                children: [
                    new docx_1.TableCell({
                        children: [new docx_1.Paragraph(activity.intitule)]
                    }),
                    new docx_1.TableCell({
                        children: activity.responsables.map((resp) => new docx_1.Paragraph(resp))
                    }),
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({
                                text: activity.situation,
                                alignment: docx_1.AlignmentType.CENTER
                            })
                        ]
                    })
                ]
            }));
        });
        return new docx_1.Table({
            rows: rows,
            width: { size: 100, type: docx_1.WidthType.PERCENTAGE }
        });
    }
    /**
     * Crée les paragraphes des faits saillants
     */
    createHighlightsParagraphs(statistics) {
        const highlights = [
            `${statistics.annual.activities.total} activités menées au total`,
            `${statistics.annual.activities.new} nouvelles activités lancées`,
            `${statistics.annual.activities.reconducted} activités reconduites`,
            `${statistics.annual.conventions.total} conventions actives`,
            `${statistics.annual.transfers.total} transferts de connaissances réalisés`,
            `${report_service_1.reportService.formatCurrency(statistics.annual.budget.totalMobilized)} de budget mobilisé`
        ];
        return highlights.map((highlight) => new docx_1.Paragraph({
            text: `• ${highlight}`,
            spacing: { after: 100 }
        }));
    }
    /**
     * Crée les paragraphes des tendances
     */
    createTrendsParagraphs(statistics) {
        const q1 = statistics.byQuarter[reports_types_1.Quarter.Q1].activities.total;
        const q4 = statistics.byQuarter[reports_types_1.Quarter.Q4].activities.total;
        const trend = q4 > q1 ? 'hausse' : q4 < q1 ? 'baisse' : 'stabilité';
        const trendPercent = q1 > 0 ? (((q4 - q1) / q1) * 100).toFixed(1) : 0;
        const mostActiveQuarter = Object.entries(statistics.byQuarter).reduce((max, [q, stats]) => stats.activities.total > max.stats.activities.total
            ? { quarter: q, stats }
            : max, { quarter: reports_types_1.Quarter.Q1, stats: statistics.byQuarter[reports_types_1.Quarter.Q1] });
        return [
            new docx_1.Paragraph({
                text: `Une tendance à la ${trend} a été observée entre le premier et le dernier trimestre (${trendPercent}%).`,
                spacing: { after: 200 }
            }),
            new docx_1.Paragraph({
                text: `Le T${mostActiveQuarter.quarter} a été le trimestre le plus actif avec ${mostActiveQuarter.stats.activities.total} activités.`,
                spacing: { after: 200 }
            })
        ];
    }
    // ============================================
    // RAPPORTS ANNUELS - CONVENTIONS (Simplifié)
    // ============================================
    /**
     * Génère un rapport annuel de conventions au format PDF
     */
    async generateAnnualConventionsPDF(conventionsByQuarter, year, statistics) {
        const filename = `rapport_annuel_conventions_${year}_${Date.now()}.pdf`;
        const filepath = path.join(this.uploadsDir, filename);
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({
                margin: 50,
                size: 'A4',
                layout: 'landscape'
            });
            const writeStream = fs.createWriteStream(filepath);
            doc.pipe(writeStream);
            // Page de garde
            this.generateCoverPage(doc, 'Rapport Annuel des Conventions', year);
            // Générer le contenu (simplifié pour la taille)
            doc.addPage();
            doc.fontSize(20).font('Helvetica-Bold').text('Synthèse Annuelle des Conventions', 50, 50);
            doc.moveDown(2);
            doc.fontSize(11).font('Helvetica');
            doc.text(`Total conventions: ${statistics.annual.conventions.total}`, 50, doc.y);
            doc.text(`Budget mobilisé: ${report_service_1.reportService.formatCurrency(statistics.annual.budget.totalMobilized)}`, 50, doc.y + 20);
            // Pages par trimestre
            [reports_types_1.Quarter.Q1, reports_types_1.Quarter.Q2, reports_types_1.Quarter.Q3, reports_types_1.Quarter.Q4].forEach((quarter) => {
                const conventions = conventionsByQuarter.get(quarter) || [];
                if (conventions.length > 0) {
                    doc.addPage();
                    doc.fontSize(16).font('Helvetica-Bold')
                        .text(quarter_service_1.quarterService.formatQuarterLabel(year, quarter), 50, 50);
                    doc.moveDown(1);
                    doc.fontSize(10).font('Helvetica')
                        .text(`${conventions.length} conventions`, 50, doc.y);
                }
            });
            doc.end();
            writeStream.on('finish', () => resolve(filepath));
            writeStream.on('error', reject);
        });
    }
    /**
     * Génère un rapport annuel de conventions au format WORD
     */
    async generateAnnualConventionsWORD(conventionsByQuarter, year, statistics) {
        const filename = `rapport_annuel_conventions_${year}_${Date.now()}.docx`;
        const filepath = path.join(this.uploadsDir, filename);
        const doc = new docx_1.Document({
            sections: [
                {
                    children: [
                        new docx_1.Paragraph({
                            text: 'Rapport Annuel des Conventions',
                            heading: docx_1.HeadingLevel.HEADING_1,
                            alignment: docx_1.AlignmentType.CENTER
                        }),
                        new docx_1.Paragraph({
                            text: `Année ${year}`,
                            alignment: docx_1.AlignmentType.CENTER,
                            spacing: { after: 400 }
                        }),
                        new docx_1.Paragraph({
                            text: `Total conventions: ${statistics.annual.conventions.total}`
                        })
                    ]
                }
            ]
        });
        const buffer = await docx_1.Packer.toBuffer(doc);
        fs.writeFileSync(filepath, buffer);
        return filepath;
    }
    // ============================================
    // RAPPORTS ANNUELS - TRANSFERTS (Simplifié)
    // ============================================
    /**
     * Génère un rapport annuel de transferts au format PDF
     */
    async generateAnnualKnowledgeTransfersPDF(transfersByQuarter, year, statistics) {
        const filename = `rapport_annuel_transferts_${year}_${Date.now()}.pdf`;
        const filepath = path.join(this.uploadsDir, filename);
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({
                margin: 50,
                size: 'A4',
                layout: 'landscape'
            });
            const writeStream = fs.createWriteStream(filepath);
            doc.pipe(writeStream);
            // Page de garde
            this.generateCoverPage(doc, 'Rapport Annuel des Transferts de Connaissances', year);
            // Contenu simplifié
            doc.addPage();
            doc.fontSize(20).font('Helvetica-Bold').text('Synthèse Annuelle des Transferts', 50, 50);
            doc.moveDown(2);
            doc.fontSize(11).font('Helvetica');
            doc.text(`Total transferts: ${statistics.annual.transfers.total}`, 50, doc.y);
            doc.end();
            writeStream.on('finish', () => resolve(filepath));
            writeStream.on('error', reject);
        });
    }
    /**
     * Génère un rapport annuel de transferts au format WORD
     */
    async generateAnnualKnowledgeTransfersWORD(transfersByQuarter, year, statistics) {
        const filename = `rapport_annuel_transferts_${year}_${Date.now()}.docx`;
        const filepath = path.join(this.uploadsDir, filename);
        const doc = new docx_1.Document({
            sections: [
                {
                    children: [
                        new docx_1.Paragraph({
                            text: 'Rapport Annuel des Transferts de Connaissances',
                            heading: docx_1.HeadingLevel.HEADING_1,
                            alignment: docx_1.AlignmentType.CENTER
                        }),
                        new docx_1.Paragraph({
                            text: `Année ${year}`,
                            alignment: docx_1.AlignmentType.CENTER,
                            spacing: { after: 400 }
                        }),
                        new docx_1.Paragraph({
                            text: `Total transferts: ${statistics.annual.transfers.total}`
                        })
                    ]
                }
            ]
        });
        const buffer = await docx_1.Packer.toBuffer(doc);
        fs.writeFileSync(filepath, buffer);
        return filepath;
    }
    /**
     * Nettoie les anciens fichiers de rapport (plus de 24h)
     */
    async cleanOldReports() {
        const files = fs.readdirSync(this.uploadsDir);
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 heures
        for (const file of files) {
            const filepath = path.join(this.uploadsDir, file);
            const stats = fs.statSync(filepath);
            if (now - stats.mtimeMs > maxAge) {
                fs.unlinkSync(filepath);
            }
        }
    }
}
exports.DocumentGeneratorService = DocumentGeneratorService;
exports.documentGeneratorService = new DocumentGeneratorService();
//# sourceMappingURL=document-generator.service.js.map