import { FormStep } from '../types/contract';
import { CIVIL_STATUS, MONTHS, DAYS, YEARS, REST_DAYS } from './formConstants';

export const formSteps: FormStep[] = [
  {
    title: 'Información del Empleado',
    description: 'Ingrese los datos personales del trabajador',
    fields: [
      {
        name: 'employeeName',
        label: 'Nombre Completo',
        type: 'text',
        required: true,
        placeholder: 'Nombre y apellidos del trabajador'
      },
      {
        name: 'employeeId',
        label: 'DNI',
        type: 'text',
        required: true,
        placeholder: 'Número de identificación'
      },
      {
        name: 'employeeNationality',
        label: 'Nacionalidad',
        type: 'text',
        required: true,
        placeholder: 'Nacionalidad del trabajador'
      },
      {
        name: 'employeeCivilStatus',
        label: 'Estado Civil',
        type: 'select',
        required: true,
        options: CIVIL_STATUS
      },
      {
        name: 'employeeAddress',
        label: 'Dirección',
        type: 'text',
        required: true,
        placeholder: 'Dirección completa'
      },
      {
        name: 'employeePhone',
        label: 'Teléfono',
        type: 'text',
        required: true,
        placeholder: 'Número de teléfono'
      }
    ]
  },
  {
    title: 'Detalles del Contrato',
    description: 'Especifique los términos del contrato',
    fields: [
      {
        name: 'employeePosition',
        label: 'Puesto',
        type: 'text',
        required: true,
        placeholder: 'Cargo o puesto a desempeñar'
      },
      {
        name: 'dailySalary',
        label: 'Salario Diario',
        type: 'text',
        required: true,
        placeholder: 'Monto en pesos mexicanos'
      },
      {
        name: 'employeeActivities',
        label: 'Actividades Adicionales',
        type: 'textarea',
        required: false,
        placeholder: 'Descripción de actividades específicas del puesto'
      }
    ]
  },
  {
    title: 'Horario y Condiciones',
    description: 'Defina el horario y condiciones de trabajo',
    fields: [
      {
        name: 'workingDays',
        label: 'Días de Trabajo',
        type: 'text',
        required: true,
        placeholder: 'Ej: LUNES A VIERNES'
      },
      {
        name: 'restDay',
        label: 'Día de Descanso',
        type: 'select',
        required: true,
        options: REST_DAYS
      },
      {
        name: 'workStartTime',
        label: 'Hora de Entrada',
        type: 'text',
        required: true,
        placeholder: 'Ej: 08:00'
      },
      {
        name: 'workEndTime',
        label: 'Hora de Salida',
        type: 'text',
        required: true,
        placeholder: 'Ej: 17:00'
      }
    ]
  },
  {
    title: 'Información Bancaria',
    description: 'Detalles de pago y cuenta bancaria',
    fields: [
      {
        name: 'bankName',
        label: 'Nombre del Banco',
        type: 'text',
        required: true,
        placeholder: 'Nombre de la institución bancaria'
      },
      {
        name: 'paymentDay',
        label: 'Día de Pago',
        type: 'text',
        required: true,
        placeholder: 'Ej: 15 Y 30 DE CADA MES'
      }
    ]
  },
  {
    title: 'Fecha del Contrato',
    description: 'Especifique la fecha de firma del contrato',
    fields: [
      {
        name: 'trialContractDay',
        label: 'Día',
        type: 'select',
        required: true,
        options: DAYS
      },
      {
        name: 'trialContractMonth',
        label: 'Mes',
        type: 'select',
        required: true,
        options: MONTHS
      },
      {
        name: 'trialContractYear',
        label: 'Año',
        type: 'select',
        required: true,
        options: YEARS
      }
    ]
  }
]; 