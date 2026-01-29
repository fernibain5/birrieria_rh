import { FormStep } from '../types/contract';
import {
  MONTHS,
  DAYS,
  YEARS,
  WORKING_DAYS,
  REST_DAYS,
  PAYMENT_DAYS,
  BANKS,
  CIVIL_STATUS,
  OWNER_OPTIONS,
  BRANCH_OPTIONS,
  PAYMENT_METHODS
} from './formConstants';

export const trialFormSteps: FormStep[] = [
  {
    title: 'Información del Contrato',
    description: 'Seleccione el propietario, sucursal e ingrese la fecha de inicio del contrato de prueba',
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
        name: 'timeUnitStartDate',
        label: 'Fecha de Inicio',
        type: 'date',
        required: true
      },
      {
        name: 'trialPeriodDays',
        label: 'Días de Prueba',
        type: 'text',
        required: true,
        placeholder: 'Ingrese el número de días de prueba'
      }
    ]
  },
  {
    title: 'Información del Empleado',
    description: 'Ingrese los datos personales del empleado',
    fields: [
      {
        name: 'employeeName',
        label: 'Nombre Completo',
        type: 'text',
        required: true,
        placeholder: 'Ingrese el nombre completo del empleado'
      },
      {
        name: 'employeeNationality',
        label: 'Nacionalidad',
        type: 'text',
        required: true,
        placeholder: 'Ingrese la nacionalidad del empleado'
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
        placeholder: 'Ingrese la dirección del empleado'
      }
    ]
  },
  {
    title: 'Detalles del Puesto',
    description: 'Ingrese la información del puesto y actividades del empleado',
    fields: [
      {
        name: 'employeePosition',
        label: 'Puesto',
        type: 'text',
        required: true,
        placeholder: 'Ingrese el puesto del empleado'
      },
      {
        name: 'employeeActivities',
        label: 'Actividades',
        type: 'textarea',
        required: true,
        placeholder: 'Ingrese las actividades del empleado'
      },
      {
        name: 'dailySalary',
        label: 'Salario Diario',
        type: 'text',
        required: true,
        placeholder: 'Ingrese el salario diario'
      }
    ]
  },
  {
    title: 'Horario y Días de Trabajo',
    description: 'Configure el horario y los días de trabajo del empleado',
    fields: [
      {
        name: 'workStartTime',
        label: 'Hora de Entrada',
        type: 'time',
        required: true
      },
      {
        name: 'workEndTime',
        label: 'Hora de Salida',
        type: 'time',
        required: true
      },
      {
        name: 'workingDays',
        label: 'Días de Trabajo',
        type: 'text',
        required: true,
      },
      {
        name: 'restDay',
        label: 'Día de Descanso',
        type: 'select',
        required: true,
        options: REST_DAYS
      }
    ]
  },
 {
     title: 'Información de Pago',
     description: 'Configure el método de pago del empleado',
     fields: [
       {
         name: 'paymentMethod',
         label: 'Método de Pago',
         type: 'select',
         required: true,
         options: PAYMENT_METHODS,
         defaultValue: 'EFECTIVO'
       },
       {
         name: 'bankName',
         label: 'Banco',
         type: 'select',
         required: false,
         options: BANKS,
         conditionalField: {
           dependsOn: 'paymentMethod',
           showWhen: 'TRANSFERENCIA'
         }
       },
       {
         name: 'paymentDay',
         label: 'Día de Pago',
         type: 'select',
         required: true,
         options: PAYMENT_DAYS
       }
     ]
   }
]; 