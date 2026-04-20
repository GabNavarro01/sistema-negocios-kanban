import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Check, Clock, Save } from 'lucide-react';

const daysOfWeek = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
];

const ScheduleDayCard: React.FC<{ day: any, onUpdate: (dayOfWeek: number, data: any) => void, isDark?: boolean }> = ({ day, onUpdate, isDark }) => {
  const [localStart, setLocalStart] = useState(day.start_time.substring(0, 5));
  const [localEnd, setLocalEnd] = useState(day.end_time.substring(0, 5));

  useEffect(() => {
    setLocalStart(day.start_time.substring(0, 5));
    setLocalEnd(day.end_time.substring(0, 5));
  }, [day.start_time, day.end_time]);

  const handleBlur = () => {
    if (localStart !== day.start_time.substring(0, 5) || localEnd !== day.end_time.substring(0, 5)) {
      onUpdate(day.day_of_week, { start_time: localStart + ':00', end_time: localEnd + ':00' });
    }
  };

  const cardClasses = isDark 
    ? (day.is_active ? 'border-primary/40 bg-primary/10' : 'border-white/5 bg-white/5 opacity-50')
    : (day.is_active ? 'border-primary/30 bg-primary/5' : 'border-gray-100 bg-gray-50 opacity-60');

  const textClasses = isDark ? 'text-white' : 'text-gray-700';

  return (
    <div className={`p-3 rounded-xl border transition-all ${cardClasses}`}>
      <div className="flex justify-between items-center mb-2">
        <span className={`font-bold text-sm ${textClasses}`}>{daysOfWeek[day.day_of_week]}</span>
        <button 
          onClick={() => onUpdate(day.day_of_week, { is_active: !day.is_active })}
          className={`w-9 h-5 rounded-full relative transition-colors ${day.is_active ? 'bg-primary' : (isDark ? 'bg-white/10' : 'bg-gray-300')}`}
        >
          <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${day.is_active ? 'translate-x-4' : ''}`}></div>
        </button>
      </div>
      
      {day.is_active && (
        <div className="flex items-center gap-2">
          <input 
            type="time" 
            value={localStart}
            onChange={(e) => setLocalStart(e.target.value)}
            onBlur={handleBlur}
            className={`${isDark ? 'bg-white/10 text-white border-white/10' : 'bg-white text-gray-700 border-gray-200'} text-[10px] p-1 rounded-lg border w-full focus:border-primary focus:outline-none shadow-sm`}
          />
          <span className="text-gray-500 text-xs">-</span>
          <input 
            type="time" 
            value={localEnd}
            onChange={(e) => setLocalEnd(e.target.value)}
            onBlur={handleBlur}
            className={`${isDark ? 'bg-white/10 text-white border-white/10' : 'bg-white text-gray-700 border-gray-200'} text-[10px] p-1 rounded-lg border w-full focus:border-primary focus:outline-none shadow-sm`}
          />
        </div>
      )}
    </div>
  );
};

interface ScheduleConfigProps {
  isDark?: boolean;
}

const ScheduleConfig: React.FC<ScheduleConfigProps> = ({ isDark }) => {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedule = async () => {
    try {
      const { data } = await api.get('/barber/schedule');
      setSchedule(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const handleUpdate = async (dayOfWeek: number, updateData: any) => {
    try {
      const res = await api.put(`/barber/schedule/${dayOfWeek}`, updateData);
      setSchedule(prev => prev.map(s => s.day_of_week === dayOfWeek ? res.data : s));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className={`p-4 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Cargando...</div>;

  return (
    <div className="flex flex-col h-full">
      <div className={`p-6 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
        <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          <Clock className="text-primary" size={18} />
          Disponibilidad
        </h3>
        <p className={`${isDark ? 'text-gray-500' : 'text-gray-500'} text-xs mt-1 font-medium`}>Configura tus horarios de trabajo.</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {schedule.map((s) => (
          <ScheduleDayCard key={s.day_of_week} day={s} onUpdate={handleUpdate} isDark={isDark} />
        ))}
      </div>

      <div className={`p-4 border-t text-[10px] font-bold uppercase tracking-tighter ${isDark ? 'bg-black/20 border-white/5 text-gray-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
        Autoguardado activado
      </div>
    </div>
  );
};

export default ScheduleConfig;
