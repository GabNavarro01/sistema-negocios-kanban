import React, { useMemo } from 'react';
import KanbanColumn from './KanbanColumn';

interface KanbanBoardProps {
  appointments: any[];
  onUpdate: (id: number, data: any) => void;
  onEdit: (appointment: any) => void;
  onDelete: (id: number) => void;
  onReschedule: (id: number, date: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ appointments, onUpdate, onEdit, onDelete, onReschedule }) => {
  const columns = useMemo(() => {
    const dates = [];
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? 1 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    for (let i = 0; i < 6; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
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

  return (
    <div className="flex gap-6 overflow-x-auto h-full pb-8 items-start">
      {columns.map(col => (
        <KanbanColumn 
          key={col.id} 
          colId={col.id}
          title={col.title} 
          appointments={col.appointments} 
          onUpdate={onUpdate}
          onEdit={onEdit}
          onDelete={onDelete}
          onReschedule={onReschedule}
        />
      ))}
    </div>
  );
};

export default KanbanBoard;
