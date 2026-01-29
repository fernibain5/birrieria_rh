import React from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  type?: 'text' | 'email' | 'date' | 'tel' | 'textarea';
  placeholder?: string;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = true
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(name, e.target.value);
  };

  const baseClasses = "w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 outline-none";

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          rows={4}
          className={`${baseClasses} resize-none`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          className={baseClasses}
        />
      )}
    </div>
  );
};