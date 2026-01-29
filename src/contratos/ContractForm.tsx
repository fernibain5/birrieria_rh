import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useContractData } from './hooks/useContractData';
import { ProgressBar } from './components/ProgressBar';
import { StepContent } from './components/StepContent';
import { ContractPreview } from './components/ContractPreview';
import { trialFormSteps } from './data/trialFormSteps';
import { timeUnitFormSteps } from './data/timeUnitFormSteps';
import { indefiniteFormSteps } from './data/indefiniteFormSteps';
import { confidentialityFormSteps } from './data/confidentialityFormSteps';
import { voluntaryQuittingFormSteps } from './data/voluntaryQuittingFormSteps';
import { finiquitoFormSteps } from './data/finiquitoFormSteps';
import { actaAdministrativaFormSteps } from './data/actaAdministrativaFormSteps';
import { generateTrialContract } from './utils/trialContractGenerator';
import { generateTimeUnitContract } from './utils/timeUnitContractGenerator';
import { generateIndefiniteContract } from './utils/indefiniteContractGenerator';
import { generateConfidentialityAgreement } from './utils/confidentialityGenerator';
import { generateVoluntaryQuittingDocument } from './utils/voluntaryQuittingGenerator';
import { generateFiniquitoDocument } from './utils/finiquitoLetterGenerator';
import { generateActaAdministrativaDocument } from './utils/actaAdministrativaGenerator';
import type { ContractType, FormStep, ContractData } from './types/contract';

interface ContractFormProps {
  onBack: () => void;
  contractType: ContractType;
}

export const ContractForm: React.FC<ContractFormProps> = ({ onBack, contractType }) => {
  const { data, updateData, resetData } = useContractData();
  const [currentStep, setCurrentStep] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const steps: FormStep[] = 
    contractType === 'trial' ? trialFormSteps :
    contractType === 'time-unit' ? timeUnitFormSteps :
    contractType === 'indefinite' ? indefiniteFormSteps :
    contractType === 'voluntary-quitting' ? voluntaryQuittingFormSteps :
    contractType === 'finiquito' ? finiquitoFormSteps :
    contractType === 'acta-administrativa' ? actaAdministrativaFormSteps :
    confidentialityFormSteps;

  const handleInputChange = (field: keyof ContractData, value: string | string[]) => {
    updateData(field, Array.isArray(value) ? value.join(',') : value);
  };

  const handleSubmit = async () => {
    try {
      if (contractType === 'trial') {
        await generateTrialContract(data);
      } else if (contractType === 'time-unit') {
        await generateTimeUnitContract(data);
      } else if (contractType === 'indefinite') {
        await generateIndefiniteContract(data);
      } else if (contractType === 'confidentiality') {
        await generateConfidentialityAgreement(data);
      } else if (contractType === 'voluntary-quitting') {
        await generateVoluntaryQuittingDocument(data);
      } else if (contractType === 'finiquito') {
        await generateFiniquitoDocument(data);
      } else if (contractType === 'acta-administrativa') {
        await generateActaAdministrativaDocument(data);
      }
      resetData();
      onBack();
    } catch (error) {
      console.error('Error generating contract:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {contractType === 'trial' ? 'Contrato a Prueba' : 
           contractType === 'time-unit' ? 'Contrato por Unidad de Tiempo' :
           'Contrato Indefinido'}
        </h1>
        <p className="text-gray-600">
          Complete los siguientes pasos para generar el contrato
        </p>
      </div>

      {!showPreview ? (
        <>
          <ProgressBar currentStep={currentStep} totalSteps={steps.length} />
          <StepContent
            step={steps[currentStep]}
            data={data}
            onInputChange={handleInputChange}
          />
          <div className="mt-8 flex justify-between">
            <button
              onClick={onBack}
              className="px-6 py-3 text-slate-600 hover:text-slate-900 font-semibold flex items-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Regresar</span>
            </button>
            <div className="flex space-x-4">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-semibold flex items-center space-x-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Anterior</span>
                </button>
              )}
              {currentStep < steps.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-lg font-semibold flex items-center space-x-2"
                >
                  <span>Siguiente</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => setShowPreview(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-lg font-semibold flex items-center space-x-2"
                >
                  <span>Vista Previa</span>
                  <Check className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowPreview(false)}
              className="px-6 py-3 text-slate-600 hover:text-slate-900 font-semibold flex items-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Regresar</span>
            </button>
            <h1 className="text-2xl font-bold text-slate-800">
              {contractType === 'trial' ? 'Contrato a Prueba' : 
               contractType === 'time-unit' ? 'Contrato por Unidad de Tiempo' :
               'Contrato Indefinido'}
            </h1>
            <div className="w-24"></div> {/* Spacer for alignment */}
          </div>

          <ContractPreview
            data={data}
            onDownload={handleSubmit}
            contractType={contractType}
          />
        </div>
      )}
    </div>
  );
}; 