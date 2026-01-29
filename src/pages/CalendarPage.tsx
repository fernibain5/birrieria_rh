import React, { useState, useEffect, useRef } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  subMonths,
  addMonths,
  isSameMonth,
  isToday,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, Calendar, Gift } from "lucide-react";
import EventModal from "../components/Calendar/EventModal";
import { Event } from "../types/Event";
import { useAuth } from "../contexts/AuthContext";
import {
  getEventsForUser,
  addEvent,
  updateEvent,
  deleteEvent,
  checkHolidaysExistForYear,
  addMultipleEvents,
} from "../services/eventService";
import { generateMexicanHolidays } from "../utils/holidayGenerator";

const CalendarPage: React.FC = () => {
  const { isAdmin, userProfile } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingHolidays, setIsAddingHolidays] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showDayEventsModal, setShowDayEventsModal] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [visibleEventTypes, setVisibleEventTypes] = useState({
    holiday: true,
    custom: true,
    minuta: true,
  });

  // Use refs to track which years we've already processed to prevent duplicates
  const processedYears = useRef<Set<number>>(new Set());
  const isProcessingHolidays = useRef<boolean>(false);

  // Load events from Firestore
  const loadEvents = async () => {
    try {
      setLoading(true);
      if (userProfile) {
        const filteredEvents = await getEventsForUser(userProfile);
        setEvents(filteredEvents);
      }
    } catch (error) {
      console.error("Error loading events:", error);
      // Show user-friendly error message
      alert(
        "Error al cargar los eventos. Por favor, intenta recargar la página."
      );
    } finally {
      setLoading(false);
    }
  };

  // Check and add holidays for current year if they don't exist
  const ensureHolidaysExist = async () => {
    const currentYear = new Date().getFullYear();

    // Prevent multiple simultaneous executions
    if (
      isProcessingHolidays.current ||
      processedYears.current.has(currentYear) ||
      !isAdmin
    ) {
      return;
    }

    try {
      isProcessingHolidays.current = true;
      setIsAddingHolidays(true);

      // Double-check if holidays exist (more robust check)
      const holidaysExist = await checkHolidaysExistForYear(currentYear);

      if (!holidaysExist) {
        console.log(`Adding holidays for ${currentYear}...`);
        const holidays = generateMexicanHolidays(currentYear);
        await addMultipleEvents(holidays);
        console.log(`✅ Added holidays for ${currentYear}`);

        // Mark this year as processed
        processedYears.current.add(currentYear);

        // Reload events to include the new holidays
        await loadEvents();
      } else {
        console.log(`Holidays for ${currentYear} already exist, skipping...`);
        processedYears.current.add(currentYear);
      }
    } catch (error) {
      console.error("Error ensuring holidays exist:", error);
      // Don't mark as processed if there was an error
    } finally {
      isProcessingHolidays.current = false;
      setIsAddingHolidays(false);
    }
  };

  // Manually add holidays for a specific year
  const addHolidaysForYear = async (year: number) => {
    if (!isAdmin) return;

    // Prevent adding if already processing or already processed
    if (isProcessingHolidays.current || processedYears.current.has(year)) {
      alert(
        `Los días festivos para ${year} ya están siendo procesados o ya existen.`
      );
      return;
    }

    try {
      isProcessingHolidays.current = true;
      setIsAddingHolidays(true);

      const holidaysExist = await checkHolidaysExistForYear(year);

      if (holidaysExist) {
        alert(`Los días festivos para ${year} ya existen en el calendario.`);
        processedYears.current.add(year);
        return;
      }

      const holidays = generateMexicanHolidays(year);
      await addMultipleEvents(holidays);

      // Mark this year as processed
      processedYears.current.add(year);

      await loadEvents(); // Reload to show new holidays
      alert(
        `✅ Se agregaron ${holidays.length} días festivos para ${year} exitosamente.`
      );
    } catch (error) {
      console.error("Error adding holidays:", error);
      alert(
        "Error al agregar los días festivos. Por favor, intenta nuevamente."
      );
    } finally {
      isProcessingHolidays.current = false;
      setIsAddingHolidays(false);
    }
  };

  // Handle adding holidays for current viewing year
  const handleAddHolidaysForCurrentYear = () => {
    const year = currentMonth.getFullYear();

    // Check if already processed
    if (processedYears.current.has(year)) {
      alert(`Los días festivos para ${year} ya han sido procesados.`);
      return;
    }

    const confirmation = window.confirm(
      `¿Deseas agregar los días festivos oficiales de México para el año ${year}?\n\nEsto incluirá:\n• Año Nuevo\n• Aniversario de la Constitución\n• Natalicio de Benito Juárez\n• Día del Trabajo\n• Día de la Independencia\n• Aniversario de la Revolución\n• Navidad`
    );

    if (confirmation) {
      addHolidaysForYear(year);
    }
  };

  // Initialize data when component mounts
  useEffect(() => {
    const initializeData = async () => {
      await loadEvents();
      await ensureHolidaysExist();
    };

    if (userProfile) {
      initializeData();
    }
  }, [isAdmin, userProfile]);

  // Reset processed years when user changes (to handle switching between admin/regular users)
  useEffect(() => {
    processedYears.current.clear();
    isProcessingHolidays.current = false;
  }, [userProfile?.uid]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = monthStart;
  const endDate = monthEnd;

  const dateFormat = "d";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getEventsForDate = (date: Date) => {
    return events.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear() &&
        visibleEventTypes[event.type as keyof typeof visibleEventTypes]
    );
  };

  const toggleEventType = (eventType: keyof typeof visibleEventTypes) => {
    setVisibleEventTypes(prev => ({
      ...prev,
      [eventType]: !prev[eventType]
    }));
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleAddEvent = () => {
    if (!isAdmin) return; // Only allow admin to add events
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleSaveEvent = async (event: Event) => {
    if (!isAdmin) return; // Only allow admin to save events

    try {
      if (event.id) {
        // Update existing event - preserve original properties
        const originalEvent = events.find((e) => e.id === event.id);
        if (!originalEvent) {
          console.error("Original event not found");
          return;
        }

        // Merge with original event to preserve all properties
        const updatedEvent: Event = {
          ...originalEvent, // Keep all original properties
          title: event.title,
          description: event.description,
          date: event.date,
          color: event.color,
          year: event.date.getFullYear(), // Update year in case date changed
        };

        await updateEvent(event.id, updatedEvent);
        setEvents(events.map((e) => (e.id === event.id ? updatedEvent : e)));
      } else {
        // Add new event
        const newEventData = {
          ...event,
          type: "custom" as const,
          year: event.date.getFullYear(),
          createdAt: new Date(),
          createdBy: userProfile?.uid || "",
        };
        const newEventId = await addEvent(newEventData);
        const newEvent = {
          ...newEventData,
          id: newEventId,
        };
        setEvents([...events, newEvent]);
      }
      setShowEventModal(false);
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Error al guardar el evento. Por favor, intenta nuevamente.");
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!isAdmin) return; // Only allow admin to delete events

    try {
      await deleteEvent(id);
      setEvents(events.filter((event) => event.id !== id));
      setShowEventModal(false);
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Error al eliminar el evento. Por favor, intenta nuevamente.");
    }
  };

  const weekdays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // Get event display class based on type
  const getEventDisplayClass = (event: Event) => {
    const baseClass = `calendar-event ${event.color} ${
      !isAdmin ? "cursor-default" : ""
    }`;

    // Add special styling for holidays
    if (event.type === "holiday") {
      return `${baseClass} font-semibold border-l-2 border-opacity-50`;
    }

    return baseClass;
  };

  // Check if holidays exist for the current viewing year
  const currentYear = currentMonth.getFullYear();
  const currentYearHolidays = events.filter(
    (e) => e.type === "holiday" && e.year === currentYear
  );
  const hasHolidaysForCurrentYear = currentYearHolidays.length > 0;

  // New: open day events modal
  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    setShowDayEventsModal(true);
  };

  // Get all events for a date (without filters for modal display)
  const getAllEventsForDate = (date: Date) => {
    return events.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
    );
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Calendar className="animate-spin" size={24} />
            <span>Cargando calendario...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          Calendario de Eventos
        </h1>
        {isAdmin && (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            {!hasHolidaysForCurrentYear &&
              !processedYears.current.has(currentYear) && (
                <button
                  className="btn bg-green-600 text-white hover:bg-green-700 flex items-center justify-center text-sm sm:text-base px-3 py-2"
                  onClick={handleAddHolidaysForCurrentYear}
                  disabled={isAddingHolidays || isProcessingHolidays.current}
                >
                  <Gift size={16} className="mr-1" />
                  <span className="hidden sm:inline">
                    {isAddingHolidays
                      ? "Agregando..."
                      : `Agregar Días Festivos ${currentYear}`}
                  </span>
                  <span className="sm:hidden">
                    {isAddingHolidays ? "Agregando..." : `Días Festivos ${currentYear}`}
                  </span>
                </button>
              )}
            <button
              className="btn btn-primary flex items-center justify-center text-sm sm:text-base px-3 py-2"
              onClick={handleAddEvent}
              disabled={isAddingHolidays || isProcessingHolidays.current}
            >
              <Plus size={16} className="mr-1" />
              Nuevo Evento
            </button>
          </div>
        )}
      </div>

      {!isAdmin && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-800 text-sm">
            📅 Estás viendo el calendario en modo solo lectura. Solo puedes
            consultar la información de los eventos.
          </p>
        </div>
      )}

      {isAddingHolidays && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 text-sm">
            🎄 Agregando días festivos automáticamente...
          </p>
        </div>
      )}

      {isAdmin &&
        !hasHolidaysForCurrentYear &&
        !isAddingHolidays &&
        !processedYears.current.has(currentYear) && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 text-sm">
              🎄 No se encontraron días festivos para {currentYear}. Puedes
              agregarlos automáticamente haciendo clic en el botón "Agregar Días
              Festivos {currentYear}".
            </p>
          </div>
        )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </h2>
        <div className="flex space-x-1 sm:space-x-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Legend for event types with mobile toggle */}
      <div className="mb-4">
        {/* Mobile toggle button */}
        <button
          className="sm:hidden w-full flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200 mb-2"
          onClick={() => setShowLegend(!showLegend)}
        >
          <span className="text-sm font-medium text-gray-700">Filtros de Eventos</span>
          <ChevronRight 
            size={16} 
            className={`transform transition-transform ${showLegend ? 'rotate-90' : ''}`}
          />
        </button>

        {/* Legend content - always visible on desktop, toggleable on mobile */}
        <div className={`${showLegend ? 'block' : 'hidden'} sm:block`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-600">
            <button
              className={`flex items-center space-x-1 p-2 rounded transition-all ${
                visibleEventTypes.holiday 
                  ? 'bg-red-50 border border-red-200' 
                  : 'bg-gray-100 border border-gray-300 opacity-50'
              }`}
              onClick={() => toggleEventType('holiday')}
            >
              <div className="w-3 h-3 bg-red-100 border-l-2 border-red-400 rounded-sm"></div>
              <span>Días Festivos</span>
              {!visibleEventTypes.holiday && <span className="text-xs">(Oculto)</span>}
            </button>
            
            <button
              className={`flex items-center space-x-1 p-2 rounded transition-all ${
                visibleEventTypes.custom 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'bg-gray-100 border border-gray-300 opacity-50'
              }`}
              onClick={() => toggleEventType('custom')}
            >
              <div className="w-3 h-3 bg-blue-100 rounded-sm"></div>
              <span>Eventos Personalizados</span>
              {!visibleEventTypes.custom && <span className="text-xs">(Oculto)</span>}
            </button>
            
            <button
              className={`flex items-center space-x-1 p-2 rounded transition-all ${
                visibleEventTypes.minuta 
                  ? 'bg-purple-50 border border-purple-200' 
                  : 'bg-gray-100 border border-gray-300 opacity-50'
              }`}
              onClick={() => toggleEventType('minuta')}
            >
              <div className="w-3 h-3 bg-purple-100 rounded-sm"></div>
              <span>Reuniones de Seguimiento</span>
              {!visibleEventTypes.minuta && <span className="text-xs">(Oculto)</span>}
            </button>
            
            {hasHolidaysForCurrentYear && (
              <div className="flex items-center space-x-1 text-green-600 p-2">
                <Gift size={14} />
                <span>
                  {currentYearHolidays.length} días festivos en {currentYear}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map((day) => (
          <div key={day} className="text-center font-medium py-2 text-gray-600 text-xs sm:text-sm">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days of the week before the first day of the month */}
        {Array.from({ length: getDay(monthStart) }).map((_, index) => (
          <div key={`empty-${index}`} className="calendar-day bg-gray-50 min-h-[50px] sm:min-h-[90px]"></div>
        ))}

        {/* Calendar days */}
        {days.map((day) => {
          const dayEvents = getEventsForDate(day);
          const holidayEvents = dayEvents.filter((e) => e.type === "holiday");
          const customEvents = dayEvents.filter((e) => e.type === "custom");
          const minutaEvents = dayEvents.filter((e) => e.type === "minuta");

          return (
            <div
              key={day.toString()}
              className={`calendar-day min-h-[50px] sm:min-h-[90px] border border-gray-200 bg-white rounded-md transition-colors duration-150 cursor-pointer ${
                !isSameMonth(day, monthStart) ? "bg-gray-50 text-gray-400" : ""
              } ${isToday(day) ? "border-green-500 border-2" : ""}`}
              onClick={() => handleDayClick(day)}
            >
              {/* Mobile View (< sm breakpoint) */}
              <div className="sm:hidden h-full flex flex-col items-center justify-center p-1 relative">
                <span
                  className={`text-xs mb-1 ${isToday(day) ? "font-bold text-green-600" : ""}`}
                >
                  {format(day, dateFormat)}
                </span>
                {/* Event dots for mobile */}
                {dayEvents.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1 max-w-full">
                    {holidayEvents.length > 0 && visibleEventTypes.holiday && (
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full" title="Día festivo"></div>
                    )}
                    {customEvents.length > 0 && visibleEventTypes.custom && (
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" title="Evento personalizado"></div>
                    )}
                    {minutaEvents.length > 0 && visibleEventTypes.minuta && (
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" title="Reunión de seguimiento"></div>
                    )}
                    {/* Show extra dot if more than 3 visible events */}
                    {dayEvents.length > 3 && (
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" title={`+${dayEvents.length - 3} más`}></div>
                    )}
                  </div>
                )}
              </div>

              {/* Desktop View (sm breakpoint and up) */}
              <div className="hidden sm:flex sm:flex-col sm:justify-between sm:h-full p-1">
                <div className="calendar-day-header flex justify-between">
                  <span
                    className={isToday(day) ? "font-bold text-green-600" : ""}
                  >
                    {format(day, dateFormat)}
                  </span>
                </div>
                <div className="overflow-y-auto max-h-16">
                  {visibleEventTypes.holiday && holidayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={getEventDisplayClass(event) + " truncate whitespace-nowrap overflow-hidden"}
                      title={`${event.title} (Día Festivo)`}
                    >
                      {event.title}
                    </div>
                  ))}
                  {visibleEventTypes.custom && customEvents.map((event) => (
                    <div
                      key={event.id}
                      className={getEventDisplayClass(event) + " truncate whitespace-nowrap overflow-hidden"}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {visibleEventTypes.minuta && minutaEvents.map((event) => (
                    <div
                      key={event.id}
                      className={getEventDisplayClass(event) + " truncate whitespace-nowrap overflow-hidden"}
                      title={`${event.title} (Reunión de Seguimiento)`}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Day Events Modal */}
      {showDayEventsModal && selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-base sm:text-lg font-medium text-gray-800">
                {format(selectedDay, 'PPP', { locale: es })}
              </h3>
              <button
                onClick={() => setShowDayEventsModal(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none p-1"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto max-h-[60vh]">
              {getAllEventsForDate(selectedDay).length === 0 ? (
                <div className="text-gray-500 text-center py-8">No hay eventos para este día.</div>
              ) : (
                getAllEventsForDate(selectedDay).map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded hover:bg-gray-100 cursor-pointer border border-gray-100 transition-colors"
                    onClick={() => {
                      if (isAdmin) {
                        setSelectedEvent(event);
                        setShowEventModal(true);
                        setShowDayEventsModal(false);
                      }
                    }}
                  >
                    <div className="font-semibold text-sm sm:text-base">{event.title}</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">
                      {event.description || <span className="italic text-gray-400">Sin descripción</span>}
                    </div>
                    {/* Event type badge */}
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        event.type === 'holiday' ? 'bg-red-100 text-red-700' :
                        event.type === 'custom' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {event.type === 'holiday' ? 'Día Festivo' :
                         event.type === 'custom' ? 'Evento Personalizado' :
                         'Reunión de Seguimiento'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showEventModal && (
        <EventModal
          event={selectedEvent}
          onClose={() => setShowEventModal(false)}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          readOnly={!isAdmin || selectedEvent?.type === "holiday"} // Make holidays read-only
        />
      )}
    </div>
  );
};

export default CalendarPage;
