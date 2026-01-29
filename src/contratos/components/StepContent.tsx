import React from 'react';
import { FormField } from './FormField';
import { convertToUTCMinus7, convertFromUTCMinus7ToDateString } from '../utils/timezoneUtils';
import type { ContractData, FormStep, FormField as FormFieldType } from '../types/contract';

interface StepContentProps {
  step: FormStep;
  data: ContractData;
  onInputChange: (name: keyof ContractData, value: string | string[]) => void;
}

export const StepContent: React.FC<StepContentProps> = ({ step, data, onInputChange }) => {
  // Helper function to check if a field should be shown based on conditional logic
  const shouldShowField = (field: FormFieldType): boolean => {
    if (!field.conditionalField) return true;
    
    const dependentValue = data[field.conditionalField.dependsOn as keyof ContractData];
    return dependentValue === field.conditionalField.showWhen;
  };

  // Helper function to get field value with default and timezone conversion
  const getFieldValue = (field: FormFieldType): string | string[] => {
    const currentValue = data[field.name as keyof ContractData];
    
    // Handle date fields - convert from UTC-7 back to display format
    if (field.type === 'date' && currentValue && typeof currentValue === 'string') {
      return convertFromUTCMinus7ToDateString(currentValue);
    }
    
    if (currentValue) return currentValue as string | string[];
    if (field.defaultValue) return field.defaultValue;
    return field.type === 'multiselect' ? [] : '';
  };

  // Helper function to handle input changes with timezone conversion
  const handleInputChange = (field: FormFieldType, value: string | string[]) => {
    let processedValue = value;
    
    // Convert date fields to UTC-7
    if (field.type === 'date' && typeof value === 'string' && value) {
      processedValue = convertToUTCMinus7(value);
    }
    
    // Time fields don't need timezone conversion - store as-is
    
    onInputChange(field.name, processedValue);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">
        {step.title}
      </h2>
      <p className="text-slate-600 mb-6">
        {step.description}
      </p>

      <div className="space-y-4">
        {step.fields.filter(shouldShowField).map((field) => (
          <div key={field.name}>
            <label
              htmlFor={field.name}
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.type === 'select' ? (
              <select
                id={field.name}
                name={field.name}
                value={getFieldValue(field) as string}
                onChange={(e) => handleInputChange(field, e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required={field.required}
              >
                <option value="">Seleccione una opción</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === 'multiselect' ? (
              <select
                id={field.name}
                name={field.name}
                value={(() => {
                  const fieldValue = getFieldValue(field);
                  return Array.isArray(fieldValue) ? fieldValue : [];
                })()}
                onChange={(e) => {
                  const values = Array.from(
                    e.target.selectedOptions,
                    option => option.value
                  );
                  handleInputChange(field, values);
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required={field.required}
                multiple
              >
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                value={getFieldValue(field) as string}
                onChange={(e) => handleInputChange(field, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-h-[100px]"
                required={field.required}
              />
            ) : (
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                value={getFieldValue(field) as string}
                onChange={(e) => handleInputChange(field, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required={field.required}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}; 