export type ContractType = 'trial' | 'time-unit' | 'indefinite' | 'confidentiality' | 'voluntary-quitting' | 'finiquito' | 'acta-administrativa';

export interface ContractData {
  // Common fields
  employeeName: string;
  employeeNationality: string;
  employeeCivilStatus: string;
  employeeAddress: string;
  employeePosition: string;
  employeeActivities: string;
  bankName: string;
  paymentDay: string;
  paymentMethod: string;
  workStartTime: string;
  workEndTime: string;
  workingDays: string;
  restDay: string;
  dailySalary: string;
  // Owner and branch selection
  ownerKey: string;
  branchKey: string;
  // Trial contract fields
  trialContractDay?: string;
  trialContractMonth?: string;
  trialContractYear?: string;
  trialPeriodDays?: string;
  // Time unit contract fields
  timeUnitStartDate?: string;
  timeUnitEndDate?: string;
  // Indefinite contract fields
  indefiniteStartDate?: string | Date; // string for new UTC-7 format, Date for legacy
  // Confidentiality agreement fields
  confidentialityDate?: string | Date; // string for new UTC-7 format, Date for legacy
  // Voluntary quitting fields
  voluntaryQuittingDate?: string | Date; // string for new UTC-7 format, Date for legacy
  // Finiquito fields
  finiquitoDate?: string | Date; // string for new UTC-7 format, Date for legacy
  finiquitoAmount?: string;
  // Acta administrativa fields
  actaDate?: string | Date; // string for new UTC-7 format, Date for legacy
  actaTime?: string;
  actaIncidentDescription?: string;
  actaWitness1Name?: string;
  actaWitness1Address?: string;
  actaWitness1Id?: string;
  actaWitness1Statement?: string;
  actaWitness2Name?: string;
  actaWitness2Address?: string;
  actaWitness2Id?: string;
  actaWitness2Statement?: string;

  // Employee Information
  employeeId: string;
  employeePhone: string;

  // Employer Information
  employerName: string;
  employerId: string;
  employerAddress: string;

  // Contract Details
  position: string;
  salary: string;
  startDate: string;
  contractType: ContractType;
  additionalTerms?: string;
}

export type FormFieldType = 'text' | 'number' | 'select' | 'multiselect' | 'textarea' | 'time' | 'date';

export interface FormField {
  name: keyof ContractData;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  options?: Array<{
    value: string;
    label: string;
  }>;
  defaultValue?: string;
  conditionalField?: {
    dependsOn: string;
    showWhen: string;
  };
}

export interface FormStep {
  title: string;
  description: string;
  fields: FormField[];
}

export interface ContractPreviewProps {
  data: ContractData;
  contractType: ContractType;
  onDownload: () => void;
} 