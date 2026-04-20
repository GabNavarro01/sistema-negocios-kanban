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
    const jsDay = date.getDay();
    const backendDay = jsDay === 0 ? 6 : jsDay - 1;
    const dayConfig = schedule.find(s => Number(s.day_of_week) === backendDay);
    return dayConfig ? !dayConfig.is_active : false;
  };

  const today = new Date();
  today.setHours(0,0,0,0);

  return (
    <div className="bg-[#f5f1e8] p-8 rounded-[40px] border-8 border-[#6b1421]/10 shadow-inner w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h4 className="text-[#6b1421] text-3xl font-black capitalize tracking-tighter">
          {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
        </h4>
        <div className="flex gap-3">
          <button onClick={handlePrevMonth} className="w-12 h-12 flex items-center justify-center hover:bg-[#6b1421] hover:text-white rounded-full text-[#6b1421] transition-all border-4 border-[#6b1421]/10 shadow-md">
            <ChevronLeft size={24} />
          </button>
          <button onClick={handleNextMonth} className="w-12 h-12 flex items-center justify-center hover:bg-[#6b1421] hover:text-white rounded-full text-[#6b1421] transition-all border-4 border-[#6b1421]/10 shadow-md">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
      
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-4 justify-items-center mb-6">
        {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map((d, i) => (
          <div key={`${d}-${i}`} className="text-sm font-black uppercase text-[#6b1421]/50 tracking-[0.2em]">{d}</div>
        ))}
      </div>
      
      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-4 justify-items-center">
        {days.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} className="h-11 md:h-12 w-full" />;
          
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
                h-10 w-10 md:h-11 md:w-11 text-sm md:text-lg rounded-xl flex items-center justify-center transition-all duration-300 relative border-2
                ${isSelected ? 'bg-[#6b1421] border-[#6b1421] text-white font-black shadow-2xl scale-105' : 'border-transparent'}
                ${!isSelected && !isDisabled ? 'text-[#2c1810] font-black hover:bg-[#6b1421] hover:text-white hover:shadow-lg' : ''}
                ${isDisabled ? 'text-[#6b1421]/10 cursor-not-allowed border-transparent' : ''}
                ${isToday && !isSelected ? 'text-[#6b1421] font-black border-[#6b1421]/40 bg-white/50' : ''}
              `}
              title={isDisabledBySchedule ? "Cerrado" : ""}
            >
              {date.getDate()}
              {isToday && !isSelected && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#6b1421] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarPicker;
