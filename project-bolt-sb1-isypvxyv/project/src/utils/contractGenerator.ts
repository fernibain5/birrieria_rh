import { ContractData } from '../types/contract';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

export const generateContractText = (data: ContractData): string => {
  return `
CONTRATO INDIVIDUAL DE TRABAJO CON PERÍODO DE PRUEBA

Entre ${data.companyName}, RUT ${data.companyRut}, representada por ${data.legalRepresentative}, RUT ${data.legalRepRut}, domiciliada en ${data.companyAddress}, ${data.companyCity}, en adelante "la Empresa", y ${data.employeeName}, RUT ${data.employeeRut}, de nacionalidad ${data.employeeNationality}, estado civil ${data.employeeCivilStatus}, profesión ${data.employeeProfession}, domiciliado en ${data.employeeAddress}, ${data.employeeCity}, en adelante "el Trabajador", se ha convenido el siguiente contrato de trabajo:

PRIMERO: La Empresa contrata los servicios del Trabajador para desempeñarse como ${data.position} en el departamento de ${data.department}.

SEGUNDO: El presente contrato comenzará a regir el ${data.startDate} y tendrá un período de prueba de ${data.trialPeriod}.

TERCERO: El Trabajador prestará sus servicios en ${data.workplace}, con una jornada de ${data.workingHours} semanales, distribuidas de ${data.workSchedule}.

CUARTO: Como remuneración por los servicios prestados, la Empresa pagará al Trabajador la suma de ${data.baseSalary} ${data.paymentFrequency}, mediante ${data.paymentMethod}.

QUINTO: El Trabajador tendrá derecho a ${data.vacationDays} de vacaciones anuales.

${data.benefits.length > 0 ? `SEXTO: Beneficios adicionales: ${data.benefits.join(', ')}.` : ''}

${data.additionalClauses ? `SÉPTIMO: Cláusulas adicionales: ${data.additionalClauses}` : ''}

Firmado en ${data.companyCity}, el ${data.contractDate}.

_______________________          _______________________
${data.legalRepresentative}             ${data.employeeName}
Representante Legal                 Trabajador
  `;
};

export const downloadContract = async (data: ContractData) => {
  try {
    // Create a new document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Title
            new Paragraph({
              children: [
                new TextRun({
                  text: "CONTRATO INDIVIDUAL DE TRABAJO CON PERÍODO DE PRUEBA",
                  bold: true,
                  size: 28,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),

            // Introduction paragraph
            new Paragraph({
              children: [
                new TextRun({
                  text: `Entre ${data.companyName || '[NOMBRE EMPRESA]'}, RUT ${data.companyRut || '[RUT EMPRESA]'}, representada por ${data.legalRepresentative || '[REPRESENTANTE LEGAL]'}, RUT ${data.legalRepRut || '[RUT REPRESENTANTE]'}, domiciliada en ${data.companyAddress || '[DIRECCIÓN EMPRESA]'}, ${data.companyCity || '[CIUDAD]'}, en adelante "la Empresa", y ${data.employeeName || '[NOMBRE TRABAJADOR]'}, RUT ${data.employeeRut || '[RUT TRABAJADOR]'}, de nacionalidad ${data.employeeNationality || '[NACIONALIDAD]'}, estado civil ${data.employeeCivilStatus || '[ESTADO CIVIL]'}, profesión ${data.employeeProfession || '[PROFESIÓN]'}, domiciliado en ${data.employeeAddress || '[DIRECCIÓN TRABAJADOR]'}, ${data.employeeCity || '[CIUDAD TRABAJADOR]'}, en adelante "el Trabajador", se ha convenido el siguiente contrato de trabajo:`,
                }),
              ],
              spacing: { after: 300 },
            }),

            // Clause 1
            new Paragraph({
              children: [
                new TextRun({
                  text: "PRIMERO: ",
                  bold: true,
                }),
                new TextRun({
                  text: `La Empresa contrata los servicios del Trabajador para desempeñarse como ${data.position || '[CARGO]'} en el departamento de ${data.department || '[DEPARTAMENTO]'}.`,
                }),
              ],
              spacing: { after: 200 },
            }),

            // Clause 2
            new Paragraph({
              children: [
                new TextRun({
                  text: "SEGUNDO: ",
                  bold: true,
                }),
                new TextRun({
                  text: `El presente contrato comenzará a regir el ${data.startDate || '[FECHA INICIO]'} y tendrá un período de prueba de ${data.trialPeriod || '[PERÍODO PRUEBA]'}.`,
                }),
              ],
              spacing: { after: 200 },
            }),

            // Clause 3
            new Paragraph({
              children: [
                new TextRun({
                  text: "TERCERO: ",
                  bold: true,
                }),
                new TextRun({
                  text: `El Trabajador prestará sus servicios en ${data.workplace || '[LUGAR TRABAJO]'}, con una jornada de ${data.workingHours || '[HORAS TRABAJO]'} semanales, distribuidas de ${data.workSchedule || '[HORARIO]'}.`,
                }),
              ],
              spacing: { after: 200 },
            }),

            // Clause 4
            new Paragraph({
              children: [
                new TextRun({
                  text: "CUARTO: ",
                  bold: true,
                }),
                new TextRun({
                  text: `Como remuneración por los servicios prestados, la Empresa pagará al Trabajador la suma de ${data.baseSalary || '[SALARIO]'} ${data.paymentFrequency || '[FRECUENCIA PAGO]'}, mediante ${data.paymentMethod || '[MÉTODO PAGO]'}.`,
                }),
              ],
              spacing: { after: 200 },
            }),

            // Clause 5
            new Paragraph({
              children: [
                new TextRun({
                  text: "QUINTO: ",
                  bold: true,
                }),
                new TextRun({
                  text: `El Trabajador tendrá derecho a ${data.vacationDays || '[DÍAS VACACIONES]'} de vacaciones anuales.`,
                }),
              ],
              spacing: { after: 200 },
            }),

            // Benefits clause (if any)
            ...(data.benefits.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "SEXTO: ",
                    bold: true,
                  }),
                  new TextRun({
                    text: `Beneficios adicionales: ${data.benefits.join(', ')}.`,
                  }),
                ],
                spacing: { after: 200 },
              })
            ] : []),

            // Additional clauses (if any)
            ...(data.additionalClauses ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: data.benefits.length > 0 ? "SÉPTIMO: " : "SEXTO: ",
                    bold: true,
                  }),
                  new TextRun({
                    text: `Cláusulas adicionales: ${data.additionalClauses}`,
                  }),
                ],
                spacing: { after: 400 },
              })
            ] : []),

            // Signature section
            new Paragraph({
              children: [
                new TextRun({
                  text: `Firmado en ${data.companyCity || '[CIUDAD]'}, el ${data.contractDate || '[FECHA CONTRATO]'}.`,
                }),
              ],
              spacing: { after: 600 },
            }),

            // Signature lines
            new Paragraph({
              children: [
                new TextRun({
                  text: "_______________________          _______________________",
                }),
              ],
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `${data.legalRepresentative || '[REPRESENTANTE LEGAL]'}             ${data.employeeName || '[NOMBRE TRABAJADOR]'}`,
                }),
              ],
              spacing: { after: 100 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Representante Legal                 Trabajador",
                }),
              ],
            }),
          ],
        },
      ],
    });

    // Generate and download the document
    const blob = await Packer.toBlob(doc);
    const fileName = `contrato_${(data.employeeName || 'trabajador').replace(/\s+/g, '_')}.docx`;
    saveAs(blob, fileName);

  } catch (error) {
    console.error('Error generating DOCX:', error);
    
    // Fallback to text file if DOCX generation fails
    const contractText = generateContractText(data);
    const blob = new Blob([contractText], { type: 'text/plain;charset=utf-8' });
    const fileName = `contrato_${(data.employeeName || 'trabajador').replace(/\s+/g, '_')}.txt`;
    saveAs(blob, fileName);
  }
};