import type { FormStep } from '../types/contract';

export const finiquitoFormSteps: FormStep[] = [
  {
    title: 'Información del Finiquito',
    description: 'Datos necesarios para la carta de finiquito',
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
        name: 'finiquitoAmount',
        label: 'Cantidad del finiquito (en pesos)',
        type: 'number',
        required: true,
        placeholder: 'Ej: 5000'
      },
      {
        name: 'finiquitoDate',
        label: 'Fecha del finiquito',
        type: 'date',
        required: true
      }
    ]
  }
];
