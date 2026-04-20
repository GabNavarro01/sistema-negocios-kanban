import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import AppointmentCard from './AppointmentCard';

interface KanbanColumnProps {
  colId: string;
  title: string;
  appointments: any[];
  onUpdate?: (id: number, data: any) => void;
  onEdit?: (appointment: any) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ colId, title, appointments, onUpdate, onEdit }) => {
  const { setNodeRef } = useDroppable({
    id: colId,
  });

  return (
    <div className="bg-white/50 border border-gray-300 rounded-2xl min-w-[320px] w-[320px] flex flex-col max-h-full shadow-sm">
      <div className="p-4 border-b border-gray-200 font-bold text-gray-800 capitalize flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md rounded-t-2xl z-10">
        {title}
        <span className="text-xs bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full">{appointments.length}</span>
      </div>
      
      <div 
        ref={setNodeRef}
        className="flex-1 p-3 overflow-y-auto flex flex-col gap-3 min-h-[150px]"
      >
        <SortableContext 
          items={appointments.map(a => a.id)}
          strategy={verticalListSortingStrategy}
        >
          {appointments.map(app => (
            <AppointmentCard 
              key={app.id} 
              appointment={app} 
              onUpdate={onUpdate}
              onEdit={onEdit}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export default KanbanColumn;
