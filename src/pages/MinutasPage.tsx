import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { createMinuta, getAllMinutas } from "../services/minutaService";
import { Minuta } from "../types/Minuta";
import { UserRole, UserBranch } from "../types/auth";
import Step1GeneralInfo from '../components/Minutas/Step1GeneralInfo';
import Step2Attendance from '../components/Minutas/Step2Attendance';
import { generateMinutaDocx } from '../utils/minutaDocxGenerator';
import { generateAttendanceListDocx } from '../utils/attendanceListGenerator';

interface AreaDetail {
  area: string;
  planteamiento: string;
  seguimiento: string;
  fechaCompromiso: string;
  encargadoUid: string;
}

const MinutasPage: React.FC = () => {
  const { userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [minutas, setMinutas] = useState<Minuta[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Multi-step form state
  const [step, setStep] = useState(1);
  const [generalInfo, setGeneralInfo] = useState<any>({});
  const [topics, setTopics] = useState<any[]>([]);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [areas, setAreas] = useState<AreaDetail[]>([]);

  const [formData, setFormData] = useState({
    supervisor: "",
    branch: "San Pedro" as UserBranch,
    role: "mesero" as UserRole,
    whatHappened: "",
    expectations: "",
    nextMeetingDate: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const minutaData = {
        supervisor: formData.supervisor,
        branch: formData.branch,
        role: formData.role,
        whatHappened: formData.whatHappened,
        expectations: formData.expectations,
        nextMeetingDate: new Date(formData.nextMeetingDate),
        createdBy: userProfile.uid,
      };

      await createMinuta(minutaData, userProfile.uid);

      setMessage({
        type: "success",
        text: "Minuta creada exitosamente. Se ha programado un evento en el calendario para la próxima reunión.",
      });

      // Reset form
      setFormData({
        supervisor: "",
        branch: "San Pedro",
        role: "mesero",
        whatHappened: "",
        expectations: "",
        nextMeetingDate: "",
      });
    } catch (error) {
      console.error("Error creating minuta:", error);
      setMessage({
        type: "error",
        text: "Error al crear la minuta. Por favor, inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMinutas = async () => {
    try {
      const allMinutas = await getAllMinutas();
      setMinutas(allMinutas);
      setShowHistory(true);
    } catch (error) {
      console.error("Error loading minutas:", error);
      setMessage({
        type: "error",
        text: "Error al cargar el historial de minutas.",
      });
    }
  };

  const startNewMinuta = () => {
    setShowHistory(false);
    setStep(1);
    setGeneralInfo({});
    setTopics([]);
    setAttendees([]);
    setAreas([]);
    setMessage(null);
  };

  const roleOptions: { value: UserRole; label: string }[] = [
    { value: "mesero", label: "Mesero" },
    { value: "tortillero", label: "Tortillero" },
    { value: "losero", label: "Losero" },
    { value: "cocinero", label: "Cocinero" },
  ];

  const branchOptions: { value: UserBranch; label: string }[] = [
    { value: "San Pedro", label: "San Pedro" },
    { value: "Las Quintas", label: "Las Quintas" },
  ];

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Minutas</h1>
        <button
          onClick={loadMinutas}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ver Historial
        </button>
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

      {!showHistory ? (
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
              onNext={() => {/* handle submit */}}
              onBack={() => setStep(1)}
              onDownload={async () => {
                // Map encargadoUid to name for each area
                const areasWithNames = areas.map(area => {
                  const responsible = attendees.find(a => a.uid === area.encargadoUid);
                  return {
                    ...area,
                    encargadoName: responsible ? (responsible.displayName || responsible.email || responsible.uid) : '',
                  };
                });
                await generateMinutaDocx({
                  generalInfo,
                  areas: areasWithNames,
                  attendees,
                });
              }}
              onDownloadAttendance={async () => {
                const attendanceInfo = {
                  startTime: generalInfo.startTime || '',
                  endTime: generalInfo.endTime || '',
                  evento: generalInfo.evento || '',
                  date: generalInfo.date || ''
                };
                
                const employeesWithArea = attendees.map(attendee => ({
                  uid: attendee.uid,
                  displayName: attendee.displayName,
                  email: attendee.email,
                  area: attendee.area || '' // Add area if available in user profile
                }));
                
                await generateAttendanceListDocx({
                  attendanceInfo,
                  employees: employeesWithArea
                });
              }}
              onSaveMinuta={() => {
                // TODO: Implement save minuta logic
                console.log('Save minuta');
              }}
            />
          )}
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Historial de Minutas
            </h2>
            <button
              onClick={startNewMinuta}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Nueva Minuta
            </button>
          </div>

          <div className="space-y-4">
            {minutas.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay minutas registradas.
              </p>
            ) : (
              minutas.map((minuta) => (
                <div
                  key={minuta.id}
                  className="bg-gray-50 p-4 rounded-lg border"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <strong className="text-sm text-gray-600">
                        Supervisor:
                      </strong>
                      <p className="text-gray-800">{minuta.supervisor}</p>
                    </div>
                    <div>
                      <strong className="text-sm text-gray-600">
                        Sucursal:
                      </strong>
                      <p className="text-gray-800">{minuta.branch}</p>
                    </div>
                    <div>
                      <strong className="text-sm text-gray-600">Rol:</strong>
                      <p className="text-gray-800">{minuta.role}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <strong className="text-sm text-gray-600">
                      ¿Qué pasó?
                    </strong>
                    <p className="text-gray-800 mt-1">{minuta.whatHappened}</p>
                  </div>

                  <div className="mb-3">
                    <strong className="text-sm text-gray-600">
                      Expectativas:
                    </strong>
                    <p className="text-gray-800 mt-1">{minuta.expectations}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <strong>Próxima reunión:</strong>
                      <p>
                        {minuta.nextMeetingDate.toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div>
                      <strong>Creada:</strong>
                      <p>{minuta.createdAt.toLocaleDateString("es-ES")}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MinutasPage;
