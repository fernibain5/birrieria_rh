import React, { useState, useEffect } from "react";
import { X, Eye, Calendar } from "lucide-react";
import { Event } from "../../types/Event";

interface EventModalProps {
  event: Event | null;
  onClose: () => void;
  onSave: (event: Event) => void;
  onDelete: (id: string) => void;
  readOnly?: boolean;
}

const EventModal: React.FC<EventModalProps> = ({
  event,
  onClose,
  onSave,
  onDelete,
  readOnly = false,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [color, setColor] = useState("bg-blue-100 text-blue-800");

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || "");
      setDate(formatDateForInput(event.date));
      setColor(event.color || "bg-blue-100 text-blue-800");
    } else {
      // Default to today for new events
      setDate(formatDateForInput(new Date()));
    }
  }, [event]);

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (readOnly) return; // Don't save if in read-only mode

    const [year, month, day] = date.split("-").map(Number);
    const eventDate = new Date(year, month - 1, day);

    onSave({
      id: event?.id || "",
      title,
      description,
      date: eventDate,
      color,
    });
  };

  const handleDelete = () => {
    if (readOnly) return; // Don't delete if in read-only mode

    if (event?.id) {
      onDelete(event.id);
    }
  };

  const isHoliday = event?.type === "holiday";
  const modalTitle = readOnly
    ? isHoliday
      ? "Ver Día Festivo"
      : "Ver Evento"
    : event
    ? "Editar Evento"
    : "Nuevo Evento";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium text-gray-800 flex items-center">
            {readOnly && <Eye size={18} className="mr-2 text-gray-500" />}
            {isHoliday && <Calendar size={18} className="mr-2 text-red-600" />}
            {modalTitle}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        {readOnly && (
          <div className="px-4 pt-4">
            <div
              className={`mb-4 p-3 rounded-md ${
                isHoliday
                  ? "bg-red-50 border border-red-200"
                  : "bg-amber-50 border border-amber-200"
              }`}
            >
              <p
                className={`text-sm ${
                  isHoliday ? "text-red-800" : "text-amber-800"
                }`}
              >
                {isHoliday
                  ? "🎄 Este es un día festivo oficial de México. No puede ser editado."
                  : "👁️ Estás viendo este evento en modo solo lectura."}
              </p>
            </div>
          </div>
        )}

        {/* Event type indicator */}
        {event && (
          <div className="px-4 pt-2">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xs font-medium text-gray-500">
                TIPO DE EVENTO:
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  isHoliday
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {isHoliday ? "Día Festivo" : "Evento Personalizado"}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Título
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="Título del evento"
                required
                disabled={readOnly}
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Descripción
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input h-24"
                placeholder="Descripción del evento"
                disabled={readOnly}
              />
            </div>

            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Fecha
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input"
                required
                disabled={readOnly}
              />
            </div>

          </div>

          {!readOnly && (
            <div className="mt-6 flex space-x-3">
              {event?.id && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                >
                  Eliminar
                </button>
              )}
              <button type="submit" className="flex-1 btn btn-primary">
                {event ? "Actualizar" : "Crear"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EventModal;
