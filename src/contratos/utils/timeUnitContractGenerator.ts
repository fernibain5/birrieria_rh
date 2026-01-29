import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx';
import { ContractData } from '../types/contract';
import { OWNERS, BRANCHES } from '../data/formConstants';
import { saveAs } from 'file-saver';
import { extractDatePartsUTC7 } from './timezoneUtils';

export const generateTimeUnitContract = async (data: ContractData): Promise<void> => {
  try {
    console.log('Starting time unit contract generation...');
    
    // Get owner and branch information
    const owner = OWNERS[data.ownerKey];
    const branch = BRANCHES[data.branchKey];
    
    if (!owner) {
      throw new Error('Owner information not found');
    }
    
    if (!branch) {
      throw new Error('Branch information not found');
    }

    // Extract date parts using UTC-7 timezone
    const startDate = data.timeUnitStartDate ? extractDatePartsUTC7(data.timeUnitStartDate) : null;
    const endDate = data.timeUnitEndDate ? extractDatePartsUTC7(data.timeUnitEndDate) : null;

    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
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
                text: 'CONTRATO INDIVIDUAL DE TRABAJO POR UNIDAD DE TIEMPO',
                ...defaultTextStyle,
                bold: true
              })
            ],
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              after: 200
            }
          }),

          // Contract Dates
          new Paragraph({
            children: [
              new TextRun({
                text: `DANDO INICIO EL DIA ${startDate.day} DE ${startDate.month} DE ${startDate.year} CON TERMINACION EL DIA ${endDate.day} DE ${endDate.month} DE ${endDate.year}`
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
                text: `QUE CELEBRAN POR UNA PARTE ${owner.genderArticle.toUpperCase()} PERSONA FISICA ${owner.name} EN REPRESENTACION Y ${owner.ownershipWord2.toUpperCase()} DE EL LUGAR CONOCIDO COMERCIALMENTE COMO "${branch.name}" A QUIEN SE LE DENOMINARA "PATRON", Y POR OTRA PARTE EL C. ${data.employeeName}`,
                ...defaultTextStyle
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              after: 200
            }
          }),

          new Paragraph({
            text: 'QUIEN SE LE DESIGNARA COMO "EL TRABAJADOR", EL PRESENTE CONTRATO ESTARA SUJETO A LAS SIGUIENTES DECLARACIONES Y CLAUSULAS:',
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
                text: 'II.- DECLARA "EL PATRON", QUE ESTA CONSTITUIDA CONFORME A LAS LEYES EMANADAS DE LOS ESTADOS UNIDOS MEXICANOS.',
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
                text: `III.- DECLARA EL "PATRON", QUE REQUIERE CONTRATAR A UN EMPLEADO CON TODAS Y CADA UNA DE LAS APTITUDES Y CAPACIDAD PARA QUE PRESTE SUS SERVICIOS PERSONALES BAJO EL PUESTO DE: ${data.employeePosition.toUpperCase()}, Y QUIEN SE LE ENCOMENDARAN LAS SIGUIENTES ACTIVIDADES: ${data.employeeActivities.toUpperCase()}.`,
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
                text: 'IV.- DECLARA EL "TRABAJADOR":',
                ...defaultTextStyle
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              after: 200
            }
          }),

          // Declaration IV.A
          new Paragraph({
            children: [
              new TextRun({
                text: `A) QUE SE LLAMA COMO HA QUEDADO ESCRITO, DE NACIONALIDAD ${data.employeeNationality.toUpperCase()}, DE ESTADO CIVIL: ${data.employeeCivilStatus.toUpperCase()} Y CON DOMICILIO EN ESTA CIUDAD EL UBICADO EN: ${data.employeeAddress.toUpperCase()}.`,
                ...defaultTextStyle
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              after: 200
            }
          }),

          // Declaration IV.B
          new Paragraph({
            children: [
              new TextRun({
                text: 'B) BAJO PROTESTA DE DECIR VERDAD MANIFIESTA EL "TRABAJADOR" QUE ES UNA PERSONA APTA PARA PODER DESARROLLAR TODAS Y CADA UNA DE LAS ACTIVIDADES DESCRITAS EN LA DECLARACIÓN ANTERIOR, Y QUE REUNE LA TOTALIDAD DE LOS REQUISITOS NECESARIOS PARA PODER DESARROLLAR EL TRABAJO PARA EL CUAL SE LE CONTRATA, Y QUE CONSECUENTEMENTE PUEDE LLEVAR A CABO TALES ACTIVIDADES CON EL ESMERO, CUIDADO Y EFICIENCIA REQUERIDA, YA QUE TIENE LA COMPETENCIA, CAPACIDAD Y APTITUDES Y EXPERIENCIA NECESARIAS PARA DESEMPEÑAR EL PUESTO DE QUE SE TRATA Y REALIZAR TODAS LAS LABORES CORRESPONDIENTE A TALES TRABAJOS COMO SERVICIOS DE PRIMERA CATEGORÍA EN SU GÉNERO, DE ACUERDO A LAS CARTAS DE RECOMENDACIÓN Y REFERENCIAS PERSONALES, VERÍDICAS Y AUTENTICAS, QUE HAN PRESENTADO AL "PATRON" Y QUE NO TIENE NINGUNA CLASE DE ANTECEDENTES PENALES DE NINGUNA ESPECIE, EN VIRTUD DE QUE SIEMPRE A LLEVADO UN MODO DE VIVIR HONESTO; DECLARANDO DE IGUAL FORMA ESTAR DISPUESTO A PRESTAR SUS SERVICIOS PERSONALES COMO "TRABAJADOR" DEL "PATRON".',
                ...defaultTextStyle
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              after: 200
            }
          }),

          // Declaration IV.C
          new Paragraph({
            children: [
              new TextRun({
                text: 'C) QUE LE INTERESA PRESTAR SUS SERVICIOS DESARROLANDO LA ACTIVIDAD MENCIONADA EN DECLARACIÓN III DE ESTE INSTRUMENTO PARA EL "PATRON", EN SU DOMICILIO O BIEN DONDE SE REQUIERA QUE PRESTE EL SERVICIO PARA EL CUAL FUE CONTRATADO.',
                ...defaultTextStyle
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              after: 200
            }
          }),

          // Declaration V
          new Paragraph({
            children: [
              new TextRun({
                text: 'V.- LAS PARTES INTERVINIENTES HAN DECIDIDO CELEBRAR EL PRESENTE CONTRATO INDIVIDUAL DE TRABAJO POR UNIDAD DE TIEMPO, EL CUAL SE SUJETARÁ A LAS SIGUIENTES CLAUSULAS:',
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
                text: `LAS PARTES CONTRATANTES CONVIENEN EN QUE PARA OBVIAR EN EL CURSO DEL PRESENTE, A ${owner.genderArticle.toUpperCase()} PERSONA FISICA ${owner.name} EN REPRESENTACION Y ${owner.ownershipWord.toUpperCase()} DE EL LUGAR CONOCIDO COMERCIALMENTE COMO "${branch.name}" A QUIEN SE LE DENOMINARA "PATRON", Y AL C.`,
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
                text: `${data.employeeName.toUpperCase()} SE LE DENOMINARA "EL TRABAJADOR", Y A LA LEY FEDERAL DE TRABAJO "LA LEY".`,
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
                text: `EL LUGAR DE LA PRESTACION DE SERVICIOS SERÁ EN: ${branch.name} DE ESTA CIUDAD.`,
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
                text: `"EL TRABAJADOR" BAJO LA DIRECCIÓN Y ÓRDENES DEL "EL PATRON" Y SUS REPRESENTANTES PRESTARA SUS SERVICIOS PERSONALES, COMO TRABAJADOR EN EL CARGO Y PUESTO DE: ${data.employeePosition.toUpperCase()}, ENTENDIÉNDOSE QUE SE ESTAN MENCIONANDO SOLAMENTE LAS LABORES BASICAS Y FUNDAMENTALES QUE DEBERÁ DE REALIZAR "EL TRABAJADOR" POR LO CUAL LA DESCRIPCIÓN Y ENUMERACIÓN ES EJEMPLIFICATIVA Y NO LIMITATIVA POR LO QUE TAMBIEN TENDRÁ EL DEBER DE LLEVAR ACABO TODAS AQUELLAS OTRAS LABORES SEMEJANTES, CONEXAS Y EN CUALQUIER FORMA COMPLEMENTARIA A LAS DESCRITAS.`,
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
            alignment: AlignmentType.JUSTIFIED,
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
                text: `POR SU PARTE "EL TRABAJADOR" MANIFIESTA QUE SUS SERVICIOS LOS PRESTARA A "EL PATRON" como fecha de INICIO EL DIA ${startDate.day} DE ${startDate.month} DE ${startDate.year} CON TERMINACION EL DIA ${endDate.day} DE ${endDate.month} DE ${endDate.year}, A PARTIR DE LA FECHA DE LA CELEBRACION DEL PRESENTE CONTRATO Y EN TALES CONDICIONES QUEDA SUJETO A SUS ORDENES Y SUBORDINACIÓN SIN PODER OCUPARSE DE OTRAS FUNCIONES ENCOMENDADAS POR PERSONAS DISTINTAS A "EL PATRON."`,
                ...defaultTextStyle
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
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
            alignment: AlignmentType.JUSTIFIED,
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
                text: 'EL "PATRON", SE COMPROMETE A dar extensión de otro contrato por UNIDAD DE TIEMPO, SIEMPRE Y CUANDO HAYA DEMOSTRADO APTITUD PARA EL PUESTO QUE SE LE CONTRATO, ESTO PARA EL CASO DE QUE A JUICIO DEL "EL PATRON", "EL TRABAJADOR" SATISFAGA LOS REQUISITOS Y CONOCIMIENTOS NECESARIOS PARA DESARROLLAR LAS ACTIVIDADES del puesto ESTIPULADo EN LA CLAUSULA tercera DEL PRESENTE CONTRATO.',
                ...defaultTextStyle
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
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
                text: `LA DURACIÓN DIARIA DE LAS DISTINTAS JORNADAS DE TRABAJO EN QUE LE TOQUE LABORAR A "EL TRABAJADOR" SERÁN LAS MÁXIMAS FIJADAS POR "LA LEY" COMO JORNADA DIURNA, NOCTURNA Y MIXTA. EL HORARIO CORRESPONDIENTE PARA LA PRESTACION DE LOS SERVICIOS, ASÍ COMO LAS HORAS DE ENTRADA Y SALIDA SERÁN FIJADAS POR "EL PATRON" PODRÁN VARIARSE DISCRECIONALMENTE, ESTANDO SUJETAS A LAS NECESIDADES DERIVADAS DEL DESARROLLO DE SUS ACTIVIDADES Y LOS TRABAJOS CONTRATADOS SEGÚN LA EPOCA Y EL AÑO. CONSECUENTEMENTE "EL TRABAJADOR" PODRÁ CAMBIADO DISCRECIONALMENTE POR "EL PATRON" PARA QUE ELABORE EN CUALQUIERA DE LOS SIGUIENTES TURNOS, DIURNOS, NOCTURNO O MIXTO QUE TENGA ESTABLECIDO, SEGÚN LO PERMITAN Y REQUIERAN LAS NECESIDADES DE LAS LABORES EN EL ENTENDIMIENTO DE QUE ESTAS MODALIDADES TENDRÁN EXCLUSIVAMENTE EL CARÁCTER DE TEMPORALES, POR LO MISMO SERAN MODIFICABLES EN TODO EL TIEMPO. HASTA EN TANTO LA EMPRESA NO NOTIFIQUE PRECISAMENTE PO ESCRITO UN DISTINTO HORARIO DE LABORES "EL TRABAJADOR" SE SUJETARA AL SIGUIENTE DE LAS: ${data.workStartTime} A LAS: ${data.workEndTime} HORAS POR CUALQUIER CAMBIO DE TURNO O DE HORARIO DE LABORES "EL PATRON" LO DEBERA DE NOTIFICAR A "EL TRABAJADOR" CON UNA ANTICIPACIÓN MINIMA DE CUARENTA Y OCHO HORAS.`,
                ...defaultTextStyle
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
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
            alignment: AlignmentType.JUSTIFIED,
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
                text: `"EL TRABAJADOR" PRESTARA SUS SERVICIOS A "EL PATRON" DE ${data.workingDays} DE CADA SEMANA Y EN RAZON DEL MISMO SE LE OTORGARA EL PAGO CORRESPONDIENTE. POR LO QUE "EL TRABAJADOR" GOZARÁ COMO DESCANSO EL DIA ${data.restDay} DE CADA SEMANA. TAMBIEN DISFRUTARÁ "EL TRABAJADOR" DE LOS DIAS DE DESCANSO OBLIGATORIOS QUE MARCA EL ARTICULO 74 DE "LA LEY" CON EL FIN DE QUE SE LE OTORGUE EL DESCANSO A "EL TRABAJADOR".`,
                ...defaultTextStyle
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              after: 200
            }
          }),

          // Clause XII
          new Paragraph({
            children: [
              new TextRun({
                text: 'DECIMA SEGUNDA.- ',
                bold: true
              }),
              new TextRun({
                text: 'AMBAS PARTES SE OBLIGAN A CUMPLIR CON LOS PLANES Y PROGRAMAS DE CAPACITACION Y ADIESTRAMIENTO QUE SE LE ESTABLEZCAN POR PARTE DE "EL PATRON" EN CUMPLIMIENTO A LOS PLANES Y PROGRAMAS QUE SE FORMULEN DE ACUERDO A LO QUE ESTABLECE "LA LEY" A SI MISMO A DAR CUMPLIMIENTO A LOS MISMOS.'
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
                bold: true
              }),
              new TextRun({
                text: 'CUANDO "EL TRABAJADOR" SE VEA EN LA NECESIDAD DE FALTAR A SUS LABORES POR CUALQUIER CIRCUNSTANCIA MOTIVO A RAZON, ANTICIPADAMENTE DEBERA DE PONERLO EN CONOCIMIENTO DE "EL PATRON" SOLO EN CASO DE QUE LE SEA METERIALMENTE IMPOSIBLE HACERLO EN FORMA PERSONAL, DEBERÁ DAR AVISO POR CONDUCTO DE ALGÚN FAMILIAR, COMPAÑERO DE TRABAJO A CUALQUIER OTRA PERSONA MEDIANTE NOTA POR ESCRITO ELABORADA Y FIRMADA POR EL MISMO. DICHO AVISO NO SERÁ JUSTIFICATIVO DE LA FALTA DE TRABAJO, PUES EN TODOS LOS CASOS "EL TRABAJADOR" DEBERÁ DE JUSTIFICAR SU AUSENCIA PRECISAMENTE AL REGRESAR DE SU REINCIDENCIA.'
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
                bold: true
              }),
              new TextRun({
                text: 'CUANDO EL "TRABAJADOR" NO SE PRESENTE PUNTUALMENTE A SU TRABAJO, SIENDO SU RETARDO DE QUINCE (15) MINUTOS O MAYOR, YA NO ESTA ADMITIDO POR ESE DIA CONSIDERÁNDOSELE COMO FALTA INJUSTIFICADA A SUS LABORES PARA TODOS LO EFECTOS LEGALES. EN CASO DE QUE SU RETRASO SEA INFERIOR A DICHOS QUINCE (15) MINUTOS, SE LES DESCONTARÁ LA PARTE PROPORCIONAL QUE CORRESPONDE A SU SALARIO Y SE HARÁ ACREEDOR A UNA SANCION DISCIPLINARIA DE SUSPENSIÓN EN SU TRABAJO DE UNO (1) A DOS (2) DIAS, SEGÚN EL NUMERO DE RETARDOS QUE TENGA CADA SEMANA Y SU REINCIDENCIA.'
              })
            ],
            spacing: {
              after: 200
            }
          }),

          // Clause XV
          new Paragraph({
            text: 'DECIMA QUINTA.- LAS PARTES CONVIENEN QUE "EL PATRON" AL TERMINO DEL presente contrato POR UNIDAD DE TIEMPO EN LA CLAUSULA SEPTIMA DEL PRESENTE CONTRATO, PODRA DAR POR TERMINADA LA RELACION DE TRABAJO, SIN RESPONSABILIDAD PARA "EL PATRON", SI A JUICIO DE ESTE ULTIMO, "EL TRABAJADOR" NO LLEGUE SATISFACER LOS REQUISITOS del puesto ESTIPULADo EN LA CLAUSULA tercerA DEL PRESENTE CONTRATO.',
            spacing: {
              after: 200
            }
          }),

          // Clause XVI
          new Paragraph({
            text: 'DECIMA SEXTA.- "LAS PARTES" CONVIENEN EN QUE, EN TODO LO ESTIPULADO EN EL PRESENTE CONTRATO SE ESTARÁ EN LO DISPUESTO EN "LA LEY".',
            spacing: {
              after: 400
            }
          }),

          // Final Statement
          new Paragraph({
            children: [
              new TextRun({
                text: `LEIDO QUE FUE EL PRESENTE CONTRATO POR LAS PARTES Y ENTERADOS DE SU ALCANCE Y FUERZA LEGAL, LO FIRMAN EN LA CIUDAD DE HERMOSILLO, A Los ${startDate.day} DIAS DEL MES DE ${startDate.month} DEL AÑO ${startDate.year} ANTE LA PRESENCIA DE LOS TESTIGOS QUE DAN FE A SU LEGALIDAD, QUEDANDO UN EJEMPLAR EN PODER DE CADA UNA DE LAS PARTES.`,
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
                text: '"EL PATRON"',
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
    
    const fileName = `Contrato_${data.employeeName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
    saveAs(blob, fileName);
    console.log('File saved successfully');
  } catch (error) {
    console.error('Error generating time unit contract:', error);
    throw error;
  }
}; 