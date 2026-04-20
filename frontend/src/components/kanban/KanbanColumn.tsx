import React from 'react';
import AppointmentCard from './AppointmentCard';

interface KanbanColumnProps {
  colId: string;
  title: string;
  appointments: any[];
  onUpdate?: (id: number, data: any) => void;
  onEdit?: (appointment: any) => void;
  onDelete?: (id: number) => void;
  onReschedule?: (id: number, date: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ colId, title, appointments, onUpdate, onEdit, onDelete, onReschedule }) => {
  return (
    <div className="bg-white/50 border-4 border-gray-200 rounded-[30px] min-w-[320px] w-[320px] flex flex-col max-h-full transition-all duration-300 shadow-sm">
      <div className="p-5 border-b border-gray-100 font-black uppercase tracking-tighter flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md rounded-t-[26px] z-10 text-gray-800">
        {title}
        <span className="text-[10px] font-black px-3 py-1 rounded-full bg-gray-200 text-gray-700">{appointments.length}</span>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 min-h-[200px]">
        {appointments.map(app => (
          <AppointmentCard 
            key={app.id} 
            appointment={app} 
            onUpdate={onUpdate}
            onEdit={onEdit}
            onDelete={onDelete}
            onReschedule={onReschedule}
          />
        ))}
        {appointments.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300 py-10 italic text-xs">
            No hay turnos
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
