import React, { useState } from 'react';
import { Phone, Clock, Trash2, Calendar } from 'lucide-react';

interface AppointmentCardProps {
  appointment: any;
  onUpdate?: (id: number, data: any) => void;
  onEdit?: (appointment: any, isReschedule?: boolean) => void;
  onDelete?: (id: number) => void;
  onReschedule?: (id: number, date: string) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onUpdate, onEdit, onDelete, onReschedule }) => {
  const [showOptions, setShowOptions] = useState(false);

  const statusConfig: Record<string, { color: string, label: string, bg: string, text: string }> = {
    pending: { color: 'border-orange-300', label: 'A Confirmar', bg: 'bg-orange-100', text: 'text-orange-900' },
    confirmed: { color: 'border-violet-300', label: 'Confirmado', bg: 'bg-violet-100', text: 'text-violet-900' },
    completed: { color: 'border-green-300', label: 'Completado', bg: 'bg-green-100', text: 'text-green-900' },
    cancelled: { color: 'border-red-300', label: 'Cancelado', bg: 'bg-red-100', text: 'text-red-900' },
  };

  const config = statusConfig[appointment.status] || { color: 'border-gray-300', label: appointment.status, bg: 'bg-gray-100', text: 'text-gray-900' };

  const isFinalStatus = appointment.status === 'completed' || appointment.status === 'cancelled';

  return (
    <div
      className={`${config.bg} border-2 ${config.color} ${isFinalStatus ? 'p-3' : 'p-4'} rounded-2xl shadow-sm mb-3 group transition-all hover:shadow-md relative`}
    >
      {/* Options Overlay */}
      {showOptions && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 rounded-2xl p-4 flex flex-col gap-2 justify-center animate-in fade-in zoom-in duration-200">
           <button 
             onClick={() => { setShowOptions(false); onEdit?.(appointment, false); }}
             className="flex items-center gap-3 w-full p-3 bg-gray-100 hover:bg-primary hover:text-white rounded-xl transition-all font-black text-xs uppercase"
           >
             <Clock size={16} /> Cambiar Hora
           </button>
           <button 
             onClick={() => { 
                setShowOptions(false); 
                onEdit?.(appointment, true);
             }}
             className="flex items-center gap-3 w-full p-3 bg-gray-100 hover:bg-primary hover:text-white rounded-xl transition-all font-black text-xs uppercase"
           >
             <Calendar size={16} /> Cambiar Fecha
           </button>
           <button onClick={() => setShowOptions(false)} className="mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600">Cancelar</button>
        </div>
      )}

      {/* Edit Button - Top Right */}
      {!isFinalStatus && (
        <button
          onClick={(e) => { e.stopPropagation(); setShowOptions(true); }}
          className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-colors shadow-sm z-10"
          title="Opciones de tiempo"
        >
          <Clock size={16} />
        </button>
      )}

      {/* Delete Button - Bottom Right */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete?.(appointment.id); }}
        className={`absolute ${isFinalStatus ? '-bottom-1 -right-1 w-6 h-6' : '-bottom-2 -right-2 w-8 h-8'} bg-white border-2 border-red-100 rounded-lg flex items-center justify-center text-red-300 hover:text-red-600 hover:border-red-600 transition-colors shadow-sm z-10`}
        title="Eliminar turno"
      >
        <Trash2 size={isFinalStatus ? 12 : 16} />
      </button>

      <div className={`flex justify-between items-start gap-2 ${isFinalStatus ? 'mb-0' : 'mb-3'} mt-1`}>
        <div className="flex flex-col shrink-0">
          <span className="font-black text-gray-900 text-xs leading-none">{appointment.start_time.substring(0,5)}</span>
          <span className="text-gray-500 text-[10px] font-bold leading-none mt-1">{appointment.end_time.substring(0,5)}</span>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-black text-gray-900 text-sm truncate leading-tight">{appointment.client_name}</h4>
          <div className="flex items-center gap-1 text-gray-600 mt-0.5">
            <Phone size={10} className="shrink-0" />
            <span className="text-[10px] font-bold truncate">{appointment.client_phone}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-[8px] uppercase tracking-tighter font-black px-2 py-0.5 rounded-full bg-white/40 border ${config.color} ${config.text}`}>
            {config.label}
          </span>
          <span className="text-[8px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
            {appointment.service?.name || 'Servicio'}
          </span>
        </div>
      </div>

      {!isFinalStatus && (
        <div className="grid grid-cols-2 gap-1.5 pt-2.5 border-t border-gray-100">
          {appointment.status === 'pending' && (
            <button 
              onClick={() => onUpdate?.(appointment.id, { status: 'confirmed' })}
              className="text-[9px] bg-violet-600 hover:bg-violet-700 text-white py-1.5 rounded-lg transition-colors font-black shadow-sm border border-violet-700"
            >
              Confirmar
            </button>
          )}
          {appointment.status === 'confirmed' && (
            <button 
              onClick={() => onUpdate?.(appointment.id, { status: 'completed' })}
              className="text-[9px] bg-green-600 hover:bg-green-700 text-white py-1.5 rounded-lg transition-colors font-black shadow-sm border border-green-700"
            >
              Completar
            </button>
          )}
          <button 
            onClick={() => onUpdate?.(appointment.id, { status: 'cancelled' })}
            className="text-[9px] bg-red-50 hover:bg-red-100 text-red-600 py-1.5 rounded-lg transition-colors font-black border border-red-200"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;
