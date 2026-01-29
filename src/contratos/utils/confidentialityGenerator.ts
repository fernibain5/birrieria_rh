import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { ContractData } from '../types/contract';
import { OWNERS, BRANCHES } from '../data/formConstants';
import { saveAs } from 'file-saver';
import { extractDatePartsUTC7 } from './timezoneUtils';

// Helper function to get Spanish month names
const getSpanishMonth = (monthIndex: number): string => {
  const months = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ];
  return months[monthIndex];
};

// Helper function to format date for contract (deprecated - use extractDatePartsUTC7)
const formatDateForContract = (date: Date | string): { day: string, month: string, year: string } => {
  let dateObj: Date;
  
  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    throw new Error('Invalid date format provided');
  }
  
  return {
    day: dateObj.getDate().toString(),
    month: getSpanishMonth(dateObj.getMonth()),
    year: dateObj.getFullYear().toString()
  };
};

export const generateConfidentialityAgreement = async (data: ContractData): Promise<void> => {
  try {
    console.log('Starting confidentiality agreement generation...');
    
    // Get owner and branch information
    const owner = OWNERS[data.ownerKey];
    const branch = BRANCHES[data.branchKey];
    
    if (!owner) {
      throw new Error('Owner information not found');
    }
    
    if (!branch) {
      throw new Error('Branch information not found');
    }

    // Default text formatting is now handled by document styles
    const defaultTextStyle = {}; // Empty object since document styles handle formatting
    
    const doc = new Document({
      styles: {
        paragraphStyles: [
          {
            id: "Normal",
            name: "Normal",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              font: "Copperplate Gothic Light",
              size: 22
            },
            paragraph: {
              alignment: AlignmentType.JUSTIFIED
            }
          }
        ]
      },
      sections: [{
        properties: {},
        children: [
          // Title
          new Paragraph({
            children: [
              new TextRun({
                text: 'CONVENIO DE CONFIDENCIALIDAD',
                ...defaultTextStyle,
                bold: true
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 400
            }
          }),

          // Main Content
          new Paragraph({
            children: [
              new TextRun({
                text: `Para los efectos de este convenio, se consideran como "SECRETOS DE ${owner.name} Y/O "${branch.name}", los conocimientos, recetas, tiempos y procedimientos de preparación de platillos y alimentos, ideas, información técnica, cursos, proyectos, procedimientos, procesos operativos, comerciales y administrativos, estrategias, métodos de LOGISTICA, registros, compilaciones Y información de ${owner.name} Y/O "${branch.name}"., Por lo cual "el TRABAJADOR" no podrá revelar, apoderarse o usar en cualquier forma, directa o indirectamente, la información confidencial que obtuvo y obtendrá de: ${owner.name} Y/O "${branch.name}", en virtud de la relación laboral que sostiene con la fuente de trabajo, que es operada por "el patron" hasta en tanto dicha información confidencial no sea considerada de carácter público o del conocimiento de terceros. Información confidencial que desde ahora reconoce que es propiedad única y exclusiva de: ${owner.name} Y/O "${branch.name}", incluyendo sin limitar información técnica de mercado o de cualquier otra naturaleza, relativa a las operaciones, estrategias, políticas, manejo de actividades de ESTa birrieria y cualquier otra información a la que haya tenido acceso y que constituyen los "secretos de ${owner.name} Y/O "${branch.name}". en caso de que "${data.employeeName ? data.employeeName.toUpperCase() : 'eL TRABAJADOR'}" incumpliera con las obligaciones contenidas en el presente convenio CON ${owner.name} Y/O "${branch.name}", Y CON cualquiera de sus clientes respectivamente, tendrá en términos de ley, la facultad de ejercitar las acciones penales y civiles que se deriven de la posible conducta ilícita, de conformidad con lo dispuesto en de los códigos penales o civiles, estatales y federales.`,
                ...defaultTextStyle
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              after: 400
            }
          }),

          // Final Statement
          new Paragraph({
            children: [
              new TextRun({
                text: (() => {
                  if (data.confidentialityDate) {
                    try {
                      let dateParts;
                      
                      // Handle both string (new format) and Date (legacy format)
                      if (typeof data.confidentialityDate === 'string') {
                        dateParts = extractDatePartsUTC7(data.confidentialityDate);
                      } else {
                        // Fallback for legacy Date objects
                        dateParts = formatDateForContract(data.confidentialityDate);
                      }
                      
                      if (dateParts) {
                        const { day, month, year } = dateParts;
                        return `Leido el presente convenio y enteradas las partes de su contenido y fuerza legal, lo firman por duplicado en la ciudad de Hermosillo, sonora, el día ${day} DE ${month} DEL ${year}`;
                      } else {
                        return `Leido el presente convenio y enteradas las partes de su contenido y fuerza legal, lo firman por duplicado en la ciudad de Hermosillo, sonora, el día __________________________________________`;
                      }
                    } catch (error) {
                      console.error('Error formatting date:', error);
                      return `Leido el presente convenio y enteradas las partes de su contenido y fuerza legal, lo firman por duplicado en la ciudad de Hermosillo, sonora, el día __________________________________________`;
                    }
                  } else {
                    return `Leido el presente convenio y enteradas las partes de su contenido y fuerza legal, lo firman por duplicado en la ciudad de Hermosillo, sonora, el día __________________________________________`;
                  }
                })(),
                ...defaultTextStyle
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              before: 400,
              after: 400
            }
          }),

          // Signatures
          new Paragraph({
            children: [
              new TextRun({
                text: '"el patron"',
                bold: true
              }),
              new TextRun({
                text: '                                                                 ',
              }),
              new TextRun({
                text: '"eL TRABAJADOR"',
                bold: true
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 200
            }
          }),

          // Signature lines and names
          new Paragraph({
            children: [
              new TextRun({
                text: '__________________________',
                bold: true
              }),
              new TextRun({
                text: '                                 ',
              }),
              new TextRun({
                text: '______________________________',
                bold: true
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 200
            }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `${owner.name}`,
                bold: true
              }),
              new TextRun({
                text: '                                                        ',
              }),
              new TextRun({
                text: `${data.employeeName ? data.employeeName.toUpperCase() : 'NOMBRE DEL TRABAJADOR'}`,
                bold: true
              })
            ],
            alignment: AlignmentType.CENTER
          })
        ]
      }]
    });

    console.log('Document created, generating blob...');
    const blob = await Packer.toBlob(doc);
    console.log('Blob generated, saving file...');
    
    const fileName = `Convenio_Confidencialidad_${data.employeeName ? data.employeeName.replace(/\s+/g, '_') : 'Sin_Nombre'}_${new Date().toISOString().split('T')[0]}.docx`;
    saveAs(blob, fileName);
    console.log('File saved successfully');
  } catch (error) {
    console.error('Error generating confidentiality agreement:', error);
    throw error;
  }
};