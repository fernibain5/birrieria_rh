import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx';
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

export const generateIndefiniteContract = async (data: ContractData): Promise<void> => {
  try {
    console.log('Starting indefinite contract generation...');
    
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
                text: 'CONTRATO INDIVIDUAL DE TRABAJO POR TIEMPO INDETERMINADO QUE',
                ...defaultTextStyle,
                bold: true
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              after: 200
            }
          }),

          // Parties
          new Paragraph({
            children: [
              new TextRun({
                text: `CELEBRAN POR UNA PARTE CELEBRA ${owner.genderArticle.toUpperCase()} PERSONA FISICA ${owner.name} EN REPRESENTACION Y ${owner.ownershipWord2.toUpperCase()} DE EL LUGAR CONOCIDO COMERCIALMENTE COMO "${branch.name}" A QUIEN SE LE DENOMINARA "PATRON", Y POR OTRA LA PERSONA DE NOMBRE EL O LA`,
                ...defaultTextStyle
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              after: 200
            }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `C.${data.employeeName ? data.employeeName.toUpperCase() : '______________________________________________________________________'}`,
                ...defaultTextStyle
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              after: 200
            }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `A QUIEN SE LE DENOMINARA "TRABAJADOR", EL CUAL SE SUJETARÁ A LAS SIGUIENTES DECLARACIONES Y CLAUSULAS:`,
                ...defaultTextStyle
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              after: 400
            }
          }),

          // Declarations Section
          new Paragraph({
            text: 'D E C L A R A C I O N E S',
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              before: 400,
              after: 200
            }
          }),

          // Declaration I
          new Paragraph({
            children: [
              new TextRun({
                text: `I.- DECLARA "EL PATRON" SER MEXICAN${owner.gender === 'MASCULINO' ? 'O' : 'A'} MAYOR DE EDAD, DE SEXO ${owner.gender} QUE SE CONSTITUYE Y QUE EJERCE SUS ACTIVIDADES Y FUNCIONES COMO PERSONA FISICA ANTE EL SAT, QUÉ TIENE SU DOMICILIO PARA TODOS LOS EFECTOS LEGALES A QUE HAYA LUGAR EL UBICADO EN: ${branch.address}.`,
                ...defaultTextStyle
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              after: 200
            }
          }),

          // Declaration II
          new Paragraph({
            children: [
              new TextRun({
                text: `II.- DECLARA EL "PATRON", QUE REQUIERE CONTRATAR A UN EMPLEADO CON TODAS Y CADA UNA DE LAS APTITUDES Y CAPACIDAD PARA QUE PRESTE SUS SERVICIOS PERSONALES BAJO EL PUESTO DE ${data.employeePosition ? data.employeePosition.toUpperCase() : '________________________________________'} Y QUIEN SE LE ENCOMENDARAN LAS SIGUIENTES ACTIVIDADES ${data.employeeActivities ? data.employeeActivities.toUpperCase() : '____________________________________________________________ ________________________________________________________________________ ____________'}.`,
                ...defaultTextStyle
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              after: 200
            }
          }),

          // Declaration III
          new Paragraph({
            children: [
              new TextRun({
                text: 'III.- DECLARA EL "TRABAJADOR":',
                ...defaultTextStyle
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              after: 200
            }
          }),

          // Declaration III.A
          new Paragraph({
            children: [
              new TextRun({
                text: `A) QUE SE LLAMA COMO HA QUEDADO ESCRITO, DE NACIONALIDAD ${data.employeeNationality ? data.employeeNationality.toUpperCase() : 'MEXICANA'}, DE ESTADO CIVIL ${data.employeeCivilStatus ? data.employeeCivilStatus.toUpperCase() : '_________'} Y CON DOMICILIO EN ESTA CIUDAD EL UBICADO EN: ${data.employeeAddress ? data.employeeAddress.toUpperCase() : '_____________________________________________________________'}.`,
                ...defaultTextStyle
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              after: 200
            }
          }),

          // Declaration III.B
          new Paragraph({
            children: [
              new TextRun({
                text: 'B) BAJO PROTESTA DE DECIR VERDAD MANIFIESTA EL "TRABAJADOR" QUE ES UNA PERSONA APTA PARA PODER DESARROLLAR TODAS Y CADA UNA DE LAS ACTIVIDADES del puesto Descrito EN LA DECLARACIÓN ii, Y QUE REUNE LA TOTALIDAD DE LOS REQUISITOS NECESARIOS PARA PODER DESARROLLAR EL TRABAJO PARA EL CUAL SE LE CONTRATA, Y QUE CONSECUENTEMENTE PUEDE LLEVAR A CABO TALES ACTIVIDADES CON EL ESMERO, CUIDADO Y EFICIENCIA REQUERIDA, YA QUE TIENE LA COMPETENCIA, CAPACIDAD Y APTITUDES Y EXPERIENCIA NECESARIAS PARA DESEMPEÑAR EL PUESTO DE QUE SE TRATA Y REALIZAR TODAS LAS LABORES CORRESPONDIENTE A TALES TRABAJOS COMO SERVICIOS DE PRIMERA CATEGORÍA EN SU GÉNERO, DE ACUERDO A LAS CARTAS DE RECOMENDACIÓN Y REFERENCIAS PERSONALES, VERÍDICAS Y AUTENTICAS, QUE HAN PRESENTADO AL "PATRON" Y QUE NO TIENE NINGUNA CLASE DE ANTECEDENTES PENALES DE NINGUNA ESPECIE, EN VIRTUD DE QUE SIEMPRE A LLEVADO UN MODO DE VIVIR HONESTO; DECLARANDO DE IGUAL FORMA ESTAR DISPUESTO A PRESTAR SUS SERVICIOS PERSONALES COMO "TRABAJADOR" DEL "PATRON".',
                ...defaultTextStyle
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              after: 200
            }
          }),

          // Declaration III.C
          new Paragraph({
            children: [
              new TextRun({
                text: 'C) QUE LE INTERESA PRESTAR SUS SERVICIOS DESARROLANDO LA ACTIVIDAD MENCIONADA EN DECLARACIÓN II DE ESTE INSTRUMENTO PARA EL "PATRON", EN SU DOMICILIO O BIEN DONDE SE REQUIERA QUE PRESTE EL SERVICIO PARA EL CUAL FUE CONTRATADO.',
                ...defaultTextStyle
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              after: 200
            }
          }),

          // Declaration IV
          new Paragraph({
            children: [
              new TextRun({
                text: 'IV.- LAS PARTES INTERVINIENTES HAN DECIDIDO CELEBRAR EL PRESENTE CONTRATO INDIVIDUAL DE TRABAJO POR TIEMPO INDETERMINADO, EL CUAL SE SUJETARÁ A LAS SIGUIENTES CLAUSULAS:',
                ...defaultTextStyle
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              after: 400
            }
          }),

          // Clauses Section
          new Paragraph({
            text: 'C L A U S U L A S:',
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              before: 400,
              after: 200
            }
          }),

          // Clause I
          new Paragraph({
            children: [
              new TextRun({
                text: 'PRIMERA.- ',
                ...defaultTextStyle,
                bold: true
              }),
              new TextRun({
                text: `LAS PARTES CONTRATANTES CONVIENEN EN QUE PARA OBVIAR EN EL CURSO DEL PRESENTE, A ${owner.genderArticle.toUpperCase()} PERSONA FISICA ${owner.name}`,
                ...defaultTextStyle
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              after: 200
            }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `EN REPRESENTACION Y ${owner.ownershipWord.toUpperCase()} DE EL LUGAR CONOCIDO COMERCIALMENTE COMO "${branch.name}" A QUIEN SE LE DENOMINARA "PATRON", Y AL C. ${data.employeeName ? data.employeeName.toUpperCase() : '________________________________________________________'} SE LE denominara "EL TRABAJADOR", Y A LA LEY FEDERAL DE TRABAJO "LA LEY".`,
                ...defaultTextStyle
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              after: 200
            }
          }),

          // Clause II
          new Paragraph({
            children: [
              new TextRun({
                text: 'SEGUNDA.- ',
                ...defaultTextStyle,
                bold: true
              }),
              new TextRun({
                text: `EL LUGAR DE LA PRESTACION DE SERVICIOS SERÁ EL UBICADO EN: ${branch.address ? branch.address.toUpperCase() : '___________________'} DE ESTA CIUDAD.`,
                ...defaultTextStyle
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              after: 200
            }
          }),

          // Clause III
          new Paragraph({
            children: [
              new TextRun({
                text: 'TERCERA.- ',
                ...defaultTextStyle,
                bold: true
              }),
              new TextRun({
                text: '"EL TRABAJADOR" BAJO LA DIRECCIÓN Y ÓRDENES DEL "EL PATRON" Y SUS REPRESENTANTES PRESTARA SUS SERVICIOS PERSONALES, COMO TRABAJADOR EN EL CARGO Y PUESTO DE:',
                ...defaultTextStyle
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              after: 200
            }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `${data.employeePosition ? data.employeePosition.toUpperCase() : '________________________________________'}, ENTENDIÉNDOSE QUE SE ESTAN MENCIONANDO SOLAMENTE LAS LABORES BASICAS Y FUNDAMENTALES QUE DEBERÁ DE REALIZAR "EL TRABAJADOR" POR LO CUAL LA DESCRIPCIÓN Y ENUMERACIÓN ES EJEMPLIFICATIVA Y NO LIMITATIVA POR LO QUE TAMBIEN TENDRÁ EL DEBER DE LLEVAR ACABO TODAS AQUELLAS OTRAS LABORES SEMEJANTES, CONEXAS Y EN CUALQUIER FORMA COMPLEMENTARIA A LAS DESCRITAS.`,
                ...defaultTextStyle
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              after: 200
            }
          }),

          // Clause IV
          new Paragraph({
            children: [
              new TextRun({
                text: 'CUARTA.- ',
                ...defaultTextStyle,
                bold: true
              }),
              new TextRun({
                text: 'EL PRESENTE CONTRATO DE TRABAJO SERÁ REGIDO POR LA NUEVA LEY FEDERAL DEL TRABAJO PUBLICADA EL 30 DE NOVIEMBRE DEL 2012 EN EL DIARIO OFICIAL DE LA FEDERACION.',
                ...defaultTextStyle
              })
            ],
            spacing: {
              after: 200
            }
          }),

          // Clause V
          new Paragraph({
            children: [
              new TextRun({
                text: 'QUINTA.- ',
                ...defaultTextStyle,
                bold: true
              }),
              new TextRun({
                text: 'POR SU PARTE "EL TRABAJADOR" MANIFIESTA QUE SUS SERVICIOS LOS PRESTARA A "EL PATRON" POR TIEMPO INDETERMINADO DE MANERA INDEFINIDA A PARTIR DE LA FECHA DE LA CELEBRACION DEL PRESENTE CONTRATO Y EN TALES CONDICIONES QUEDA SUJETO A SUS ORDENES Y SUBORDINACIÓN SIN PODER OCUPARSE DE OTRAS FUNCIONES ENCOMENDADAS POR PERSONAS DISTINTAS A "EL PATRON."',
                ...defaultTextStyle
              })
            ],
            spacing: {
              after: 200
            }
          }),

          // Clause VI
          new Paragraph({
            children: [
              new TextRun({
                text: 'SEXTA.- ',
                ...defaultTextStyle,
                bold: true
              }),
              new TextRun({
                text: 'El "PATRON" SE COMPROMETE A OTORGAR AL "TRABAJADOR" TODAS Y CADA UNA DE LAS GARANTIAS DE SEGURIDAD SOCIAL Y LAS PRESTACIONES QUE MARCA LA "LEY" EN RELACION A LA CATEGORIA Y PUESTO QUE DESEMPEÑE EL "TRABAJADOR".',
                ...defaultTextStyle
              })
            ],
            spacing: {
              after: 200
            }
          }),

          // Clause VII
          new Paragraph({
            children: [
              new TextRun({
                text: 'SEPTIMA.- ',
                ...defaultTextStyle,
                bold: true
              }),
              new TextRun({
                text: 'EL "TRABAJADOR" ESTA OBLIGADO Y SE COMPROMETE A CUMPLIR CABALMENTE CON LOS REQUISITOS Y CONOCIMIENTOS PARA DESARROLLAR el puesto Estipulado EN LA CLAUSULA tercera, DEL PRESENTE CONTRATO.',
                ...defaultTextStyle
              })
            ],
            spacing: {
              after: 200
            }
          }),

          // Clause VIII
          new Paragraph({
            children: [
              ...(data.paymentMethod === 'EFECTIVO' 
                ? [
                    new TextRun({
                      text: 'OCTAVA.- ',
                      ...defaultTextStyle,
                      bold: true
                    }),
                    new TextRun({
                      text: `EL SUELDO INTEGRADO QUE PERCIBIRÁ "EL TRABAJADOR" SERÁ EL DE: $${data.dailySalary} M.N. DIARIOS. ESTE SALARIO SERA DEPOSITADO LIQUIDADO A "EL TRABAJADOR" EN EFECTIVO LOS DIAS ${data.paymentDay} CONJUNTAMENTE CON CUALQUIERA OTRA PRESTACION COMPLEMENTARIA QUE PUDIERA CORRESPONDERLE, ESTANDO OBLIGADO "EL TRABAJADOR" A FIRMAR LA CORRESPONDIENTE NOMINA O RECIBO DE PAGO RESPECTIVO.`,
                      ...defaultTextStyle
                    })
                  ]
                : [
                    new TextRun({
                      text: 'OCTAVA.- ',
                      ...defaultTextStyle,
                      bold: true
                    }),
                    new TextRun({
                      text: `EL SUELDO INTEGRADO QUE PERCIBIRÁ "EL TRABAJADOR" SERÁ EL DE: $${data.dailySalary} M.N. DIARIOS. ESTE SALARIO SERA DEPOSITADO LIQUIDADO A "EL TRABAJADOR" EN UNA CUENTA BANCARIA DEL BANCO DENOMINADO ${data.bankName}, A NOMBRE DE "EL TRABAJADOR", LOS DIAS ${data.paymentDay} CONJUNTAMENTE CON CUALQUIERA OTRA PRESTACION COMPLEMENTARIA QUE PUDIERA CORRESPONDERLE, ESTANDO OBLIGADO "EL TRABAJADOR" A FIRMAR LA CORRESPONDIENTE NOMINA O RECIBO DE PAGO RESPECTIVO.`,
                      ...defaultTextStyle
                    })
                  ])
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              after: 200
            }
          }),

          // Clause IX
          new Paragraph({
            children: [
              new TextRun({
                text: 'NOVENA.- ',
                ...defaultTextStyle,
                bold: true
              }),
              new TextRun({
                text: `LA DURACIÓN DIARIA DE LAS DISTINTAS JORNADAS DE TRABAJO EN QUE LE TOQUE LABORAR A "EL TRABAJADOR" SERÁN LAS MÁXIMAS FIJADAS POR "LA LEY" COMO JORNADA DIURNA, NOCTURNA Y MIXTA. EL HORARIO CORRESPONDIENTE PARA LA PRESTACION DE LOS SERVICIOS, ASÍ COMO LAS HORAS DE ENTRADA Y SALIDA SERÁN FIJADAS POR "EL PATRON" PODRÁN VARIARSE DISCRECIONALMENTE, ESTANDO SUJETAS A LAS NECESIDADES DERIVADAS DEL DESARROLLO DE SUS ACTIVIDADES Y LOS TRABAJOS CONTRATADOS SEGÚN LA EPOCA Y EL AÑO. CONSECUENTEMENTE "EL TRABAJADOR" PODRÁ CAMBIADO DISCRECIONALMENTE POR "EL PATRON" PARA QUE ELABORE EN CUALQUIERA DE LOS SIGUIENTES TURNOS, DIURNOS, NOCTURNO O MIXTO QUE TENGA ESTABLECIDO, SEGÚN LO PERMITAN Y REQUIERAN LAS NECESIDADES DE LAS LABORES EN EL ENTENDIMIENTO DE QUE ESTAS MODALIDADES TENDRÁN EXCLUSIVAMENTE EL CARÁCTER DE TEMPORALES, POR LO MISMO SERAN MODIFICABLES EN TODO EL TIEMPO. HASTA EN TANTO LA EMPRESA NO NOTIFIQUE PRECISAMENTE PO ESCRITO UN DISTINTO HORARIO DE LABORES "EL TRABAJADOR" SE SUJETARA AL SIGUIENTE DE LAS: ${data.workStartTime ? data.workStartTime : '______________'} A LAS: ${data.workEndTime ? data.workEndTime : '____________'} HORAS POR CUALQUIER CAMBIO DE TURNO O DE HORARIO DE LABORES "EL PATRON" LO DEBERA DE NOTIFICAR A "EL TRABAJADOR" CON UNA ANTICIPACIÓN MINIMA DE CUARENTA Y OCHO HORAS.`,
                ...defaultTextStyle
              })
            ],
            spacing: {
              after: 200
            }
          }),

          // Clause X
          new Paragraph({
            children: [
              new TextRun({
                text: 'DECIMA.- ',
                ...defaultTextStyle,
                bold: true
              }),
              new TextRun({
                text: '"EL TRABAJADOR" UNICAMENTE PODRÁ LABORAR TIEMPO EXTRAORDINARIO CUANDO "EL PATRON" SE LO INDIQUE AUNQUE NO MEDIE ORDEN POR ESCRITO DEBIDAMENTE AUTORIZADA POR LA PERSONA COMPETENTE PARA TAL EFECTO Y SERAN PAGADERAS CONFORME MARCA "LA LEY".',
                ...defaultTextStyle
              })
            ],
            spacing: {
              after: 200
            }
          }),

          // Clause XI
          new Paragraph({
            children: [
              new TextRun({
                text: 'DECIMA PRIMERA.- ',
                ...defaultTextStyle,
                bold: true
              }),
              new TextRun({
                text: `"EL TRABAJADOR" PRESTARA SUS SERVICIOS A "EL PATRON" DE ${data.workingDays ? data.workingDays : '_________________'} DE CADA SEMANA Y EN RAZON DEL MISMO SE LE OTORGARA EL PAGO CORRESPONDIENTE. POR LO QUE "EL TRABAJADOR" GOZARÁ COMO DESCANSO EL DIA ${data.restDay ? data.restDay : '_________________'} DE CADA SEMANA. TAMBIEN DISFRUTARÁ "EL TRABAJADOR" DE LOS DIAS DE DESCANSO OBLIGATORIOS QUE MARCA EL ARTICULO 74 DE "LA LEY" CON EL FIN DE QUE SE LE OTORGUE EL DESCANSO A "EL TRABAJADOR".`,
                ...defaultTextStyle
              })
            ],
            spacing: {
              after: 200
            }
          }),

          // Clause XII
          new Paragraph({
            children: [
              new TextRun({
                text: 'DECIMA SEGUNDA.- ',
                ...defaultTextStyle,
                bold: true
              }),
              new TextRun({
                text: 'AMBAS PARTES SE OBLIGAN A CUMPLIR CON LOS PLANES Y PROGRAMAS DE CAPACITACION Y ADIESTRAMIENTO QUE SE LE ESTABLEZCAN POR PARTE DE "EL PATRON" EN CUMPLIMIENTO A LOS PLANES Y PROGRAMAS QUE SE FORMULEN DE ACUERDO A LO QUE ESTABLECE "LA LEY" A SI MISMO A DAR CUMPLIMIENTO A LOS MISMOS.',
                ...defaultTextStyle
              })
            ],
            spacing: {
              after: 200
            }
          }),

          // Clause XIII
          new Paragraph({
            children: [
              new TextRun({
                text: 'DECIMA TERCERA.- ',
                ...defaultTextStyle,
                bold: true
              }),
              new TextRun({
                text: 'CUANDO "EL TRABAJADOR" SE VEA EN LA NECESIDAD DE FALTAR A SUS LABORES POR CUALQUIER CIRCUNSTANCIA MOTIVO A RAZON, ANTICIPADAMENTE DEBERA DE PONERLO EN CONOCIMIENTO DE "EL PATRON" SOLO EN CASO DE QUE LE SEA METERIALMENTE IMPOSIBLE HACERLO EN FORMA PERSONAL, DEBERÁ DAR AVISO POR CONDUCTO DE ALGÚN FAMILIAR, COMPAÑERO DE TRABAJO A CUALQUIER OTRA PERSONA MEDIANTE NOTA POR ESCRITO ELABORADA Y FIRMADA POR EL MISMO. DICHO AVISO NO SERÁ JUSTIFICATIVO DE LA FALTA DE TRABAJO, PUES EN TODOS LOS CASOS "EL TRABAJADOR" DEBERÁ DE JUSTIFICAR SU AUSENCIA PRECISAMENTE AL REGRESAR DE SU REINCIDENCIA.',
                ...defaultTextStyle
              })
            ],
            spacing: {
              after: 200
            }
          }),

          // Clause XIV
          new Paragraph({
            children: [
              new TextRun({
                text: 'DECIMA CUARTA.- ',
                ...defaultTextStyle,
                bold: true
              }),
              new TextRun({
                text: 'CUANDO EL "TRABAJADOR" NO SE PRESENTE PUNTUALMENTE A SU TRABAJO, SIENDO SU RETARDO DE QUINCE (15) MINUTOS O MAYOR, YA NO ESTA ADMITIDO POR ESE DIA CONSIDERÁNDOSELE COMO FALTA INJUSTIFICADA A SUS LABORES PARA TODOS LO EFECTOS LEGALES. EN CASO DE QUE SU RETRASO SEA INFERIOR A DICHOS QUINCE (15) MINUTOS, SE LES DESCONTARÁ LA PARTE PROPORCIONAL QUE CORRESPONDE A SU SALARIO Y SE HARÁ ACREEDOR A UNA SANCION DISCIPLINARIA DE SUSPENSIÓN EN SU TRABAJO DE UNO (1) A DOS (2) DIAS, SEGÚN EL NUMERO DE RETARDOS QUE TENGA CADA SEMANA Y SU REINCIDENCIA.',
                ...defaultTextStyle
              })
            ],
            spacing: {
              after: 200
            }
          }),

          // Clause XV
          new Paragraph({
            children: [
              new TextRun({
                text: 'DECIMA QUINTA.- ',
                ...defaultTextStyle,
                bold: true
              }),
              new TextRun({
                text: 'LAS PARTES CONVIENEN QUE "EL PATRON" PODRA DAR POR CONCLUIDA LA RELACION DE TRABAJO Y LA TERMINACION DEL PRESENTE CONTRATO SI "EL TRABAJADOR" INCUMPLE CON CUALQUIER CLAUSULA DEL PRESENTE CONTRATO O CUALQUIER OTRA CIRCUNSTANCIA O CONDUCTA QUE MARQUE Y ESTIPULE "LA LEY" COMO CAUSA Y DESPIDO JUSTIFICADO SIN RESPONSABILIDAD PARA "EL PATRON".',
                ...defaultTextStyle
              })
            ],
            spacing: {
              after: 200
            }
          }),

          // Clause XVI
          new Paragraph({
            children: [
              new TextRun({
                text: 'DECIMA SEXTA.- ',
                ...defaultTextStyle,
                bold: true
              }),
              new TextRun({
                text: '"LAS PARTES" CONVIENEN EN QUE, EN TODO LO ESTIPULADO EN EL PRESENTE CONTRATO SE ESTARÁ EN LO DISPUESTO EN "LA LEY".',
                ...defaultTextStyle
              })
            ],
            spacing: {
              after: 400
            }
          }),

          // Final Statement
          new Paragraph({
            children: [
              new TextRun({
                text: (() => {
                  if (data.indefiniteStartDate) {
                    try {
                      console.log('indefiniteStartDate:', data.indefiniteStartDate, 'Type:', typeof data.indefiniteStartDate);
                      let startDateParts;
                      
                      // Handle both string (new format) and Date (legacy format)
                      if (typeof data.indefiniteStartDate === 'string') {
                        startDateParts = extractDatePartsUTC7(data.indefiniteStartDate);
                      } else {
                        // Fallback for legacy Date objects
                        startDateParts = formatDateForContract(data.indefiniteStartDate);
                      }
                      
                      if (startDateParts) {
                        const { day, month, year } = startDateParts;
                        return `LEIDO QUE FUE EL PRESENTE CONTRATO POR LAS PARTES Y ENTERADOS DE SU ALCANCE Y FUERZA LEGAL, LO FIRMAN EN LA CIUDAD DE HERMOSILLO A LOS ${day} DIAS DEL MES DE ${month} DEL AÑO ${year} ANTE LA PRESENCIA DE LOS TESTIGOS QUE DAN FE A SU LEGALIDAD, QUEDANDO UN EJEMPLAR EN PODER DE CADA UNA DE LAS PARTES.`;
                      } else {
                        return `LEIDO QUE FUE EL PRESENTE CONTRATO POR LAS PARTES Y ENTERADOS DE SU ALCANCE Y FUERZA LEGAL, LO FIRMAN EN LA CIUDAD DE HERMOSILLO A LOS ___ DIAS DEL MES DE ________DEL AÑO______ ANTE LA PRESENCIA DE LOS TESTIGOS QUE DAN FE A SU LEGALIDAD, QUEDANDO UN EJEMPLAR EN PODER DE CADA UNA DE LAS PARTES.`;
                      }
                    } catch (error) {
                      console.error('Error formatting date:', error);
                      return `LEIDO QUE FUE EL PRESENTE CONTRATO POR LAS PARTES Y ENTERADOS DE SU ALCANCE Y FUERZA LEGAL, LO FIRMAN EN LA CIUDAD DE HERMOSILLO A LOS ___ DIAS DEL MES DE ________DEL AÑO______ ANTE LA PRESENCIA DE LOS TESTIGOS QUE DAN FE A SU LEGALIDAD, QUEDANDO UN EJEMPLAR EN PODER DE CADA UNA DE LAS PARTES.`;
                    }
                  } else {
                    return `LEIDO QUE FUE EL PRESENTE CONTRATO POR LAS PARTES Y ENTERADOS DE SU ALCANCE Y FUERZA LEGAL, LO FIRMAN EN LA CIUDAD DE HERMOSILLO A LOS ___ DIAS DEL MES DE ________DEL AÑO______ ANTE LA PRESENCIA DE LOS TESTIGOS QUE DAN FE A SU LEGALIDAD, QUEDANDO UN EJEMPLAR EN PODER DE CADA UNA DE LAS PARTES.`;
                  }
                })(),
                ...defaultTextStyle
              })
            ],
            spacing: {
              before: 400,
              after: 400
            }
          }),

          // Signatures
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
            spacing: {
              after: 200
            }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: '"EL TRABAJADOR"',
                bold: true
              }),
              new TextRun({
                text: '                                                                 ',
              }),
              new TextRun({
                text: `"${owner.name}"`,
                bold: true
              })
            ],
            spacing: {
              after: 400
            }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: '__________________________',
                bold: true
              }),
              new TextRun({
                text: '                                ',
              }),
              new TextRun({
                text: '______________________________',
                bold: true
              })
            ],
            spacing: {
              after: 200
            }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'TESTIGO',
                bold: true
              }),
              new TextRun({
                text: '                                                                           ',
              }),
              new TextRun({
                text: 'TESTIGO',
                bold: true
              })
            ]
          })
        ]
      }]
    });

    console.log('Document created, generating blob...');
    const blob = await Packer.toBlob(doc);
    console.log('Blob generated, saving file...');
    
    const fileName = `Contrato_Indefinido_${data.employeeName ? data.employeeName.replace(/\s+/g, '_') : 'Sin_Nombre'}_${new Date().toISOString().split('T')[0]}.docx`;
    saveAs(blob, fileName);
    console.log('File saved successfully');
  } catch (error) {
    console.error('Error generating contract:', error);
    throw error;
  }
}; 