import { useState } from 'react';
import { ContractData } from '../types/contract';

const initialContractData: ContractData = {
  // Employee Information
  employeeName: '',
  employeeId: '',
  employeeAddress: '',
  employeePhone: '',

  // Employer Information
  employerName: '',
  employerId: '',
  employerAddress: '',

  // Contract Details
  position: '',
  salary: '0',
  startDate: '',
  contractType: 'trial', // Default to Trial
  additionalTerms: '',
  employeeNationality: '',
  employeeCivilStatus: '',
  employeePosition: '',
  employeeActivities: '',
  bankName: '',
  paymentDay: '',
  paymentMethod: '',
  workStartTime: '',
  workEndTime: '',
  workingDays: '',
  restDay: '',
  dailySalary: '',
  ownerKey: '',
  branchKey: ''
};

export const useContractData = () => {
  const [data, setData] = useState<ContractData>(initialContractData);

  const updateData = (name: keyof ContractData, value: string) => {
    setData(prev => ({
      ...prev,
      [name]: name === 'salary' ? Number(value) : value
    }));
  };

  const resetData = () => {
    setData(initialContractData);
  };

  return {
    data,
    updateData,
    resetData
  };
}; 