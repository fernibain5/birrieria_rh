import React from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'number' | 'date' | 'tel';
  value: string | number;
  onChange: (name: string, value: string) => void;
  required?: boolean;
  placeholder?: string;
  error?: string;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder,
  error,
  className = '',
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-2 rounded-lg border ${
          error ? 'border-red-500' : 'border-slate-300'
        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}; 