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

const numberToWords = (amount: string): string => {
  // Simple implementation for common amounts
  // In a real implementation, you'd want a more comprehensive number-to-words converter
  const num = parseFloat(amount);
  if (isNaN(num)) return 'CANTIDAD NO VÁLIDA';
  
  // This is a simplified version - you can expand this for more precise conversions
  const units = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const tens = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const hundreds = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];
  
  if (num === 0) return 'CERO PESOS';
  if (num < 10) return `${units[Math.floor(num)]} PESOS`;
  if (num < 100) return `${tens[Math.floor(num / 10)]} ${units[num % 10]} PESOS`;
  if (num < 1000) return `${hundreds[Math.floor(num / 100)]} ${tens[Math.floor((num % 100) / 10)]} ${units[num % 10]} PESOS`;
  
  return `${amount} PESOS`; // Fallback for larger amounts
};

export const generateFiniquitoDocument = async (data: ContractData): Promise<void> => {
  try {
    const currentDate = new Date();
    const formattedDate = formatDate(data.finiquitoDate || currentDate);
    const employeeName = data.employeeName || '________________________';
    const position = data.position || '_________________________';
    const amount = data.finiquitoAmount || '0';
    const amountInWords = numberToWords(amount);

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

            // Amount line
            new Paragraph({
              children: [
                new TextRun({
                  text: "BUENO POR-. $",
                  size: 24,
                  bold: true
                }),
                new TextRun({
                  text: amount,
                  size: 24,
                  underline: {}
                })
              ],
              alignment: AlignmentType.LEFT,
              spacing: { after: 200 }
            }),

            // Main receipt paragraph
            new Paragraph({
              children: [
                new TextRun({
                  text: "R E C I B I de OLIVIA GONZALEZ MERCADO Y/O \"BIRRIERIA LA PURISIMA\", la cantidad de $",
                  size: 24
                }),
                new TextRun({
                  text: amount,
                  size: 24,
                  underline: {}
                }),
                new TextRun({
                  text: "m.n. (SON: ",
                  size: 24
                }),
                new TextRun({
                  text: amountInWords,
                  size: 24,
                  underline: {}
                }),
                new TextRun({
                  text: "), por concepto de gratificación que se me otorga con motivo de la terminación de mi contrato de trabajo que con esta fecha de hoy doy por terminado voluntariamente, lo anterior con fundamento en él artículo 53 Fracción I de la Ley Federal del Trabajo.",
                  size: 24
                })
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 300 }
            }),

            // Finiquito clause
            new Paragraph({
              children: [
                new TextRun({
                  text: "-----Este recibo hace las veces y lo otorgo como finiquito total de la prestación de servicio que tenía celebrado con: OLIVIA GONZALEZ MERCADO Y/O \"BIRRIERIA LA PURISIMA\".",
                  size: 24
                })
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 300 }
            }),

            // Legal disclaimer paragraph
            new Paragraph({
              children: [
                new TextRun({
                  text: "-----En vista de lo anterior, reconozco expresamente que no tengo ninguna prestación que reclamarle A \"el patrón\": OLIVIA GONZALEZ MERCADO Y/O \"BIRRIERIA LA PURISIMA\", por ninguna causa, con motivo de mis labores desarrolladas a su servicio, ya sea por conceptos de salarios devengados, pago de comisiones, horas extras, días festivos, así mismo hago constar para todos los efectos legales conducentes en términos del árt. 134 Fr. XIII de la ley Federal del Trabajo que me obligo a guardar estricta reserva de la información, procedimientos, y todos aquellos hechos y actos que con motivo de mi trabajo desempeñado en: OLIVIA GONZALEZ MERCADO Y/O \"BIRRIERIA LA PURISIMA\", sean de mi conocimiento y por lo tanto me obligo a no utilizar en beneficio propio o en beneficio de terceras personas ya sea directa o indirectamente la información, actos y demás hechos que sean de mi conocimiento, así como los secretos que se deriven de asuntos administrativos reservados que cuya divulgación pueda causar perjuicios a esta BIRRIERIA, comprometiéndome además a no divulgar información confidencial obtenida con motivo de la prestación de mis servicios como ",
                  size: 24
                }),
                new TextRun({
                  text: position,
                  size: 24,
                  underline: {}
                }),
                new TextRun({
                  text: ", aquella que no ha sido publicada o que no ha sido conocida por el resto de la competencia en este ramo RESTAURANTERO DE BIRRIERIA, ya que entiendo que esta se encuentra siendo propiedad del C. OLIVIA GONZALEZ MERCADO mismos secretos que están protegidos por la ley, hago constar para todos los efectos legales conducentes que durante la vigencia de mi relación obrero-patronal no fui objeto de riesgo profesional alguno, motivo por el cual libero a \"el patrón\" de toda responsabilidad laboral y de seguridad social, o cualquier otro concepto derivado del trabajo que con esta fecha hemos dado por definitivamente terminado.",
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
                  text: "firma",
                  size: 24
                })
              ],
              alignment: AlignmentType.LEFT,
              spacing: { after: 400 }
            }),

            // Signature line
            new Paragraph({
              children: [
                new TextRun({
                  text: "_____________________________________________",
                  size: 24
                })
              ],
              alignment: AlignmentType.LEFT,
              spacing: { after: 200 }
            }),

            // Employee name
            new Paragraph({
              children: [
                new TextRun({
                  text: "Nombre del trabajador",
                  size: 24
                })
              ],
              alignment: AlignmentType.LEFT,
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: employeeName,
                  size: 24
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
    const fileName = `Carta_Finiquito_${employeeName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
    saveAs(blob, fileName);
    
  } catch (error) {
    console.error('Error generating finiquito document:', error);
    throw new Error('Failed to generate finiquito document');
  }
};
