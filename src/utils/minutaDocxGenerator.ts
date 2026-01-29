import { Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, TableLayoutType, ImageRun } from 'docx';
import { saveAs } from 'file-saver';

export interface AreaDetail {
  area: string;
  planteamiento: string;
  seguimiento: string;
  fechaCompromiso: string;
  encargadoUid: string;
  encargadoName?: string;
}

export interface MinutaGeneralInfo {
  date: string;
  startTime: string;
  endTime: string;
  lugar: string;
  evento: string;
}

export interface MinutaAttendee {
  uid: string;
  displayName?: string;
  email?: string;
}

// Helper function to fetch image as buffer
async function fetchImageBuffer(imagePath: string): Promise<ArrayBuffer> {
  try {
    const response = await fetch(imagePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    return await response.arrayBuffer();
  } catch (error) {
    console.error('Error fetching image:', error);
    throw error;
  }
}

export async function generateMinutaDocx({
  generalInfo,
  areas,
  attendees,
}: {
  generalInfo: MinutaGeneralInfo;
  areas: AreaDetail[];
  attendees: MinutaAttendee[];
}) {
  // Fetch the logo image
  let logoBuffer: ArrayBuffer | undefined;
  try {
    logoBuffer = await fetchImageBuffer('/images/logo_birrieria.jpg');
  } catch (error) {
    console.warn('Could not load logo image:', error);
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: [
          // Header with logo and company name
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      ...(logoBuffer ? [
                        new Paragraph({
                          children: [
                            new ImageRun({
                              data: logoBuffer,
                              transformation: {
                                width: 80,
                                height: 80,
                              },
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        })
                      ] : []),
                    ],
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                    verticalAlign: 'center',
                  }),
                  // new TableCell({
                  //   children: [
                  //     new Paragraph({
                  //       children: [
                  //         new TextRun({
                  //           text: 'BIRRIERÍA',
                  //           bold: true,
                  //           size: 24,
                  //         }),
                  //       ],
                  //       alignment: AlignmentType.LEFT,
                  //       spacing: { after: 0 },
                  //     }),
                  //     new Paragraph({
                  //       children: [
                  //         new TextRun({
                  //           text: 'LA PURÍSIMA',
                  //           bold: true,
                  //           size: 24,
                  //         }),
                  //       ],
                  //       alignment: AlignmentType.LEFT,
                  //       spacing: { after: 0 },
                  //     }),
                  //   ],
                  //   width: { size: 80, type: WidthType.PERCENTAGE },
                  //   borders: {
                  //     top: { style: BorderStyle.NONE },
                  //     bottom: { style: BorderStyle.NONE },
                  //     left: { style: BorderStyle.NONE },
                  //     right: { style: BorderStyle.NONE },
                  //   },
                  //   verticalAlign: 'center',
                  // }),
                ],
              }),
            ],
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
          }),
          
          // Center titles
          new Paragraph({
            children: [
              new TextRun({
                text: 'Sistema de Gestión de Calidad',
                bold: true,
                size: 20,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Minuta de reunión',
                bold: true,
                size: 18,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          }),
          // Form fields section
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Fecha:', bold: true }),
                          new TextRun({ text: `\t\t${generalInfo.date || ''}` }),
                        ],
                      }),
                    ],
                    width: { size: 60, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Inició:', bold: true }),
                          new TextRun({ text: `\t\t${generalInfo.startTime || ''}` }),
                        ],
                      }),
                    ],
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Terminó:', bold: true }),
                          new TextRun({ text: `\t\t${generalInfo.endTime || ''}` }),
                        ],
                      }),
                    ],
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Lugar:', bold: true }),
                          new TextRun({ text: `\t\t${generalInfo.lugar || ''}` }),
                        ],
                      }),
                    ],
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                    columnSpan: 3,
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Evento:', bold: true }),
                          new TextRun({ text: `\t\t${generalInfo.evento || ''}` }),
                        ],
                      }),
                    ],
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                    columnSpan: 3,
                  }),
                ],
              }),
            ],
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
          }),

          // "Asuntos a tratar" section
          new Paragraph({
            children: [
              new TextRun({ text: 'Asuntos a tratar:', bold: true }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          
          // Empty box for "Asuntos a tratar"
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ text: '' }),
                      new Paragraph({ text: '' }),
                      new Paragraph({ text: '' }),
                    ],
                    width: { size: 100, type: WidthType.PERCENTAGE },
                  }),
                ],
                height: { value: 1200, rule: 'atLeast' },
              }),
            ],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
              left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
              right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
            },
          }),
          // Main table with proper styling
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            rows: [
              new TableRow({
                tableHeader: true,
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ 
                        children: [new TextRun({ text: 'No.', bold: true, size: 20 })], 
                        alignment: AlignmentType.CENTER 
                      })
                    ],
                    width: { size: 6, type: WidthType.PERCENTAGE },
                    shading: { fill: 'FFA500' }, // Orange background like in the image
                    verticalAlign: 'center',
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ 
                        children: [new TextRun({ text: 'Área', bold: true, size: 20 })], 
                        alignment: AlignmentType.CENTER 
                      })
                    ],
                    width: { size: 15, type: WidthType.PERCENTAGE },
                    shading: { fill: 'FFA500' },
                    verticalAlign: 'center',
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ 
                        children: [new TextRun({ text: 'Planteamiento o problemática', bold: true, size: 20 })], 
                        alignment: AlignmentType.CENTER 
                      })
                    ],
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    shading: { fill: 'FFA500' },
                    verticalAlign: 'center',
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ 
                        children: [new TextRun({ text: 'Seguimiento o actividades por realizar', bold: true, size: 20 })], 
                        alignment: AlignmentType.CENTER 
                      })
                    ],
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    shading: { fill: 'FFA500' },
                    verticalAlign: 'center',
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ 
                        children: [new TextRun({ text: 'Fecha compromiso', bold: true, size: 20 })], 
                        alignment: AlignmentType.CENTER 
                      })
                    ],
                    width: { size: 19, type: WidthType.PERCENTAGE },
                    shading: { fill: 'FFA500' },
                    verticalAlign: 'center',
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ 
                        children: [new TextRun({ text: 'Responsable / firma', bold: true, size: 20 })], 
                        alignment: AlignmentType.CENTER 
                      })
                    ],
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    shading: { fill: 'FFA500' },
                    verticalAlign: 'center',
                  }),
                ],
                height: { value: 800, rule: 'atLeast' },
              }),
              // Area rows
              ...areas.map((area, idx) =>
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({ 
                          children: [new TextRun({ text: String(idx + 1), size: 20 })], 
                          alignment: AlignmentType.CENTER 
                        })
                      ],
                      verticalAlign: 'center',
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({ 
                          text: area.area, 
                          alignment: AlignmentType.CENTER,
                          spacing: { before: 100, after: 100 }
                        })
                      ],
                      verticalAlign: 'center',
                      margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({ 
                          text: area.planteamiento, 
                          alignment: AlignmentType.LEFT,
                          spacing: { before: 100, after: 100 }
                        })
                      ],
                      verticalAlign: 'top',
                      margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({ 
                          text: area.seguimiento, 
                          alignment: AlignmentType.LEFT,
                          spacing: { before: 100, after: 100 }
                        })
                      ],
                      verticalAlign: 'top',
                      margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({ 
                          text: area.fechaCompromiso, 
                          alignment: AlignmentType.CENTER,
                          spacing: { before: 100, after: 100 }
                        })
                      ],
                      verticalAlign: 'center',
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({ 
                          text: area.encargadoName || '', 
                          alignment: AlignmentType.CENTER,
                          spacing: { before: 100, after: 100 }
                        })
                      ],
                      verticalAlign: 'center',
                    }),
                  ],
                  height: { value: 1000, rule: 'atLeast' }, // Increased height for better spacing
                })
              ),
              // Add empty rows if there are fewer than 6 items (to match template)
              ...Array.from({ length: Math.max(0, 6 - areas.length) }, () =>
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: '' })],
                      verticalAlign: 'center',
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: '' })],
                      verticalAlign: 'center',
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: '' })],
                      verticalAlign: 'center',
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: '' })],
                      verticalAlign: 'center',
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: '' })],
                      verticalAlign: 'center',
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: '' })],
                      verticalAlign: 'center',
                    }),
                  ],
                  height: { value: 1000, rule: 'atLeast' },
                })
              ),
            ],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              bottom: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              left: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              right: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
            },
          }),

          // Version info at bottom right
          new Paragraph({
            children: [
              new TextRun({ 
                text: 'Ver. 1, 30/09/2016',
                size: 16,
                italics: true
              }),
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 400 },
          }),

          // Attendees section (moved to end)
          new Paragraph({
            children: [
              new TextRun({ text: 'Asistentes:', bold: true }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          ...attendees.map((a, i) =>
            new Paragraph({
              text: `${i + 1}. ${a.displayName || a.email || a.uid}`,
            })
          ),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `Minuta_${generalInfo.date || ''}.docx`;
  saveAs(blob, fileName);
} 