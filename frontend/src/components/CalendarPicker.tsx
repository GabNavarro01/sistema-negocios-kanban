import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarPickerProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  schedule?: any[]; // 0=Monday, 6=Sunday
}

const CalendarPicker: React.FC<CalendarPickerProps> = ({ selectedDate, onDateSelect, schedule = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push(new Date(year, month, i));
    }
    return calendarDays;
  }, [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isDayDisabled = (date: Date) => {
    if (!schedule || schedule.length === 0) return false;
    
    // JS getDay(): 0=Sun, 1=Mon... 6=Sat
    // Backend: 0=Mon, 6=Sun
    const jsDay = date.getDay();
    const backendDay = (jsDay + 6) % 7;
    
    const dayConfig = schedule.find(s => s.day_of_week === backendDay);
    return dayConfig ? !dayConfig.is_active : false;
  };

  const today = new Date();
  today.setHours(0,0,0,0);

  return (
    <div className="bg-[#f5f1e8] p-4 rounded-2xl border-4 border-[#6b1421]/20">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-[#6b1421] font-black capitalize">
          {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
        </h4>
        <div className="flex gap-1">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-[#6b1421]/10 rounded-full text-[#6b1421] transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button onClick={handleNextMonth} className="p-1 hover:bg-[#6b1421]/10 rounded-full text-[#6b1421] transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
          <div key={`${d}-${i}`} className="text-[10px] font-black text-[#6b1421]/40">{d}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} className="h-8" />;
          
          const isSelected = selectedDate === formatDate(date);
          const isPast = date < today;
          const isToday = today.getTime() === date.getTime();
          const isDisabledBySchedule = isDayDisabled(date);
          const isDisabled = isPast || isDisabledBySchedule;
          
          return (
            <button
              key={i}
              disabled={isDisabled}
              onClick={() => onDateSelect(formatDate(date))}
              className={`
                h-8 w-8 text-xs rounded-full flex items-center justify-center transition-all
                ${isSelected ? 'bg-[#6b1421] text-white font-black shadow-lg shadow-[#6b1421]/30' : ''}
                ${!isSelected && !isDisabled ? 'text-[#2c1810] font-bold hover:bg-[#6b1421]/10' : ''}
                ${isDisabled ? 'text-gray-300 cursor-not-allowed opacity-30' : ''}
                ${isToday && !isSelected ? 'text-[#6b1421] font-black border-2 border-[#6b1421]/30' : ''}
              `}
              title={isDisabledBySchedule ? "Barbería cerrada" : ""}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarPicker;
