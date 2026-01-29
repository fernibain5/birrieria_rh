import { FormStep } from '../types/contract';
import { OWNER_OPTIONS, BRANCH_OPTIONS } from './formConstants';

export const confidentialityFormSteps: FormStep[] = [
  {
    title: 'Convenio de Confidencialidad',
    description: 'Ingrese la información básica para el convenio de confidencialidad',
    fields: [
      {
        name: 'ownerKey',
        label: 'Seleccionar Propietario',
        type: 'select',
        required: true,
        options: OWNER_OPTIONS
      },
      {
        name: 'branchKey',
        label: 'Seleccionar Sucursal',
        type: 'select',
        required: true,
        options: BRANCH_OPTIONS
      },
      {
        name: 'employeeName',
        label: 'Nombre Completo del Empleado',
        type: 'text',
        required: true
      },
      {
        name: 'confidentialityDate',
        label: 'Fecha del Convenio',
        type: 'date',
        required: true,
        placeholder: 'Seleccione la fecha del convenio'
      }
    ]
  }
];
