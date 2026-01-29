import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxGroupProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  label,
  options,
  selectedValues,
  onChange
}) => {
  const toggleOption = (option: string) => {
    const newValues = selectedValues.includes(option)
      ? selectedValues.filter(val => val !== option)
      : [...selectedValues, option];
    onChange(newValues);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option);
          return (
            <div
              key={option}
              onClick={() => toggleOption(option)}
              className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                isSelected 
                  ? 'border-blue-500 bg-blue-500' 
                  : 'border-slate-300'
              }`}>
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm text-slate-700">{option}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};