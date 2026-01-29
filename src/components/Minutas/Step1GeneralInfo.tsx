import React, { useState, useEffect } from 'react';
import { getAllUsers } from '../../services/userService';
import { UserProfile } from '../../types/auth';

interface AreaDetail {
  area: string;
  planteamiento: string;
  seguimiento: string;
  fechaCompromiso: string;
  encargadoUid: string;
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setGeneralInfo({
      ...generalInfo,
      [e.target.name]: e.target.value,
    });
  };

  const addArea = () => {
    const newArea: AreaDetail = {
      area: '',
      planteamiento: '',
      seguimiento: '',
      fechaCompromiso: '',
      encargadoUid: '',
    };
    setAreas([...areas, newArea]);
  };

  const removeArea = (idx: number) => {
    setAreas(areas.filter((_, i) => i !== idx));
  };

  const updateArea = (idx: number, field: keyof AreaDetail, value: string) => {
    const updatedAreas = areas.map((area: AreaDetail, i: number) => 
      i === idx ? { ...area, [field]: value } : area
    );
    setAreas(updatedAreas);
  };

  const isValid =
    generalInfo.date &&
    generalInfo.startTime &&
    generalInfo.endTime &&
    generalInfo.lugar &&
    generalInfo.evento &&
    areas.length > 0 &&
    areas.every(area => 
      area.area && 
      area.planteamiento && 
      area.seguimiento && 
      area.fechaCompromiso && 
      area.encargadoUid
    );

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Paso 1: Información General y Areas</h2>
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
        <div>
          <label className="block mb-1 font-medium">Lugar</label>
          <input
            type="text"
            name="lugar"
            value={generalInfo.lugar || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
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
          <label className="block font-medium">Areas (mínimo 1 requerida)</label>
          <button 
            type="button" 
            onClick={addArea} 
            className="px-3 py-1 bg-green-600 text-white rounded text-sm"
          >
            Agregar Area
          </button>
        </div>
        
        {areas.length === 0 && (
          <p className="text-sm text-gray-500 mb-2">No hay areas agregadas. Agrega al menos una area.</p>
        )}

        <div className="space-y-4">
          {areas.map((area, idx) => (
            <div key={idx} className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">Area {idx + 1}</h4>
                <button 
                  type="button" 
                  onClick={() => removeArea(idx)} 
                  className="text-red-500 text-sm"
                >
                  Eliminar
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
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

              <div>
                <label className="block mb-1 text-sm font-medium">Nombre del responsable</label>
                <select
                  value={area.encargadoUid}
                  onChange={e => updateArea(idx, 'encargadoUid', e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                  required
                >
                  <option value="">Selecciona un responsable</option>
                  {admins.map(user => (
                    <option key={user.uid} value={user.uid}>
                      {user.displayName || user.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        className={`px-4 py-2 bg-blue-600 text-white rounded ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={!isValid}
      >
        Siguiente
      </button>
    </div>
  );
};

export default Step1GeneralInfo; 