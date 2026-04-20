import React, { useState } from 'react';
import { X } from 'lucide-react';
import api from '../services/api';
import CalendarPicker from './CalendarPicker';

interface BookingModalProps {
  onClose: () => void;
  services: any[];
}

const BookingModal: React.FC<BookingModalProps> = ({ onClose, services }) => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  
  const formatPhone = (value: string) => {
    // Solo permitir dgitos y el smbolo +
    const digits = value.replace(/\D/g, '');
    let formatted = '';
    
    if (digits.length > 0) {
      formatted += '+' + digits.substring(0, 2);
      if (digits.length > 2) {
        formatted += ' ' + digits.substring(2, 4);
      }
      if (digits.length > 4) {
        formatted += '-' + digits.substring(4, 9);
      }
      if (digits.length > 9) {
        formatted += '-' + digits.substring(9, 13);
      }
    }
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientPhone(formatPhone(e.target.value));
  };

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const fetchSlots = async (date: string, serviceId: number) => {
    setLoadingSlots(true);
    try {
      const { data } = await api.get(`/availability?target_date=${date}&service_id=${serviceId}`);
      setAvailableSlots(data.available_slots);
    } catch (e) {
      console.error(e);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleManualDateChange = (date: string) => {
    setSelectedDate(date);
    if (selectedService) {
      fetchSlots(date, selectedService);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = e.target.value;
    handleManualDateChange(d);
  };

  const goToStep2 = () => {
    setStep(2);
    if (selectedDate && selectedService) {
      fetchSlots(selectedDate, selectedService);
    }
  };

  const handleSubmit = async () => {
    try {
      const service = services.find(s => s.id === selectedService);
      const duration = service ? service.duration_minutes : 30;
      
      const startD = new Date(`${selectedDate}T${selectedTime}`);
      const endD = new Date(startD.getTime() + duration*60000);
      const endTime = endD.toTimeString().split(' ')[0].substring(0,5) + ':00';
      const startTime = selectedTime + ':00';

      await api.post('/appointments', {
        client_name: clientName,
        client_phone: clientPhone,
        service_id: selectedService,
        date: selectedDate,
        start_time: startTime,
        end_time: endTime,
        notes: ''
      });
      alert('¡Turno reservado con éxito!');
      onClose();
    } catch (e) {
      console.error(e);
      alert('Error al reservar el turno. Puede que el horario ya no esté disponible.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-paper rounded-lg shadow-xl w-full max-w-2xl relative overflow-hidden">
        <div className="bg-primary p-4 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold">Reservar Turno</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg text-gray-300 font-semibold mb-2">Paso 1: Selecciona el Servicio</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {services?.map((s) => {
                  let imageUrl = "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80"; // Un corte cualquiera por defecto
                  const lowerName = s.name.toLowerCase();
                  if (lowerName.includes('tintura') || lowerName.includes('color')) {
                    imageUrl = "https://images.unsplash.com/photo-1604902396830-aca29e19b067?auto=format&fit=crop&q=80"; // Imagen de platinado / pelo teñido
                  } else if (lowerName.includes('barba')) {
                    imageUrl = "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80"; // Imagen de barba
                  }

                  return (
                    <button 
                      key={s.id}
                      onClick={() => setSelectedService(s.id)}
                      className={`relative overflow-hidden rounded-lg border-2 transition-all duration-300 text-left group ${
                        selectedService === s.id 
                          ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-dark-paper' 
                          : 'border-transparent hover:border-gray-500'
                      }`}
                    >
                      <div className="h-40 w-full overflow-hidden">
                        <img 
                          src={imageUrl} 
                          alt={s.name} 
                          className={`w-full h-full object-cover transition-transform duration-300 ${
                            selectedService === s.id ? 'scale-105' : 'group-hover:scale-105'
                          }`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="font-bold text-white text-lg leading-tight">{s.name}</div>
                        <div className="text-xs text-gray-300 mt-1">{s.duration_minutes} min • {s.price}</div>
                      </div>
                      
                      {selectedService === s.id && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <button 
                onClick={goToStep2}
                disabled={!selectedService}
                className="w-full mt-4 bg-primary hover:bg-primary-hover disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Siguiente
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg text-gray-300 font-semibold mb-2">Paso 2: Fecha y Hora</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Calendario a la izquierda */}
                <div>
                  <label className="block text-sm text-gray-400 mb-3">Selecciona el Día</label>
                  <CalendarPicker 
                    selectedDate={selectedDate} 
                    onDateSelect={handleManualDateChange} 
                  />
                </div>
                
                {/* Horarios a la derecha */}
                <div>
                  <label className="block text-sm text-gray-400 mb-3">Horarios Disponibles</label>
                  {loadingSlots ? (
                    <div className="flex flex-col gap-2">
                      {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-800 animate-pulse rounded" />)}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {availableSlots.map(time => (
                        <button 
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-2 rounded-lg border transition-all ${selectedTime === time ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20' : 'border-gray-800 bg-gray-900/50 text-gray-400 hover:text-white hover:border-gray-600'}`}
                        >
                          {time}
                        </button>
                      ))}
                      {availableSlots.length === 0 && selectedDate && (
                        <div className="col-span-2 py-8 text-center bg-gray-900/30 rounded-lg">
                          <p className="text-gray-500 text-sm italic">No hay horarios disponibles para este día.</p>
                        </div>
                      )}
                      {!selectedDate && (
                        <div className="col-span-2 py-8 text-center bg-gray-900/30 rounded-lg">
                          <p className="text-gray-400 text-sm">Selecciona un día para ver horarios</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-8">
                <button 
                  onClick={() => setStep(1)}
                  className="w-1/3 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded transition-colors"
                >
                  Atrás
                </button>
                <button 
                  onClick={() => setStep(3)}
                  disabled={!selectedDate || !selectedTime}
                  className="w-2/3 bg-primary hover:bg-primary-hover disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 rounded transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg text-gray-300 font-semibold mb-2">Paso 3: Tus Datos</h3>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Teléfono</label>
                <input 
                  type="tel" 
                  value={clientPhone}
                  onChange={handlePhoneChange}
                  placeholder="+54 11-12345-6789"
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="bg-gray-800 p-3 rounded text-sm text-gray-300 mt-4 border border-gray-700">
                Resumen: <br/>
                Servicio: {services.find(s => s.id === selectedService)?.name}<br/>
                Día: {selectedDate} a las {selectedTime}
              </div>

              <div className="flex gap-2 mt-6">
                <button 
                  onClick={() => setStep(2)}
                  className="w-1/3 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded transition-colors"
                >
                  Atrás
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={!clientName || !clientPhone}
                  className="w-2/3 bg-primary hover:bg-primary-hover disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 rounded transition-colors"
                >
                  Confirmar Reserva
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default BookingModal;
