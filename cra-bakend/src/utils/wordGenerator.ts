import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, AlignmentType, WidthType, BorderStyle } from 'docx';
import { ActivityReportData } from '../types/report.types';

export async function generateWord(data: ActivityReportData): Promise<Buffer> {
  const sections: any[] = [];

  // Titre - Utilise le lifecycleStatus pour déterminer le type de fiche
  const titreMapping: Record<string, string> = {
    'NOUVELLE': 'FICHE D\'ACTIVITÉ NOUVELLE',
    'RECONDUITE': 'FICHE D\'ACTIVITÉ RECONDUITE',
    'CLOTUREE': 'FICHE D\'ACTIVITÉ CLÔTURÉE'
  };

  sections.push(
    new Paragraph({
      text: titreMapping[data.lifecycleStatus] || 'FICHE D\'ACTIVITÉ',
      heading: 'Heading1',
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 }
    })
  );

  // Tableau des informations générales
  const infoTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
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
  sections.push(new Paragraph({ text: '' }));

  // Justificatifs ou Recommandations basé sur le lifecycleStatus
  if (data.lifecycleStatus === 'RECONDUITE' || data.lifecycleStatus === 'CLOTUREE') {
    sections.push(
      new Paragraph({
        text: 'APPLICATION DES RECOMMANDATIONS DU CST :',
        heading: 'Heading2',
        spacing: { before: 200, after: 100 }
      })
    );

    if (data.contraintes) {
      sections.push(
        new Paragraph({
          text: 'CONTRAINTES : ' + data.contraintes,
          spacing: { after: 100 }
        })
      );
    }

    if (data.resultatsObtenus) {
      sections.push(
        new Paragraph({
          text: 'RESULTATS OBTENUS : ' + data.resultatsObtenus,
          spacing: { after: 100 }
        })
      );
    }
  } else if (data.justificatifs) {
    sections.push(
      new Paragraph({
        text: 'JUSTIFICATIFS :',
        heading: 'Heading2',
        spacing: { before: 200, after: 100 }
      })
    );
    sections.push(
      new Paragraph({
        text: data.justificatifs,
        spacing: { after: 200 }
      })
    );
  }

  // Objectifs
  sections.push(
    new Paragraph({
      text: 'OBJECTIFS :',
      heading: 'Heading2',
      spacing: { before: 200, after: 100 }
    })
  );
  sections.push(
    new Paragraph({
      text: data.objectifs,
      spacing: { after: 200 }
    })
  );

  // Méthodologie
  if (data.methodologie) {
    sections.push(
      new Paragraph({
        text: 'METHODOLOGIE :',
        heading: 'Heading2',
        spacing: { before: 200, after: 100 }
      })
    );
    sections.push(
      new Paragraph({
        text: data.methodologie,
        spacing: { after: 200 }
      })
    );
  }

  // Mode de transfert
  if (data.modeTransfertAcquis) {
    sections.push(
      new Paragraph({
        text: 'MODE DE TRANSFERT DES ACQUIS : ' + data.modeTransfertAcquis,
        spacing: { after: 200 }
      })
    );
  }

  // Équipe de recherche
  if (data.equipeRecherche.length > 0) {
    sections.push(
      new Paragraph({
        text: 'EQUIPE DE RECHERCHE :',
        heading: 'Heading2',
        spacing: { before: 200, after: 100 }
      })
    );

    const equipeRows = [
      new TableRow({
        children: [
          createHeaderCell('Chercheur'),
          createHeaderCell('Grade'),
          createHeaderCell('Discipline'),
          createHeaderCell('Institution'),
          createHeaderCell('Laboratoire'),
          createHeaderCell('Temps %')
        ]
      }),
      ...data.equipeRecherche.map(membre => 
        new TableRow({
          children: [
            createDataCell(membre.chercheur),
            createDataCell(membre.grade),
            createDataCell(membre.discipline),
            createDataCell(membre.institution),
            createDataCell(membre.laboratoire),
            createDataCell(membre.tempsEnPourcent.toString())
          ]
        })
      )
    ];

    sections.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: equipeRows
      })
    );
    sections.push(new Paragraph({ text: '' }));
  }

  // Institutions partenaires
  if (data.institutionsPartenaires.length > 0) {
    sections.push(
      new Paragraph({
        text: 'INSTITUTIONS PARTENAIRES :',
        heading: 'Heading2',
        spacing: { before: 200, after: 100 }
      })
    );

    const partenaireRows = [
      new TableRow({
        children: [
          createHeaderCell('Institution partenaire'),
          createHeaderCell('Budget alloué en F.CFA')
        ]
      }),
      ...data.institutionsPartenaires.map(inst =>
        new TableRow({
          children: [
            createDataCell(inst.institution),
            createDataCell(inst.budgetAlloue.toLocaleString('fr-FR'))
          ]
        })
      )
    ];

    sections.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: partenaireRows
      })
    );
    sections.push(new Paragraph({ text: '' }));
  }

  // Ressources financières
  if (data.ressourcesFinancieres.length > 0) {
    sections.push(
      new Paragraph({
        text: 'RESSOURCES FINANCIERES :',
        heading: 'Heading2',
        spacing: { before: 200, after: 100 }
      })
    );

    const financeRows = [
      new TableRow({
        children: [
          createHeaderCell('Bailleur de fonds'),
          createHeaderCell('Montant financement en F.CFA')
        ]
      }),
      ...data.ressourcesFinancieres.map(res =>
        new TableRow({
          children: [
            createDataCell(res.bailleurFonds),
            createDataCell(res.montantFinancement.toLocaleString('fr-FR'))
          ]
        })
      )
    ];

    sections.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: financeRows
      })
    );
    sections.push(new Paragraph({ text: '' }));
  }

  // Budget total
  if (data.budgetTotalAnnee) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `BUDGET TOTAL ANNEE ${new Date().getFullYear()} : ${data.budgetTotalAnnee.toLocaleString('fr-FR')}`,
            bold: true
          })
        ],
        spacing: { before: 200 }
      })
    );
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: sections
    }]
  });

  return await Packer.toBuffer(doc);
}

function safeText(value?: string | number | null): string {
  return value === undefined || value === null ? '' : String(value);
}

function createTableRow(label: string, value: string): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        children: [
          new Paragraph({
            children: [ new TextRun({ text: safeText(label), bold: true }) ]
          })
        ],
        shading: { fill: 'CCCCCC' },
        width: { size: 30, type: WidthType.PERCENTAGE }
      }),
      new TableCell({
        children: [
          new Paragraph({
            children: [ new TextRun(safeText(value)) ]
          })
        ],
        width: { size: 70, type: WidthType.PERCENTAGE }
      })
    ]
  });
}

function createHeaderCell(text: string): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [ new TextRun({ text, bold: true }) ]
      })
    ],
    shading: { fill: 'ADD8E6' },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 }
    }
  });
}

function createDataCell(text: string): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [ new TextRun(String(text ?? '')) ]
      })
    ],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 }
    }
  });
}
