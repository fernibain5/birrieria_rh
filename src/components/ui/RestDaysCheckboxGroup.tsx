import React from 'react';
import { DIAS_DESCANSO, RestDay } from '../../types/auth';

interface RestDaysCheckboxGroupProps {
  value: RestDay[];
  onChange: (days: RestDay[]) => void;
  disabled?: boolean;
}

const RestDaysCheckboxGroup: React.FC<RestDaysCheckboxGroupProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const toggle = (dia: RestDay) => {
    onChange(value.includes(dia) ? value.filter((d) => d !== dia) : [...value, dia]);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {DIAS_DESCANSO.map((dia) => (
        <label key={dia} className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={value.includes(dia)}
            onChange={() => toggle(dia)}
            disabled={disabled}
            className="h-4 w-4 text-brand-secondary border-gray-300 rounded focus:ring-brand-secondary"
          />
          {dia}
        </label>
      ))}
    </div>
  );
};

export default RestDaysCheckboxGroup;
