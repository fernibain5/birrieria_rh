import { FormStep } from '../types/contract';
import { MONTHS, DAYS, YEARS, WORKING_DAYS, REST_DAYS, PAYMENT_DAYS, BANKS, CIVIL_STATUS, OWNER_OPTIONS, BRANCH_OPTIONS, PAYMENT_METHODS } from './formConstants';

export const indefiniteFormSteps: FormStep[] = [
  {
    title: 'Información del Contrato',
    description: 'Ingrese la fecha de inicio del contrato',
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
        name: 'indefiniteStartDate',
        label: 'Fecha de Inicio',
        type: 'date',
        required: true,
        placeholder: 'Seleccione la fecha de inicio del contrato'
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
        required: true
      },
      {
        name: 'employeeNationality',
        label: 'Nacionalidad',
        type: 'text',
        required: true
      },
      {
        name: 'employeeCivilStatus',
        label: 'Estado Civil',
        type: 'select',
        options: CIVIL_STATUS,
        required: true
      },
      {
        name: 'employeeAddress',
        label: 'Domicilio',
        type: 'text',
        required: true
      }
    ]
  },
  {
    title: 'Detalles del Puesto',
    description: 'Ingrese los detalles del puesto y actividades',
    fields: [
      {
        name: 'employeePosition',
        label: 'Puesto',
        type: 'text',
        required: true
      },
      {
        name: 'employeeActivities',
        label: 'Actividades',
        type: 'textarea',
        required: true
      },
      {
        name: 'dailySalary',
        label: 'Salario Diario',
        type: 'text',
        required: true
      }
    ]
  },
  {
    title: 'Horario y Días de Trabajo',
    description: 'Configure el horario y días de trabajo',
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
        required: true
      },
      {
        name: 'restDay',
        label: 'Día de Descanso',
        type: 'select',
        options: REST_DAYS,
        required: true
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