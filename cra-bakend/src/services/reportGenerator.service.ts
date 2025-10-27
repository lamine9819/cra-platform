// src/services/reportGenerator.service.ts
import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { Readable } from 'stream';
import { ProjectResponse } from '../types/project.types';

type ProjectData = ProjectResponse;

export class ReportGeneratorService {
  /**
   * Génère un rapport PDF
   */
  async generatePDF(projectData: ProjectData, sections: string[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        // En-tête
        doc.fontSize(20).font('Helvetica-Bold').text('RAPPORT DE PROJET', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).text(projectData.title, { align: 'center' });
        doc.moveDown();

        // Ligne de séparation
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        // Informations générales
        doc.fontSize(10).font('Helvetica');
        doc.text(`Code: ${projectData.code || 'N/A'}`, { continued: true });
        doc.text(`     Statut: ${projectData.status}`);
        doc.text(`Date de génération: ${new Date().toLocaleDateString('fr-FR')}`);
        doc.moveDown(2);

        // Sections
        if (sections.includes('overview')) {
          this.addPDFSection(doc, 'APERÇU GÉNÉRAL', () => {
            if (projectData.description) {
              doc.fontSize(10).font('Helvetica-Bold').text('Description:');
              doc.font('Helvetica').text(projectData.description);
              doc.moveDown();
            }

            if (projectData.objectives && projectData.objectives.length > 0) {
              doc.font('Helvetica-Bold').text('Objectifs:');
              doc.font('Helvetica');
              projectData.objectives.forEach((obj, idx) => {
                doc.text(`  ${idx + 1}. ${obj}`);
              });
              doc.moveDown();
            }

            if (projectData.startDate) {
              doc.text(`Date de début: ${new Date(projectData.startDate).toLocaleDateString('fr-FR')}`);
            }
            if (projectData.endDate) {
              doc.text(`Date de fin: ${new Date(projectData.endDate).toLocaleDateString('fr-FR')}`);
            }
            if (projectData.budget) {
              doc.text(`Budget: ${projectData.budget.toLocaleString('fr-FR')} XOF`);
            }
            if (projectData.interventionRegion) {
              doc.text(`Région d'intervention: ${projectData.interventionRegion}`);
            }
            doc.moveDown();

            if (projectData.theme) {
              doc.text(`Thème: ${projectData.theme.name}`);
            }
            if (projectData.researchType) {
              doc.text(`Type de recherche: ${projectData.researchType}`);
            }
          });
        }

        if (sections.includes('participants') && projectData.participants) {
          this.addPDFSection(doc, `PARTICIPANTS (${projectData.participants.length})`, () => {
            projectData.participants!.forEach((participant, idx) => {
              doc.fontSize(10).font('Helvetica-Bold')
                .text(`${idx + 1}. ${participant.user.firstName} ${participant.user.lastName}`);
              doc.font('Helvetica')
                .text(`   Email: ${participant.user.email}`)
                .text(`   Rôle: ${participant.role || 'N/A'}`)
                .text(`   Statut: ${participant.isActive ? 'Actif' : 'Inactif'}`);
              doc.moveDown(0.5);
            });
          });
        }

        if (sections.includes('budget')) {
          this.addPDFSection(doc, 'BUDGET ET FINANCEMENT', () => {
            if (projectData.fundings && projectData.fundings.length > 0) {
              doc.fontSize(10).font('Helvetica-Bold').text(`Sources de financement (${projectData.fundings.length}):`);
              doc.font('Helvetica');
              projectData.fundings.forEach((funding, idx) => {
                doc.text(`${idx + 1}. ${funding.fundingSource} (${funding.fundingType})`);
                doc.text(`   Statut: ${funding.status}`);
                doc.text(`   Montant demandé: ${funding.requestedAmount.toLocaleString('fr-FR')} ${funding.currency}`);
                if (funding.approvedAmount) {
                  doc.text(`   Montant approuvé: ${funding.approvedAmount.toLocaleString('fr-FR')} ${funding.currency}`);
                }
                if (funding.receivedAmount) {
                  doc.text(`   Montant reçu: ${funding.receivedAmount.toLocaleString('fr-FR')} ${funding.currency}`);
                }
                if (funding.contractNumber) {
                  doc.text(`   N° contrat: ${funding.contractNumber}`);
                }
                if (funding.conditions) {
                  doc.text(`   Conditions: ${funding.conditions}`);
                }
                doc.moveDown(0.5);
              });
            } else {
              doc.fontSize(10).text('Aucune source de financement enregistrée.');
            }
          });
        }

        // Pied de page
        doc.moveDown(2);
        doc.fontSize(8).font('Helvetica-Oblique')
          .text(`Généré le ${new Date().toLocaleString('fr-FR')}`, { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private addPDFSection(doc: PDFKit.PDFDocument, title: string, contentFn: () => void) {
    // Vérifier si on a besoin d'une nouvelle page
    if (doc.y > 700) {
      doc.addPage();
    }

    doc.fontSize(14).font('Helvetica-Bold').text(title);
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');

    contentFn();

    doc.moveDown();
    // Ligne de séparation
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
  }

  /**
   * Génère un rapport Word
   */
  async generateWord(projectData: ProjectData, sections: string[]): Promise<Buffer> {
    const docSections: any[] = [];

    // En-tête
    docSections.push(
      new Paragraph({
        text: 'RAPPORT DE PROJET',
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: projectData.title,
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Code: ', bold: true }),
          new TextRun(projectData.code || 'N/A'),
          new TextRun({ text: '     Statut: ', bold: true }),
          new TextRun(projectData.status),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Date de génération: ', bold: true }),
          new TextRun(new Date().toLocaleDateString('fr-FR')),
        ],
        spacing: { after: 400 },
      })
    );

    // Sections
    if (sections.includes('overview')) {
      docSections.push(
        new Paragraph({
          text: 'APERÇU GÉNÉRAL',
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 200 },
        })
      );

      if (projectData.description) {
        docSections.push(
          new Paragraph({
            children: [new TextRun({ text: 'Description:', bold: true })],
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: projectData.description,
            spacing: { after: 200 },
          })
        );
      }

      if (projectData.objectives && projectData.objectives.length > 0) {
        docSections.push(
          new Paragraph({
            children: [new TextRun({ text: 'Objectifs:', bold: true })],
            spacing: { after: 100 },
          })
        );
        projectData.objectives.forEach((obj, idx) => {
          docSections.push(
            new Paragraph({
              text: `${idx + 1}. ${obj}`,
              spacing: { after: 100 },
            })
          );
        });
      }

      const infoItems: string[] = [];
      if (projectData.startDate) {
        infoItems.push(`Date de début: ${new Date(projectData.startDate).toLocaleDateString('fr-FR')}`);
      }
      if (projectData.endDate) {
        infoItems.push(`Date de fin: ${new Date(projectData.endDate).toLocaleDateString('fr-FR')}`);
      }
      if (projectData.budget) {
        infoItems.push(`Budget: ${projectData.budget.toLocaleString('fr-FR')} XOF`);
      }
      if (projectData.interventionRegion) {
        infoItems.push(`Région d'intervention: ${projectData.interventionRegion}`);
      }
      if (projectData.theme) {
        infoItems.push(`Thème: ${projectData.theme.name}`);
      }
      if (projectData.researchType) {
        infoItems.push(`Type de recherche: ${projectData.researchType}`);
      }

      infoItems.forEach(item => {
        docSections.push(new Paragraph({ text: item, spacing: { after: 100 } }));
      });
    }

    if (sections.includes('participants') && projectData.participants) {
      docSections.push(
        new Paragraph({
          text: `PARTICIPANTS (${projectData.participants.length})`,
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 400, after: 200 },
        })
      );

      projectData.participants.forEach((participant, idx) => {
        docSections.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${idx + 1}. ${participant.user.firstName} ${participant.user.lastName}`, bold: true }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: `   Email: ${participant.user.email}`,
            spacing: { after: 50 },
          }),
          new Paragraph({
            text: `   Rôle: ${participant.role || 'N/A'}`,
            spacing: { after: 50 },
          }),
          new Paragraph({
            text: `   Statut: ${participant.isActive ? 'Actif' : 'Inactif'}`,
            spacing: { after: 200 },
          })
        );
      });
    }

    if (sections.includes('budget')) {
      docSections.push(
        new Paragraph({
          text: 'BUDGET ET FINANCEMENT',
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 400, after: 200 },
        })
      );

      if (projectData.fundings && projectData.fundings.length > 0) {
        docSections.push(
          new Paragraph({
            children: [new TextRun({ text: `Sources de financement (${projectData.fundings.length}):`, bold: true })],
            spacing: { after: 100 },
          })
        );

        projectData.fundings.forEach((funding, idx) => {
          docSections.push(
            new Paragraph({
              text: `${idx + 1}. ${funding.fundingSource} (${funding.fundingType})`,
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: `   Statut: ${funding.status}`,
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: `   Montant demandé: ${funding.requestedAmount.toLocaleString('fr-FR')} ${funding.currency}`,
              spacing: { after: 50 },
            })
          );

          if (funding.approvedAmount) {
            docSections.push(
              new Paragraph({
                text: `   Montant approuvé: ${funding.approvedAmount.toLocaleString('fr-FR')} ${funding.currency}`,
                spacing: { after: 50 },
              })
            );
          }

          if (funding.receivedAmount) {
            docSections.push(
              new Paragraph({
                text: `   Montant reçu: ${funding.receivedAmount.toLocaleString('fr-FR')} ${funding.currency}`,
                spacing: { after: 50 },
              })
            );
          }

          if (funding.contractNumber) {
            docSections.push(
              new Paragraph({
                text: `   N° contrat: ${funding.contractNumber}`,
                spacing: { after: 50 },
              })
            );
          }

          if (funding.conditions) {
            docSections.push(
              new Paragraph({
                text: `   Conditions: ${funding.conditions}`,
                spacing: { after: 100 },
              })
            );
          }
        });
      } else {
        docSections.push(
          new Paragraph({
            text: 'Aucune source de financement enregistrée.',
            spacing: { after: 200 },
          })
        );
      }
    }

    // Pied de page
    docSections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Généré le ${new Date().toLocaleString('fr-FR')}`,
            italics: true,
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 },
      })
    );

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: docSections,
        },
      ],
    });

    return await Packer.toBuffer(doc);
  }
}
