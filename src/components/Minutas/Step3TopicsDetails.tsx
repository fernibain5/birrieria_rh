import React, { useState, useEffect } from 'react';
import { getAllUsers } from '../../services/userService';
import { UserProfile, UserRole } from '../../types/auth';

interface TopicDetail {
  topic: string;
  planteamiento: string;
  seguimiento: string;
  fechaCompromiso: string;
  encargadoUid?: string;
}

interface Step3Props {
  topics: string[] | TopicDetail[];
  setTopics: (topics: TopicDetail[]) => void;
  onSubmit: () => void;
}

const Step3TopicsDetails: React.FC<Step3Props> = ({ topics, setTopics, onSubmit }) => {
  const [details, setDetails] = useState<TopicDetail[]>(
    Array.isArray(topics) && typeof topics[0] === 'string'
      ? (topics as string[]).map(t => ({ topic: t, planteamiento: '', seguimiento: '', fechaCompromiso: '', encargadoUid: '' }))
      : (topics as TopicDetail[])
  );

  const [admins, setAdmins] = useState<UserProfile[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    setTopics(details);
  }, [details, setTopics]);

  useEffect(() => {
    console.log("🔍 DEBUG: Fetching all users...");
    getAllUsers()
      .then(users => {
        console.log("🔍 DEBUG: All users fetched:", users);
        setAllUsers(users);
        // TODO: Uncomment when admin requirement is needed
        // const adminUsers = users.filter(u => u.role === 'admin');
        // console.log("🔍 DEBUG: Admin users filtered:", adminUsers);
        // console.log("🔍 DEBUG: All user roles:", users.map(u => ({ email: u.email, role: u.role })));
        // setAdmins(adminUsers);
        
        // For now, allow any user to be selected
        setAdmins(users);
      })
      .catch(error => {
        console.error("🔍 DEBUG: Error fetching users:", error);
        setAdmins([]);
        setAllUsers([]);
      });
  }, []);

  const handleChange = (idx: number, field: keyof TopicDetail, value: string | undefined) => {
    setDetails(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  };

  const isValid = details.every(d =>
    d.planteamiento &&
    d.seguimiento &&
    d.fechaCompromiso &&
    d.encargadoUid
  );

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-lg font-bold mb-4">Paso 3: Detalles de Area</h2>
      <div className="space-y-6">
        {details.map((detail, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2">Area: {detail.topic}</h3>
            <div className="mb-2">
              <label className="block mb-1 font-medium">Planteamiento o problemática</label>
              <textarea
                className="w-full px-3 py-2 border rounded"
                value={detail.planteamiento}
                onChange={e => handleChange(idx, 'planteamiento', e.target.value)}
                rows={2}
                placeholder="Describe el planteamiento o problemática"
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1 font-medium">Seguimiento o actividades por realizar</label>
              <textarea
                className="w-full px-3 py-2 border rounded"
                value={detail.seguimiento}
                onChange={e => handleChange(idx, 'seguimiento', e.target.value)}
                rows={2}
                placeholder="Describe el seguimiento o actividades"
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1 font-medium">Fecha compromiso</label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded"
                value={detail.fechaCompromiso}
                onChange={e => handleChange(idx, 'fechaCompromiso', e.target.value)}
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1 font-medium">Nombre del responsable</label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={detail.encargadoUid || ''}
                onChange={e => handleChange(idx, 'encargadoUid', e.target.value)}
              >
                <option value="">Selecciona un responsable</option>
                {admins.length === 0 ? (
                  <option value="" disabled>No hay usuarios disponibles</option>
                ) : (
                  admins.map(user => (
                    <option key={user.uid} value={user.uid}>
                      {user.displayName || user.email}
                    </option>
                  ))
                )}
              </select>
              {admins.length === 0 && (
                <p className="text-sm text-red-600 mt-1">
                  No se encontraron usuarios. ({admins.length} usuarios encontrados)
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={onSubmit}
        className={`mt-6 px-4 py-2 bg-green-600 text-white rounded w-full ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={!isValid}
      >
        Enviar
      </button>
    </div>
  );
};

export default Step3TopicsDetails; 