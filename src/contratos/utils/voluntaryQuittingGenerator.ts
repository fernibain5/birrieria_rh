import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import type { ContractData } from '../types/contract';
import { formatDateForContract } from './timezoneUtils';

const formatDate = (date: Date | string): string => {
  try {
    // If it's a string, assume it's an ISO string from form data and use UTC-7 conversion
    if (typeof date === 'string') {
      return formatDateForContract(date);
    }
    
    // If it's a Date object, format it directly (fallback for current date)
    const dateObj = date;
    
    if (!dateObj || isNaN(dateObj.getTime())) {
      console.warn('Invalid date provided, using current date');
      return formatDate(new Date());
    }

    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    const day = dateObj.getDate();
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    
    return `${day} de ${month} de ${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return formatDate(new Date());
  }
};

export const generateVoluntaryQuittingDocument = async (data: ContractData): Promise<void> => {
  try {
    const currentDate = new Date();
    const formattedDate = formatDate(data.voluntaryQuittingDate || currentDate);
    const employeeName = data.employeeName || '________________________';
    const position = data.position || '_________________________';

    const doc = new Document({
      sections: [
        {
          children: [
            // Header with date and location
            new Paragraph({
              children: [
                new TextRun({
                  text: `Guadalajara, Jalisco a ${formattedDate}`,
                  size: 24,
                })
              ],
              alignment: AlignmentType.RIGHT,
              spacing: { after: 400 }
            }),

            // "PRESENTE" line
            new Paragraph({
              children: [
                new TextRun({
                  text: "P R E S E N T E.-",
                  size: 24,
                  bold: true
                })
              ],
              alignment: AlignmentType.LEFT,
              spacing: { after: 400 }
            }),

            // Main body paragraph
            new Paragraph({
              children: [
                new TextRun({
                  text: "Por medio de la presente me dirijo a ustedes para hacerles saber que con esta fecha presento, por medio de esta carta mi renuncia con carácter de irrevocable al empleo que había venido desempeñando como ",
                  size: 24
                }),
                new TextRun({
                  text: position,
                  size: 24,
                  underline: {}
                }),
                new TextRun({
                  text: ", con la c. OLIVIA GONZALEZ MERCADO Y/O \"BIRRIERIA LA PURISIMA\", lo anterior por así convenir a mis intereses y en forma enteramente voluntaria, dicha determinación la hago con apoyo en la Fracción I del artículo 53 de la Ley Federal del Trabajo, para todos los efectos legales a que haya lugar.",
                  size: 24
                })
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 400 }
            }),

            // Gratitude paragraph
            new Paragraph({
              children: [
                new TextRun({
                  text: "Agradezco las atenciones de que fui objeto en mi relación obrero-patronal, quedando de ustedes como atento amigo y seguro servidor.",
                  size: 24
                })
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 600 }
            }),

            // Signature label
            new Paragraph({
              children: [
                new TextRun({
                  text: "FIRMA",
                  size: 24,
                  bold: true
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 600 }
            }),

            // Signature line and name
            new Paragraph({
              children: [
                new TextRun({
                  text: "_____________________________",
                  size: 24
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: employeeName,
                  size: 24
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 }
            })
          ]
        }
      ]
    });

    const blob = await Packer.toBlob(doc);
    const fileName = `Carta_Renuncia_${employeeName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
    saveAs(blob, fileName);
    
  } catch (error) {
    console.error('Error generating voluntary quitting document:', error);
    throw new Error('Failed to generate voluntary quitting document');
  }
};
