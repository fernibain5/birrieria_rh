import React from 'react';
import { FileText, Clock, Shield, UserX, Receipt, ClipboardList } from 'lucide-react';
import type { ContractType } from '../types/contract';

interface ContractSelectionCardProps {
  type: ContractType;
  onSelect: (type: ContractType) => void;
}

interface ContractInfo {
  title: string;
  subtitle: string;
  icon: React.ReactNode;

  colorClasses: {
    bg: string;
    border: string;
    dot: string;
    gradientFrom: string;
    gradientTo: string;
    gradientHoverFrom: string;
    gradientHoverTo: string;
  };
}

export const ContractSelectionCard: React.FC<ContractSelectionCardProps> = ({ type, onSelect }) => {
  const contractInfo: Record<ContractType, ContractInfo> = {
    trial: {
      title: 'Contrato a Prueba',
      subtitle: 'Contrato inicial con período de prueba',
      icon: <FileText className="w-8 h-8 text-blue-600" />,

      colorClasses: {
        bg: 'bg-blue-50',
        border: 'hover:border-blue-200',
        dot: 'bg-blue-500',
        gradientFrom: 'from-blue-600',
        gradientTo: 'to-emerald-600',
        gradientHoverFrom: 'hover:from-blue-700',
        gradientHoverTo: 'hover:to-emerald-700'
      }
    },
    'time-unit': {
      title: 'Contrato individual de trabajo por unidad de tiempo',
      subtitle: 'Contrato por un período específico',
      icon: <Clock className="w-8 h-8 text-emerald-600" />,

      colorClasses: {
        bg: 'bg-emerald-50',
        border: 'hover:border-emerald-200',
        dot: 'bg-emerald-500',
        gradientFrom: 'from-emerald-600',
        gradientTo: 'to-blue-600',
        gradientHoverFrom: 'hover:from-emerald-700',
        gradientHoverTo: 'hover:to-blue-700'
      }
    },
    indefinite: {
      title: 'Contrato Indefinido',
      subtitle: 'Contrato sin fecha de terminación',
      icon: <Clock className="w-8 h-8 text-emerald-600" />,
      colorClasses: {
        bg: 'bg-emerald-50',
        border: 'hover:border-emerald-200',
        dot: 'bg-emerald-500',
        gradientFrom: 'from-emerald-600',
        gradientTo: 'to-blue-600',
        gradientHoverFrom: 'hover:from-emerald-700',
        gradientHoverTo: 'hover:to-blue-700'
      }
    },
    confidentiality: {
      title: 'Convenio de Confidencialidad',
      subtitle: 'Acuerdo de protección de información confidencial',
      icon: <Shield className="w-8 h-8 text-purple-600" />,

      colorClasses: {
        bg: 'bg-purple-50',
        border: 'hover:border-purple-200',
        dot: 'bg-purple-500',
        gradientFrom: 'from-purple-600',
        gradientTo: 'to-indigo-600',
        gradientHoverFrom: 'hover:from-purple-700',
        gradientHoverTo: 'hover:to-indigo-700'
      }
    },
    'voluntary-quitting': {
      title: 'Carta de Renuncia Voluntaria',
      subtitle: 'Documento para renuncia del trabajador',
      icon: <UserX className="w-8 h-8 text-red-600" />,

      colorClasses: {
        bg: 'bg-red-50',
        border: 'hover:border-red-200',
        dot: 'bg-red-500',
        gradientFrom: 'from-red-600',
        gradientTo: 'to-pink-600',
        gradientHoverFrom: 'hover:from-red-700',
        gradientHoverTo: 'hover:to-pink-700'
      }
    },
    finiquito: {
      title: 'Carta de Finiquito',
      subtitle: 'Documento de liquidación final del trabajador',
      icon: <Receipt className="w-8 h-8 text-orange-600" />,

      colorClasses: {
        bg: 'bg-orange-50',
        border: 'hover:border-orange-200',
        dot: 'bg-orange-500',
        gradientFrom: 'from-orange-600',
        gradientTo: 'to-yellow-600',
        gradientHoverFrom: 'hover:from-orange-700',
        gradientHoverTo: 'hover:to-yellow-700'
      }
    },
    'acta-administrativa': {
      title: 'Acta Administrativa',
      subtitle: 'Documento de registro de hechos laborales',
      icon: <ClipboardList className="w-8 h-8 text-slate-600" />,

      colorClasses: {
        bg: 'bg-slate-50',
        border: 'hover:border-slate-200',
        dot: 'bg-slate-500',
        gradientFrom: 'from-slate-600',
        gradientTo: 'to-gray-600',
        gradientHoverFrom: 'hover:from-slate-700',
        gradientHoverTo: 'hover:to-gray-700'
      }
    }
  };

  const info = contractInfo[type];

  return (
    <div 
      className={`bg-white rounded-xl shadow-lg border border-slate-200 p-8 cursor-pointer transition-all duration-200 hover:shadow-xl ${info.colorClasses.border} hover:scale-[1.02]`}
      onClick={() => onSelect(type)}
    >
      <div className="flex items-center space-x-4">
        <div className={`${info.colorClasses.bg} p-3 rounded-lg`}>
          {info.icon}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{info.title}</h3>
          <p className="text-sm text-gray-600">{info.subtitle}</p>
        </div>
      </div>

      {/* <div className="mt-6 space-y-3">
        {info.features.map((feature: string, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div className={`w-1.5 h-1.5 rounded-full ${info.colorClasses.dot}`} />
            <span className="text-sm text-gray-600">{feature}</span>
          </div>
        ))}
      </div> */}

      <div className="mt-8">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(type);
          }}
          className={`w-full px-6 py-3 bg-gradient-to-r ${info.colorClasses.gradientFrom} ${info.colorClasses.gradientTo} ${info.colorClasses.gradientHoverFrom} ${info.colorClasses.gradientHoverTo} text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg`}
        >
          Crear Nuevo Contrato
        </button>
      </div>
    </div>
  );
}; 