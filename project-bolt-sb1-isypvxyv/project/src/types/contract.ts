export interface ContractData {
  // Empresa/Empleador
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyRut: string;
  legalRepresentative: string;
  legalRepRut: string;
  
  // Trabajador
  employeeName: string;
  employeeRut: string;
  employeeNationality: string;
  employeeCivilStatus: string;
  employeeProfession: string;
  employeeAddress: string;
  employeeCity: string;
  employeePhone: string;
  employeeEmail: string;
  
  // Contrato
  contractDate: string;
  startDate: string;
  trialPeriod: string;
  position: string;
  department: string;
  workplace: string;
  workingHours: string;
  workSchedule: string;
  
  // Remuneración
  baseSalary: string;
  paymentFrequency: string;
  paymentMethod: string;
  
  // Beneficios
  benefits: string[];
  
  // Vacaciones
  vacationDays: string;
  
  // Otros
  additionalClauses: string;
}

export interface FormStep {
  id: number;
  title: string;
  description: string;
  fields: string[];
}