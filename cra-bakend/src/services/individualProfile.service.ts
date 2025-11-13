// src/services/individualProfile.service.ts
import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, AlignmentType, WidthType, BorderStyle } from 'docx';
import { NotFoundError, ValidationError } from '../utils/errors';

const prisma = new PrismaClient();

export class IndividualProfileService {

  /**
   * Générer le document de fiche individuelle
   */
  async generateIndividualProfileDocument(
    userId: string,
    format: 'pdf' | 'word' = 'pdf'
  ): Promise<{ buffer: Buffer; matricule: string }> {
    
    // Récupérer les données du chercheur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        individualProfile: true,
      }
    });

    if (!user) {
      throw new NotFoundError('Utilisateur non trouvé');
    }

    if (!user.individualProfile) {
      throw new ValidationError('Cet utilisateur n\'a pas de profil individuel');
    }

    if (user.role !== 'CHERCHEUR') {
      throw new ValidationError('Seuls les chercheurs ont une fiche individuelle');
    }

    // Générer le document selon le format demandé
    if (format === 'pdf') {
      const buffer = await this.generatePDFFicheIndividuelle(user);
      return { buffer, matricule: user.individualProfile.matricule };
    } else {
      const buffer = await this.generateWordFicheIndividuelle(user);
      return { buffer, matricule: user.individualProfile.matricule };
    }
  }

  /**
   * Générer une fiche individuelle en PDF
   */
  private async generatePDFFicheIndividuelle(user: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          size: 'A4', 
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
          info: {
            Title: `Fiche Individuelle - ${user.firstName} ${user.lastName}`,
            Author: 'Centre de Recherches Agricoles',
            Subject: 'Fiche Individuelle'
          }
        });
        
        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        const profile = user.individualProfile;

        // Titre
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .text('FICHE INDIVIDUELLE 5', { align: 'center' })
           .moveDown(1.5);

        // Fonction helper pour créer une ligne avec label et valeur
        const addRow = (label: string, value: string, x: number, y: number, width: number = 180) => {
          doc.fontSize(9)
             .font('Helvetica')
             .text(label, x, y, { continued: true, width: width })
             .font('Helvetica-Bold')
             .text(value);
        };

        // Section 1 : Informations de base (3 colonnes)
        let yPos = doc.y;
        
        // Colonne 1
        addRow('CODE FICHE : ', user.id.substring(0, 8).toUpperCase(), 50, yPos, 150);
        yPos += 20;
        addRow('MATRICULE : ', profile.matricule, 50, yPos, 150);
        yPos += 20;
        addRow('CHERCHEUR : ', `${user.firstName} ${user.lastName}`, 50, yPos, 150);
        yPos += 20;
        addRow('CENTRE : ', 'Centre de Recherches Agricoles de Saint-Louis', 50, yPos, 150);
        yPos += 20;
        addRow('LOCALITÉ : ', profile.localite, 50, yPos, 150);
        yPos += 20;
        addRow('DISCIPLINE : ', user.discipline || 'N/A', 50, yPos, 150);

        // Colonne 2 (à droite)
        yPos = doc.y - 120; // Remonter pour aligner avec la première colonne
        
        addRow('GRADE : ', profile.grade, 350, yPos, 150);
        yPos += 20;
        addRow('CLASSE : ', profile.classe || 'N/A', 350, yPos, 150);
        yPos += 20;
        addRow('DATE NAISSANCE : ', this.formatDate(profile.dateNaissance), 350, yPos, 150);
        yPos += 20;
        addRow('DATE RECRUTEMENT : ', this.formatDate(profile.dateRecrutement), 350, yPos, 150);
        yPos += 20;
        addRow('DIPLÔME : ', profile.diplome, 350, yPos, 150);

        // Avancer après les deux colonnes
        doc.moveDown(3);

        // Section 2 : Répartition du temps
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .fillColor('#4A5568')
           .text('Répartition du temps du chercheur par type d\'activité', { align: 'center' })
           .moveDown(0.5);

        // Tableau de répartition du temps
        const tableTop = doc.y;
        const colWidth = 250;
        const col2Width = 295;
        
        // En-tête du tableau
        doc.rect(50, tableTop, colWidth, 25).fillAndStroke('#E2E8F0', '#718096');
        doc.rect(50 + colWidth, tableTop, col2Width, 25).fillAndStroke('#E2E8F0', '#718096');
        
        doc.fillColor('#1A202C')
           .fontSize(10)
           .font('Helvetica-Bold')
           .text('TYPE D\'ACTIVITÉ', 55, tableTop + 8, { width: colWidth - 10 })
           .text('TEMPS EN %', 55 + colWidth, tableTop + 8, { width: col2Width - 10, align: 'center' });

        // Lignes du tableau
        const activities = [
          { label: 'RECHERCHE :', value: profile.tempsRecherche },
          { label: 'ENSEIGNEMENT / FORMATION À DISPENSER :', value: profile.tempsEnseignement },
          { label: 'FORMATION À RECEVOIR :', value: profile.tempsFormation },
          { label: 'CONSULTATION / EXPERTISE :', value: profile.tempsConsultation },
          { label: 'GESTION SCIENTIFIQUE* :', value: profile.tempsGestionScientifique },
          { label: 'ADMINISTRATION** :', value: profile.tempsAdministration }
        ];

        let currentY = tableTop + 25;
        
        activities.forEach((activity, index) => {
          const rowHeight = 25;
          const isLastRow = index === activities.length;
          
          // Cellule label
          doc.rect(50, currentY, colWidth, rowHeight).stroke('#CBD5E0');
          doc.fillColor('#000000')
             .fontSize(9)
             .font('Helvetica')
             .text(activity.label, 55, currentY + 8, { width: colWidth - 10 });
          
          // Cellule valeur
          doc.rect(50 + colWidth, currentY, col2Width, rowHeight).stroke('#CBD5E0');
          doc.fillColor('#2D3748')
             .fontSize(10)
             .font('Helvetica-Bold')
             .text(activity.value.toString(), 50 + colWidth + 5, currentY + 8, { 
               width: col2Width - 10, 
               align: 'center' 
             });
          
          currentY += rowHeight;
        });

        // Ligne TOTAL
        const totalRowHeight = 25;
        doc.rect(50, currentY, colWidth, totalRowHeight).fillAndStroke('#E2E8F0', '#718096');
        doc.rect(50 + colWidth, currentY, col2Width, totalRowHeight).fillAndStroke('#E2E8F0', '#718096');
        
        const total = profile.tempsRecherche + profile.tempsEnseignement + profile.tempsFormation +
                     profile.tempsConsultation + profile.tempsGestionScientifique + profile.tempsAdministration;
        
        doc.fillColor('#1A202C')
           .fontSize(9)
           .font('Helvetica-Bold')
           .text('TOTAL (le total doit faire 100 %) :', 55, currentY + 8, { width: colWidth - 10 })
           .fontSize(10)
           .text(total.toString(), 50 + colWidth + 5, currentY + 8, { 
             width: col2Width - 10, 
             align: 'center' 
           });

        doc.moveDown(3);

        // Section signature
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor('#000000')
           .text('SIGNATURE DU CHERCHEUR', 50, doc.y)
           .moveDown(3)
           .fontSize(9)
           .font('Helvetica')
           .text(`DATE : __/__/${new Date().getFullYear()}`, 50, doc.y);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Générer une fiche individuelle en Word (DOCX)
   */
  /**
 * Générer une fiche individuelle en Word (DOCX)
 */
private async generateWordFicheIndividuelle(user: any): Promise<Buffer> {
  const profile = user.individualProfile;

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 720,
            right: 720,
            bottom: 720,
            left: 720,
          },
        },
      },
      children: [
        // ===== Titre =====
        new Paragraph({
          children: [new TextRun({ text: 'FICHE INDIVIDUELLE 5', bold: true, size: 28 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),

        // ===== Tableau des informations principales =====
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
          },
          rows: [
            // Ligne 1: CODE FICHE / GRADE / CLASSE
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({
                    children: [
                      new TextRun({ text: 'CODE FICHE : ', size: 18 }),
                      new TextRun({ text: user.id.substring(0, 8).toUpperCase(), bold: true, size: 18 })
                    ]
                  })],
                  width: { size: 50, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [
                      new TextRun({ text: 'GRADE : ', size: 18 }),
                      new TextRun({ text: profile.grade, bold: true, size: 18 })
                    ]
                  })],
                  width: { size: 25, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [
                      new TextRun({ text: 'CLASSE : ', size: 18 }),
                      new TextRun({ text: profile.classe || 'N/A', bold: true, size: 18 })
                    ]
                  })],
                  width: { size: 25, type: WidthType.PERCENTAGE },
                }),
              ],
            }),

            // Ligne 2: MATRICULE / DATE NAISSANCE
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({
                    children: [
                      new TextRun({ text: 'MATRICULE : ', size: 18 }),
                      new TextRun({ text: profile.matricule, bold: true, size: 18 })
                    ]
                  })],
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [
                      new TextRun({ text: 'DATE NAISSANCE : ', size: 18 }),
                      new TextRun({ text: this.formatDate(profile.dateNaissance), bold: true, size: 18 })
                    ]
                  })],
                  columnSpan: 2,
                }),
              ],
            }),

            // Ligne 3: CHERCHEUR / DATE RECRUTEMENT
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({
                    children: [
                      new TextRun({ text: 'CHERCHEUR : ', size: 18 }),
                      new TextRun({ text: `${user.firstName} ${user.lastName}`, bold: true, size: 18 })
                    ]
                  })],
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [
                      new TextRun({ text: 'DATE RECRUTEMENT : ', size: 18 }),
                      new TextRun({ text: this.formatDate(profile.dateRecrutement), bold: true, size: 18 })
                    ]
                  })],
                  columnSpan: 2,
                }),
              ],
            }),

            // Ligne 4: CENTRE
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({
                    children: [
                      new TextRun({ text: 'CENTRE : ', size: 18 }),
                      new TextRun({ text: 'Centre de Recherches Agricoles de Saint-Louis', bold: true, size: 18 })
                    ]
                  })],
                  columnSpan: 3,
                }),
              ],
            }),

            // Ligne 5: LOCALITÉ / DIPLÔME
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({
                    children: [
                      new TextRun({ text: 'LOCALITÉ : ', size: 18 }),
                      new TextRun({ text: profile.localite, bold: true, size: 18 })
                    ]
                  })],
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [
                      new TextRun({ text: 'DIPLÔME : ', size: 18 }),
                      new TextRun({ text: profile.diplome, bold: true, size: 18 })
                    ]
                  })],
                  columnSpan: 2,
                }),
              ],
            }),

            // Ligne 6: DISCIPLINE
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({
                    children: [
                      new TextRun({ text: 'DISCIPLINE : ', size: 18 }),
                      new TextRun({ text: user.discipline || 'N/A', bold: true, size: 18 })
                    ]
                  })],
                  columnSpan: 3,
                }),
              ],
            }),
          ],
        }),

        // ===== Espace =====
        new Paragraph({ text: '', spacing: { after: 300 } }),

        // ===== Titre Répartition du temps =====
        new Paragraph({
          children: [new TextRun({ text: "Répartition du temps du chercheur par type d'activité", bold: true })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),

        // ===== Tableau de répartition =====
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
          },
          rows: [
            // En-tête
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: "TYPE D'ACTIVITÉ", bold: true })],
                    alignment: AlignmentType.CENTER,
                  })],
                  shading: { fill: 'E2E8F0' },
                  width: { size: 70, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: 'TEMPS EN %', bold: true })],
                    alignment: AlignmentType.CENTER,
                  })],
                  shading: { fill: 'E2E8F0' },
                  width: { size: 30, type: WidthType.PERCENTAGE },
                }),
              ],
            }),

            // Lignes de données
            this.createTimeRow('RECHERCHE :', profile.tempsRecherche),
            this.createTimeRow('ENSEIGNEMENT / FORMATION À DISPENSER :', profile.tempsEnseignement),
            this.createTimeRow('FORMATION À RECEVOIR :', profile.tempsFormation),
            this.createTimeRow('CONSULTATION / EXPERTISE :', profile.tempsConsultation),
            this.createTimeRow('GESTION SCIENTIFIQUE* :', profile.tempsGestionScientifique),
            this.createTimeRow('ADMINISTRATION** :', profile.tempsAdministration),

            // Ligne TOTAL
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: 'TOTAL (le total doit faire 100 %) :', bold: true })],
                  })],
                  shading: { fill: 'E2E8F0' },
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({
                      text: (
                        profile.tempsRecherche +
                        profile.tempsEnseignement +
                        profile.tempsFormation +
                        profile.tempsConsultation +
                        profile.tempsGestionScientifique +
                        profile.tempsAdministration
                      ).toString(),
                      bold: true,
                    })],
                    alignment: AlignmentType.CENTER,
                  })],
                  shading: { fill: 'E2E8F0' },
                }),
              ],
            }),
          ],
        }),

        // ===== Espace =====
        new Paragraph({ text: '', spacing: { after: 300 } }),

        // ===== Signature =====
        new Paragraph({
          children: [new TextRun({ text: 'SIGNATURE DU CHERCHEUR', bold: true })],
          spacing: { after: 600 },
        }),

        new Paragraph({
          children: [
            new TextRun({ text: 'DATE : __/__/' }),
            new TextRun({ text: new Date().getFullYear().toString(), bold: true }),
          ],
        }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}


  /**
   * Créer une ligne de tableau pour la répartition du temps (Word)
   */
 private createTimeRow(label: string, value: number): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: label, size: 18 })],
          }),
        ],
      }),
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: value.toString(), bold: true, size: 18 })],
            alignment: AlignmentType.CENTER,
          }),
        ],
      }),
    ],
  });
}


  /**
   * Formater une date au format DD/MM/YYYY
   */
  private formatDate(date: Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
}