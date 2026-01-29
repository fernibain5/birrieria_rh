import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full bg-slate-200 rounded-full h-2 mb-8">
      <div 
        className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      ></div>
      <div className="text-sm text-slate-600 mt-2 text-center">
        Paso {currentStep} de {totalSteps}
      </div>
    </div>
  );
};