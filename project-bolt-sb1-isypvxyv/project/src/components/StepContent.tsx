import React from 'react';
import { ContractData } from '../types/contract';
import { FormField } from './FormField';
import { CheckboxGroup } from './CheckboxGroup';

interface StepContentProps {
  step: number;
  data: ContractData;
  updateData: (field: string, value: string | string[]) => void;
}

export const StepContent: React.FC<StepContentProps> = ({ step, data, updateData }) => {
  const benefitOptions = [
    'Seguro médico complementario',
    'Seguro de vida',
    'Bono de alimentación',
    'Asignación de movilización',
    'Capacitación y desarrollo',
    'Bono por desempeño',
    'Días libres adicionales',
    'Trabajo remoto'
  ];

  const handleFieldChange = (name: string, value: string) => {
    updateData(name, value);
  };

  const handleBenefitsChange = (values: string[]) => {
    updateData('benefits', values);
  };

  switch(step) {
    case 1:
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Nombre de la Empresa"
              name="companyName"
              value={data.companyName}
              onChange={handleFieldChange}
              placeholder="Ej: Empresa ABC S.A."
            />
            <FormField
              label="RUT de la Empresa"
              name="companyRut"
              value={data.companyRut}
              onChange={handleFieldChange}
              placeholder="Ej: 12.345.678-9"
            />
          </div>
          
          <FormField
            label="Dirección de la Empresa"
            name="companyAddress"
            value={data.companyAddress}
            onChange={handleFieldChange}
            placeholder="Ej: Av. Principal 123"
          />
          
          <FormField
            label="Ciudad"
            name="companyCity"
            value={data.companyCity}
            onChange={handleFieldChange}
            placeholder="Ej: Santiago"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Representante Legal"
              name="legalRepresentative"
              value={data.legalRepresentative}
              onChange={handleFieldChange}
              placeholder="Ej: Juan Pérez García"
            />
            <FormField
              label="RUT del Representante"
              name="legalRepRut"
              value={data.legalRepRut}
              onChange={handleFieldChange}
              placeholder="Ej: 12.345.678-9"
            />
          </div>
        </div>
      );

    case 2:
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Nombre Completo"
              name="employeeName"
              value={data.employeeName}
              onChange={handleFieldChange}
              placeholder="Ej: María González López"
            />
            <FormField
              label="RUT"
              name="employeeRut"
              value={data.employeeRut}
              onChange={handleFieldChange}
              placeholder="Ej: 12.345.678-9"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Nacionalidad"
              name="employeeNationality"
              value={data.employeeNationality}
              onChange={handleFieldChange}
              placeholder="Ej: Chilena"
            />
            <FormField
              label="Estado Civil"
              name="employeeCivilStatus"
              value={data.employeeCivilStatus}
              onChange={handleFieldChange}
              placeholder="Ej: Soltero(a)"
            />
          </div>
          
          <FormField
            label="Profesión u Oficio"
            name="employeeProfession"
            value={data.employeeProfession}
            onChange={handleFieldChange}
            placeholder="Ej: Ingeniero en Sistemas"
          />
          
          <FormField
            label="Dirección"
            name="employeeAddress"
            value={data.employeeAddress}
            onChange={handleFieldChange}
            placeholder="Ej: Calle Los Rosales 456"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              label="Ciudad"
              name="employeeCity"
              value={data.employeeCity}
              onChange={handleFieldChange}
              placeholder="Ej: Santiago"
            />
            <FormField
              label="Teléfono"
              name="employeePhone"
              value={data.employeePhone}
              onChange={handleFieldChange}
              type="tel"
              placeholder="Ej: +56 9 1234 5678"
            />
            <FormField
              label="Email"
              name="employeeEmail"
              value={data.employeeEmail}
              onChange={handleFieldChange}
              type="email"
              placeholder="Ej: correo@email.com"
            />
          </div>
        </div>
      );

    case 3:
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Fecha del Contrato"
              name="contractDate"
              value={data.contractDate}
              onChange={handleFieldChange}
              type="date"
            />
            <FormField
              label="Fecha de Inicio"
              name="startDate"
              value={data.startDate}
              onChange={handleFieldChange}
              type="date"
            />
          </div>
          
          <FormField
            label="Período de Prueba"
            name="trialPeriod"
            value={data.trialPeriod}
            onChange={handleFieldChange}
            placeholder="Ej: 3 meses"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Cargo o Posición"
              name="position"
              value={data.position}
              onChange={handleFieldChange}
              placeholder="Ej: Desarrollador Senior"
            />
            <FormField
              label="Departamento"
              name="department"
              value={data.department}
              onChange={handleFieldChange}
              placeholder="Ej: Tecnología"
            />
          </div>
          
          <FormField
            label="Lugar de Trabajo"
            name="workplace"
            value={data.workplace}
            onChange={handleFieldChange}
            placeholder="Ej: Oficina Central, Santiago"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Horas de Trabajo Semanales"
              name="workingHours"
              value={data.workingHours}
              onChange={handleFieldChange}
              placeholder="Ej: 45 horas"
            />
            <FormField
              label="Horario de Trabajo"
              name="workSchedule"
              value={data.workSchedule}
              onChange={handleFieldChange}
              placeholder="Ej: Lunes a Viernes 9:00-18:00"
            />
          </div>
        </div>
      );

    case 4:
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Salario Base Mensual"
              name="baseSalary"
              value={data.baseSalary}
              onChange={handleFieldChange}
              placeholder="Ej: $1.500.000"
            />
            <FormField
              label="Frecuencia de Pago"
              name="paymentFrequency"
              value={data.paymentFrequency}
              onChange={handleFieldChange}
              placeholder="Ej: Mensual"
            />
          </div>
          
          <FormField
            label="Método de Pago"
            name="paymentMethod"
            value={data.paymentMethod}
            onChange={handleFieldChange}
            placeholder="Ej: Transferencia bancaria"
          />
          
          <CheckboxGroup
            label="Beneficios Adicionales"
            options={benefitOptions}
            selectedValues={data.benefits}
            onChange={handleBenefitsChange}
          />
          
          <FormField
            label="Días de Vacaciones Anuales"
            name="vacationDays"
            value={data.vacationDays}
            onChange={handleFieldChange}
            placeholder="Ej: 15 días hábiles"
          />
        </div>
      );

    case 5:
      return (
        <div className="space-y-6">
          <FormField
            label="Cláusulas Adicionales"
            name="additionalClauses"
            value={data.additionalClauses}
            onChange={handleFieldChange}
            type="textarea"
            placeholder="Ingrese cualquier término o condición especial que desee agregar al contrato..."
            required={false}
          />
        </div>
      );

    default:
      return null;
  }
};