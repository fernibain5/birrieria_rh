import React from 'react';
import { ContractData } from '../types/contract';
import { FileText, Download } from 'lucide-react';

interface ContractPreviewProps {
  data: ContractData;
  onDownload: () => void;
}

export const ContractPreview: React.FC<ContractPreviewProps> = ({ data, onDownload }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-emerald-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-white" />
            <h3 className="text-xl font-bold text-white">Vista Previa del Contrato</h3>
          </div>
          <button
            onClick={onDownload}
            className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm"
          >
            <Download className="w-4 h-4" />
            <span>Descargar DOCX</span>
          </button>
        </div>
      </div>
      
      <div className="p-6 max-h-96 overflow-y-auto">
        <div className="space-y-4 text-sm text-slate-700">
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-slate-900">CONTRATO INDIVIDUAL DE TRABAJO CON PERÍODO DE PRUEBA</h2>
          </div>
          
          <div className="space-y-3">
            <p><strong>Empresa:</strong> {data.companyName || '[NOMBRE EMPRESA]'}</p>
            <p><strong>RUT Empresa:</strong> {data.companyRut || '[RUT EMPRESA]'}</p>
            <p><strong>Representante Legal:</strong> {data.legalRepresentative || '[REPRESENTANTE LEGAL]'}</p>
            
            <div className="border-t pt-3 mt-4">
              <p><strong>Trabajador:</strong> {data.employeeName || '[NOMBRE TRABAJADOR]'}</p>
              <p><strong>RUT:</strong> {data.employeeRut || '[RUT TRABAJADOR]'}</p>
              <p><strong>Cargo:</strong> {data.position || '[CARGO]'}</p>
              <p><strong>Salario:</strong> {data.baseSalary || '[SALARIO]'}</p>
            </div>
            
            {data.benefits.length > 0 && (
              <div className="border-t pt-3 mt-4">
                <p><strong>Beneficios:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {data.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-emerald-50 border-t border-emerald-200 px-6 py-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          <p className="text-emerald-800 text-sm font-medium">
            El contrato se descargará como archivo DOCX profesional
          </p>
        </div>
      </div>
    </div>
  );
};