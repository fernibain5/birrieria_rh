import type { FormStep } from '../types/contract';

export const voluntaryQuittingFormSteps: FormStep[] = [
  {
    title: 'Información General',
    description: 'Datos del trabajador para la carta de renuncia',
    fields: [
      {
        name: 'employeeName',
        label: 'Nombre completo del trabajador',
        type: 'text',
        required: true,
        placeholder: 'Ej: Juan Pérez García'
      },
      {
        name: 'position',
        label: 'Puesto de trabajo',
        type: 'text',
        required: true,
        placeholder: 'Ej: Mesero, Cocinero, Cajero'
      },
      {
        name: 'voluntaryQuittingDate',
        label: 'Fecha de la renuncia',
        type: 'date',
        required: true
      }
    ]
  }
];
