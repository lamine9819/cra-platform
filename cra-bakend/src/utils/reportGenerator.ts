// utils/reportGenerator.ts
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { publicationService } from '../services/publication.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ReportGenerator {
  
  async generatePublicationReport(
    researcherId: string,
    year: number,
    format: 'pdf' | 'docx' = 'pdf'
  ) {
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

    const publications = await publicationService.getResearcherPublications(researcherId, year);
    
    if (format === 'pdf') {
      return this.generatePDFReport(publications, year, researcher);
    } else {
      return this.generateWordReport(publications, year, researcher);
    }
  }

  private async generatePDFReport(publications: any[], year: number, researcher: any) {
    const doc = new PDFDocument({ 
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
    
    Object.entries(grouped).forEach(([type, pubs]: [string, any]) => {
      doc.fontSize(13)
         .font('Helvetica-Bold')
         .text(this.getTypeLabel(type), { underline: true });
      
      doc.moveDown(0.5);

      pubs.forEach((pub: any, index: number) => {
        const authors = this.formatAuthors(pub.authors);
        const pubYear = pub.publicationDate ? new Date(pub.publicationDate).getFullYear() : year;
        
        doc.fontSize(10)
           .font('Helvetica');
        
        let citation = `${index + 1}. ${authors} (${pubYear}). ${pub.title}. `;
        
        if (pub.journal) {
          citation += `${pub.journal}`;
          if (pub.volume) citation += `, ${pub.volume}`;
          if (pub.issue) citation += `(${pub.issue})`;
          if (pub.pages) citation += `, ${pub.pages}`;
          citation += '.';
        } else if (pub.publisher) {
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
       .text(
         `Rapport généré le ${new Date().toLocaleDateString('fr-FR')}`,
         50,
         doc.page.height - 50,
         { align: 'center' }
       );

    doc.end();

    return new Promise<string>((resolve) => {
      stream.on('finish', () => resolve(filename));
    });
  }

  private async generateWordReport(publications: any[], year: number, researcher: any) {
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
    const sections: any[] = [];

    // En-tête
    sections.push(
      new Paragraph({
        text: 'RAPPORT DES PUBLICATIONS SCIENTIFIQUES',
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      }),
      new Paragraph({
        text: `Année: ${year}`,
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        text: `Chercheur: ${researcher.firstName} ${researcher.lastName}`,
        alignment: AlignmentType.CENTER
      })
    );

    if (researcher.department) {
      sections.push(
        new Paragraph({
          text: `Département: ${researcher.department}`,
          alignment: AlignmentType.CENTER
        })
      );
    }

    if (researcher.discipline) {
      sections.push(
        new Paragraph({
          text: `Discipline: ${researcher.discipline}`,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        })
      );
    }

    // Statistiques
    sections.push(
      new Paragraph({
        text: 'STATISTIQUES GLOBALES',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 }
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Nombre total de publications: ${stats.total}`
          })
        ],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Publications internationales: ${stats.international}`
          })
        ],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Publications nationales: ${stats.national}`
          })
        ],
        spacing: { after: 400 }
      })
    );

    // Publications par type
    Object.entries(grouped).forEach(([type, pubs]: [string, any]) => {
      sections.push(
        new Paragraph({
          text: this.getTypeLabel(type),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 }
        })
      );

      pubs.forEach((pub: any, index: number) => {
        const authors = this.formatAuthors(pub.authors);
        const pubYear = pub.publicationDate ? new Date(pub.publicationDate).getFullYear() : year;
        
        let citation = `${index + 1}. ${authors} (${pubYear}). ${pub.title}. `;
        
        if (pub.journal) {
          citation += `${pub.journal}`;
          if (pub.volume) citation += `, ${pub.volume}`;
          if (pub.issue) citation += `(${pub.issue})`;
          if (pub.pages) citation += `, ${pub.pages}`;
          citation += '.';
        } else if (pub.publisher) {
          citation += `${pub.publisher}.`;
        }
        
        if (pub.doi) {
          citation += ` DOI: ${pub.doi}`;
        }

        sections.push(
          new Paragraph({
            text: citation,
            spacing: { after: 150 },
            alignment: AlignmentType.JUSTIFIED
          })
        );
      });
    });

    // Pied de page
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Rapport généré le ${new Date().toLocaleDateString('fr-FR')}`,
            italics: true
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 800 }
      })
    );

    // Créer le document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: sections
        }
      ]
    });

    // Sauvegarder
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(filepath, buffer);

    return filename;
  }

  private formatAuthors(authors: any[]): string {
    return authors
      .sort((a, b) => a.authorOrder - b.authorOrder)
      .map(a => {
        const lastName = a.user.lastName.toUpperCase();
        const firstInitial = a.user.firstName.charAt(0);
        return `${lastName} ${firstInitial}.`;
      })
      .join(', ');
  }

  private groupByType(publications: any[]) {
    return publications.reduce((acc, pub) => {
      if (!acc[pub.type]) acc[pub.type] = [];
      acc[pub.type].push(pub);
      return acc;
    }, {});
  }

  private calculateStats(publications: any[]) {
    return {
      total: publications.length,
      international: publications.filter(p => p.isInternational).length,
      national: publications.filter(p => !p.isInternational).length
    };
  }

  private getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
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

export const reportGenerator = new ReportGenerator();