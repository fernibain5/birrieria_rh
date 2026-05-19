import React, { useEffect, useState } from 'react';
import { getAllUsers } from '../../services/userService';
import { UserProfile } from '../../types/auth';

interface Step2Props {
  attendees: UserProfile[];
  setAttendees: (attendees: UserProfile[]) => void;
  onBack: () => void;
  onSaveMinuta: () => void | Promise<void>;
}

const Step2Attendance: React.FC<Step2Props> = ({ attendees, setAttendees, onBack, onSaveMinuta }) => {
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

  const allFilteredSelected =
    filteredUsers.length > 0 && filteredUsers.every(u => attendees.some(a => a.uid === u.uid));
  const someFilteredSelected = filteredUsers.some(u => attendees.some(a => a.uid === u.uid));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setAttendees(attendees.filter(a => !filteredUsers.some(u => u.uid === a.uid)));
    } else {
      const merged = [...attendees];
      for (const user of filteredUsers) {
        if (!merged.some(a => a.uid === user.uid)) merged.push(user);
      }
      setAttendees(merged);
    }
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
        className="mb-4 px-3 py-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-brand-secondary"
      />
      {!loading && filteredUsers.length > 0 && (
        <label className="flex items-center gap-2 mb-3 cursor-pointer select-none text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={allFilteredSelected}
            ref={el => { if (el) el.indeterminate = someFilteredSelected && !allFilteredSelected; }}
            onChange={toggleSelectAll}
            className="h-4 w-4 rounded accent-brand-primary"
          />
          Seleccionar todos
        </label>
      )}
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
                className={`flex items-center justify-between py-2 px-3 rounded cursor-pointer transition-colors ${selected ? 'bg-brand-secondarySoft text-brand-primary font-semibold' : 'hover:bg-gray-100'}`}
                style={{ marginBottom: '4px' }}
              >
                <span>{user.displayName || user.email}</span>
                {selected && <span className="ml-2">✔️</span>}
              </li>
            );
          })}
        </ul>
      )}
      <div className="flex gap-2 mt-4">
        <button 
          onClick={onBack} 
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors flex-1"
        >
          Anterior
        </button>
        <button 
          onClick={onSaveMinuta} 
          className="px-4 py-2 bg-brand-primary text-white rounded hover:bg-brand-primaryHover transition-colors flex-1"
        >
          Guardar Minuta
        </button>
      </div>
    </div>
  );
};

export default Step2Attendance; 
