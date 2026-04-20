import React, { useMemo, useState } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import AppointmentCard from './AppointmentCard';

interface KanbanBoardProps {
  appointments: any[];
  onDragEnd: (appointmentId: number, newDate: string, newStatus: string) => void;
  onUpdate: (id: number, data: any) => void;
  onEdit: (appointment: any) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ appointments, onDragEnd, onUpdate, onEdit }) => {
  const [activeId, setActiveId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Generate columns for the next 6 days (Mon-Sat or similar)
  // For simplicity, let's just group appointments by date based on the existing ones, or generate fixed upcoming dates.
  const columns = useMemo(() => {
    const dates = [];
    const now = new Date();
    const day = now.getDay(); // 0 (Dom) a 6 (Sab)
    
    // Si es domingo, mostramos la semana que empieza mañana.
    // Si es lunes a sábado, mostramos la semana actual (desde el lunes pasado).
    const diff = day === 0 ? 1 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    for (let i = 0; i < 6; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      
      // Formato YYYY-MM-DD local
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dayNum = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dayNum}`;
      
      const dayAppointments = appointments.filter(a => a.date === dateStr);
      dates.push({
        id: dateStr,
        title: d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' }),
        date: dateStr,
        appointments: dayAppointments.sort((a,b) => a.start_time.localeCompare(b.start_time))
      });
    }
    
    return dates;
  }, [appointments]);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over) return;

    const appointmentId = active.id;
    const overId = over.id; // It could be a column (date) or another card (string like "card-ID")

    let newDate = "";
    
    if (String(overId).startsWith('col-')) {
      newDate = String(overId).replace('col-', '');
    } else {
      // Find the appointment we are dropping over to get its date
      const overApp = appointments.find(a => a.id === overId);
      if (overApp) {
        newDate = overApp.date;
      }
    }

    if (newDate) {
      // Find active appointment
      const activeApp = appointments.find(a => a.id === appointmentId);
      if (activeApp && activeApp.date !== newDate) {
        onDragEnd(appointmentId, newDate, activeApp.status);
      }
    }
  };

  const activeAppointment = useMemo(() => appointments.find(a => a.id === activeId), [activeId, appointments]);

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto h-full pb-4 items-start">
        {columns.map(col => (
          <KanbanColumn 
            key={col.id} 
            colId={`col-${col.id}`}
            title={col.title} 
            appointments={col.appointments} 
            onUpdate={onUpdate}
            onEdit={onEdit}
          />
        ))}
      </div>
      
      <DragOverlay>
        {activeAppointment ? <AppointmentCard appointment={activeAppointment} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
