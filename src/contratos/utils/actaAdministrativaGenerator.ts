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

const formatTime = (time: string): string => {
  if (!time) return '_______';
  return time;
};

export const generateActaAdministrativaDocument = async (data: ContractData): Promise<void> => {
  try {
    const currentDate = new Date();
    const formattedDate = formatDate(data.actaDate || currentDate);
    const employeeName = data.employeeName || '____________________________';
    const position = data.position || '__________________________';
    const incidentTime = formatTime(data.actaTime || '');
    const incidentDescription = data.actaIncidentDescription || '__________________________________________________________________________________________________________________________________________________________';
    const witness1Name = data.actaWitness1Name || '_____________________________________________';
    const witness1Address = data.actaWitness1Address || '________________________________________________';
    const witness1Id = data.actaWitness1Id || '________';
    const witness1Statement = data.actaWitness1Statement || '__________________________________________________________________________________________________________________________________________________________';
    const witness2Name = data.actaWitness2Name || '__________________________________________';
    const witness2Address = data.actaWitness2Address || '_______________________________________________';
    const witness2Id = data.actaWitness2Id || '__________________';
    const witness2Statement = data.actaWitness2Statement || '______________________________________________________________________________________________________________________________________________________';

    const doc = new Document({
      sections: [
        {
          children: [
            // Title
            new Paragraph({
              children: [
                new TextRun({
                  text: "ACTA ADMINISTRATIVA DE HECHOS",
                  size: 28,
                  bold: true
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 600 }
            }),

            // Main introduction paragraph
            new Paragraph({
              children: [
                new TextRun({
                  text: "En las instalaciones de la fuente de trabajo: OLIVIA GONZALEZ MERCADO Y/O \"BIRRIERIA LA PURISIMA\", ubicada en: BLVD. PASEO DE LAS QUINTAS NUMERO 85 COLONIA MONTEBELLO ESTA CIUDAD, siendo las ",
                  size: 24
                }),
                new TextRun({
                  text: incidentTime,
                  size: 24,
                  underline: {}
                }),
                new TextRun({
                  text: " horas, del día ",
                  size: 24
                }),
                new TextRun({
                  text: formattedDate,
                  size: 24,
                  underline: {}
                }),
                new TextRun({
                  text: ", se reunieron la C. OLIVIA GONZALEZ MERCADO en su carácter de \"el patrón\" quien actúa con los C.C. (2 TESTIGOS de OLIVIA GONZALEZ MERCADO Y/O \"BIRRIERIA LA PURISIMA\"",
                  size: 24
                }),
                new TextRun({
                  text: "____________________________________________________________________________________________________________________________________________",
                  size: 24,
                  underline: {}
                }),
                new TextRun({
                  text: " como testigos de cargo se procedió a instrumentar la presente acta en contra del C. ",
                  size: 24
                }),
                new TextRun({
                  text: employeeName,
                  size: 24,
                  underline: {}
                }),
                new TextRun({
                  text: ", quien tiene el puesto de",
                  size: 24
                }),
                new TextRun({
                  text: position,
                  size: 24,
                  underline: {}
                }),
                new TextRun({
                  text: ", adscrito a esta BIRRIERIA LA PURISIMA de esta ciudad de Hermosillo, sonora.",
                  size: 24
                })
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 400 }
            }),

            // HECHOS section
            new Paragraph({
              children: [
                new TextRun({
                  text: "HECHOS",
                  size: 24,
                  bold: true
                })
              ],
              alignment: AlignmentType.LEFT,
              spacing: { after: 300 }
            }),

            // Facts description
            new Paragraph({
              children: [
                new TextRun({
                  text: "Asimismo se hace constar que el motivo de la presente es por virtud de que ",
                  size: 24
                }),
                new TextRun({
                  text: incidentDescription,
                  size: 24,
                  underline: {}
                }),
                new TextRun({
                  text: " (explicación detallada de los hechos o actos cometidos por el trabajador al que se le levanta el acta). Acto seguido se presenta:",
                  size: 24
                })
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 300 }
            }),

            // First witness
            new Paragraph({
              children: [
                new TextRun({
                  text: "El primer testigo de cargo de nombre ",
                  size: 24
                }),
                new TextRun({
                  text: witness1Name,
                  size: 24,
                  underline: {}
                }),
                new TextRun({
                  text: " (persona que va a declarar como testigo de que le constan los hechos que se le atribuyen a la trabajadora que se le instrumenta el acta) quien dice ser mayor de edad, con domicilio particular en ",
                  size: 24
                }),
                new TextRun({
                  text: witness1Address,
                  size: 24,
                  underline: {}
                }),
                new TextRun({
                  text: ", quien se identifica con la credencial número ",
                  size: 24
                }),
                new TextRun({
                  text: witness1Id,
                  size: 24,
                  underline: {}
                }),
                new TextRun({
                  text: ", expedida a su favor por el I.F.E. o i.n.e., y quien bajo protesta de decir verdad declara que sabe y le consta que el C. ",
                  size: 24
                }),
                new TextRun({
                  text: employeeName,
                  size: 24,
                  underline: {}
                }),
                new TextRun({
                  text: " (nombre completo de la persona a la que se levanta el acta o sea el trabajador) con puesto de ",
                  size: 24
                }),
                new TextRun({
                  text: position,
                  size: 24,
                  underline: {}
                }),
                new TextRun({
                  text: ", quien presta sus servicios en este lugar, ",
                  size: 24
                }),
                new TextRun({
                  text: witness1Statement,
                  size: 24,
                  underline: {}
                }),
                new TextRun({
                  text: " (explicación detallada por el testigo de cargo de cuándo, dónde, y cómo sucedieron los hechos y/o actos que se le atribuyen al trabajador al que se le levanta el acta), siendo todo lo que desea declarar. Acto seguido comparece:",
                  size: 24
                })
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 300 }
            }),

            // Second witness
            new Paragraph({
              children: [
                new TextRun({
                  text: "El segundo testigo de cargo de nombre ",
                  size: 24
                }),
                new TextRun({
                  text: witness2Name,
                  size: 24,
                  underline: {}
                }),
                new TextRun({
                  text: " (persona que va a declarar como testigo de que le constan los hechos que se le atribuyen a la trabajadora al que se le levanta el acta), quien dice ser mayor de edad, con domicilio particular en",
                  size: 24
                }),
                new TextRun({
                  text: witness2Address,
                  size: 24,
                  underline: {}
                }),
                new TextRun({
                  text: ", quien se identifica con credencial número ",
                  size: 24
                }),
                new TextRun({
                  text: witness2Id,
                  size: 24,
                  underline: {}
                }),
                new TextRun({
                  text: ", expedida a su favor por el I.F.E. o i.n.e., y quien bajo protesta de decir verdad declara: que sabe y le consta que la C. ",
                  size: 24
                }),
                new TextRun({
                  text: employeeName,
                  size: 24,
                  underline: {}
                }),
                new TextRun({
                  text: ", con puesto de",
                  size: 24
                }),
                new TextRun({
                  text: position,
                  size: 24,
                  underline: {}
                }),
                new TextRun({
                  text: ", quien presta sus servicios en este lugar,",
                  size: 24
                }),
                new TextRun({
                  text: witness2Statement,
                  size: 24,
                  underline: {}
                }),
                new TextRun({
                  text: " (explicación detallada por el testigo de cargo de cuándo, dónde y cómo sucedieron los hechos y/o actos que se le atribuyen al trabajador al que se le levanta el acta), siendo todo lo que desea declarar.",
                  size: 24
                })
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 400 }
            }),

            // Closing paragraph
            new Paragraph({
              children: [
                new TextRun({
                  text: "Todos debidamente apercibidos de las consecuencias legales que contrae para los que declaran con falsedad, mismos quienes han oído y presenciado lo declarado por los comparecientes, lo cual se asentó en esta acta, la que se da por concluida, y firmando al margen y calce para constancia legal, los que en ella intervinieron y así quisieron hacerlo.",
                  size: 24
                })
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 800 }
            }),

            // Empty lines for spacing
            new Paragraph({
              children: [new TextRun({ text: "", size: 24 })],
              spacing: { after: 400 }
            }),

            new Paragraph({
              children: [new TextRun({ text: "", size: 24 })],
              spacing: { after: 400 }
            }),

            // Employer signature
            new Paragraph({
              children: [
                new TextRun({
                  text: "OLIVIA GONZALEZ MERCADO Y/O \"BIRRIERIA LA PURISIMA\",",
                  size: 24
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 800 }
            }),

            // Empty lines for signatures
            new Paragraph({
              children: [new TextRun({ text: "", size: 24 })],
              spacing: { after: 400 }
            }),

            new Paragraph({
              children: [new TextRun({ text: "", size: 24 })],
              spacing: { after: 400 }
            }),

            new Paragraph({
              children: [new TextRun({ text: "", size: 24 })],
              spacing: { after: 400 }
            }),

            // Witness signatures
            new Paragraph({
              children: [
                new TextRun({
                  text: "_____________________",
                  size: 24
                })
              ],
              alignment: AlignmentType.LEFT,
              spacing: { after: 200 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `(${witness1Name})`,
                  size: 20
                })
              ],
              alignment: AlignmentType.LEFT,
              spacing: { after: 400 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "_____________________",
                  size: 24
                })
              ],
              alignment: AlignmentType.LEFT,
              spacing: { after: 200 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `(${witness2Name})`,
                  size: 20
                })
              ],
              alignment: AlignmentType.LEFT,
              spacing: { after: 200 }
            })
          ]
        }
      ]
    });

    const blob = await Packer.toBlob(doc);
    const fileName = `Acta_Administrativa_${employeeName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
    saveAs(blob, fileName);
    
  } catch (error) {
    console.error('Error generating acta administrativa document:', error);
    throw new Error('Failed to generate acta administrativa document');
  }
};
