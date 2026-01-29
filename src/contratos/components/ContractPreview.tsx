import React from 'react';
import { Download, FileText, Clock, Shield, UserX, Receipt, ClipboardList } from 'lucide-react';
import { ContractData } from '../types/contract';
import type { ContractType } from '../types/contract';

interface ContractPreviewProps {
  data: ContractData;
  onDownload: () => void;
  contractType: ContractType;
}

interface ContractInfo {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  details: Array<{ label: string; value: string }>;
  colorClasses: {
    gradientFrom: string;
    gradientTo: string;
    gradientHoverFrom: string;
    gradientHoverTo: string;
  };
}

export const ContractPreview: React.FC<ContractPreviewProps> = ({ data, onDownload, contractType }) => {
  const contractInfo: Record<ContractType, ContractInfo> = {
    trial: {
      title: 'Contrato a Prueba',
      subtitle: 'Contrato inicial con período de prueba',
      icon: <FileText className="w-8 h-8 text-white" />,
      details: [
        { label: 'Nombre del Empleado', value: data.employeeName },
        { label: 'Puesto', value: data.employeePosition },
        { label: 'Salario Diario', value: `$${data.dailySalary}` },
        { label: 'Fecha de Inicio', value: `${data.trialContractDay}/${data.trialContractMonth}/${data.trialContractYear}` }
      ],
      colorClasses: {
        gradientFrom: 'from-blue-600',
        gradientTo: 'to-emerald-600',
        gradientHoverFrom: 'hover:from-blue-700',
        gradientHoverTo: 'hover:to-emerald-700'
      }
    },
    'time-unit': {
      title: 'Contrato por Unidad de Tiempo',
      subtitle: 'Contrato por un período específico',
      icon: <Clock className="w-8 h-8 text-white" />,
      details: [
        { label: 'Nombre del Empleado', value: data.employeeName },
        { label: 'Puesto', value: data.employeePosition },
        { label: 'Salario Diario', value: `$${data.dailySalary}` },
        { label: 'Fecha de Inicio', value: `${data.timeUnitStartDate}}` },
        { label: 'Fecha de Término', value: `${data.timeUnitEndDate}` }
      ],
      colorClasses: {
        gradientFrom: 'from-emerald-600',
        gradientTo: 'to-blue-600',
        gradientHoverFrom: 'hover:from-emerald-700',
        gradientHoverTo: 'hover:to-blue-700'
      }
    },
    indefinite: {
      title: 'Contrato Indefinido',
      subtitle: 'Contrato sin fecha de terminación',
      icon: <Clock className="w-8 h-8 text-white" />,
      details: [
        { label: 'Nombre del Empleado', value: data.employeeName },
        { label: 'Puesto', value: data.employeePosition },
        { label: 'Salario Diario', value: `$${data.dailySalary}` },
        { label: 'Fecha de Inicio', value: data.indefiniteStartDate ? new Date(data.indefiniteStartDate).toLocaleDateString() : 'No especificada' }
      ],
      colorClasses: {
        gradientFrom: 'from-emerald-600',
        gradientTo: 'to-blue-600',
        gradientHoverFrom: 'hover:from-emerald-700',
        gradientHoverTo: 'hover:to-blue-700'
      }
    },
    confidentiality: {
      title: 'Convenio de Confidencialidad',
      subtitle: 'Acuerdo de protección de información confidencial',
      icon: <Shield className="w-8 h-8 text-white" />,
      details: [
        { label: 'Nombre del Empleado', value: data.employeeName || 'No especificado' },
        { label: 'Sucursal', value: data.branchKey || 'No especificada' },
        { label: 'Fecha del Convenio', value: data.confidentialityDate ? new Date(data.confidentialityDate).toLocaleDateString() : 'No especificada' }
      ],
      colorClasses: {
        gradientFrom: 'from-purple-600',
        gradientTo: 'to-indigo-600',
        gradientHoverFrom: 'hover:from-purple-700',
        gradientHoverTo: 'hover:to-indigo-700'
      }
    },
    'voluntary-quitting': {
      title: 'Carta de Renuncia Voluntaria',
      subtitle: 'Documento para renuncia del trabajador',
      icon: <UserX className="w-8 h-8 text-white" />,
      details: [
        { label: 'Nombre del Trabajador', value: data.employeeName || 'No especificado' },
        { label: 'Puesto', value: data.position || 'No especificado' },
        { label: 'Fecha de Renuncia', value: data.voluntaryQuittingDate ? new Date(data.voluntaryQuittingDate).toLocaleDateString() : 'No especificada' }
      ],
      colorClasses: {
        gradientFrom: 'from-red-600',
        gradientTo: 'to-pink-600',
        gradientHoverFrom: 'hover:from-red-700',
        gradientHoverTo: 'hover:to-pink-700'
      }
    },
    finiquito: {
      title: 'Carta de Finiquito',
      subtitle: 'Documento de liquidación final del trabajador',
      icon: <Receipt className="w-8 h-8 text-white" />,
      details: [
        { label: 'Nombre del Trabajador', value: data.employeeName || 'No especificado' },
        { label: 'Puesto', value: data.position || 'No especificado' },
        { label: 'Cantidad', value: data.finiquitoAmount ? `$${data.finiquitoAmount}` : 'No especificada' },
        { label: 'Fecha de Finiquito', value: data.finiquitoDate ? new Date(data.finiquitoDate).toLocaleDateString() : 'No especificada' }
      ],
      colorClasses: {
        gradientFrom: 'from-orange-600',
        gradientTo: 'to-yellow-600',
        gradientHoverFrom: 'hover:from-orange-700',
        gradientHoverTo: 'hover:to-yellow-700'
      }
    },
    'acta-administrativa': {
      title: 'Acta Administrativa',
      subtitle: 'Documento de registro de hechos laborales',
      icon: <ClipboardList className="w-8 h-8 text-white" />,
      details: [
        { label: 'Nombre del Trabajador', value: data.employeeName || 'No especificado' },
        { label: 'Puesto', value: data.position || 'No especificado' },
        { label: 'Fecha del Incidente', value: data.actaDate ? new Date(data.actaDate).toLocaleDateString() : 'No especificada' },
        { label: 'Hora del Incidente', value: data.actaTime || 'No especificada' },
        { label: 'Primer Testigo', value: data.actaWitness1Name || 'No especificado' },
        { label: 'Segundo Testigo', value: data.actaWitness2Name || 'No especificado' }
      ],
      colorClasses: {
        gradientFrom: 'from-slate-600',
        gradientTo: 'to-gray-600',
        gradientHoverFrom: 'hover:from-slate-700',
        gradientHoverTo: 'hover:to-gray-700'
      }
    }
  };

  const info = contractInfo[contractType];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className={`bg-gradient-to-r ${info.colorClasses.gradientFrom} ${info.colorClasses.gradientTo} px-6 py-4`}>
        <div className="flex items-center space-x-4">
          {info.icon}
          <div>
            <h3 className="text-xl font-semibold text-white">{info.title}</h3>
            <p className="text-white/80">{info.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {info.details.map((detail, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
            <span className="text-sm font-medium text-slate-600">{detail.label}</span>
            <span className="text-sm text-slate-900">{detail.value}</span>
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-slate-100">
        <button
          onClick={onDownload}
          className={`w-full px-6 py-3 bg-gradient-to-r ${info.colorClasses.gradientFrom} ${info.colorClasses.gradientTo} ${info.colorClasses.gradientHoverFrom} ${info.colorClasses.gradientHoverTo} text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2`}
        >
          <Download className="w-5 h-5" />
          <span>Descargar Contrato</span>
        </button>
      </div>
    </div>
  );
}; 