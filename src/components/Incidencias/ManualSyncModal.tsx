import React, { useState } from 'react';
import { X, AlertTriangle, RefreshCw } from 'lucide-react';

const STORAGE_KEY = 'manualSyncDeviceIp';
const ADDRESS_RE = /^[A-Za-z0-9.-]+(:\d{1,5})?$/;

interface ManualSyncModalProps {
  /** Fallback address when nothing is cached yet (e.g. the restaurant's stored hikvisionIp). */
  defaultAddress?: string;
  onClose: () => void;
  onConfirm: (address: string) => void;
}

const ManualSyncModal: React.FC<ManualSyncModalProps> = ({
  defaultAddress,
  onClose,
  onConfirm,
}) => {
  const [address, setAddress] = useState(
    () => localStorage.getItem(STORAGE_KEY) || defaultAddress || '',
  );
  const [error, setError] = useState('');

  const handleConfirm = () => {
    const trimmed = address.trim();
    if (!trimmed || !ADDRESS_RE.test(trimmed)) {
      setError('Escribe una dirección válida (IP o IP:puerto), por ejemplo 100.90.68.90:8571');
      return;
    }
    localStorage.setItem(STORAGE_KEY, trimmed);
    onConfirm(trimmed);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <RefreshCw className="text-brand-secondary mr-3" size={22} />
            <h2 className="text-lg font-semibold text-gray-900">Sincronización manual</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-300 rounded-md px-4 py-3 flex gap-3">
            <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-amber-800">
              <strong>Importante:</strong> la sincronización la ejecuta el servidor, no esta
              computadora. Para usarla, una computadora conectada al WiFi del restaurante debe
              estar corriendo el túnel temporal (<code>manual-tunnel.sh</code>, requiere
              Tailscale). Escribe aquí la dirección que muestra ese script (ej.{' '}
              <code>100.x.x.x:8571</code>). Una IP local del restaurante (
              <code>192.168.x.x</code>) <strong>no funcionará</strong>.
            </p>
          </div>

          <div>
            <label htmlFor="manual-sync-address" className="block text-sm font-medium text-gray-700 mb-1">
              Dirección del dispositivo
            </label>
            <input
              id="manual-sync-address"
              type="text"
              className="input"
              placeholder="100.x.x.x:8571"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirm();
              }}
              autoFocus
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primaryHover focus:outline-none focus:ring-2 focus:ring-brand-secondary transition-colors disabled:opacity-50"
              disabled={!address.trim()}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualSyncModal;
