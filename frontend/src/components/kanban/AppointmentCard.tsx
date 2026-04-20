import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, Phone, User as UserIcon } from 'lucide-react';

interface AppointmentCardProps {
  appointment: any;
  isOverlay?: boolean;
  onUpdate?: (id: number, data: any) => void;
  onEdit?: (appointment: any) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, isOverlay, onUpdate, onEdit }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: appointment.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging && !isOverlay) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg h-32 opacity-50 mb-3"
      />
    );
  }

  const statusConfig: Record<string, { color: string, label: string, bg: string, text: string }> = {
    pending: { color: 'border-orange-300', label: 'A Confirmar', bg: 'bg-orange-100', text: 'text-orange-900' },
    confirmed: { color: 'border-violet-300', label: 'Confirmado', bg: 'bg-violet-100', text: 'text-violet-900' },
    completed: { color: 'border-green-300', label: 'Completado', bg: 'bg-green-100', text: 'text-green-900' },
    cancelled: { color: 'border-red-300', label: 'Cancelado', bg: 'bg-red-100', text: 'text-red-900' },
  };

  const config = statusConfig[appointment.status] || { color: 'border-gray-300', label: appointment.status, bg: 'bg-gray-100', text: 'text-gray-900' };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${config.bg} border-2 ${config.color} p-3 rounded-xl shadow-sm mb-2 group transition-all hover:shadow-md ${isOverlay ? 'shadow-2xl scale-105 rotate-1' : ''}`}
    >
      <div className="flex justify-between items-center gap-3 mb-3" {...attributes} {...listeners}>
        {/* Col 1: Logo/Time */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-white/50 p-1.5 rounded-lg shadow-sm border border-white/20">
            <Clock size={14} className="text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-gray-900 text-[10px] leading-none">{appointment.start_time.substring(0,5)}</span>
            <span className="text-gray-500 text-[8px] font-bold leading-none mt-0.5">{appointment.end_time.substring(0,5)}</span>
          </div>
        </div>

        {/* Col 2: Name */}
        <div className="flex-1 min-w-0">
          <h4 className="font-black text-gray-900 text-sm truncate">{appointment.client_name}</h4>
          <div className="flex items-center gap-1 text-gray-600">
            <Phone size={10} className="shrink-0" />
            <span className="text-[10px] font-bold truncate">{appointment.client_phone}</span>
          </div>
        </div>

        {/* Col 3: Status/Service */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-[8px] uppercase tracking-tighter font-black px-2 py-0.5 rounded-full bg-white/40 border ${config.color} ${config.text}`}>
            {config.label}
          </span>
          <span className="text-[8px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
            {appointment.service?.name || 'Servicio'}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
        {appointment.status === 'pending' && (
          <button 
            onClick={() => onUpdate?.(appointment.id, { status: 'confirmed' })}
            className="text-[9px] bg-violet-600 hover:bg-violet-700 text-white px-2.5 py-2 rounded-lg transition-colors font-black shadow-sm border border-violet-700"
          >
            Confirmar
          </button>
        )}
        {appointment.status === 'confirmed' && (
          <button 
            onClick={() => onUpdate?.(appointment.id, { status: 'completed' })}
            className="text-[9px] bg-green-600 hover:bg-green-700 text-white px-2.5 py-2 rounded-lg transition-colors font-black shadow-sm border border-green-700"
          >
            Completar
          </button>
        )}
        {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
          <button 
            onClick={() => onUpdate?.(appointment.id, { status: 'cancelled' })}
            className="text-[9px] bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-2 rounded-lg transition-colors font-black border border-red-200"
          >
            Cancelar
          </button>
        )}
        <button 
          onClick={() => onEdit?.(appointment)}
          className="text-[9px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-2 rounded-lg transition-colors font-black border border-gray-300 ml-auto"
        >
          Editar Hora
        </button>
      </div>
    </div>
  );
};

export default AppointmentCard;
