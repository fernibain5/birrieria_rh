import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { getAllUsers } from '../../services/userService';
import { UserProfile } from '../../types/auth';

interface AreaDetail {
  area: string;
  planteamiento: string;
  seguimiento: string;
  fechaCompromiso: string;
  encargadoUid?: string;
  encargadoUids: string[];
}

interface Step1Props {
  generalInfo: any;
  setGeneralInfo: (info: any) => void;
  topics: string[];
  setTopics: (topics: string[]) => void;
  areas: AreaDetail[];
  setAreas: (areas: AreaDetail[]) => void;
  onNext: () => void;
}

const Step1GeneralInfo: React.FC<Step1Props> = ({ generalInfo, setGeneralInfo, topics, setTopics, areas, setAreas, onNext }) => {
  const [admins, setAdmins] = useState<UserProfile[]>([]);
  const [openResponsibleDropdown, setOpenResponsibleDropdown] = useState<number | null>(null);
  const responsibleDropdownRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    console.log("🔍 DEBUG: Fetching all users...");
    getAllUsers()
      .then(users => {
        console.log("🔍 DEBUG: All users fetched:", users);
        // TODO: Uncomment when admin requirement is needed
        // const adminUsers = users.filter(u => u.role === 'admin');
        // setAdmins(adminUsers);
        
        // For now, allow any user to be selected
        setAdmins(users);
      })
      .catch(error => {
        console.error("🔍 DEBUG: Error fetching users:", error);
        setAdmins([]);
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openResponsibleDropdown === null) {
        return;
      }

      const dropdownElement = responsibleDropdownRefs.current[openResponsibleDropdown];
      if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
        setOpenResponsibleDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openResponsibleDropdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setGeneralInfo({
      ...generalInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleLugarChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLugar = e.target.value;

    setGeneralInfo({
      ...generalInfo,
      lugarOption: selectedLugar,
      lugar: selectedLugar === 'otro' ? (generalInfo.customLugar || '') : selectedLugar,
    });
  };

  const handleCustomLugarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGeneralInfo({
      ...generalInfo,
      customLugar: e.target.value,
      lugar: e.target.value,
    });
  };

  const addArea = () => {
    const newArea: AreaDetail = {
      area: '',
      planteamiento: '',
      seguimiento: '',
      fechaCompromiso: '',
      encargadoUid: '',
      encargadoUids: [],
    };
    setAreas([...areas, newArea]);
  };

  const removeArea = (idx: number) => {
    setAreas(areas.filter((_, i) => i !== idx));
    setOpenResponsibleDropdown(null);
  };

  const updateArea = (idx: number, field: keyof AreaDetail, value: string | string[]) => {
    const updatedAreas = areas.map((area: AreaDetail, i: number) => 
      i === idx ? { ...area, [field]: value } : area
    );
    setAreas(updatedAreas);
  };

  const toggleResponsible = (idx: number, uid: string) => {
    const currentUids = areas[idx].encargadoUids || (areas[idx].encargadoUid ? [areas[idx].encargadoUid] : []);
    const nextUids = currentUids.includes(uid)
      ? currentUids.filter(currentUid => currentUid !== uid)
      : [...currentUids, uid];

    const updatedAreas = areas.map((area: AreaDetail, i: number) =>
      i === idx
        ? {
            ...area,
            encargadoUids: nextUids,
            encargadoUid: nextUids[0] || '',
          }
        : area
    );
    setAreas(updatedAreas);
  };

  const getSelectedResponsibleUids = (area: AreaDetail) =>
    area.encargadoUids || (area.encargadoUid ? [area.encargadoUid] : []);

  const getResponsibleDropdownLabel = (area: AreaDetail) => {
    const selectedUids = getSelectedResponsibleUids(area);

    if (selectedUids.length === 0) {
      return 'Selecciona responsable(s)';
    }

    const selectedNames = selectedUids
      .map(uid => {
        const user = admins.find(admin => admin.uid === uid);
        return user ? (user.displayName || user.email || user.uid) : '';
      })
      .filter(Boolean);

    if (selectedNames.length <= 2) {
      return selectedNames.join(', ');
    }

    return `${selectedNames.slice(0, 2).join(', ')} +${selectedNames.length - 2} más`;
  };

  const isValid =
    generalInfo.date &&
    generalInfo.startTime &&
    generalInfo.endTime &&
    generalInfo.lugar &&
    (generalInfo.lugarOption !== 'otro' || generalInfo.lugar.trim()) &&
    generalInfo.evento &&
    areas.length > 0 &&
    areas.every(area => 
      area.area && 
      area.planteamiento && 
      area.seguimiento && 
      area.fechaCompromiso && 
      ((area.encargadoUids && area.encargadoUids.length > 0) || area.encargadoUid)
    );

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Paso 1: Información General y Partidas</h2>
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">Fecha</label>
          <input
            type="date"
            name="date"
            value={generalInfo.date || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Hora de inicio</label>
          <input
            type="time"
            name="startTime"
            value={generalInfo.startTime || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Lugar</label>
          <select
            value={generalInfo.lugarOption || generalInfo.lugar || ''}
            onChange={handleLugarChange}
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="">Selecciona un lugar</option>
            <option value="San Pedro">San Pedro</option>
            <option value="Las Quintas">Las Quintas</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        {generalInfo.lugarOption === 'otro' && (
          <div>
            <label className="block mb-1 font-medium">Especifica el lugar</label>
            <input
              type="text"
              value={generalInfo.customLugar || ''}
              onChange={handleCustomLugarChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
        )}
        <div className="md:col-span-2">
          <label className="block mb-1 font-medium">Evento</label>
          <input
            type="text"
            name="evento"
            value={generalInfo.evento || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block font-medium">Partidas (mínimo 1 requerida)</label>
        </div>
        
        {areas.length === 0 && (
          <p className="text-sm text-gray-500 mb-2">No hay partidas agregadas. Agrega al menos una partida.</p>
        )}

        <div className="space-y-4">
          {areas.map((area, idx) => (
            <div key={idx} className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">Partida {idx + 1}</h4>
                <button 
                  type="button" 
                  onClick={() => removeArea(idx)} 
                  className="text-red-500 text-sm"
                >
                  Eliminar
                </button>
              </div>
              
              <div className="mb-3">
                <div>
                  <label className="block mb-1 text-sm font-medium">Area</label>
                  <input
                    type="text"
                    value={area.area}
                    onChange={e => updateArea(idx, 'area', e.target.value)}
                    className="w-full px-3 py-2 border rounded text-sm"
                    placeholder="Nombre del area"
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="block mb-1 text-sm font-medium">Planteamiento o problemática</label>
                <textarea
                  value={area.planteamiento}
                  onChange={e => updateArea(idx, 'planteamiento', e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                  rows={2}
                  placeholder="Describe el planteamiento o problemática"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="block mb-1 text-sm font-medium">Seguimiento o actividades por realizar</label>
                <textarea
                  value={area.seguimiento}
                  onChange={e => updateArea(idx, 'seguimiento', e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                  rows={2}
                  placeholder="Describe el seguimiento o actividades"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="block mb-1 text-sm font-medium">Nombre del responsable</label>
                <div
                  ref={element => {
                    responsibleDropdownRefs.current[idx] = element;
                  }}
                  className="relative"
                >
                  <button
                    type="button"
                    onClick={() => setOpenResponsibleDropdown(openResponsibleDropdown === idx ? null : idx)}
                    className="flex w-full items-center justify-between gap-2 rounded border bg-white px-3 py-2 text-left text-sm"
                  >
                    <span className="truncate">{getResponsibleDropdownLabel(area)}</span>
                    <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-500" />
                  </button>

                  {openResponsibleDropdown === idx && (
                    <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded border bg-white p-2 shadow-lg">
                      {admins.length === 0 ? (
                        <p className="px-2 py-1 text-sm text-gray-500">No hay usuarios disponibles</p>
                      ) : (
                        admins.map(user => {
                          const selectedUids = getSelectedResponsibleUids(area);

                          return (
                            <label key={user.uid} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-gray-100">
                              <input
                                type="checkbox"
                                checked={selectedUids.includes(user.uid)}
                                onChange={() => toggleResponsible(idx, user.uid)}
                                className="h-4 w-4"
                              />
                              <span className="truncate">{user.displayName || user.email}</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">Fecha compromiso</label>
                <input
                  type="date"
                  value={area.fechaCompromiso}
                  onChange={e => updateArea(idx, 'fechaCompromiso', e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                  required
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <button
          type="button"
          onClick={addArea}
          className="mb-3 px-3 py-1 bg-brand-secondary text-white rounded text-sm hover:bg-brand-secondaryHover transition-colors"
        >
          Agregar Partida
        </button>
        <label className="block mb-1 font-medium">Hora de término</label>
        <input
          type="time"
          name="endTime"
          value={generalInfo.endTime || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>

      <button
        onClick={onNext}
        className={`px-4 py-2 bg-brand-primary text-white rounded hover:bg-brand-primaryHover transition-colors ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={!isValid}
      >
        Siguiente
      </button>
    </div>
  );
};

export default Step1GeneralInfo; 
