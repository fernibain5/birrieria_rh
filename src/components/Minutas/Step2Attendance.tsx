import React, { useEffect, useState } from 'react';
import { getAllUsers } from '../../services/userService';
import { UserProfile } from '../../types/auth';

interface Step2Props {
  attendees: UserProfile[];
  setAttendees: (attendees: UserProfile[]) => void;
  onNext: () => void;
  onBack: () => void;
  onDownload: () => void;
  onDownloadAttendance: () => void;
  onSaveMinuta: () => void;
}

const Step2Attendance: React.FC<Step2Props> = ({ attendees, setAttendees, onNext, onBack, onDownload, onDownloadAttendance, onSaveMinuta }) => {
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const users = await getAllUsers();
        setAllUsers(users);
      } catch (e) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter only by displayName (case-insensitive)
  const filteredUsers = allUsers.filter(user =>
    user.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleAttendance = (user: UserProfile) => {
    setAttendees(
      attendees.some(a => a.uid === user.uid)
        ? attendees.filter(a => a.uid !== user.uid)
        : [...attendees, user]
    );
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-bold mb-2">Paso 2: Asistencia</h2>
      <p className="mb-4 text-gray-600">Busca y selecciona los asistentes a la reunión. Haz clic en los nombres para marcar o desmarcar asistencia.</p>
      <input
        type="text"
        placeholder="Buscar por nombre..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-4 px-3 py-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {loading ? (
        <div className="text-center text-gray-500">Cargando usuarios...</div>
      ) : (
        <ul className="mb-4 divide-y divide-gray-200">
          {filteredUsers.length === 0 && (
            <li className="py-2 text-gray-400 text-center">No se encontraron usuarios.</li>
          )}
          {filteredUsers.map(user => {
            const selected = attendees.some((a: UserProfile) => a.uid === user.uid);
            return (
              <li
                key={user.uid}
                onClick={() => toggleAttendance(user)}
                className={`flex items-center justify-between py-2 px-3 rounded cursor-pointer transition-colors ${selected ? 'bg-green-100 text-green-800 font-semibold' : 'hover:bg-gray-100'}`}
                style={{ marginBottom: '4px' }}
              >
                <span>{user.displayName || user.email}</span>
                {selected && <span className="ml-2">✔️</span>}
              </li>
            );
          })}
        </ul>
      )}
      <div className="flex flex-col gap-2 mt-4">
        <div className="flex gap-2">
          <button 
            onClick={onBack} 
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors flex-1"
          >
            Anterior
          </button>
          <button 
            onClick={onDownload} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex-1"
          >
            Descargar Minuta
          </button>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onDownloadAttendance} 
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex-1"
          >
            Descargar Asistencia
          </button>
          <button 
            onClick={onSaveMinuta} 
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex-1"
          >
            Guardar Minuta
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step2Attendance; 