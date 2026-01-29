import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, FileText } from 'lucide-react';
import { ProgressBar } from './components/ProgressBar';
import { StepContent } from './components/StepContent';
import { ContractPreview } from './components/ContractPreview';
import { useContractData } from './hooks/useContractData';
import { formSteps } from './data/formSteps';
import { downloadContract } from './utils/contractGenerator';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const { data, updateData, resetData } = useContractData();

  const totalSteps = formSteps.length;
  const currentFormStep = formSteps.find(step => step.id === currentStep);

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowPreview(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDownload = async () => {
    await downloadContract(data);
  };

  const startNew = () => {
    setShowPreview(false);
    setCurrentStep(1);
    resetData();
  };

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
                <h1 className="text-3xl font-bold text-slate-800">¡Contrato Completado!</h1>
              </div>
              <p className="text-slate-600">
                Tu contrato ha sido generado exitosamente. Puedes descargarlo como archivo DOCX profesional.
              </p>
            </div>

            <ContractPreview data={data} onDownload={handleDownload} />

            <div className="flex justify-center space-x-4 mt-8">
              <button
                onClick={startNew}
                className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
              >
                Crear Nuevo Contrato
              </button>
              <button
                onClick={handleDownload}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Descargar DOCX
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-slate-800">Sistema de Contratos Laborales</h1>
            </div>
            <p className="text-slate-600">
              Complete la información requerida para generar su contrato de trabajo
            </p>
          </div>

          {/* Progress Bar */}
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Step Header */}
            <div className="bg-gradient-to-r from-blue-600 to-emerald-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">{currentFormStep?.title}</h2>
              <p className="text-blue-100 text-sm mt-1">{currentFormStep?.description}</p>
            </div>

            {/* Form Content */}
            <div className="p-8">
              <StepContent
                step={currentStep}
                data={data}
                updateData={updateData}
              />
            </div>

            {/* Navigation */}
            <div className="bg-slate-50 px-8 py-6 flex justify-between items-center">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  currentStep === 1
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-600 hover:bg-slate-700 text-white transform hover:scale-105'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <div className="text-sm text-slate-500">
                {currentStep} de {totalSteps}
              </div>

              <button
                onClick={nextStep}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <span>{currentStep === totalSteps ? 'Finalizar' : 'Siguiente'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Todos los campos marcados con <span className="text-red-500">*</span> son obligatorios
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;