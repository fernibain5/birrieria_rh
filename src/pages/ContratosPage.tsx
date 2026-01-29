import { useState } from 'react';
import { ContractForm } from '../contratos/ContractForm';
import { ContractSelectionCard } from '../contratos/components/ContractSelectionCard';
import type { ContractType } from '../contratos/types/contract';

const ContratosPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedContractType, setSelectedContractType] = useState<ContractType | null>(null);

  const handleContractSelect = (type: ContractType) => {
    setSelectedContractType(type);
    setShowForm(true);
  };

  const handleBack = () => {
    setShowForm(false);
    setSelectedContractType(null);
  };

  if (showForm && selectedContractType) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ContractForm 
          contractType={selectedContractType}
          onBack={handleBack}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Contratos</h1>
        <p className="text-slate-600 mb-8">
          Selecciona el tipo de contrato que deseas generar
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ContractSelectionCard
            type="trial"
            onSelect={() => handleContractSelect('trial')}
          />
          <ContractSelectionCard
            type="time-unit"
            onSelect={() => handleContractSelect('time-unit')}
          />
          <ContractSelectionCard
            type="indefinite"
            onSelect={() => handleContractSelect('indefinite')}
          />
          <ContractSelectionCard
            type="confidentiality"
            onSelect={() => handleContractSelect('confidentiality')}
          />
          <ContractSelectionCard
            type="voluntary-quitting"
            onSelect={() => handleContractSelect('voluntary-quitting')}
          />
          <ContractSelectionCard
            type="finiquito"
            onSelect={() => handleContractSelect('finiquito')}
          />
          <ContractSelectionCard
            type="acta-administrativa"
            onSelect={() => handleContractSelect('acta-administrativa')}
          />
        </div>
      </div>
    </div>
  );
};

export default ContratosPage; 