import { useState } from 'react';
import { ContractData } from '../types/contract';

const initialData: ContractData = {
  companyName: '',
  companyAddress: '',
  companyCity: '',
  companyRut: '',
  legalRepresentative: '',
  legalRepRut: '',
  employeeName: '',
  employeeRut: '',
  employeeNationality: '',
  employeeCivilStatus: '',
  employeeProfession: '',
  employeeAddress: '',
  employeeCity: '',
  employeePhone: '',
  employeeEmail: '',
  contractDate: '',
  startDate: '',
  trialPeriod: '',
  position: '',
  department: '',
  workplace: '',
  workingHours: '',
  workSchedule: '',
  baseSalary: '',
  paymentFrequency: '',
  paymentMethod: '',
  benefits: [],
  vacationDays: '',
  additionalClauses: ''
};

export const useContractData = () => {
  const [data, setData] = useState<ContractData>(initialData);

  const updateData = (field: string, value: string | string[]) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetData = () => {
    setData(initialData);
  };

  return {
    data,
    updateData,
    resetData
  };
};