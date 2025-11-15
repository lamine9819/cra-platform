"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWord = generateWord;
const docx_1 = require("docx");
async function generateWord(data) {
    const sections = [];
    // Titre - Utilise le lifecycleStatus pour déterminer le type de fiche
    const titreMapping = {
        'NOUVELLE': 'FICHE D\'ACTIVITÉ NOUVELLE',
        'RECONDUITE': 'FICHE D\'ACTIVITÉ RECONDUITE',
        'CLOTUREE': 'FICHE D\'ACTIVITÉ CLÔTURÉE'
    };
    sections.push(new docx_1.Paragraph({
        text: titreMapping[data.lifecycleStatus] || 'FICHE D\'ACTIVITÉ',
        heading: 'Heading1',
        alignment: docx_1.AlignmentType.CENTER,
        spacing: { after: 300 }
    }));
    // Tableau des informations générales
    const infoTable = new docx_1.Table({
        width: { size: 100, type: docx_1.WidthType.PERCENTAGE },
        rows: [
            createTableRow('CODE ACTIVITE', data.codeActivite || ''),
            createTableRow('CENTRE', data.centre),
            createTableRow('DOMAINE D\'ACTIVITE', data.domaineActivite),
            createTableRow('CODE CENTRE', data.codeCentre),
            createTableRow('TYPE DE RECHERCHE', data.typeRecherche),
            createTableRow('DATE DEBUT', data.dateDebut || ''),
            createTableRow('DATE FIN', data.dateFin || ''),
            createTableRow('Région d\'intervention', data.regionIntervention || ''),
            createTableRow('PLAN STRATEGIQUE', data.planStrategique || ''),
            createTableRow('AXE', data.axe || ''),
            createTableRow('SOUS-AXE', data.sousAxe || ''),
            createTableRow('PROGRAMME', data.programme || ''),
            createTableRow('THEME', data.theme),
            createTableRow('TITRE DE L\'ACTIVITE', data.titreActivite),
            createTableRow('RESPONSABLE DE L\'ACTIVITE', data.responsableActivite),
            createTableRow('GRADE', data.grade),
            createTableRow('DISCIPLINE', data.discipline)
        ]
    });
    sections.push(infoTable);
    sections.push(new docx_1.Paragraph({ text: '' }));
    // Justificatifs ou Recommandations basé sur le lifecycleStatus
    if (data.lifecycleStatus === 'RECONDUITE' || data.lifecycleStatus === 'CLOTUREE') {
        sections.push(new docx_1.Paragraph({
            text: 'APPLICATION DES RECOMMANDATIONS DU CST :',
            heading: 'Heading2',
            spacing: { before: 200, after: 100 }
        }));
        if (data.contraintes) {
            sections.push(new docx_1.Paragraph({
                text: 'CONTRAINTES : ' + data.contraintes,
                spacing: { after: 100 }
            }));
        }
        if (data.resultatsObtenus) {
            sections.push(new docx_1.Paragraph({
                text: 'RESULTATS OBTENUS : ' + data.resultatsObtenus,
                spacing: { after: 100 }
            }));
        }
    }
    else if (data.justificatifs) {
        sections.push(new docx_1.Paragraph({
            text: 'JUSTIFICATIFS :',
            heading: 'Heading2',
            spacing: { before: 200, after: 100 }
        }));
        sections.push(new docx_1.Paragraph({
            text: data.justificatifs,
            spacing: { after: 200 }
        }));
    }
    // Objectifs
    sections.push(new docx_1.Paragraph({
        text: 'OBJECTIFS :',
        heading: 'Heading2',
        spacing: { before: 200, after: 100 }
    }));
    sections.push(new docx_1.Paragraph({
        text: data.objectifs,
        spacing: { after: 200 }
    }));
    // Méthodologie
    if (data.methodologie) {
        sections.push(new docx_1.Paragraph({
            text: 'METHODOLOGIE :',
            heading: 'Heading2',
            spacing: { before: 200, after: 100 }
        }));
        sections.push(new docx_1.Paragraph({
            text: data.methodologie,
            spacing: { after: 200 }
        }));
    }
    // Mode de transfert
    if (data.modeTransfertAcquis) {
        sections.push(new docx_1.Paragraph({
            text: 'MODE DE TRANSFERT DES ACQUIS : ' + data.modeTransfertAcquis,
            spacing: { after: 200 }
        }));
    }
    // Équipe de recherche
    if (data.equipeRecherche.length > 0) {
        sections.push(new docx_1.Paragraph({
            text: 'EQUIPE DE RECHERCHE :',
            heading: 'Heading2',
            spacing: { before: 200, after: 100 }
        }));
        const equipeRows = [
            new docx_1.TableRow({
                children: [
                    createHeaderCell('Chercheur'),
                    createHeaderCell('Grade'),
                    createHeaderCell('Discipline'),
                    createHeaderCell('Institution'),
                    createHeaderCell('Laboratoire'),
                    createHeaderCell('Temps %')
                ]
            }),
            ...data.equipeRecherche.map(membre => new docx_1.TableRow({
                children: [
                    createDataCell(membre.chercheur),
                    createDataCell(membre.grade),
                    createDataCell(membre.discipline),
                    createDataCell(membre.institution),
                    createDataCell(membre.laboratoire),
                    createDataCell(membre.tempsEnPourcent.toString())
                ]
            }))
        ];
        sections.push(new docx_1.Table({
            width: { size: 100, type: docx_1.WidthType.PERCENTAGE },
            rows: equipeRows
        }));
        sections.push(new docx_1.Paragraph({ text: '' }));
    }
    // Institutions partenaires
    if (data.institutionsPartenaires.length > 0) {
        sections.push(new docx_1.Paragraph({
            text: 'INSTITUTIONS PARTENAIRES :',
            heading: 'Heading2',
            spacing: { before: 200, after: 100 }
        }));
        const partenaireRows = [
            new docx_1.TableRow({
                children: [
                    createHeaderCell('Institution partenaire'),
                    createHeaderCell('Budget alloué en F.CFA')
                ]
            }),
            ...data.institutionsPartenaires.map(inst => new docx_1.TableRow({
                children: [
                    createDataCell(inst.institution),
                    createDataCell(inst.budgetAlloue.toLocaleString('fr-FR'))
                ]
            }))
        ];
        sections.push(new docx_1.Table({
            width: { size: 100, type: docx_1.WidthType.PERCENTAGE },
            rows: partenaireRows
        }));
        sections.push(new docx_1.Paragraph({ text: '' }));
    }
    // Ressources financières
    if (data.ressourcesFinancieres.length > 0) {
        sections.push(new docx_1.Paragraph({
            text: 'RESSOURCES FINANCIERES :',
            heading: 'Heading2',
            spacing: { before: 200, after: 100 }
        }));
        const financeRows = [
            new docx_1.TableRow({
                children: [
                    createHeaderCell('Bailleur de fonds'),
                    createHeaderCell('Montant financement en F.CFA')
                ]
            }),
            ...data.ressourcesFinancieres.map(res => new docx_1.TableRow({
                children: [
                    createDataCell(res.bailleurFonds),
                    createDataCell(res.montantFinancement.toLocaleString('fr-FR'))
                ]
            }))
        ];
        sections.push(new docx_1.Table({
            width: { size: 100, type: docx_1.WidthType.PERCENTAGE },
            rows: financeRows
        }));
        sections.push(new docx_1.Paragraph({ text: '' }));
    }
    // Budget total
    if (data.budgetTotalAnnee) {
        sections.push(new docx_1.Paragraph({
            children: [
                new docx_1.TextRun({
                    text: `BUDGET TOTAL ANNEE ${new Date().getFullYear()} : ${data.budgetTotalAnnee.toLocaleString('fr-FR')}`,
                    bold: true
                })
            ],
            spacing: { before: 200 }
        }));
    }
    const doc = new docx_1.Document({
        sections: [{
                properties: {},
                children: sections
            }]
    });
    return await docx_1.Packer.toBuffer(doc);
}
function safeText(value) {
    return value === undefined || value === null ? '' : String(value);
}
function createTableRow(label, value) {
    return new docx_1.TableRow({
        children: [
            new docx_1.TableCell({
                children: [
                    new docx_1.Paragraph({
                        children: [new docx_1.TextRun({ text: safeText(label), bold: true })]
                    })
                ],
                shading: { fill: 'CCCCCC' },
                width: { size: 30, type: docx_1.WidthType.PERCENTAGE }
            }),
            new docx_1.TableCell({
                children: [
                    new docx_1.Paragraph({
                        children: [new docx_1.TextRun(safeText(value))]
                    })
                ],
                width: { size: 70, type: docx_1.WidthType.PERCENTAGE }
            })
        ]
    });
}
function createHeaderCell(text) {
    return new docx_1.TableCell({
        children: [
            new docx_1.Paragraph({
                children: [new docx_1.TextRun({ text, bold: true })]
            })
        ],
        shading: { fill: 'ADD8E6' },
        borders: {
            top: { style: docx_1.BorderStyle.SINGLE, size: 1 },
            bottom: { style: docx_1.BorderStyle.SINGLE, size: 1 },
            left: { style: docx_1.BorderStyle.SINGLE, size: 1 },
            right: { style: docx_1.BorderStyle.SINGLE, size: 1 }
        }
    });
}
function createDataCell(text) {
    return new docx_1.TableCell({
        children: [
            new docx_1.Paragraph({
                children: [new docx_1.TextRun(String(text ?? ''))]
            })
        ],
        borders: {
            top: { style: docx_1.BorderStyle.SINGLE, size: 1 },
            bottom: { style: docx_1.BorderStyle.SINGLE, size: 1 },
            left: { style: docx_1.BorderStyle.SINGLE, size: 1 },
            right: { style: docx_1.BorderStyle.SINGLE, size: 1 }
        }
    });
}
//# sourceMappingURL=wordGenerator.js.map