import { FormStep } from '../types/contract';

export const formSteps: FormStep[] = [
  {
    id: 1,
    title: "Información de la Empresa",
    description: "Datos del empleador y representante legal",
    fields: ['companyName', 'companyAddress', 'companyCity', 'companyRut', 'legalRepresentative', 'legalRepRut']
  },
  {
    id: 2,
    title: "Datos del Trabajador",
    description: "Información personal del empleado",
    fields: ['employeeName', 'employeeRut', 'employeeNationality', 'employeeCivilStatus', 'employeeProfession', 'employeeAddress', 'employeeCity', 'employeePhone', 'employeeEmail']
  },
  {
    id: 3,
    title: "Detalles del Contrato",
    description: "Información del puesto y condiciones laborales",
    fields: ['contractDate', 'startDate', 'trialPeriod', 'position', 'department', 'workplace', 'workingHours', 'workSchedule']
  },
  {
    id: 4,
    title: "Remuneración y Beneficios",
    description: "Salario, forma de pago y beneficios adicionales",
    fields: ['baseSalary', 'paymentFrequency', 'paymentMethod', 'benefits', 'vacationDays']
  },
  {
    id: 5,
    title: "Cláusulas Adicionales",
    description: "Términos y condiciones especiales",
    fields: ['additionalClauses']
  }
];