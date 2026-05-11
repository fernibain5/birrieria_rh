import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { createMinuta } from "../services/minutaService";
import { MinutaArea, MinutaAttendee, MinutaGeneralInfo } from "../types/Minuta";
import { UserProfile } from "../types/auth";
import Step1GeneralInfo from '../components/Minutas/Step1GeneralInfo';
import Step2Attendance from '../components/Minutas/Step2Attendance';
import { getAllUsers } from '../services/userService';

interface AreaDetail {
  area: string;
  planteamiento: string;
  seguimiento: string;
  fechaCompromiso: string;
  encargadoUid?: string;
  encargadoUids: string[];
}

const getUserLabel = (user: { displayName?: string; email?: string; uid: string }) =>
  user.displayName || user.email || user.uid;

const toAttendanceInfo = (generalInfo: Partial<MinutaGeneralInfo>): MinutaGeneralInfo => ({
  startTime: generalInfo.startTime || '',
  endTime: generalInfo.endTime || '',
  evento: generalInfo.evento || '',
  date: generalInfo.date || '',
  lugar: generalInfo.lugar || '',
  lugarOption: generalInfo.lugarOption,
  customLugar: generalInfo.customLugar,
});

const MinutasPage: React.FC = () => {
  const { userProfile } = useAuth();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Multi-step form state
  const [step, setStep] = useState(1);
  const [generalInfo, setGeneralInfo] = useState<Partial<MinutaGeneralInfo>>({});
  const [topics, setTopics] = useState<string[]>([]);
  const [attendees, setAttendees] = useState<UserProfile[]>([]);
  const [areas, setAreas] = useState<AreaDetail[]>([]);

  const buildAreasWithNames = async (): Promise<MinutaArea[]> => {
    const allUsers = await getAllUsers();

    return areas.map(area => {
      const responsibleUids = area.encargadoUids || (area.encargadoUid ? [area.encargadoUid] : []);
      const responsibleNames = responsibleUids
        .map(uid => {
          const responsible = allUsers.find(user => user.uid === uid) || attendees.find(a => a.uid === uid);
          return responsible ? getUserLabel(responsible) : '';
        })
        .filter(Boolean);

      return {
        ...area,
        encargadoName: responsibleNames.join(', '),
      };
    });
  };

  const buildAttendeeSnapshot = (): MinutaAttendee[] =>
    attendees.map(attendee => ({
      uid: attendee.uid,
      displayName: attendee.displayName || '',
      email: attendee.email || '',
      area: attendee.role || '',
    }));

  const saveCurrentMinuta = async () => {
    if (!userProfile) return;

    setMessage(null);

    try {
      const savedAreas = await buildAreasWithNames();
      const savedAttendees = buildAttendeeSnapshot();
      const savedGeneralInfo = toAttendanceInfo(generalInfo);

      const branch = savedGeneralInfo.lugar === 'San Pedro' || savedGeneralInfo.lugar === 'Las Quintas'
        ? savedGeneralInfo.lugar
        : userProfile.branch;

      await createMinuta({
        supervisor: userProfile.displayName || userProfile.email,
        branch,
        role: userProfile.role,
        whatHappened: savedAreas.map(area => area.planteamiento).join('\n'),
        expectations: savedAreas.map(area => area.seguimiento).join('\n'),
        createdBy: userProfile.uid,
        generalInfo: savedGeneralInfo,
        areas: savedAreas,
        attendees: savedAttendees,
      }, userProfile.uid);

      setMessage({
        type: "success",
        text: "Minuta guardada exitosamente. Puedes revisarla y descargarla en Historial Minutas.",
      });

      setStep(1);
      setGeneralInfo({});
      setTopics([]);
      setAttendees([]);
      setAreas([]);
    } catch (error) {
      console.error("Error saving minuta:", error);
      setMessage({
        type: "error",
        text: "Error al guardar la minuta. Por favor, inténtalo de nuevo.",
      });
    }
  };

  return (
    <div className="card">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Minutas</h1>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-red-100 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        {step === 1 && (
          <Step1GeneralInfo
            generalInfo={generalInfo}
            setGeneralInfo={setGeneralInfo}
            topics={topics}
            setTopics={setTopics}
            areas={areas}
            setAreas={setAreas}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <Step2Attendance
            attendees={attendees}
            setAttendees={setAttendees}
            onBack={() => setStep(1)}
            onSaveMinuta={saveCurrentMinuta}
          />
        )}
      </div>
    </div>
  );
};

export default MinutasPage;
