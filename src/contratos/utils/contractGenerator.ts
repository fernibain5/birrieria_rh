// import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx';
// import { ContractData, ContractType } from '../types/contract';
// import { saveAs } from 'file-saver';

// export const generateContract = async (data: ContractData, contractType: ContractType): Promise<void> => {
//   try {
//     console.log(`Starting ${contractType} contract generation...`);
    
//     const doc = new Document({
//       sections: [{
//         properties: {},
//         children: [
//           // Title
//           new Paragraph({
//             text: contractType === 'trial' 
//               ? 'CONTRATO INDIVIDUAL DE TRABAJO A PRUEBA'
//               : 'CONTRATO INDIVIDUAL DE TRABAJO POR UNIDAD DE TIEMPO',
//             heading: HeadingLevel.HEADING_1,
//             alignment: AlignmentType.CENTER,
//             spacing: {
//               after: 200
//             }
//           }),

//           // Contract Dates
//           new Paragraph({
//             text: contractType === 'trial'
//               ? `DANDO INICIO EL DIA ${data.trialContractDay} DE ${data.trialContractMonth} DE ${data.trialContractYear} CON TERMINACION EL DIA ${data.trialContractDay} DE ${data.trialContractMonth} DE ${data.trialContractYear} MAS ${data.trialPeriodDays} DIAS DE PRUEBA`
//               : `DANDO INICIO EL DIA ${data.timeUnitStartDate} DE ${data.timeUnitEndDate} DE ${data.timeUnitStartYear} CON TERMINACION EL DIA ${data.timeUnitEndDay} DE ${data.timeUnitEndMonth} DE ${data.timeUnitEndYear}`,
//             alignment: AlignmentType.CENTER,
//             spacing: {
//               after: 200
//             }
//           }),

//           // Parties
//           new Paragraph({
//             text: 'QUE CELEBRAN POR UNA PARTE LA PERSONA FISICA OLIVIA GONZALEZ MERCADO EN REPRESENTACION Y PROPIETARIA DE EL LUGAR CONOCIDO COMERCIALMENTE COMO "BIRRIERIA LA PURISIMA" A QUIEN SE LE DENOMINARA "PATRON", Y POR OTRA PARTE EL C.',
//             spacing: {
//               after: 200
//             }
//           }),

//           new Paragraph({
//             text: data.employeeName,
//             alignment: AlignmentType.CENTER,
//             spacing: {
//               after: 200
//             }
//           }),

//           new Paragraph({
//             text: 'QUIEN SE LE DESIGNARA COMO "EL TRABAJADOR", EL PRESENTE CONTRATO ESTARA SUJETO A LAS SIGUIENTES DECLARACIONES Y CLAUSULAS:',
//             spacing: {
//               after: 400
//             }
//           }),

//           // Declarations Section
//           new Paragraph({
//             text: 'D E C L A R A C I O N E S',
//             heading: HeadingLevel.HEADING_2,
//             alignment: AlignmentType.CENTER,
//             spacing: {
//               before: 400,
//               after: 200
//             }
//           }),

//           // Declaration I
//           new Paragraph({
//             text: 'I.- DECLARA "EL PATRON" SER MEXICANA MAYOR DE EDAD, DE SEXO FEMENINO QUE SE CONSTITUYE Y QUE EJERCE SUS ACTIVIDADES Y FUNCIONES COMO PERSONA FISICA ANTE EL SAT, QUÉ TIENE SU DOMICILIO PARA TODOS LOS EFECTOS LEGALES A QUE HAYA LUGAR EL UBICADO EN: BLVD. PASEO DE LAS QUINTAS NUMERO 85 COLONIA MONTEBELLO INTERIOR LAS QUINTAS FOOD TRUCK DE ESTA CIUDAD.',
//             spacing: {
//               after: 200
//             }
//           }),

//           // Declaration II
//           new Paragraph({
//             text: 'II.- DECLARA "EL PATRON", QUE ESTA CONSTITUIDA CONFORME A LAS LEYES EMANADAS DE LOS ESTADOS UNIDOS MEXICANOS.',
//             spacing: {
//               after: 200
//             }
//           }),

//           // Declaration III
//           new Paragraph({
//             text: 'III.- DECLARA EL "PATRON", QUE REQUIERE CONTRATAR A UN EMPLEADO CON TODAS Y CADA UNA DE LAS APTITUDES Y CAPACIDAD PARA QUE PRESTE SUS SERVICIOS PERSONALES BAJO EL PUESTO DE:',
//             spacing: {
//               after: 200
//             }
//           }),

//           new Paragraph({
//             text: data.employeePosition,
//             alignment: AlignmentType.CENTER,
//             spacing: {
//               after: 200
//             }
//           }),

//           new Paragraph({
//             text: 'Y QUIEN SE LE ENCOMENDARAN LAS SIGUIENTES ACTIVIDADES:',
//             spacing: {
//               after: 200
//             }
//           }),

//           new Paragraph({
//             text: data.employeeActivities,
//             alignment: AlignmentType.CENTER,
//             spacing: {
//               after: 200
//             }
//           }),

//           // Declaration IV
//           new Paragraph({
//             text: 'IV.- DECLARA EL "TRABAJADOR":',
//             spacing: {
//               after: 200
//             }
//           }),

//           // Declaration IV.A
//           new Paragraph({
//             text: `A) QUE SE LLAMA COMO HA QUEDADO ESCRITO, DE NACIONALIDAD ${data.employeeNationality}, DE ESTADO CIVIL: ${data.employeeCivilStatus} Y CON DOMICILIO EN ESTA CIUDAD EL UBICADO EN: ${data.employeeAddress}.`,
//             spacing: {
//               after: 200
//             }
//           }),

//           // Declaration IV.B
//           new Paragraph({
//             text: 'B) BAJO PROTESTA DE DECIR VERDAD MANIFIESTA EL "TRABAJADOR" QUE ES UNA PERSONA APTA PARA PODER DESARROLLAR TODAS Y CADA UNA DE LAS ACTIVIDADES DESCRITAS EN LA DECLARACIÓN ANTERIOR, Y QUE REUNE LA TOTALIDAD DE LOS REQUISITOS NECESARIOS PARA PODER DESARROLLAR EL TRABAJO PARA EL CUAL SE LE CONTRATA, Y QUE CONSECUENTEMENTE PUEDE LLEVAR A CABO TALES ACTIVIDADES CON EL ESMERO, CUIDADO Y EFICIENCIA REQUERIDA, YA QUE TIENE LA COMPETENCIA, CAPACIDAD Y APTITUDES Y EXPERIENCIA NECESARIAS PARA DESEMPEÑAR EL PUESTO DE QUE SE TRATA Y REALIZAR TODAS LAS LABORES CORRESPONDIENTE A TALES TRABAJOS COMO SERVICIOS DE PRIMERA CATEGORÍA EN SU GÉNERO, DE ACUERDO A LAS CARTAS DE RECOMENDACIÓN Y REFERENCIAS PERSONALES, VERÍDICAS Y AUTENTICAS, QUE HAN PRESENTADO AL "PATRON" Y QUE NO TIENE NINGUNA CLASE DE ANTECEDENTES PENALES DE NINGUNA ESPECIE, EN VIRTUD DE QUE SIEMPRE A LLEVADO UN MODO DE VIVIR HONESTO; DECLARANDO DE IGUAL FORMA ESTAR DISPUESTO A PRESTAR SUS SERVICIOS PERSONALES COMO "TRABAJADOR" DEL "PATRON".',
//             spacing: {
//               after: 200
//             }
//           }),

//           // Declaration IV.C
//           new Paragraph({
//             text: 'C) QUE LE INTERESA PRESTAR SUS SERVICIOS DESARROLANDO LA ACTIVIDAD MENCIONADA EN DECLARACIÓN III DE ESTE INSTRUMENTO PARA EL "PATRON", EN SU DOMICILIO O BIEN DONDE SE REQUIERA QUE PRESTE EL SERVICIO PARA EL CUAL FUE CONTRATADO.',
//             spacing: {
//               after: 200
//             }
//           }),

//           // Declaration V
//           new Paragraph({
//             text: 'V.- LAS PARTES INTERVINIENTES HAN DECIDIDO CELEBRAR EL PRESENTE CONTRATO INDIVIDUAL DE TRABAJO A PRUEBA, EL CUAL SE SUJETARÁ A LAS SIGUIENTES CLAUSULAS:',
//             spacing: {
//               after: 400
//             }
//           }),

//           // Clauses Section
//           new Paragraph({
//             text: 'C L A U S U L A S:',
//             heading: HeadingLevel.HEADING_2,
//             alignment: AlignmentType.CENTER,
//             spacing: {
//               before: 400,
//               after: 200
//             }
//           }),

//           // Clause I
//           new Paragraph({
//             text: 'PRIMERA.- LAS PARTES CONTRATANTES CONVIENEN EN QUE PARA OBVIAR EN EL CURSO DEL PRESENTE, A LA PERSONA FISICA OLIVIA GONZALEZ MERCADO EN REPRESENTACION Y DUEÑA DE EL LUGAR CONOCIDO COMERCIALMENTE COMO "BIRRIERIA LA PURISIMA" A QUIEN SE LE DENOMINARA "PATRON", Y AL C.',
//             spacing: {
//               after: 200
//             }
//           }),

//           new Paragraph({
//             text: data.employeeName,
//             alignment: AlignmentType.CENTER,
//             spacing: {
//               after: 200
//             }
//           }),

//           new Paragraph({
//             text: 'SE LE denominara "EL TRABAJADOR", Y A LA LEY FEDERAL DE TRABAJO "LA LEY".',
//             spacing: {
//               after: 200
//             }
//           }),

//           // Clause II
//           new Paragraph({
//             text: 'SEGUNDA.- EL LUGAR DE LA PRESTACION DE SERVICIOS SERÁ EN: BIRRIERIA LA PURISIMA DE ESTA CIUDAD.',
//             spacing: {
//               after: 200
//             }
//           }),

//           // Clause III
//           new Paragraph({
//             text: 'TERCERA.- "EL TRABAJADOR" BAJO LA DIRECCIÓN Y ÓRDENES DEL "EL PATRON" Y SUS REPRESENTANTES PRESTARA SUS SERVICIOS PERSONALES, COMO TRABAJADOR EN EL CARGO Y PUESTO DE:',
//             spacing: {
//               after: 200
//             }
//           }),

//           new Paragraph({
//             text: data.employeePosition,
//             alignment: AlignmentType.CENTER,
//             spacing: {
//               after: 200
//             }
//           }),

//           new Paragraph({
//             text: 'ENTENDIÉNDOSE QUE SE ESTAN MENCIONANDO SOLAMENTE LAS LABORES BASICAS Y FUNDAMENTALES QUE DEBERÁ DE REALIZAR "EL TRABAJADOR" POR LO CUAL LA DESCRIPCIÓN Y ENUMERACIÓN ES EJEMPLIFICATIVA Y NO LIMITATIVA POR LO QUE TAMBIEN TENDRÁ EL DEBER DE LLEVAR ACABO TODAS AQUELLAS OTRAS LABORES SEMEJANTES, CONEXAS Y EN CUALQUIER FORMA COMPLEMENTARIA A LAS DESCRITAS.',
//             spacing: {
//               after: 200
//             }
//           }),

//           // Clause IV
//           new Paragraph({
//             text: 'CUARTA.- EL PRESENTE CONTRATO DE TRABAJO SERÁ REGIDO POR LA NUEVA LEY FEDERAL DEL TRABAJO PUBLICADA EL 30 DE NOVIEMBRE DEL 2012 EN EL DIARIO OFICIAL DE LA FEDERACION.',
//             spacing: {
//               after: 200
//             }
//           }),

//           // Clause V
//           new Paragraph({
//             text: contractType === 'trial'
//               ? `QUINTA.- POR SU PARTE "EL TRABAJADOR" MANIFIESTA QUE SUS SERVICIOS LOS PRESTARA A "EL PATRON" como fecha de INICIO EL DIA ${data.trialContractDay} DE ${data.trialContractMonth} DE ${data.trialContractYear} CON TERMINACION EL DIA ${data.trialContractDay} DE ${data.trialContractMonth} DE ${data.trialContractYear} MAS ${data.trialPeriodDays} DIAS DE PRUEBA, A PARTIR DE LA FECHA DE LA CELEBRACION DEL PRESENTE CONTRATO Y EN TALES CONDICIONES QUEDA SUJETO A SUS ORDENES Y SUBORDINACIÓN SIN PODER OCUPARSE DE OTRAS FUNCIONES ENCOMENDADAS POR PERSONAS DISTINTAS A "EL PATRON."`
//               : `QUINTA.- POR SU PARTE "EL TRABAJADOR" MANIFIESTA QUE SUS SERVICIOS LOS PRESTARA A "EL PATRON" como fecha de INICIO EL DIA ${data.timeUnitStartDay} DE ${data.timeUnitStartMonth} DE ${data.timeUnitStartYear} CON TERMINACION EL DIA ${data.timeUnitEndDay} DE ${data.timeUnitEndMonth} DE ${data.timeUnitEndYear}, A PARTIR DE LA FECHA DE LA CELEBRACION DEL PRESENTE CONTRATO Y EN TALES CONDICIONES QUEDA SUJETO A SUS ORDENES Y SUBORDINACIÓN SIN PODER OCUPARSE DE OTRAS FUNCIONES ENCOMENDADAS POR PERSONAS DISTINTAS A "EL PATRON."`,
//             spacing: {
//               after: 200
//             }
//           }),

//           // Clause VI
//           new Paragraph({
//             text: 'SEXTA.- El "PATRON" SE COMPROMETE A OTORGAR AL "TRABAJADOR" TODAS Y CADA UNA DE LAS GARANTIAS DE SEGURIDAD SOCIAL Y LAS PRESTACIONES QUE MARCA LA "LEY" EN RELACION A LA CATEGORIA Y PUESTO QUE DESEMPEÑE EL "TRABAJADOR".',
//             spacing: {
//               after: 200
//             }
//           }),

//           // Clause VII
//           new Paragraph({
//             text: contractType === 'trial'
//               ? 'SEPTIMA.- EL "PATRON", SE COMPROMETE A dar extensión de otro contrato por UNIDAD DE TIEMPO, SIEMPRE Y CUANDO HAYA DEMOSTRADO APTITUD PARA EL PUESTO QUE SE LE CONTRATO, ESTO PARA EL CASO DE QUE A JUICIO DEL "EL PATRON", "EL TRABAJADOR" SATISFAGA LOS REQUISITOS Y CONOCIMIENTOS NECESARIOS PARA DESARROLLAR LAS ACTIVIDADES del puesto ESTIPULADo EN LA CLAUSULA tercera DEL PRESENTE CONTRATO.'
//               : 'SEPTIMA.- EL "PATRON", SE COMPROMETE A dar extensión de otro contrato por UNIDAD DE TIEMPO, SIEMPRE Y CUANDO HAYA DEMOSTRADO APTITUD PARA EL PUESTO QUE SE LE CONTRATO, ESTO PARA EL CASO DE QUE A JUICIO DEL "EL PATRON", "EL TRABAJADOR" SATISFAGA LOS REQUISITOS Y CONOCIMIENTOS NECESARIOS PARA DESARROLLAR LAS ACTIVIDADES del puesto ESTIPULADo EN LA CLAUSULA tercera DEL PRESENTE CONTRATO.',
//             spacing: {
//               after: 200
//             }
//           }),

//           // Clause VIII
//           new Paragraph({
//             text: `OCTAVA.- EL SUELDO INTEGRADO QUE PERCIBIRÁ "EL TRABAJADOR" SERÁ EL DE: $${data.dailySalary} M.N. DIARIOS. ESTE SALARIO SERA DEPOSITADO LIQUIDADO A "EL TRABAJADOR" EN UNA CUENTA BANCARIA DEL BANCO DENOMINADO ${data.bankName}, A NOMBRE DE "EL TRABAJADOR", LOS DIAS ${data.paymentDay} CONJUNTAMENTE CON CUALQUIERA OTRA PRESTACION COMPLEMENTARIA QUE PUDIERA CORRESPONDERLE, ESTANDO OBLIGADO "EL TRABAJADOR" A FIRMAR LA CORRESPONDIENTE NOMINA O RECIBO DE PAGO RESPECTIVO.`,
//             spacing: {
//               after: 200
//             }
//           }),

//           // Clause IX
//           new Paragraph({
//             text: `NOVENA.- LA DURACIÓN DIARIA DE LAS DISTINTAS JORNADAS DE TRABAJO EN QUE LE TOQUE LABORAR A "EL TRABAJADOR" SERÁN LAS MÁXIMAS FIJADAS POR "LA LEY" COMO JORNADA DIURNA, NOCTURNA Y MIXTA. EL HORARIO CORRESPONDIENTE PARA LA PRESTACION DE LOS SERVICIOS, ASÍ COMO LAS HORAS DE ENTRADA Y SALIDA SERÁN FIJADAS POR "EL PATRON" PODRÁN VARIARSE DISCRECIONALMENTE, ESTANDO SUJETAS A LAS NECESIDADES DERIVADAS DEL DESARROLLO DE SUS ACTIVIDADES Y LOS TRABAJOS CONTRATADOS SEGÚN LA EPOCA Y EL AÑO. CONSECUENTEMENTE "EL TRABAJADOR" PODRÁ CAMBIADO DISCRECIONALMENTE POR "EL PATRON" PARA QUE ELABORE EN CUALQUIERA DE LOS SIGUIENTES TURNOS, DIURNOS, NOCTURNO O MIXTO QUE TENGA ESTABLECIDO, SEGÚN LO PERMITAN Y REQUIERAN LAS NECESIDADES DE LAS LABORES EN EL ENTENDIMIENTO DE QUE ESTAS MODALIDADES TENDRÁN EXCLUSIVAMENTE EL CARÁCTER DE TEMPORALES, POR LO MISMO SERAN MODIFICABLES EN TODO EL TIEMPO. HASTA EN TANTO LA EMPRESA NO NOTIFIQUE PRECISAMENTE PO ESCRITO UN DISTINTO HORARIO DE LABORES "EL TRABAJADOR" SE SUJETARA AL SIGUIENTE DE LAS: ${data.workStartTime} A LAS: ${data.workEndTime} HORAS POR CUALQUIER CAMBIO DE TURNO O DE HORARIO DE LABORES "EL PATRON" LO DEBERÁ DE NOTIFICAR A "EL TRABAJADOR" CON UNA ANTICIPACIÓN MINIMA DE CUARENTA Y OCHO HORAS.`,
//             spacing: {
//               after: 200
//             }
//           }),

//           // Clause X
//           new Paragraph({
//             text: 'DECIMA.- "EL TRABAJADOR" UNICAMENTE PODRÁ LABORAR TIEMPO EXTRAORDINARIO CUANDO "EL PATRON" SE LO INDIQUE AUNQUE NO MEDIE ORDEN POR ESCRITO DEBIDAMENTE AUTORIZADA POR LA PERSONA COMPETENTE PARA TAL EFECTO Y SERAN PAGADERAS CONFORME MARCA "LA LEY".',
//             spacing: {
//               after: 200
//             }
//           }),

//           // Clause XI
//           new Paragraph({
//             text: `DECIMA PRIMERA.- "EL TRABAJADOR" PRESTARA SUS SERVICIOS A "EL PATRON" DE ${data.workingDays.join(' A ')} DE CADA SEMANA Y EN RAZON DEL MISMO SE LE OTORGARA EL PAGO CORRESPONDIENTE. POR LO QUE "EL TRABAJADOR" GOZARÁ COMO DESCANSO EL DIA ${data.restDay} DE CADA SEMANA. TAMBIEN DISFRUTARÁ "EL TRABAJADOR" DE LOS DIAS DE DESCANSO OBLIGATORIOS QUE MARCA EL ARTICULO 74 DE "LA LEY" CON EL FIN DE QUE SE LE OTORGUE EL DESCANSO A "EL TRABAJADOR".`,
//             spacing: {
//               after: 200
//             }
//           }),

//           // Clause XII
//           new Paragraph({
//             text: 'DECIMA SEGUNDA.- AMBAS PARTES SE OBLIGAN A CUMPLIR CON LOS PLANES Y PROGRAMAS DE CAPACITACION Y ADIESTRAMIENTO QUE SE LE ESTABLEZCAN POR PARTE DE "EL PATRON" EN CUMPLIMIENTO A LOS PLANES Y PROGRAMAS QUE SE FORMULEN DE ACUERDO A LO QUE ESTABLECE "LA LEY" A SI MISMO A DAR CUMPLIMIENTO A LOS MISMOS.',
//             spacing: {
//               after: 200
//             }
//           }),

//           // Clause XIII
//           new Paragraph({
//             text: 'DECIMA TERCERA.- CUANDO "EL TRABAJADOR" SE VEA EN LA NECESIDAD DE FALTAR A SUS LABORES POR CUALQUIER CIRCUNSTANCIA MOTIVO A RAZON, ANTICIPADAMENTE DEBERA DE PONERLO EN CONOCIMIENTO DE "EL PATRON" SOLO EN CASO DE QUE LE SEA METERIALMENTE IMPOSIBLE HACERLO EN FORMA PERSONAL, DEBERÁ DAR AVISO POR CONDUCTO DE ALGÚN FAMILIAR, COMPAÑERO DE TRABAJO A CUALQUIER OTRA PERSONA MEDIANTE NOTA POR ESCRITO ELABORADA Y FIRMADA POR EL MISMO. DICHO AVISO NO SERÁ JUSTIFICATIVO DE LA FALTA DE TRABAJO, PUES EN TODOS LOS CASOS "EL TRABAJADOR" DEBERÁ DE JUSTIFICAR SU AUSENCIA PRECISAMENTE AL REGRESAR DE SU REINCIDENCIA.',
//             spacing: {
//               after: 200
//             }
//           }),

//           // Clause XIV
//           new Paragraph({
//             text: 'DECIMA CUARTA.- CUANDO EL "TRABAJADOR" NO SE PRESENTE PUNTUALMENTE A SU TRABAJO, SIENDO SU RETARDO DE QUINCE (15) MINUTOS O MAYOR, YA NO ESTA ADMITIDO POR ESE DIA CONSIDERÁNDOSELE COMO FALTA INJUSTIFICADA A SUS LABORES PARA TODOS LO EFECTOS LEGALES. EN CASO DE QUE SU RETRASO SEA INFERIOR A DICHOS QUINCE (15) MINUTOS, SE LES DESCONTARÁ LA PARTE PROPORCIONAL QUE CORRESPONDE A SU SALARIO Y SE HARÁ ACREEDOR A UNA SANCION DISCIPLINARIA DE SUSPENSIÓN EN SU TRABAJO DE UNO (1) A DOS (2) DIAS, SEGÚN EL NUMERO DE RETARDOS QUE TENGA CADA SEMANA Y SU REINCIDENCIA.',
//             spacing: {
//               after: 200
//             }
//           }),

//           // Clause XV
//           new Paragraph({
//             text: contractType === 'trial'
//               ? 'DECIMA QUINTA.- LAS PARTES CONVIENEN QUE "EL PATRON" AL TERMINO DEL presente contrato A PRUEBA EN LA CLAUSULA SEPTIMA DEL PRESENTE CONTRATO, PODRA DAR POR TERMINADA LA RELACION DE TRABAJO, SIN RESPONSABILIDAD PARA "EL PATRON", SI A JUICIO DE ESTE ULTIMO, "EL TRABAJADOR" NO LLEGUE SATISFACER LOS REQUISITOS del puesto ESTIPULADo EN LA CLAUSULA tercerA DEL PRESENTE CONTRATO.'
//               : 'DECIMA QUINTA.- LAS PARTES CONVIENEN QUE "EL PATRON" AL TERMINO DEL presente contrato POR UNIDAD DE TIEMPO EN LA CLAUSULA SEPTIMA DEL PRESENTE CONTRATO, PODRA DAR POR TERMINADA LA RELACION DE TRABAJO, SIN RESPONSABILIDAD PARA "EL PATRON", SI A JUICIO DE ESTE ULTIMO, "EL TRABAJADOR" NO LLEGUE SATISFACER LOS REQUISITOS del puesto ESTIPULADo EN LA CLAUSULA tercerA DEL PRESENTE CONTRATO.',
//             spacing: {
//               after: 200
//             }
//           }),

//           // Clause XVI
//           new Paragraph({
//             text: 'DECIMA SEXTA.- "LAS PARTES" CONVIENEN EN QUE, EN TODO LO ESTIPULADO EN EL PRESENTE CONTRATO SE ESTARÁ EN LO DISPUESTO EN "LA LEY".',
//             spacing: {
//               after: 400
//             }
//           }),

//           // Final Statement
//           new Paragraph({
//             text: contractType === 'trial'
//               ? `LEIDO QUE FUE EL PRESENTE CONTRATO POR LAS PARTES Y ENTERADOS DE SU ALCANCE Y FUERZA LEGAL, LO FIRMAN EN LA CIUDAD DE HERMOSILLO, A Los ${data.trialContractDay} DIAS DEL MES DE ${data.trialContractMonth} DEL AÑO ${data.trialContractYear} ANTE LA PRESENCIA DE LOS TESTIGOS QUE DAN FE A SU LEGALIDAD, QUEDANDO UN EJEMPLAR EN PODER DE CADA UNA DE LAS PARTES.`
//               : `LEIDO QUE FUE EL PRESENTE CONTRATO POR LAS PARTES Y ENTERADOS DE SU ALCANCE Y FUERZA LEGAL, LO FIRMAN EN LA CIUDAD DE HERMOSILLO, A Los ${data.timeUnitStartDay} DIAS DEL MES DE ${data.timeUnitStartMonth} DEL AÑO ${data.timeUnitStartYear} ANTE LA PRESENCIA DE LOS TESTIGOS QUE DAN FE A SU LEGALIDAD, QUEDANDO UN EJEMPLAR EN PODER DE CADA UNA DE LAS PARTES.`,
//             spacing: {
//               before: 400,
//               after: 400
//             }
//           }),

//           // Signatures
//           new Paragraph({
//             children: [
//               new TextRun({
//                 text: '__________________________',
//                 bold: true
//               }),
//               new TextRun({
//                 text: '                                 ',
//               }),
//               new TextRun({
//                 text: '______________________________',
//                 bold: true
//               })
//             ],
//             spacing: {
//               after: 200
//             }
//           }),

//           new Paragraph({
//             children: [
//               new TextRun({
//                 text: '"EL TRABAJADOR"',
//                 bold: true
//               }),
//               new TextRun({
//                 text: '                                                                 ',
//               }),
//               new TextRun({
//                 text: '"EL PATRON"',
//                 bold: true
//               })
//             ],
//             spacing: {
//               after: 400
//             }
//           }),

//           new Paragraph({
//             children: [
//               new TextRun({
//                 text: '__________________________',
//                 bold: true
//               }),
//               new TextRun({
//                 text: '                                ',
//               }),
//               new TextRun({
//                 text: '______________________________',
//                 bold: true
//               })
//             ],
//             spacing: {
//               after: 200
//             }
//           }),

//           new Paragraph({
//             children: [
//               new TextRun({
//                 text: 'TESTIGO',
//                 bold: true
//               }),
//               new TextRun({
//                 text: '                                                                           ',
//               }),
//               new TextRun({
//                 text: 'TESTIGO',
//                 bold: true
//               })
//             ]
//           })
//         ]
//       }]
//     });

//     console.log('Document created, generating blob...');
//     const blob = await Packer.toBlob(doc);
//     console.log('Blob generated, saving file...');
    
//     const fileName = `Contrato_${data.employeeName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
//     saveAs(blob, fileName);
//     console.log('File saved successfully');
//   } catch (error) {
//     console.error('Error generating contract:', error);
//     throw error;
//   }
// }; 