import { Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, TableLayoutType, ImageRun } from 'docx';
import { saveAs } from 'file-saver';

export interface AttendanceInfo {
  startTime: string;
  endTime: string;
  evento: string;
  date: string;
}

export interface AttendanceEmployee {
  uid: string;
  displayName?: string;
  email?: string;
  area?: string;
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

export async function generateAttendanceListDocx({
  attendanceInfo,
  employees,
}: {
  attendanceInfo: AttendanceInfo;
  employees: AttendanceEmployee[];
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
                  new TableCell({
                    children: [
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
                            text: 'Lista de asistencia',
                            bold: true,
                            size: 18,
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 0 },
                      }),
                    ],
                    width: { size: 80, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                    verticalAlign: 'center',
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

          // Spacing
          new Paragraph({
            text: '',
            spacing: { after: 300 },
          }),

          // Form fields section - Times on the right
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ text: '' }),
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
                          new TextRun({ text: 'Hora de inicio: ', bold: true }),
                          new TextRun({ text: `${attendanceInfo.startTime || '_'.repeat(20)}` }),
                        ],
                      }),
                    ],
                    width: { size: 40, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
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
                      new Paragraph({ text: '' }),
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
                          new TextRun({ text: 'Hora de término: ', bold: true }),
                          new TextRun({ text: `${attendanceInfo.endTime || '_'.repeat(20)}` }),
                        ],
                        spacing: { before: 100 },
                      }),
                    ],
                    width: { size: 40, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
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

          // Event and Date fields
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Evento: ', bold: true }),
                          new TextRun({ text: `${attendanceInfo.evento || '_'.repeat(80)}` }),
                        ],
                      }),
                    ],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Fecha: ', bold: true }),
                          new TextRun({ text: `${attendanceInfo.date || '_'.repeat(15)}` }),
                        ],
                      }),
                    ],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
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

          // Spacing before main table
          new Paragraph({
            text: '',
            spacing: { after: 400 },
          }),

          // Main attendance table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            rows: [
              // Header row
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
                    width: { size: 8, type: WidthType.PERCENTAGE },
                    shading: { fill: 'FFA500' }, // Orange background
                    verticalAlign: 'center',
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ 
                        children: [new TextRun({ text: 'Nombre', bold: true, size: 20 })], 
                        alignment: AlignmentType.CENTER 
                      })
                    ],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    shading: { fill: 'FFA500' },
                    verticalAlign: 'center',
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ 
                        children: [new TextRun({ text: 'Área', bold: true, size: 20 })], 
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
                        children: [new TextRun({ text: 'Correo electrónico', bold: true, size: 20 })], 
                        alignment: AlignmentType.CENTER 
                      })
                    ],
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    shading: { fill: 'FFA500' },
                    verticalAlign: 'center',
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ 
                        children: [new TextRun({ text: 'Firma', bold: true, size: 20 })], 
                        alignment: AlignmentType.CENTER 
                      })
                    ],
                    width: { size: 17, type: WidthType.PERCENTAGE },
                    shading: { fill: 'FFA500' },
                    verticalAlign: 'center',
                  }),
                ],
                height: { value: 800, rule: 'atLeast' },
              }),
              // Employee rows
              ...employees.map((employee, idx) =>
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
                          text: employee.displayName || '', 
                          alignment: AlignmentType.LEFT,
                          spacing: { before: 100, after: 100 }
                        })
                      ],
                      verticalAlign: 'center',
                      margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({ 
                          text: employee.area || '', 
                          alignment: AlignmentType.LEFT,
                          spacing: { before: 100, after: 100 }
                        })
                      ],
                      verticalAlign: 'center',
                      margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({ 
                          text: employee.email || '', 
                          alignment: AlignmentType.LEFT,
                          spacing: { before: 100, after: 100 }
                        })
                      ],
                      verticalAlign: 'center',
                      margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({ 
                          text: '', // Empty for signature
                          alignment: AlignmentType.CENTER,
                          spacing: { before: 100, after: 100 }
                        })
                      ],
                      verticalAlign: 'center',
                    }),
                  ],
                  height: { value: 1000, rule: 'atLeast' },
                })
              ),
              // Add empty rows to ensure at least 15 rows total
              ...Array.from({ length: Math.max(0, 15 - employees.length) }, (_, idx) =>
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({ 
                          children: [new TextRun({ text: String(employees.length + idx + 1), size: 20 })], 
                          alignment: AlignmentType.CENTER 
                        })
                      ],
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
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `Lista_Asistencia_${attendanceInfo.date || 'Sin_Fecha'}.docx`;
  saveAs(blob, fileName);
}
